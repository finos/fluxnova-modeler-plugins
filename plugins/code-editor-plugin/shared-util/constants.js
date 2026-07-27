/**
 * A list of event types called on {@link eventBus}
 * @type {string}
 */
export const PLUGIN_NAME = 'codeEditorPlugin';
export const OPEN_CODE_EDITOR = PLUGIN_NAME + '.open';
export const SAVE_CODE_EDITOR = PLUGIN_NAME + '.saveData';
export const CODE_EDITOR_FLAG = PLUGIN_NAME + '.featureFlag';
export const TOGGLE_CODE_EDITOR_FLAG = PLUGIN_NAME + '.toggle';

/** Config */
export const LIGHT_THEME_KEY = 'lightTheme';
export const MINIMAP_KEY = 'minimap';
export const LINT_ENABLED_KEY = 'lintEnabled';

/** Subscribe events  */
export const CODE_EDITOR_CONFIG = PLUGIN_NAME + '.config';
export const BPMN_MODELER_CREATED = 'bpmn.modeler.created';
export const DMN_MODELER_CREATED = 'dmn.modeler.created';
export const APP_ACTIVE_TAB_CHANGED = 'app.activeTabChanged';
export const TAB_CLOSED = 'tab.closed';
export const CREATE_NEW_TAB_ACTION = 'createNewAction.open';
export const APP_CLIENT_READY = 'app:client-ready';
export const QUIT = 'quit';
export const LINTING_SERVER_STATUS = 'lintingServer.status';