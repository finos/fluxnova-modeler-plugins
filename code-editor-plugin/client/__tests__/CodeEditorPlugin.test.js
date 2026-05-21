import React from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import TestUtilities from '../../shared-util/test-utilities';
import CodeEditorPlugin from '../CodeEditorPlugin';
import {
  CODE_EDITOR_CONFIG, CODE_EDITOR_FLAG,
  LINT_ENABLED_KEY, LIGHT_THEME_KEY, MINIMAP_KEY,
  OPEN_CODE_EDITOR,
  PLUGIN_NAME,
  SAVE_CODE_EDITOR,
  TOGGLE_CODE_EDITOR_FLAG,
  BPMN_MODELER_CREATED,
  DMN_MODELER_CREATED,
  APP_ACTIVE_TAB_CHANGED,
  TAB_CLOSED,
  CREATE_NEW_TAB_ACTION,
  LINTING_SERVER_STATUS,
} from '../../shared-util/constants';
import * as CodeEditorContext from '../CodeEditorContext';
import { initialState } from '../CodeEditorContext';
import LintingClient from '../lib/LintingClient';

jest.mock('../lib/LintingClient', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    isConnected: jest.fn().mockReturnValue(true),
  }));
});

jest.mock('monaco-editor/esm/vs/editor/editor.api');

jest.mock('../ui/CodeEditorModal', () => {
  const MockCodeEditorModal = () => (
    <div data-testid="mock-modal">Modal Open</div>
  );
  MockCodeEditorModal.displayName = 'MockCodeEditorModal';
  return MockCodeEditorModal;
});

describe('CodeEditorPlugin', () => {
  let subscribeMock, displayNotificationMock, triggerActionMock, configMock, eventBusMock;

  const mockFn = jest.fn();

  const createModelerMock = (eventBus = eventBusMock) => ({
    get: jest.fn((key) => (key === 'eventBus' ? eventBus : null)),
  });

  const createSubscribeMock = (callbacks = {}) => {
    subscribeMock.mockImplementation((event, callback) => {
      if ((event === BPMN_MODELER_CREATED || event === DMN_MODELER_CREATED) && callbacks.modelerCreated) {
        callbacks.modelerCreated(callback);
      }
      if (event === CODE_EDITOR_CONFIG && callbacks.configEvent) {
        callbacks.configEvent(callback);
      }
      if (event === APP_ACTIVE_TAB_CHANGED && callbacks.activeTabChanged) {
        callbacks.activeTabChanged(callback);
      }
      if (event === TAB_CLOSED && callbacks.tabClosed) {
        callbacks.tabClosed(callback);
      }
      if (event === CREATE_NEW_TAB_ACTION && callbacks.createNewTab) {
        callbacks.createNewTab(callback);
      }
      return { cancel: mockFn };
    });
  };

  const createConfigMock = (overrides = {}) => {
    const defaults = {
      wsUrl: undefined,
      lightTheme: false,
      minimap: false,
      lintEnabled: true,
    };

    const config = { ...defaults, ...overrides };

    configMock.getForPlugin.mockImplementation((plugin, key) => config[key]);
  };

  const mockContextWithState = (stateOverrides = {}) => {
    const dispatchMock = jest.fn();
    jest.spyOn(CodeEditorContext, 'useCodeEditorContext').mockReturnValue({
      state: { ...initialState, ...stateOverrides },
      dispatch: dispatchMock,
      subscribe: subscribeMock,
      displayNotification: displayNotificationMock,
      config: configMock,
    });
    return dispatchMock;
  };

  beforeEach(() => {
    subscribeMock = jest.fn(() => ({
      cancel: mockFn,
    }));
    displayNotificationMock = mockFn;
    triggerActionMock = jest.fn(() => Promise.resolve());
    configMock = {
      getForPlugin: mockFn,
      setForPlugin: mockFn,
      backend: {
        getPlatform: mockFn
      }
    };

    eventBusMock = {
      on: mockFn,
      fire: mockFn
    };

    jest.spyOn(monaco.languages, 'register');
    jest.spyOn(monaco.languages, 'setMonarchTokensProvider');
    jest.spyOn(monaco.languages, 'setLanguageConfiguration');

    createConfigMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  const renderComponent = async () => (
    await TestUtilities.render(
      <CodeEditorPlugin
        subscribe={ subscribeMock }
        displayNotification={ displayNotificationMock }
        triggerAction={ triggerActionMock }
        config={ configMock }
      />
    )
  );

  it('should register groovy language on render', async () => {

    await renderComponent();

    expect(monaco.languages.register).toHaveBeenCalledWith({ aliases: [ 'Groovy' ], 'id': 'groovy' });
    expect(monaco.languages.setMonarchTokensProvider).toHaveBeenCalledWith('groovy', expect.objectContaining({
      brackets: [
        {
          close: ']',
          open: '[',
          token: 'delimiter.square'
        },
        {
          close: ')',
          open: '(',
          token: 'delimiter.parenthesis'
        },
        {
          close: '}',
          open: '{',
          token: 'delimiter.curly'
        }
      ],
      constants: [ 'null', 'Infinity', 'NaN', 'undefined', 'true', 'false' ]
    }));
    expect(monaco.languages.setLanguageConfiguration).toHaveBeenCalledWith('groovy', expect.objectContaining({
      autoClosingPairs: [
        { close: '}', 'open': '{' },
        { close: ']', 'open': '[' },
        { close: ')', 'open': '(' },
        { close: '"', 'open': '"' },
        { close: "'", 'open': "'" },
        { close: '`', 'open': '`' }
      ],
      brackets: [
        [ '{', '}' ],
        [ '[', ']' ],
        [ '(', ')' ]
      ],
      comments: { 'blockComment': [ '/*', '*/' ], 'lineComment': '//' },
      surroundingPairs: [
        { close: '}', 'open': '{' },
        { close: ']', 'open': '[' },
        { close: ')', 'open': '(' },
        { close: '"', 'open': '"' },
        { close: "'", 'open': "'" },
        { close: '`', 'open': '`' }
      ]
    }));

  });

  it('should subscribe to modeler events on mount', async () => {
    await renderComponent();

    expect(subscribeMock).toHaveBeenCalledWith(
      BPMN_MODELER_CREATED,
      expect.any(Function)
    );

    expect(subscribeMock).toHaveBeenCalledWith(
      DMN_MODELER_CREATED,
      expect.any(Function)
    );

    expect(subscribeMock).toHaveBeenCalledWith(
      APP_ACTIVE_TAB_CHANGED,
      expect.any(Function)
    );

    expect(subscribeMock).toHaveBeenCalledWith(
      TAB_CLOSED, expect.any(Function)
    );

    expect(subscribeMock).toHaveBeenCalledWith(
      CREATE_NEW_TAB_ACTION, expect.any(Function)
    );

    expect(subscribeMock).toHaveBeenCalledWith(
      CODE_EDITOR_CONFIG, expect.any(Function)
    );

    expect(subscribeMock).toHaveBeenCalledWith(
      LINTING_SERVER_STATUS, expect.any(Function)
    );
  });

  it('should cancel listeners on unmount', async () => {
    const { unmount } = await renderComponent();

    unmount();

    const cancelMocks = subscribeMock.mock.results.map((result) => result.value.cancel);
    cancelMocks.forEach((cancelMock) => {
      expect(cancelMock).toHaveBeenCalled();
    });
  });

  it('should open the modal on OPEN_CODE_EDITOR event', async () => {
    eventBusMock.on = jest.fn((event, callback) => {
      if (event === OPEN_CODE_EDITOR) {
        callback({
          element: 'element1',
          node: 'node1',
          data: 'some code',
          mode: 'javascript',
        });
      }
    });

    const modelerMock = createModelerMock(eventBusMock);

    let modelerCreatedCallback;
    createSubscribeMock({
      modelerCreated: (callback) => {
        modelerCreatedCallback = callback;
      }
    });

    await renderComponent();
    await TestUtilities.actAsync(async () => {
      await modelerCreatedCallback({ modeler: modelerMock, tab: { id: 'tab1' } });
    });

    expect(configMock.getForPlugin).toHaveBeenCalledWith('codeEditorPlugin', LIGHT_THEME_KEY);
    expect(configMock.getForPlugin).toHaveBeenCalledWith('codeEditorPlugin', MINIMAP_KEY);
    expect(configMock.getForPlugin).toHaveBeenCalledWith('codeEditorPlugin', LINT_ENABLED_KEY);
    expect(modelerMock.get).toHaveBeenCalledWith('eventBus');
    expect(TestUtilities.getByTestId('mock-modal')).toBeInTheDocument();
  });

  it('should initialize with feature flag enabled by default', async () => {
    const modelerMock = createModelerMock();

    let modelerCreatedCallback;
    createSubscribeMock({
      modelerCreated: (callback) => {
        modelerCreatedCallback = callback;
      }
    });

    await renderComponent();
    await TestUtilities.actAsync(async () => {
      await modelerCreatedCallback({ modeler: modelerMock, tab: { id: 'tab1' } });
    });

    expect(eventBusMock.fire).toHaveBeenCalledWith(CODE_EDITOR_FLAG, { enabled: true });
  });

  it('should handle feature flag toggle', async () => {
    const modelerMock = createModelerMock();

    let modelerCreatedCallback;
    createSubscribeMock({
      modelerCreated: (callback) => {
        modelerCreatedCallback = callback;
      }
    });

    await renderComponent();
    await TestUtilities.actAsync(async () => {
      await modelerCreatedCallback({ modeler: modelerMock, tab: { id: 'tab1' } });
    });

    const toggleCallback = eventBusMock.on.mock.calls.find(call => call[0] === TOGGLE_CODE_EDITOR_FLAG)[1];
    await toggleCallback({ enabled: false });

    expect(configMock.setForPlugin).toHaveBeenCalledWith(PLUGIN_NAME, 'enabled', false);
    expect(displayNotificationMock).toHaveBeenCalled();
  });

  it('should display the correct reload toast based on platform', async () => {
    const modelerMock = createModelerMock();

    let modelerCreatedCallback;
    createSubscribeMock({
      modelerCreated: (callback) => {
        modelerCreatedCallback = callback;
      }
    });

    configMock.backend.getPlatform = jest.fn().mockReturnValue('darwin');

    await renderComponent();
    await TestUtilities.actAsync(async () => {
      await modelerCreatedCallback({ modeler: modelerMock, tab: { id: 'tab1' } });
    });

    const toggleCallback = eventBusMock.on.mock.calls.find(call => call[0] === TOGGLE_CODE_EDITOR_FLAG)[1];
    await toggleCallback({ enabled: false });

    expect(configMock.setForPlugin).toHaveBeenCalledWith(PLUGIN_NAME, 'enabled', false);
    expect(displayNotificationMock).toHaveBeenCalledWith({
      title: 'Code Editor Plugin',
      content: expect.anything(),
      type: 'info'
    });

    const toastContentMac = displayNotificationMock.mock.lastCall[0].content.props.children;
    expect(toastContentMac[0].props.children[0]).toEqual('Code Editor is now ');
    expect(toastContentMac[0].props.children[1].props.children).toEqual('disabled');
    expect(toastContentMac[1].props.children).toEqual('Please reload the modeler with');
    expect(toastContentMac[3].props.children).toEqual('⌘');
    expect(toastContentMac[4]).toEqual(' + ');
    expect(toastContentMac[5].props.children).toEqual('R');


    configMock.backend.getPlatform.mockResolvedValue('win32');
    await toggleCallback({ enabled: true });

    expect(configMock.setForPlugin).toHaveBeenCalledWith(PLUGIN_NAME, 'enabled', true);
    expect(displayNotificationMock).toHaveBeenCalledWith({
      title: 'Code Editor Plugin',
      content: expect.anything(),
      type: 'info'
    });

    const toastContentWin = displayNotificationMock.mock.lastCall[0].content.props.children;
    expect(toastContentWin[0].props.children[0]).toEqual('Code Editor is now ');
    expect(toastContentWin[0].props.children[1].props.children).toEqual('enabled');
    expect(toastContentWin[1].props.children).toEqual('Please reload the modeler with');
    expect(toastContentWin[3].props.children).toEqual('Ctrl');
    expect(toastContentWin[4]).toEqual(' + ');
    expect(toastContentWin[5].props.children).toEqual('R');
  });


  it('should close the modal on tab.closed event', async () => {
    let modelerCreatedCallback, tabClosedCallback;

    eventBusMock.on = jest.fn((event, callback) => {
      if (event === OPEN_CODE_EDITOR) {
        callback({ element: 'e1', node: 'n1', data: 'code', mode: 'javascript' });
      }
    });

    const modelerMock = createModelerMock(eventBusMock);

    createSubscribeMock({
      modelerCreated: (callback) => {
        modelerCreatedCallback = callback;
      },
      tabClosed: (callback) => { tabClosedCallback = callback; }
    });

    await renderComponent();
    await TestUtilities.actAsync(async () => {
      await modelerCreatedCallback({ modeler: modelerMock, tab: { id: 'tab1' } });
    });
    expect(TestUtilities.getByTestId('mock-modal')).toBeInTheDocument();

    await TestUtilities.actAsync(async () => tabClosedCallback());

    expect(TestUtilities.queryByText('Modal Open')).not.toBeInTheDocument();
  });

  it('should close the modal on createNewAction.open event', async () => {
    let modelerCreatedCallback, createNewTabCallback;

    eventBusMock.on = jest.fn((event, callback) => {
      if (event === OPEN_CODE_EDITOR) {
        callback({ element: 'e1', node: 'n1', data: 'code', mode: 'javascript' });
      }
    });

    const modelerMock = createModelerMock(eventBusMock);

    createSubscribeMock({
      modelerCreated: (callback) => {
        modelerCreatedCallback = callback;
      },
      createNewTab: (callback) => { createNewTabCallback = callback; }
    });

    await renderComponent();
    await TestUtilities.actAsync(async () => {
      await modelerCreatedCallback({ modeler: modelerMock, tab: { id: 'tab1' } });
    });
    expect(TestUtilities.getByTestId('mock-modal')).toBeInTheDocument();

    await TestUtilities.actAsync(async () => createNewTabCallback());

    expect(TestUtilities.queryByText('Modal Open')).not.toBeInTheDocument();
  });

  it('should fire SAVE_CODE_EDITOR when closing modal with active eventBus', async () => {
    const fireMock = jest.fn();
    const dispatchMock = mockContextWithState({
      modalOpen: true,
      eventBus: { on: mockFn, fire: fireMock },
      element: 'element1',
      node: 'node1',
      data: 'test-data',
    });

    let tabClosedCallback;
    subscribeMock.mockImplementation((event, callback) => {
      if (event === TAB_CLOSED) tabClosedCallback = callback;
      return { cancel: mockFn };
    });

    await renderComponent();
    tabClosedCallback();

    expect(fireMock).toHaveBeenCalledWith(SAVE_CODE_EDITOR, {
      element: 'element1',
      node: 'node1',
      data: 'test-data',
    });
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });
  });

  it('should handle app.activeTabChanged event and close modal', async () => {
    let modelerCreatedCallback, activeTabCallback;

    eventBusMock.on = jest.fn((event, callback) => {
      if (event === OPEN_CODE_EDITOR) {
        callback({ element: 'e1', node: 'n1', data: 'code', mode: 'javascript' });
      }
    });

    const modelerMock = createModelerMock(eventBusMock);

    createSubscribeMock({
      modelerCreated: (callback) => {
        modelerCreatedCallback = callback;
      },
      activeTabChanged: (callback) => { activeTabCallback = callback; }
    });

    await renderComponent();
    await TestUtilities.actAsync(async () => {
      await modelerCreatedCallback({ modeler: modelerMock, tab: { id: 'tab1' } });
    });
    expect(TestUtilities.getByTestId('mock-modal')).toBeInTheDocument();

    await TestUtilities.actAsync(async () => activeTabCallback({ activeTab: { id: 'tab1' } }));

    expect(TestUtilities.queryByText('Modal Open')).not.toBeInTheDocument();
  });

  it('should dispatch SET_ACTIVE_MODELER on active tab change with matching modeler', async () => {
    const tabModelerMock = createModelerMock();
    const dispatchMock = mockContextWithState({
      modalOpen: true,
      tabModeler: [ { tabId: 'tab1', modeler: tabModelerMock } ],
    });

    let activeTabCallback;
    subscribeMock.mockImplementation((event, callback) => {
      if (event === APP_ACTIVE_TAB_CHANGED) activeTabCallback = callback;
      return { cancel: mockFn };
    });

    await renderComponent();
    activeTabCallback({ activeTab: { id: 'tab1' } });

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'SET_ACTIVE_MODELER',
      payload: {
        modeler: tabModelerMock,
        eventBus: eventBusMock,
      }
    });
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });
  });

  it('should not render modal when modalOpen is false', async () => {
    await renderComponent();

    expect(TestUtilities.queryByText('Modal Open')).not.toBeInTheDocument();
  });

  it('should handle linting config event', async () => {
    const modelerMock = createModelerMock();
    let modelerCreatedCallback, configCallback;

    createSubscribeMock({
      modelerCreated: (callback) => {
        modelerCreatedCallback = callback;
      },
      configEvent: (callback) => {
        configCallback = callback;
      }
    });

    await renderComponent();
    await TestUtilities.actAsync(async () => {
      await modelerCreatedCallback({ modeler: modelerMock, tab: { id: 'tab1' } });
    });

    await TestUtilities.actAsync(async () => {
      await configCallback({ lintingServerUrl: 'ws://localhost:8080' });
    });

    expect(configMock.setForPlugin).toHaveBeenCalledWith(PLUGIN_NAME, 'wsUrl', 'ws://localhost:8080');
  });

  it('should store lint client in state after successful connection', async () => {
    const modelerMock = createModelerMock();
    let modelerCreatedCallback, configCallback;

    createSubscribeMock({
      modelerCreated: (callback) => {
        modelerCreatedCallback = callback;
      },
      configEvent: (callback) => {
        configCallback = callback;
      }
    });

    createConfigMock({
      wsUrl: 'ws://localhost:8080',
    });

    await renderComponent();
    await TestUtilities.actAsync(async () => {
      await modelerCreatedCallback({ modeler: modelerMock, tab: { id: 'tab1' } });
    });

    await TestUtilities.actAsync(async () => {
      await configCallback({ lintingServerUrl: 'ws://localhost:8080' });
    });

    expect(LintingClient).toHaveBeenCalledWith('ws://localhost:8080');
    const clientInstance = LintingClient.mock.results[0].value;
    expect(clientInstance.connect).toHaveBeenCalled();
  });


  it('should create new lint client when reconnecting with different URL', async () => {
    const modelerMock = createModelerMock();
    let modelerCreatedCallback, configCallback;

    createSubscribeMock({
      modelerCreated: (callback) => {
        modelerCreatedCallback = callback;
      },
      configEvent: (callback) => {
        configCallback = callback;
      }
    });

    createConfigMock({
      wsUrl: 'ws://localhost:8080',
    });

    await renderComponent();
    await TestUtilities.actAsync(async () => {
      await modelerCreatedCallback({ modeler: modelerMock, tab: { id: 'tab1' } });
    });

    await TestUtilities.actAsync(async () => {
      await configCallback({ lintingServerUrl: 'ws://localhost:8080' });
    });

    expect(LintingClient).toHaveBeenCalledWith('ws://localhost:8080');

    await TestUtilities.actAsync(async () => {
      await configCallback({ lintingServerUrl: 'ws://localhost:9000' });
    });

    expect(configMock.setForPlugin).toHaveBeenCalledWith(PLUGIN_NAME, 'wsUrl', 'ws://localhost:9000');
    expect(LintingClient).toHaveBeenCalledWith('ws://localhost:9000');
  });

  it('should skip reconnection when lint client is already connected with same URL', async () => {
    const existingClient = {
      isConnected: jest.fn().mockReturnValue(true),
      _wsUrl: 'ws://localhost:8080',
      disconnect: jest.fn(),
    };
    mockContextWithState({ lintClient: existingClient });

    let configCallback;
    subscribeMock.mockImplementation((event, callback) => {
      if (event === CODE_EDITOR_CONFIG) configCallback = callback;
      return { cancel: mockFn };
    });

    createConfigMock({ wsUrl: 'ws://localhost:8080' });
    await renderComponent();

    await configCallback({ lintingServerUrl: 'ws://localhost:8080' });
    await TestUtilities.allowComponentUpdates();

    expect(existingClient.isConnected).toHaveBeenCalled();
    expect(existingClient.disconnect).not.toHaveBeenCalled();
    expect(LintingClient).not.toHaveBeenCalled();
  });

  it('should disconnect existing lint client before connecting with new URL', async () => {
    const existingClient = {
      isConnected: jest.fn().mockReturnValue(true),
      _wsUrl: 'ws://localhost:8080',
      disconnect: jest.fn().mockResolvedValue(undefined),
    };
    mockContextWithState({ lintClient: existingClient });

    let configCallback;
    subscribeMock.mockImplementation((event, callback) => {
      if (event === CODE_EDITOR_CONFIG) configCallback = callback;
      return { cancel: mockFn };
    });

    await renderComponent();

    await configCallback({ lintingServerUrl: 'ws://localhost:9000' });
    await TestUtilities.allowComponentUpdates();

    expect(existingClient.disconnect).toHaveBeenCalled();
    expect(LintingClient).toHaveBeenCalledWith('ws://localhost:9000');
  });

  it('should use existing config values when not overriding', async () => {
    const modelerMock = createModelerMock();
    let modelerCreatedCallback, configCallback;

    createSubscribeMock({
      modelerCreated: (callback) => {
        modelerCreatedCallback = callback;
      },
      configEvent: (callback) => {
        configCallback = callback;
      }
    });

    createConfigMock({
      wsUrl: 'ws://localhost:8080',
    });

    await renderComponent();
    await TestUtilities.actAsync(async () => {
      await modelerCreatedCallback({ modeler: modelerMock, tab: { id: 'tab1' } });
    });

    await TestUtilities.actAsync(async () => {
      await configCallback({ lintingServerUrl: undefined });
    });

    expect(configMock.getForPlugin).toHaveBeenCalledWith(PLUGIN_NAME, 'wsUrl');
    expect(LintingClient).toHaveBeenCalledWith('ws://localhost:8080');
  });

  it('should handle lint client connection error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    LintingClient.mockImplementationOnce(() => {
      throw new Error('Connection failed');
    });

    const modelerMock = createModelerMock();
    let modelerCreatedCallback, configCallback;

    createSubscribeMock({
      modelerCreated: (callback) => {
        modelerCreatedCallback = callback;
      },
      configEvent: (callback) => {
        configCallback = callback;
      }
    });

    createConfigMock({
      wsUrl: 'ws://localhost:8080',
    });

    await renderComponent();
    await TestUtilities.actAsync(async () => {
      await modelerCreatedCallback({ modeler: modelerMock, tab: { id: 'tab1' } });
    });

    await TestUtilities.actAsync(async () => {
      await configCallback({ lintingServerUrl: 'ws://localhost:8080' });
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error initializing lint client',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should handle linting config init error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const modelerMock = createModelerMock();
    let modelerCreatedCallback, configCallback;

    createSubscribeMock({
      modelerCreated: (callback) => {
        modelerCreatedCallback = callback;
      },
      configEvent: (callback) => {
        configCallback = callback;
      }
    });

    configMock.setForPlugin = jest.fn().mockRejectedValue(new Error('Config failed'));

    await renderComponent();
    await TestUtilities.actAsync(async () => {
      await modelerCreatedCallback({ modeler: modelerMock, tab: { id: 'tab1' } });
    });

    await TestUtilities.actAsync(async () => {
      await configCallback({ lintingServerUrl: 'ws://localhost:8080' });
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to set config value for wsUrl:',
      expect.any(Error)
    );

    configMock.setForPlugin = mockFn;
    consoleErrorSpy.mockRestore();
  });

  it('should handle linting server status check', async () => {
    await TestUtilities.render(
      <CodeEditorPlugin
        subscribe={ (event, callback) => {
          if (event === 'lintingServer.status') {
            callback({
              isRunning: true,
              hasClient: true,
              url: 'ws://localhost:8080'
            });
          }
          return { cancel: mockFn };
        } }
        displayNotification={ displayNotificationMock }
        triggerAction={ triggerActionMock }
        config={ configMock }
      />
    );

    expect(displayNotificationMock).toHaveBeenCalledWith({
      title: 'Linting Server Status',
      content: expect.anything(),
      type: 'info'
    });

    const notificationContent = displayNotificationMock.mock.lastCall[0].content.props.children;
    expect(notificationContent[0].props.children[0]).toEqual('Server: ');
    expect(notificationContent[0].props.children[1]).toEqual('Running');
    expect(notificationContent[1].props.children[0]).toEqual('Client: ');
    expect(notificationContent[1].props.children[1]).toEqual('Connected');
    expect(notificationContent[2].props.children[0]).toEqual('WebSocket URL: ');
    expect(notificationContent[2].props.children[1].props.children).toEqual('ws://localhost:8080');
  });
});