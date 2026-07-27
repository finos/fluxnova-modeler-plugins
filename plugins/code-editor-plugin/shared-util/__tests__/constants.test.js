import * as CONSTANTS from '../constants';

describe('constants.test', () => {
  it.each([
    [ 'PLUGIN_NAME', 'codeEditorPlugin' ],
    [ 'OPEN_CODE_EDITOR', 'codeEditorPlugin.open' ],
    [ 'SAVE_CODE_EDITOR', 'codeEditorPlugin.saveData' ],
    [ 'CODE_EDITOR_FLAG', 'codeEditorPlugin.featureFlag' ],
    [ 'TOGGLE_CODE_EDITOR_FLAG', 'codeEditorPlugin.toggle' ],
  ])('should have correct plugin constant %s', (key, value) => {
    expect(CONSTANTS[key]).toBe(value);
  });

  it.each([
    [ 'LIGHT_THEME_KEY', 'lightTheme' ],
    [ 'MINIMAP_KEY', 'minimap' ],
    [ 'LINT_ENABLED_KEY', 'lintEnabled' ],
  ])('should have correct config constant %s', (key, value) => {
    expect(CONSTANTS[key]).toBe(value);
  });

  it.each([
    [ 'CODE_EDITOR_CONFIG', 'codeEditorPlugin.config' ],
    [ 'BPMN_MODELER_CREATED', 'bpmn.modeler.created' ],
    [ 'DMN_MODELER_CREATED', 'dmn.modeler.created' ],
    [ 'APP_ACTIVE_TAB_CHANGED', 'app.activeTabChanged' ],
    [ 'TAB_CLOSED', 'tab.closed' ],
    [ 'CREATE_NEW_TAB_ACTION', 'createNewAction.open' ],
    [ 'APP_CLIENT_READY', 'app:client-ready' ],
    [ 'QUIT', 'quit' ],
    [ 'LINTING_SERVER_STATUS', 'lintingServer.status' ],
  ])('should have correct subscribe event constant %s', (key, value) => {
    expect(CONSTANTS[key]).toBe(value);
  });
});
