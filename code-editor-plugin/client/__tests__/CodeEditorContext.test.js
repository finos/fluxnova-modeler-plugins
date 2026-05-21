import React from 'react';
import CodeEditorProvider, {
  useCodeEditorContext,
  codeEditorReducer,
  initialState,
  CodeEditorContext
} from '../CodeEditorContext';
import TestUtilities from '../../shared-util/test-utilities';

describe('CodeEditorContext', () => {
  const mockState = {
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

  describe('state', () => {
    it('should create context with null state and dispatch initially', () => {
      expect(CodeEditorContext._currentValue).toBeNull();
    });

    it('should validate the initial state', async () => {
      expect(initialState).toEqual(mockState);
    });
  });

  describe('reducer functions', () => {
    it('should update the state based on OPEN_MODAL action', () => {
      const action = {
        type: 'OPEN_MODAL',
        payload: { data: 'some code', selection: 'some selection' }
      };
      const updatedState = codeEditorReducer({}, action);
      expect(updatedState).toEqual({
        modalOpen: true,
        data: 'some code',
        selection: 'some selection',
      });
    });

    it('should update the state based on CLOSE_MODAL action', () => {
      const action = { type: 'CLOSE_MODAL' };
      const updatedState = codeEditorReducer({}, action);
      expect(updatedState.modalOpen).toBe(false);
    });

    it('should update the state based on INIT_MODELER action', () => {
      const action = {
        type: 'INIT_MODELER',
        payload: {
          eventBus: 'EVENT_BUS',
          modeler: 'MODELER',
          tabModelerEntry: { tabId: 'tab2', modeler: 'modelerInstance2' }
        }
      };
      const updatedState = codeEditorReducer({ tabModeler: [ { tabId: 'tab1', modeler: 'modelerInstance1' } ] }, action);

      expect(updatedState.modeler).toBe('MODELER');
      expect(updatedState.eventBus).toBe('EVENT_BUS');
      expect(updatedState.tabModeler).toEqual([
        { tabId: 'tab1', modeler: 'modelerInstance1' },
        { tabId: 'tab2', modeler: 'modelerInstance2' }
      ]);
    });

    it('should update the state based on SET_ACTIVE_MODELER action', () => {
      const action = {
        type: 'SET_ACTIVE_MODELER',
        payload: {
          eventBus: 'EVENT_BUS',
          modeler: 'MODELER'
        } };
      const updatedState = codeEditorReducer({}, action);

      expect(updatedState).toEqual({
        eventBus: 'EVENT_BUS',
        modeler: 'MODELER',
      });
    });

    it('should update the state based on SET_PREFERENCES action (single)', () => {
      const action = {
        type: 'SET_PREFERENCES',
        payload: {
          lightTheme: false,
        } };
      const updatedState = codeEditorReducer({}, action);

      expect(updatedState.lightTheme).toBe(false);
    });

    it('should update the state based on SET_PREFERENCES action (multiple)', () => {
      const action = {
        type: 'SET_PREFERENCES',
        payload: {
          lightTheme: true,
          minimap: false,
        } };
      const updatedState = codeEditorReducer({}, action);

      expect(updatedState.lightTheme).toBe(true);
      expect(updatedState.minimap).toBe(false);
    });

    it('should update the state based on SET_LINT_STATUS action', () => {
      const action = {
        type: 'SET_LINT_STATUS',
        payload: {
          success: true,
          error: null,
          errorCount: 0,
          warnCount: 27,
        } };
      const updatedState = codeEditorReducer({}, action);
      expect(updatedState).toEqual({
        lintStatus: {
          success: true,
          error: null,
          errorCount: 0,
          warnCount: 27,
        }
      });
    });


    it('should update the state based on SET_LINT_CLIENT action', () => {
      const action = {
        type: 'SET_LINT_CLIENT',
        payload: {
          LintingClient: {
            isConnected: false,
            wsUrl: 'ws://localhost:1234'
          }
        } };
      const updatedState = codeEditorReducer({}, action);
      expect(updatedState).toEqual({
        lintClient: {
          LintingClient: {
            isConnected: false,
            wsUrl: 'ws://localhost:1234'
          }
        }
      });
    });

    it('should throw an error for an unknown action', () => {
      const action = {
        type: 'SOME_ACTION',
        payload: {
          foo: 'bar'
        } };

      expect(() =>
        codeEditorReducer({}, action)
      ).toThrowError('Unknown action type SOME_ACTION');

    });
  });

  describe('provider', () => {
    const CustomTest = () => {
      const { state, dispatch } = useCodeEditorContext();
      const toggleModal = (open) => dispatch({
        type: open ? 'OPEN_MODAL' : 'CLOSE_MODAL',
        payload: { data: `Modal ${open ? 'Opened' : 'Closed'}` }
      });

      return (
        <div>
          <div data-testid="state">{JSON.stringify(state)}</div>
          <div>{state.data}</div>
          <button onClick={ () => toggleModal(true) } aria-label="open-modal">
            Open Modal
          </button>
          <button onClick={ () => toggleModal(false) } aria-label="close-modal">
            Close Modal
          </button>
        </div>
      );
    };

    it('should throw an error when calling context from a component not wrapped with the provider', async () => {
      expect(() => TestUtilities.renderHook(() => useCodeEditorContext())).toThrowError('useCodeEditorContext must be used within a CodeEditorProvider');
    });

    it('should render initial values', async () => {
      await TestUtilities.render(
        <CodeEditorProvider>
          <CustomTest />
        </CodeEditorProvider>
      );

      expect(TestUtilities.getByTestId('state')).toHaveTextContent(JSON.stringify(mockState));
    });

    it('should open the modal', async () => {
      await TestUtilities.render(
        <CodeEditorProvider>
          <CustomTest />
        </CodeEditorProvider>
      );


      const openModalButton = TestUtilities.getByRole('button', { name: 'open-modal' });
      await TestUtilities.click(openModalButton);
      const openModel = TestUtilities.getByText('Modal Opened');
      expect(openModel).toBeInTheDocument();
    });

    it('should close the modal', async () => {
      await TestUtilities.render(
        <CodeEditorProvider>
          <CustomTest />
        </CodeEditorProvider>
      );

      const closeModalButton = TestUtilities.getByRole('button', { name: 'close-modal' });
      await TestUtilities.click(closeModalButton);
      const closeModal = TestUtilities.getByText('Modal Closed');
      expect(closeModal).toBeInTheDocument();
    });

    it('should pass plugin props (subscribe, displayNotification, triggerAction, config) to context', async () => {
      const TestComponent = () => {
        const { subscribe, displayNotification, triggerAction, config } = useCodeEditorContext();
        return (
          <div>
            <div data-testid="subscribe">{typeof subscribe}</div>
            <div data-testid="displayNotification">{typeof displayNotification}</div>
            <div data-testid="triggerAction">{typeof triggerAction}</div>
            <div data-testid="config">{JSON.stringify(config)}</div>
          </div>
        );
      };

      const mockConfig = { editor: { theme: 'vs-dark' } };
      const mockSubscribe = jest.fn();
      const mockDisplayNotification = jest.fn();
      const mockTriggerAction = jest.fn();

      await TestUtilities.render(
        <CodeEditorProvider config={ mockConfig } subscribe={ mockSubscribe } displayNotification={ mockDisplayNotification } triggerAction={ mockTriggerAction }>
          <TestComponent />
        </CodeEditorProvider>
      );

      expect(TestUtilities.getByTestId('subscribe')).toHaveTextContent('function');
      expect(TestUtilities.getByTestId('displayNotification')).toHaveTextContent('function');
      expect(TestUtilities.getByTestId('triggerAction')).toHaveTextContent('function');
      expect(TestUtilities.getByTestId('config')).toHaveTextContent(JSON.stringify(mockConfig));
    });
  });

});

