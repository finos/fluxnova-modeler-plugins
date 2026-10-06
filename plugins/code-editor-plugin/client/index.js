import {
  registerClientExtension,
  registerBpmnJSPlugin,
} from 'camunda-modeler-plugin-helpers';

import BpmnExtensionModule from './bpmn-js-extension';
import CodeEditorPlugin from './CodeEditorPlugin';

registerBpmnJSPlugin(BpmnExtensionModule);
registerClientExtension(CodeEditorPlugin);
