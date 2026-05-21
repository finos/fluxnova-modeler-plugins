import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import { useCodeEditorContext } from '../CodeEditorContext';

export function useScriptValidator() {
  const { state, dispatch } = useCodeEditorContext();
  const { lintClient, lintEnabled } = state;

  const validate = async (model, language) => {
    if (!lintEnabled || !model.getValue().trim()) {
      if (!model.isDisposed()) editor.setModelMarkers(model, 'owner', []);
      return;
    }

    if (!model.isDisposed()) {
      try {
        if (!lintClient.isConnected()) {
          console.warn('Linting client not initialized. Attempting to reconnect.');
          await lintClient.connect();
        }

        return lintClient.validateScript(
          model.getValue(),
          language,
          (response) => handleValidationCallback(model, response),
        );
      } catch (err) {
        console.error('Validation error', err);
      }
    }
  };

  const setMarkers = (model, markers) => {
    if (model.isDisposed() || !Array.isArray(markers) || !markers.length) {
      editor.setModelMarkers(model, 'owner', []);
      return markers || [];
    }

    const lineCount = model.getLineCount();

    markers.forEach((marker) => {
      if (marker.startLineNumber > lineCount) {
        console.warn(`Error outside of script: Line ${marker.startLineNumber}: ${marker.message}`);
        marker.startLineNumber = lineCount;
      }

      if (marker.endLineNumber > lineCount) {
        console.warn(`Error outside of script: Line ${marker.endLineNumber}: ${marker.message}`);
        marker.endLineNumber = lineCount;
      }

      if (model && marker.endColumn === -1) {
        marker.endColumn = model.getLineLength(marker.endLineNumber) + 1;
      }
    });

    editor.setModelMarkers(model, 'owner', markers);
  };

  const handleValidationCallback = (model, response) => {
    if (response?.data?.markers) {
      setMarkers(model, response.data.markers);
    }

    dispatch({
      type: 'SET_LINT_STATUS',
      payload: {
        success: response?.success,
        error: response?.error,
        errorCount: response?.data?.errorCount,
        warnCount: response?.data?.warnCount,
        infoCount: response?.data?.infoCount,
      }
    });
  };

  return { validate };
}