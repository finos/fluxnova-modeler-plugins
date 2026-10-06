import { CODE_EDITOR_FLAG, TOGGLE_CODE_EDITOR_FLAG } from '../../../shared-util/constants';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import { Script, getScriptType, getScriptFormat } from './props/ScriptProps';

import {
  ConditionalScript,
  getScriptLanguage,
  getScriptType as getConditionalScriptType
} from './props/ConditionalProps';

const SUPPORTED_LANGUAGES = [ 'groovy', 'javascript', 'js' ];

/**
 * Checks if the given language is supported.
 *
 * @param {string} lang - language to check.
 * @return {boolean} - True if is supported, false otherwise
 */
const isSupportedLanguage = (lang) => lang && SUPPORTED_LANGUAGES.includes(lang.toLowerCase());

/**
 * Updates the component of an entry.
 *
 * @param {Array} entries - The list of entries.
 * @param {string} entryId - The ID of the entry to update.
 * @param {Object} component - The component to set.
 */
const updateComponent = (entries, entryId, component) => {
  return entries.map(entry =>
    entry.id === entryId
      ? { ...entry, component, isEdited: isTextFieldEntryEdited }
      : entry
  );
};

/**
 * Our custom PropertiesProvider, replacing default camunda fields like scriptTaskProps with our custom properties.
 *
 */
export default class CodePropertiesProvider {
  constructor(propertiesPanel, injector, editorActions) {
    this.isEnabled = true;
    this.injector = injector;
    this.editorActions = editorActions;
    const eventBus = injector.get('eventBus');

    eventBus.on(CODE_EDITOR_FLAG, (e) => {
      this.isEnabled = e.enabled ?? true;
    });

    editorActions.register({
      toggleCodeEditor: function() {
        this.isEnabled = !this.isEnabled;
        eventBus.fire(TOGGLE_CODE_EDITOR_FLAG, { enabled: this.isEnabled });
      }.bind(this)
    });

    propertiesPanel.registerProvider(200, this);
  }

  /**
   * Return the groups provided for the given element.
   *
   * @param element
   *
   * @return groups middleware
   */
  getGroups(element) {
    return groups => {
      if (!this.isEnabled) {
        return groups;
      }
      const businessObject = getBusinessObject(element);

      let scriptGroup = groups.find(entry => entry.id === 'CamundaPlatform__Script');
      if (scriptGroup && getScriptType(element) === 'script' && isSupportedLanguage(getScriptFormat(businessObject))) {
        scriptGroup.entries = updateComponent(scriptGroup.entries, 'scriptValue', Script);
      }

      let conditionGroup = groups.find(entry => entry.id === 'CamundaPlatform__Condition');
      if (conditionGroup && getConditionalScriptType(element) === 'script' && isSupportedLanguage(getScriptLanguage(businessObject))) {
        conditionGroup.entries = updateComponent(conditionGroup.entries, 'conditionScriptValue', ConditionalScript);
      }

      // Decorate Listeners and I/O Params groups
      [
        'CamundaPlatform__TaskListener',
        'CamundaPlatform__ExecutionListener',
        'CamundaPlatform__Input',
        'CamundaPlatform__Output',
        'CamundaPlatform__ConnectorInput',
        'CamundaPlatform__ConnectorOutput'
      ].forEach(groupId => {
        const group = groups.find(entry => entry.id === groupId);
        if (group) decorateGroup(group);
      });

      return groups;
    };
  }
}

/**
 * Decorates a group by modifying its entries
 *
 * @param {Object} group
 */
export function decorateGroup(group) {
  group.items.map(item => {
    let scriptValue = item.entries.find(entry => entry.id.endsWith('scriptValue'));

    if (scriptValue) {
      let scriptObject = scriptValue.script;
      let scriptFormat = scriptObject.get('scriptFormat');

      if (isSupportedLanguage(scriptFormat)) {
        scriptValue.component = Script;
        scriptValue.isEdited = isTextFieldEntryEdited;
      }
    }
  });
}

CodePropertiesProvider.$inject = [ 'propertiesPanel', 'injector', 'editorActions' ];