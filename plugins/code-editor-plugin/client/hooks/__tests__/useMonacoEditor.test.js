import React from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import useMonacoEditor from '../useMonacoEditor';
import useDebouncedCallback from '../useDebouncedCallback';
import TestUtilities from '../../../shared-util/test-utilities';
import { CodeEditorContext } from '../../CodeEditorContext';

const mockSelection = { startLineNumber: 1, startColumn: 1, endLineNumber: 2, endColumn: 2 };
let state, mockDispatch;
const wrapper = ({ children }) => (
  <CodeEditorContext.Provider value={ { state, dispatch: mockDispatch } }>
    {children}
  </CodeEditorContext.Provider>
);

jest.mock('monaco-editor/esm/vs/editor/editor.api', () => ({
  editor: {
    create: jest.fn(),
    defineTheme: jest.fn(),
  },
  languages: {
    typescript: {
      javascriptDefaults: {
        addExtraLib: jest.fn(),
      }
    }
  }
}));

jest.mock('../useDebouncedCallback', () => {
  return jest.fn((callback, _delay) => {
    const debouncedFn = jest.fn((...args) => callback(...args));
    debouncedFn.cancel = jest.fn();
    return debouncedFn;
  });
});

const mockValidate = jest.fn();
jest.mock('../useScriptValidator', () => ({
  useScriptValidator: () => ({ validate: mockValidate })
}));

const containerRefMockValue = { current: document.createElement('div') };

jest.spyOn(React, 'useRef').mockImplementation((initialValue) => {
  if (initialValue === null) {
    return containerRefMockValue;
  }
  if (typeof initialValue === 'undefined') {
    return { current: () => {} };
  }
  return { current: initialValue };
});


describe('useMonacoEditor', () => {
  const mockFn = jest.fn();
  let containerRefMock, editorMock;

  beforeEach(() => {
    containerRefMock = { current: document.createElement('div') };

    editorMock = {
      layout: mockFn,
      dispose: mockFn,
      onDidChangeModelContent: jest.fn((cb) => {
        setTimeout(() => cb(), 0);
        return { dispose: mockFn };
      }),
      onDidChangeCursorSelection: jest.fn((_cb) => {

        // _cb();
        return { dispose: mockFn };
      }),
      getModel: jest.fn(() => { return { model: {} }; }),
      getValue: jest.fn(() => 'Updated value'),
      getSelection: jest.fn(() => ({
        ...mockSelection,
        equalsSelection: jest.fn(() => true),
      })),
      setValue: mockFn,
      setSelection: mockFn,
      equalsSelection: mockFn,
      focus: mockFn,
      updateOptions: mockFn
    };

    monaco.editor.create.mockReturnValue(editorMock);
    mockDispatch = jest.fn();
    state = {
      data:'some code',
      selection: null,
      language: 'javascript',
      lightTheme: false,
      minimap: false
    };

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the editor with the correct options', () => {

    // mock containerRef
    containerRefMock = { current: document.createElement('div') };

    state = { ...state, selection: mockSelection, lightTheme: false, minimap: true };
    TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    // ensure .create is called with the correct ref and args
    expect(monaco.editor.create).toHaveBeenCalledWith(containerRefMock.current, {
      value: 'some code',
      language: 'javascript',
      theme: 'vs-dark',
      minimap: { enabled: true },
      fixedOverflowWidgets: true,
    });

    // ensure selection is set correctly
    expect(editorMock.setSelection).toHaveBeenCalledWith(mockSelection);
  });

  it('should call onEditorChange on content change', async () => {
    state = { ...state, lightTheme: false, minimap: true };
    TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    const debouncedOnEditorChange = useDebouncedCallback.mock.results[0].value;
    await TestUtilities.allowComponentUpdates();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'OPEN_MODAL',
      payload: { data: 'Updated value', selection: expect.objectContaining(mockSelection) }
    });

    mockDispatch.mockClear();
    editorMock.onDidChangeModelContent.mock.calls[0][0]();
    await TestUtilities.allowComponentUpdates();

    expect(debouncedOnEditorChange).toHaveBeenCalledWith('Updated value', expect.objectContaining(mockSelection));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'OPEN_MODAL',
      payload: { data: 'Updated value', selection: expect.objectContaining(mockSelection) }
    });
  });

  it('should call onEditorChange on content change on cursor changes', async () => {
    state = { ...state, lightTheme: false, minimap: true };
    TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    await TestUtilities.allowComponentUpdates();
    mockDispatch.mockClear();

    const debouncedOnEditorChange = useDebouncedCallback.mock.results[0].value;
    const newSelection = { startLineNumber: 12, startColumn: 2, endLineNumber: 15, endColumn: 4 };
    editorMock.getSelection.mockReturnValue(newSelection);

    editorMock.onDidChangeCursorSelection.mock.calls[0][0]();

    expect(debouncedOnEditorChange).toHaveBeenCalledWith('Updated value', expect.objectContaining({
      startLineNumber: newSelection.startLineNumber,
      startColumn: newSelection.startColumn,
      endLineNumber: newSelection.endLineNumber,
      endColumn: newSelection.endColumn,
    }));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'OPEN_MODAL',
      payload: { data: 'Updated value', selection: expect.objectContaining(newSelection) }
    });
  });

  it('should cleanup the editor on unmount', () => {
    state = { ...state, lightTheme: false, minimap: true };
    const { unmount } = TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    unmount();
    expect(editorMock.dispose).toHaveBeenCalled();
  });

  it('should handle window resizing', () => {
    state = { ...state, selection: mockSelection, lightTheme: false, minimap: true };
    TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    window.dispatchEvent(new Event('resize'));
    expect(editorMock.layout).toHaveBeenCalled();
  });

  it('should call validateScript on content change', async () => {
    expect(mockValidate).not.toHaveBeenCalled();

    state = { ...state, lightTheme: false, minimap: true };
    TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    const debouncedOnEditorChange = useDebouncedCallback.mock.results[0].value;

    expect(mockValidate).toHaveBeenCalledTimes(2);
    expect(mockValidate).toHaveBeenCalledWith({ model: {} }, 'javascript');
    await TestUtilities.allowComponentUpdates();

    expect(mockValidate).toHaveBeenCalledTimes(3);

    editorMock.onDidChangeModelContent.mock.calls[0][0]();
    await TestUtilities.allowComponentUpdates();

    expect(mockValidate).toHaveBeenCalledTimes(4);
    expect(debouncedOnEditorChange).toHaveBeenCalledWith('Updated value', expect.objectContaining(mockSelection));
  });

  it('should create editor with theme and minimap params', () => {
    state = { ...state, lightTheme: true, minimap: false };
    TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    expect(monaco.editor.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        theme: 'vs-light',
        minimap: { enabled: false }
      })
    );
  });

  it('should update editor options when lightTheme or minimap changes', () => {
    state = { ...state, lightTheme: false, minimap: false };
    const { rerender } = TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    expect(monaco.editor.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        theme: 'vs-dark',
        minimap: { enabled: false }
      })
    );

    state = { ...state, lightTheme: true, minimap: true };
    rerender();

    expect(editorMock.updateOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'vs-light',
        minimap: { enabled: true }
      })
    );
  });

  it('should load Execution TypeScript definitions as extra lib (global)', () => {
    state = { ...state, lightTheme: false, minimap: true };
    TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    expect(monaco.languages.typescript.javascriptDefaults.addExtraLib).toHaveBeenCalledTimes(1);
    expect(monaco.languages.typescript.javascriptDefaults.addExtraLib).toHaveBeenCalledWith(
      expect.stringContaining('declare const execution: DelegateExecution')
    );
  });

  it('should validate script when lintEnabled changes', () => {
    state = { ...state, lightTheme: false, minimap: false, lintEnabled: false };
    const { rerender } = TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    mockValidate.mockClear();

    state = { ...state, lintEnabled: true };
    rerender();

    expect(mockValidate).toHaveBeenCalled();
  });

  it('should fire eventBus when eventBus and element are in state', async () => {
    const mockEventBus = { fire: jest.fn() };
    state = { ...state, lightTheme: false, minimap: true, eventBus: mockEventBus, element: { id: 'task1' }, node: { type: 'script' } };
    TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    await TestUtilities.allowComponentUpdates();

    expect(mockEventBus.fire).toHaveBeenCalledWith('codeEditorPlugin.saveData', {
      element: { id: 'task1' },
      node: { type: 'script' },
      data: 'Updated value',
    });
  });

  it('should not fire eventBus when element is missing', async () => {
    const mockEventBus = { fire: jest.fn() };
    state = { ...state, lightTheme: false, minimap: true, eventBus: mockEventBus, element: null };
    TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    await TestUtilities.allowComponentUpdates();

    expect(mockEventBus.fire).not.toHaveBeenCalled();
  });

  it('should not dispatch OPEN_MODAL when value and selection are unchanged', async () => {
    editorMock.getValue.mockReturnValue('some code');
    editorMock.getSelection.mockReturnValue(null);
    state = { ...state, data: 'some code', selection: null, lightTheme: false, minimap: true };
    TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    await TestUtilities.allowComponentUpdates();

    expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'OPEN_MODAL' }));
  });

  it('should dispatch SET_LINT_STATUS on unmount', () => {
    state = { ...state, lightTheme: false, minimap: true };
    const { unmount } = TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    unmount();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_LINT_STATUS',
      payload: {
        success: false,
        error: null,
        errorCount: null,
        warnCount: null,
        infoCount: null,
      }
    });
  });

  it('should create editor with lowercase language for non-JS languages', () => {
    state = { ...state, language: 'Groovy', lightTheme: false, minimap: false };
    TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    expect(monaco.editor.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ language: 'groovy' })
    );
  });

  it('should cancel debounced callback on unmount', () => {
    state = { ...state, lightTheme: false, minimap: false };
    const { unmount } = TestUtilities.renderHook(() => useMonacoEditor(), { wrapper });

    const debouncedOnEditorChange = useDebouncedCallback.mock.results[0].value;

    unmount();

    expect(debouncedOnEditorChange.cancel).toHaveBeenCalled();
  });
});

