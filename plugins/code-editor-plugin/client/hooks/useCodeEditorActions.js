import { useCodeEditorContext } from '../CodeEditorContext';
import { SAVE_CODE_EDITOR } from '../../shared-util/constants';

const useCodeEditorActions = () => {
  const { state, dispatch } = useCodeEditorContext();

  const saveScript = (data = state.data) => {
    if (state.eventBus && state.element) {
      state.eventBus.fire(SAVE_CODE_EDITOR, {
        element: state.element,
        node: state.node,
        data,
      });
    }
  };

  const closeEditor = () => {
    if (state.modalOpen) {
      saveScript();
      dispatch({ type: 'CLOSE_MODAL' });
    }
  };

  return { saveScript, closeEditor };
};

export default useCodeEditorActions;
