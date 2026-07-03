import React from 'react';
import TestUtilities from '../../../../../shared-util/test-utilities';
import { ConditionalScript, getScriptLanguage, getScriptType } from '../ConditionalProps';
import { useService } from 'bpmn-js-properties-panel';
import { OPEN_CODE_EDITOR, SAVE_CODE_EDITOR } from '../../../../../shared-util/constants';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

jest.mock('bpmn-js/lib/util/ModelUtil', () => ({
  is: jest.fn(),
  getBusinessObject: jest.fn()
}));

describe('ConditionalProps', () => {
  let elementMock, businessObjectMock, conditionExpressionMock;
  let eventBusMock, commandStackMock, translateMock, debounceMock;
  let props;

  const mockFn = jest.fn();

  beforeEach(()=> {
    eventBusMock = {
      on: jest.fn(),
      off: jest.fn(),
      fire: mockFn,
    };

    commandStackMock = { execute: mockFn };

    translateMock = jest.fn((key) => key);
    debounceMock = jest.fn((fn)=> fn);

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

    conditionExpressionMock = {
      get: jest.fn((prop) => {
        if (prop === 'body') return 'some condition script';
        if (prop === 'language') return 'javascript';
        if (prop === 'camunda:resource') return 'camunda:resource';
        return undefined;
      })
    };

    businessObjectMock = {
      $type: 'bpmn:SequenceFlow',
      get: jest.fn((prop) => {
        if (prop === 'conditionExpression') return conditionExpressionMock;
        return undefined;
      })
    };

    is.mockImplementation((obj, type) => obj.$type === type);
    getBusinessObject.mockReturnValue(businessObjectMock);

    elementMock = { id: 'SequenceFlow_1' };


    props = { element: elementMock };
  });

  afterEach(()=>{
    jest.restoreAllMocks();
  });

  it('should render TextFieldEntry with correct props', async () => {

    await TestUtilities.render(
      <ConditionalScript { ...props } />
    );

    const textField = await TestUtilities.getByTestId('text-field-entry');
    expect(textField).toBeInTheDocument();
    expect(textField).toBeDisabled();
  });

  it('should fire OPEN_CODE_EDITOR event when triggering the modal', async () => {

    await TestUtilities.render(
      <ConditionalScript { ...props } />
    );

    // trigger modal
    await TestUtilities.clickByText('Edit Script');

    expect(eventBusMock.on).toHaveBeenCalledWith(
      SAVE_CODE_EDITOR,
      10000,
      expect.any(Function)
    );

    // check editor is open with the correct data passed in
    expect(eventBusMock.fire).toHaveBeenCalledWith(OPEN_CODE_EDITOR, {
      element: elementMock,
      data: 'some condition script',
      mode: 'javascript',
      node: conditionExpressionMock,
    });
  });


  it('should handle SAVE_CODE_EDITOR event and update script value', async () => {
    await TestUtilities.render(
      <ConditionalScript { ...props } />
    );

    // launch code editor
    await TestUtilities.clickByText('Edit Script');

    const saveCallback = eventBusMock.on.mock.calls[0][2];
    saveCallback({ node: conditionExpressionMock, data: 'new condition script' });

    expect(commandStackMock.execute).toHaveBeenCalledWith('element.updateModdleProperties', {
      element: elementMock,
      moddleElement: conditionExpressionMock,
      properties: { body: 'new condition script' }
    });
  });
});

describe('ConditionalScript Helpers', () => {
  let element = {};
  function createMockBusinessObj({
    type = 'bpmn:SequenceFlow',
    resource,
    language,
    noConditionExpression
  } = {}) {
    const conditionExpression = {
      get: jest.fn((prop) => {
        if (prop === 'language') return language;
        if (prop === 'camunda:resource') return resource;
        return undefined;
      })
    };

    return {
      $type: type,
      get: jest.fn(prop => {
        if (!noConditionExpression && prop === 'conditionExpression') return conditionExpression;
        return undefined;
      })
    };
  }

  beforeEach(() => {
    is.mockImplementation((obj, type) => obj.$type === type);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getScriptType', () => {
    it('should return "script" if conditionExpression has no "camunda:resource"', () => {
      const bo = createMockBusinessObj({ resource: undefined });
      getBusinessObject.mockReturnValue(bo);
      expect(getScriptType(element)).toBe('script');
    });

    it('should return "resource" if conditionExpression has "camunda:resource"', () => {
      const bo = createMockBusinessObj({ resource: 'some resource' });
      getBusinessObject.mockReturnValue(bo);
      expect(getScriptType(element)).toBe('resource');
    });

    it('should return undefined if no conditionExpression found', () => {
      const bo = createMockBusinessObj({ noConditionExpression: true });
      getBusinessObject.mockReturnValue(bo);
      expect(getScriptType(element)).toBeUndefined();
    });
  });

  describe('getScriptLanguage', () => {
    it('should return language from conditionExpression', () => {
      const bo = createMockBusinessObj({ language: 'groovy' });
      getBusinessObject.mockReturnValue(bo);
      expect(getScriptLanguage(element)).toBe('groovy');
    });
  });
});