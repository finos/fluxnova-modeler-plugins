import React from 'preact/compat';
import { useService } from 'bpmn-js-properties-panel';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { TextFieldEntry } from '@bpmn-io/properties-panel';

import { OPEN_CODE_EDITOR, SAVE_CODE_EDITOR } from '../../../../shared-util/constants';
import EditIcon from '../../../resources/icons/edit.svg';

const _scriptHandlers = new WeakMap();

export function Script(props) {
  const {
    element,
    idPrefix,
    script
  } = props;

  const eventBus = useService('eventBus');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const businessObject = script || getBusinessObject(element);
  const scriptProperty = getScriptProperty(businessObject);

  const getValue = () => {
    return getScriptValue(businessObject);
  };

  const setValue = value => {
    const currentValue = getValue();
    if (currentValue !== value) {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: businessObject,
        properties: {
          [scriptProperty]: value || ''
        }
      });
    }
  };

  const handleOpenEditor = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const prevHandler = _scriptHandlers.get(businessObject);
    if (prevHandler) {
      eventBus.off(SAVE_CODE_EDITOR, prevHandler);
    }

    const handler = (event) => {
      if (event.node === businessObject) {
        setValue(event.data);
      }
    };
    _scriptHandlers.set(businessObject, handler);
    eventBus.on(SAVE_CODE_EDITOR, 10000, handler);

    eventBus.fire(OPEN_CODE_EDITOR, {
      element: element,
      data: getValue(),
      mode: getScriptFormat(businessObject),
      node: businessObject,
    });
  };

  return (
    <>
      <div className="edit-script-container">
        <TextFieldEntry
          element={ element }
          id={ idPrefix + 'scriptValue' }
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
  const businessObject = getBusinessObject(element);
  const scriptValue = getScriptValue(businessObject);

  if (typeof scriptValue !== 'undefined') {
    return 'script';
  }

  const resource = businessObject.get('camunda:resource');

  if (typeof resource !== 'undefined') {
    return 'resource';
  }
}

export function getScriptFormat(businessObject) {
  return businessObject.get('scriptFormat');
}

function getScriptValue(businessObject) {
  return businessObject.get(getScriptProperty(businessObject));
}

function getScriptProperty(businessObject) {
  return isScript(businessObject) ? 'value' : 'script';
}

function isScript(element) {
  return is(element, 'camunda:Script');
}