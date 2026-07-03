import { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import useDebouncedCallback from './useDebouncedCallback';
import { useCodeEditorContext } from '../CodeEditorContext';
import { useScriptValidator } from './useScriptValidator';
import useCodeEditorActions from './useCodeEditorActions';
import { isJavaScriptLanguage } from '../../shared-util/common';
import EXECUTION_DEFINITIONS from '../../types/execution-types.d.ts';

const useMonacoEditor = () => {
  const { state, dispatch } = useCodeEditorContext();
  const { data, selection, language, lightTheme = false, minimap = false, lintEnabled } = state;
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const validateRef = useRef();

  const { validate } = useScriptValidator();
  const { saveScript } = useCodeEditorActions();
  validateRef.current = () => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) validate(model, language);
    }
  };

  const validateScript = () => validateRef.current();
  const onEditorChange = (value, selection) => {
    if (value !== state.data || selection !== state.selection) {
      dispatch({
        type: 'OPEN_MODAL',
        payload: {
          data: value,
          selection: selection,
        }
      });

      saveScript(value);
    }
  };

  const debouncedOnEditorChange = useDebouncedCallback(
    (val, selection) => {
      onEditorChange(val, selection);
    },
    250
  );

  // handle editor resizing
  useEffect(() => {
    const resize = () => {
      if (editorRef.current) {
        editorRef.current.layout({ height: 0, width: 0 });
        editorRef.current.layout();
      }
    };
    window.addEventListener('resize', resize);
    setTimeout(() => resize); // push to next tick
    return () => window.removeEventListener('resize', resize);
  });

  useEffect(() => {
    if (!containerRef.current) return;
    editorRef.current = monaco.editor.create(containerRef.current, {
      value: data,
      language: isJavaScriptLanguage(language) ? 'javascript' : language.toLowerCase(),
      theme: (lightTheme ? 'vs-light' : 'vs-dark'),
      minimap: {
        enabled: minimap,
      },
      fixedOverflowWidgets: true
    });

    monaco.languages.typescript.javascriptDefaults.addExtraLib(EXECUTION_DEFINITIONS);

    if (selection) {
      editorRef.current.setSelection(selection);
      editorRef.current.focus();
    }

    // capture editor on change
    editorRef.current.onDidChangeModelContent(() => {
      if (editorRef.current && onEditorChange) {
        debouncedOnEditorChange(editorRef.current.getValue(), editorRef.current.getSelection());
        validateScript();
      }
    });

    // capture editor on cursor selection and position
    editorRef.current.onDidChangeCursorSelection(() => {
      if (editorRef.current && onEditorChange)
        debouncedOnEditorChange(editorRef.current.getValue(), editorRef.current.getSelection());
    });

    validateScript();

    return () => {
      debouncedOnEditorChange.cancel();
      editorRef.current && editorRef.current.dispose();

      dispatch({
        type:  'SET_LINT_STATUS',
        payload: {
          success: false,
          error: null,
          errorCount: null,
          warnCount: null,
          infoCount: null,
        }
      });
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        theme: lightTheme ? 'vs-light' : 'vs-dark',
        minimap: {
          enabled: minimap,
        }
      });
      validateScript();
    }
  }, [ lightTheme, minimap, lintEnabled ]);

  return containerRef;
};

export default useMonacoEditor;