import React, { useEffect } from 'react';

import {
  CODE_EDITOR_FLAG, OPEN_CODE_EDITOR, CODE_EDITOR_CONFIG,
  TOGGLE_CODE_EDITOR_FLAG, PLUGIN_NAME,
  BPMN_MODELER_CREATED, DMN_MODELER_CREATED,
  APP_ACTIVE_TAB_CHANGED, LINTING_SERVER_STATUS,
  LIGHT_THEME_KEY, MINIMAP_KEY, LINT_ENABLED_KEY,
  TAB_CLOSED, CREATE_NEW_TAB_ACTION,
} from '../shared-util/constants';
import CodeEditorModal from './ui/CodeEditorModal';
import { registerGroovyLanguageForMonaco } from './lib/RegisterGroovy';
import { getConfigValue, setConfigValue } from './util/ConfigHelper';
import CodeEditorProvider, { useCodeEditorContext } from './CodeEditorContext';
import LintingClient from './lib/LintingClient';
import useCodeEditorActions from './hooks/useCodeEditorActions';

const CodeEditorPluginComponent = () => {
  const { state, dispatch, subscribe, displayNotification, config } = useCodeEditorContext();
  const { closeEditor } = useCodeEditorActions();

  const initModeler = async ({ modeler, tab }) => {
    const eventBus = modeler?.get?.('eventBus') || modeler?._eventBus;
    const isEnabled = await getConfigValue(config, PLUGIN_NAME, 'enabled', true);

    eventBus.fire(CODE_EDITOR_FLAG, { enabled: isEnabled });
    eventBus.on(TOGGLE_CODE_EDITOR_FLAG, async (e) => {
      const isMac = config.backend.getPlatform() === 'darwin';
      const modifierKey = isMac ? '⌘' : 'Ctrl';
      const content =
        <div>
          <p>Code Editor is now <b>{`${e.enabled ? 'enabled' : 'disabled'}`}</b>.</p>
          <span>Please reload the modeler with</span><br /><kbd>{modifierKey}</kbd> + <kbd>R</kbd>
        </div>;

      await setConfigValue(config, PLUGIN_NAME, 'enabled', e.enabled);
      displayNotification({
        title: 'Code Editor Plugin',
        content,
        type: 'info'
      });
    });

    dispatch({
      type: 'INIT_MODELER',
      payload: {
        modeler,
        eventBus,
        tabModelerEntry: { tabId: tab.id, modeler }
      }
    });

    eventBus.on(OPEN_CODE_EDITOR, async (event) => {
      const lightTheme = await getConfigValue(config, PLUGIN_NAME, LIGHT_THEME_KEY);
      const minimap = await getConfigValue(config, PLUGIN_NAME, MINIMAP_KEY);
      const lintEnabled = await getConfigValue(config, PLUGIN_NAME, LINT_ENABLED_KEY, true);

      dispatch({
        type: 'SET_PREFERENCES',
        payload: {
          lightTheme: lightTheme !== undefined ? lightTheme : false,
          minimap: minimap !== undefined ? minimap : false,
          lintEnabled: lintEnabled !== undefined ? lintEnabled : true,
        }
      });

      dispatch({
        type: 'OPEN_MODAL',
        payload: {
          element: event.element,
          node: event.node,
          data: event.data,
          language: event.mode,
        },
      });
    });
  };

  const initLintClient = async ({ lintingServerUrl }) => {
    try {
      if (lintingServerUrl) {
        await setConfigValue(config, PLUGIN_NAME, 'wsUrl', lintingServerUrl);
      }

      const wsUrl = lintingServerUrl || await getConfigValue(config, PLUGIN_NAME, 'wsUrl');

      if (state.lintClient?.isConnected() && state.lintClient._wsUrl === wsUrl) {
        return;
      }

      if (state.lintClient?.isConnected()) {
        await state.lintClient.disconnect();
      }

      const lintClient = new LintingClient(wsUrl);
      await lintClient.connect();

      dispatch({
        type: 'SET_LINT_CLIENT',
        payload: lintClient,
      });
    } catch (err) {
      console.error('Error initializing lint client', err);
    }
  };

  const handleActiveTabChange = (tab) => {
    const activeTabId = tab.activeTab.id;
    const activeModeler = state.tabModeler.find(item => item.tabId === activeTabId);

    if (activeModeler?.modeler) {
      const eventBus = activeModeler.modeler?.get?.('eventBus') || activeModeler.modeler?._eventBus;

      dispatch({
        type: 'SET_ACTIVE_MODELER',
        payload: {
          modeler: activeModeler.modeler,
          eventBus
        }
      });
    }
    closeEditor();
  };

  const handleLintStatusCheck = (data) => {
    const { isRunning, hasClient, url } = data;
    const content = (
      <div>
        <p>Server: {isRunning ? 'Running' : 'Stopped'}</p>
        <p>Client: {hasClient ? 'Connected' : 'Disconnected'}</p>
        <p>WebSocket URL: <code>{url || 'N/A'}</code></p>
      </div>
    );

    displayNotification({
      title: 'Linting Server Status',
      content,
      type: 'info'
    });
  };

  useEffect(() => {
    const bpmnCreatedSub = subscribe(BPMN_MODELER_CREATED, initModeler);
    const dmnCreatedSub = subscribe(DMN_MODELER_CREATED, initModeler);
    const tabChangeSub = subscribe(APP_ACTIVE_TAB_CHANGED, handleActiveTabChange);
    const codeEditorConfigSub = subscribe(CODE_EDITOR_CONFIG, initLintClient);
    const lintServerStatus = subscribe(LINTING_SERVER_STATUS, handleLintStatusCheck);
    const tabClosedSub = subscribe(TAB_CLOSED, closeEditor);
    const createNewTabActionSub = subscribe(CREATE_NEW_TAB_ACTION, closeEditor);

    registerGroovyLanguageForMonaco();

    return () => {
      bpmnCreatedSub.cancel();
      dmnCreatedSub.cancel();
      tabChangeSub.cancel();
      codeEditorConfigSub.cancel();
      lintServerStatus.cancel();
      tabClosedSub.cancel();
      createNewTabActionSub.cancel();
    };
  }, [ state, subscribe, dispatch, displayNotification, config ]);
  return state.modalOpen ? <CodeEditorModal /> : null;
};

const CodeEditorPlugin = (props) => {
  return (
    <CodeEditorProvider { ...props }>
      <CodeEditorPluginComponent />
    </CodeEditorProvider>
  );
};

export default CodeEditorPlugin;
