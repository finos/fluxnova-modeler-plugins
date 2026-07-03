import CodePropertiesProvider from './propertiesProvider/CodePropertiesProvider';
import DisableModelingCode from './disableModeling/DisableModeling';

/**
 * A bpmn-js module, defining all extension services and their dependencies.
 *
 */
export default {
  __init__: [ 'codePropertiesProvider', 'disableModelingCode', ],
  codePropertiesProvider: [ 'type', CodePropertiesProvider ],
  disableModelingCode: [ 'type', DisableModelingCode ],
};
