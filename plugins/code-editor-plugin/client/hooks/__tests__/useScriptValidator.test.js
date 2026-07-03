import React from 'react';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import { useScriptValidator } from '../useScriptValidator';
import TestUtilities from '../../../shared-util/test-utilities';
import { CodeEditorContext } from '../../CodeEditorContext';

const sampleJS = `
    let x = 1;
    let result = 0;

    for (let i = 0; i < 10; i++) {
        result += x * i;
        x++;
    }

    console.log('Result: ', result);
`;

const mockLintingClient = {
  connect: jest.fn(),
  isConnected: jest.fn(),
  validateScript: jest.fn(),
};


const mockDispatch = jest.fn();
jest.mock('monaco-editor/esm/vs/editor/editor.api', () => ({
  editor: {
    createModel: jest.fn(),
    setModelMarkers: jest.fn(),
  }
}));

describe('useScriptValidator', () => {
  let model, validate, state;

  const wrapper = ({ children }) => (
    <CodeEditorContext.Provider value={ { state, dispatch: mockDispatch } }>
      {children}
    </CodeEditorContext.Provider>
  );

  beforeEach(() => {
    model = {
      getValue: jest.fn(() => sampleJS),
      isDisposed: jest.fn(() => false),
      getLineCount: jest.fn(() => 7),
      getLineLength: jest.fn(() => 30)
    };

    state = { lintClient: mockLintingClient, lintEnabled: true };

    const { result } = TestUtilities.renderHook(() => useScriptValidator(), { wrapper });
    validate = result.current.validate;

    jest.spyOn(console, 'warn');
    jest.spyOn(console, 'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should clear markers for disposed model', async () => {
    model.isDisposed.mockReturnValue(true);
    model.getValue.mockReturnValue('');

    await validate(model, 'javascript');

    expect(mockLintingClient.validateScript).not.toHaveBeenCalled();
  });

  it('should clear markers for empty script', async () => {
    model.getValue.mockReturnValue(' ');

    await validate(model, 'javascript');

    expect(editor.setModelMarkers).toHaveBeenCalledWith(model, 'owner', []);
  });

  it('should connect client if not connected', async () => {
    mockLintingClient.isConnected.mockReturnValue(false);
    await validate(model, 'javascript');

    expect(console.warn).toHaveBeenCalledWith('Linting client not initialized. Attempting to reconnect.');
    expect(mockLintingClient.connect).toHaveBeenCalled();
  });

  it('should validate script when client is connected', async () => {
    mockLintingClient.isConnected.mockReturnValue(true);
    await validate(model, 'javascript');

    expect(mockLintingClient.validateScript).toHaveBeenCalledWith(
      sampleJS,
      'javascript',
      expect.any(Function)
    );
  });

  it('should handle connect error and log to console', async () => {
    mockLintingClient.isConnected.mockReturnValue(false);
    const error = new Error('Connection failed');
    mockLintingClient.connect.mockRejectedValue(error);

    await validate(model, 'javascript');

    expect(console.error).toHaveBeenCalledWith('Validation error', error);
  });

  it('should not validate disposed model', async () => {
    model.isDisposed.mockReturnValue(true);
    model.getValue.mockReturnValue(sampleJS);

    await validate(model, 'javascript');

    expect(mockLintingClient.validateScript).not.toHaveBeenCalled();
  });

  it('should handle validation callback', async () => {
    mockLintingClient.isConnected.mockReturnValue(true);
    mockLintingClient.validateScript.mockImplementation((script, lang, onProgress) => {
      onProgress({
        success: true,
        data: {
          markers: [ { message: 'lint error', startLineNumber: 1, endLineNumber: 1, startColumn: 1, endColumn: 10 } ],
          errorCount: 1,
          warnCount: 0,
          infoCount: 0
        },
        error: undefined
      });
      return Promise.resolve();
    });

    await validate(model, 'javascript');

    expect(editor.setModelMarkers).toHaveBeenCalledWith(model, 'owner', [
      { message: 'lint error', startLineNumber: 1, endLineNumber: 1, startColumn: 1, endColumn: 10 }
    ]);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_LINT_STATUS',
      payload: {
        success: true,
        error: undefined,
        errorCount: 1,
        warnCount: 0,
        infoCount: 0
      }
    });
  });

  it('should handle validation callback with error', async () => {
    mockLintingClient.isConnected.mockReturnValue(true);
    mockLintingClient.validateScript.mockImplementation((script, lang, onProgress) => {
      onProgress({
        success: false,
        data: {
          markers: [ { message: 'validation error', startLineNumber: 2, endLineNumber: 2, startColumn: 1, endColumn: 15 } ],
          errorCount: 0,
          warnCount: 1,
          infoCount: 0
        },
        error: 'warning found'
      });
      return Promise.resolve();
    });

    await validate(model, 'javascript');

    expect(editor.setModelMarkers).toHaveBeenCalledWith(model, 'owner', [
      { message: 'validation error', startLineNumber: 2, endLineNumber: 2, startColumn: 1, endColumn: 15 }
    ]);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_LINT_STATUS',
      payload: {
        success: false,
        error: 'warning found',
        errorCount: 0,
        warnCount: 1,
        infoCount: 0
      }
    });
  });



  it('should reset markers on new validation', async () => {
    mockLintingClient.isConnected.mockReturnValue(true);

    mockLintingClient.validateScript.mockImplementationOnce((script, lang, onProgress) => {
      onProgress({
        data: { markers: [ { message: 'first error', startLineNumber: 1, endLineNumber: 1, startColumn: 1, endColumn: 10 } ] }
      });
      return Promise.resolve();
    });

    await validate(model, 'javascript');

    mockLintingClient.validateScript.mockImplementationOnce((script, lang, onProgress) => {
      onProgress({
        data: { markers: [ { message: 'second error', startLineNumber: 2, endLineNumber: 2, startColumn: 1, endColumn: 15 } ] }
      });
      return Promise.resolve();
    });

    await validate(model, 'javascript');

    expect(editor.setModelMarkers).toHaveBeenLastCalledWith(model, 'owner', [
      { message: 'second error', startLineNumber: 2, endLineNumber: 2, startColumn: 1, endColumn: 15 }
    ]);
  });

  it('should transform markers outside script bounds', async () => {
    model.getLineCount.mockReturnValue(5);
    mockLintingClient.isConnected.mockReturnValue(true);

    mockLintingClient.validateScript.mockImplementation((script, lang, onProgress) => {
      onProgress({
        data: {
          markers: [
            { message: 'error beyond script', startLineNumber: 10, endLineNumber: 10, startColumn: 1, endColumn: 5 }
          ]
        }
      });
      return Promise.resolve();
    });

    await validate(model, 'javascript');

    expect(console.warn).toHaveBeenCalledWith('Error outside of script: Line 10: error beyond script');
    expect(editor.setModelMarkers).toHaveBeenCalledWith(model, 'owner', [
      { message: 'error beyond script', startLineNumber: 5, endLineNumber: 5, startColumn: 1, endColumn: 5 }
    ]);
  });

  it('should transform end column when -1 is present', async () => {
    model.getLineLength.mockReturnValue(25);
    mockLintingClient.isConnected.mockReturnValue(true);

    mockLintingClient.validateScript.mockImplementation((script, lang, onProgress) => {
      onProgress({
        data: {
          markers: [
            { message: 'line end error', startLineNumber: 3, endLineNumber: 3, startColumn: 1, endColumn: -1 }
          ]
        }
      });
      return Promise.resolve();
    });

    await validate(model, 'javascript');

    expect(editor.setModelMarkers).toHaveBeenCalledWith(model, 'owner', [
      { message: 'line end error', startLineNumber: 3, endLineNumber: 3, startColumn: 1, endColumn: 26 }
    ]);
  });

  it('should handle null markers in setMarkers', async () => {
    mockLintingClient.isConnected.mockReturnValue(true);

    mockLintingClient.validateScript.mockImplementation((script, lang, onProgress) => {
      onProgress({
        data: { markers: null }
      });
      return Promise.resolve();
    });

    await validate(model, 'javascript');

    expect(editor.setModelMarkers).not.toHaveBeenCalled();
  });

  it('should clear markers when model is disposed in setMarkers', async () => {
    mockLintingClient.isConnected.mockReturnValue(true);
    model.isDisposed.mockReturnValue(false);

    mockLintingClient.validateScript.mockImplementation((script, lang, onProgress) => {
      model.isDisposed.mockReturnValue(true);
      onProgress({
        data: {
          markers: [ { message: 'error', startLineNumber: 1, endLineNumber: 1, startColumn: 1, endColumn: 10 } ]
        }
      });
      return Promise.resolve();
    });

    await validate(model, 'javascript');

    expect(editor.setModelMarkers).toHaveBeenCalledWith(model, 'owner', []);
  });

  it('should clear markers when markers array is empty', async () => {
    mockLintingClient.isConnected.mockReturnValue(true);

    mockLintingClient.validateScript.mockImplementation((script, lang, onProgress) => {
      onProgress({
        data: { markers: [] }
      });
      return Promise.resolve();
    });

    await validate(model, 'javascript');

    expect(editor.setModelMarkers).toHaveBeenCalledWith(model, 'owner', []);
  });

  it('should not validate when linting is disabled', async () => {
    state.lintEnabled = false;
    const { result } = TestUtilities.renderHook(() => useScriptValidator(), { wrapper });
    const validateDisabled = result.current.validate;

    await validateDisabled(model, 'javascript');

    expect(mockLintingClient.validateScript).not.toHaveBeenCalled();
    expect(editor.setModelMarkers).toHaveBeenCalledWith(model, 'owner', []);
  });
});