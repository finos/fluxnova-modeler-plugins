import React from 'react';
import TestUtilities from '../../../../../shared-util/test-utilities';
import { Script, getScriptFormat, getScriptType } from '../ScriptProps';
import { OPEN_CODE_EDITOR, SAVE_CODE_EDITOR } from '../../../../../shared-util/constants';
import { useService } from 'bpmn-js-properties-panel';

describe('ScriptProps', () => {
  let elementMock, businessObjectMock;
  let eventBusMock, commandStackMock, translateMock, debounceMock;
  let props;

  const mockFn = jest.fn();

  beforeEach(()=> {
    businessObjectMock = {
      get: jest.fn((property) => (property === 'scriptFormat' ? 'javascript' : 'some script'))
    };
    elementMock = { businessObject: businessObjectMock };

    eventBusMock = {
      on: jest.fn(),
      off: jest.fn(),
      fire: mockFn,
    };

    commandStackMock = {
      execute: mockFn,
    };

    translateMock = jest.fn((key) => key);
    debounceMock = jest.fn((fn) => fn);

    useService.mockImplementation((service)=> {
      switch (service) {
      case 'eventBus':
        return eventBusMock;
      case 'commandStack':
        return commandStackMock;
      case 'translate':
        return translateMock;
      case 'debounceInput':
        return debounceMock;
      default:
        return null;
      }
    });

    props = {
      element: elementMock,
      idPrefix: 'testPrefix_',
      script: null,
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render TextFieldEntry with correct props', async () => {
    await TestUtilities.render(
      <Script { ...props } />
    );

    const textField = await TestUtilities.getByTestId('text-field-entry');
    expect(textField).toBeInTheDocument();
    expect(textField).toBeDisabled();
  });

  it('should fire OPEN_CODE_EDITOR event when triggering the modal', async () => {
    await TestUtilities.render(
      <Script { ...props } />
    );

    // trigger modal
    await TestUtilities.clickByText('Edit Script');

    expect(eventBusMock.on).toHaveBeenCalledWith(
      SAVE_CODE_EDITOR,
      10000,
      expect.any(Function)
    );

    expect(eventBusMock.fire).toHaveBeenCalledWith(OPEN_CODE_EDITOR, {
      element: elementMock,
      data: 'some script',
      mode: 'javascript',
      node: businessObjectMock,
    });
  });


  it('should handle SAVE_CODE_EDITOR event and update script value', async () => {
    await TestUtilities.render(
      <Script { ...props } />
    );

    // launch code editor
    await TestUtilities.clickByText('Edit Script');

    const saveCallback = eventBusMock.on.mock.calls[0][2];
    saveCallback({ node: businessObjectMock, data: 'mock updated script' });

    expect(commandStackMock.execute).toHaveBeenCalledWith('element.updateModdleProperties', {
      element: elementMock,
      moddleElement: elementMock.businessObject,
      properties: { script: 'mock updated script' }
    });
  });
});

describe('Script Helpers', () => {
  let businessObject;

  beforeEach(() => {
    businessObject = {
      get: jest.fn((prop) => {
        if (prop === 'scriptFormat') return 'javascript';
        if (prop === 'camunda:resource') return 'resource';
        return undefined;
      })
    };
  });

  it ('should return correct script type', () => {
    const elementWithScript = { businessObject: { get: jest.fn(() => 'some script') } };
    expect(getScriptType(elementWithScript)).toBe('script');

    const elementWithResource = { businessObject };
    expect(getScriptType(elementWithResource)).toBe('resource');

    const elementWithNoScript = { businessObject: { get: jest.fn(() => undefined) } };
    expect(getScriptType(elementWithNoScript)).toBeUndefined();
  });

  it('should return correct script format', () => {
    expect(getScriptFormat(businessObject)).toBe('javascript');
  });
});
