import React, { useContext, useMemo, createContext, useReducer } from 'react';

export const CodeEditorContext = createContext(null);

export const initialState = {
  modalOpen: false,
  element: null,
  node: null,
  data: null,
  selection: null,
  language: null,
  modeler: null,
  eventBus: null,
  tabModeler: [],
  lightTheme: false,
  minimap: false,
  lintEnabled: true,
  lintStatus: {
    success: false,
    error: null,
    infoCount: 0,
    errorCount: 0,
    warnCount: 0,
  },
  lintClient: null,
};

export const codeEditorReducer = (state, action) => {
  switch (action.type) {
  case 'OPEN_MODAL':
    return { ...state, modalOpen: true, ...action.payload };
  case 'CLOSE_MODAL':
    return { ...state, modalOpen: false, ...action.payload };
  case 'INIT_MODELER':
    return {
      ...state,
      modeler: action.payload.modeler,
      eventBus: action.payload.eventBus,
      tabModeler: [ ...state.tabModeler, action.payload.tabModelerEntry ]
    };
  case 'SET_ACTIVE_MODELER':
    return {
      ...state,
      modeler: action.payload.modeler,
      eventBus: action.payload.eventBus,
    };
  case 'SET_PREFERENCES':
    return { ...state, ...action.payload };
  case 'SET_LINT_STATUS':
    return { ...state, lintStatus: action.payload };
  case 'SET_LINT_CLIENT':
    return { ...state, lintClient: action.payload };
  default:
    throw new Error(`Unknown action type ${action.type}`);
  }
};

const CodeEditorProvider = ({ children, subscribe, displayNotification, triggerAction, config }) => {
  const [ state, dispatch ] = useReducer(codeEditorReducer, initialState);
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    subscribe,
    displayNotification,
    triggerAction,
    config,
  }), [ state, dispatch, subscribe, displayNotification, triggerAction, config ]);

  return (
    <CodeEditorContext.Provider value={ contextValue }>
      {children}
    </CodeEditorContext.Provider>
  );
};

export const useCodeEditorContext = () => {
  const context = useContext(CodeEditorContext);
  if (!context) {
    throw new Error('useCodeEditorContext must be used within a CodeEditorProvider');
  }

  return context;
};

export default CodeEditorProvider;