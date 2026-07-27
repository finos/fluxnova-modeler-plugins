import React from 'preact/compat';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import EditIcon from '../../../resources/icons/edit.svg';
import { OPEN_CODE_EDITOR, SAVE_CODE_EDITOR } from '../../../../shared-util/constants';
import { TextFieldEntry } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

const _conditionalHandlers = new WeakMap();

export function ConditionalScript(props) {
  const {
    element
  } = props;

  const eventBus = useService('eventBus');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getConditionExpression(element).get('body');
  };

  const setValue = value => {
    const currentValue = getValue();
    if (currentValue !== value) {
      commandStack.execute('element.updateModdleProperties', {
        element: element,
        moddleElement: getConditionExpression(element),
        properties: {
          'body': value || ''
        }
      });
    }
  };

  const handleOpenEditor = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const conditionExpression = getConditionExpression(element);
    const prevHandler = _conditionalHandlers.get(conditionExpression);
    if (prevHandler) {
      eventBus.off(SAVE_CODE_EDITOR, prevHandler);
    }

    const handler = (event) => {
      if (event.node === conditionExpression) {
        setValue(event.data);
      }
    };
    _conditionalHandlers.set(conditionExpression, handler);
    eventBus.on(SAVE_CODE_EDITOR, 10000, handler);

    eventBus.fire(OPEN_CODE_EDITOR, {
      element: element,
      data: getValue(),
      mode: getScriptLanguage(element),
      node: conditionExpression,
    });
  };

  return (
    <>
      <div className="edit-script-container">
        <TextFieldEntry
          element={ element }
          id={ 'conditionScriptValue' }
          label={ translate('Script') }
          disabled={ true }
          getValue={ getValue }
          setValue={ setValue }
          debounce={ debounce }
        />

        {/* Cant use button or input tags here - it bypasses the disableModeling logic */}
        <span onClick={ handleOpenEditor }>
          <EditIcon className="edit-icon" />
          Edit Script
        </span>
      </div>
    </>
  );
}

export function getScriptType(element) {
  const conditionExpression = getConditionExpression(element);
  if (conditionExpression) {
    const resource = conditionExpression.get('camunda:resource');

    if (typeof resource !== 'undefined') {
      return 'resource';
    } else {
      return 'script';
    }
  }
}

export function getScriptLanguage(element) {
  return getConditionExpression(element).get('language');
}

/**
 * getConditionExpression - get the body value of a condition expression for a given element
 *
 * @param  {ModdleElement} element
 *
 * @return {string|undefined}
 */


function getConditionExpression(element) {
  const businessObject = getBusinessObject(element);

  if (is(businessObject, 'bpmn:SequenceFlow')) {
    return businessObject.get('conditionExpression');
  } else if (getConditionalEventDefinition(businessObject)) {
    return getConditionalEventDefinition(businessObject).get('condition');
  }
}

function getConditionalEventDefinition(element) {
  if (!is(element, 'bpmn:Event')) {
    return false;
  }

  return getEventDefinition(element, 'bpmn:ConditionalEventDefinition');
}

function getEventDefinition(element, eventType) {
  const businessObject = getBusinessObject(element);
  const eventDefinitions = businessObject.get('eventDefinitions') || [];
  return eventDefinitions.find(definition => is(definition, eventType));
}