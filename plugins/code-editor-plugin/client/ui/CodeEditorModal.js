import React from 'react';
import { Modal } from 'camunda-modeler-plugin-helpers/components';
import useMonacoEditor from '../hooks/useMonacoEditor';
import useCodeEditorActions from '../hooks/useCodeEditorActions';
import ModalActions from './ModalActions';
import { useCodeEditorContext } from '../CodeEditorContext';
import { isJavaScriptLanguage, isGroovyLanguage } from '../../shared-util/common';

// polyfill upcoming structural components
const Body = Modal.Body || (({ children }) => <div>{children}</div>);
const Footer = Modal.Footer || (({ children }) => <div>{children}</div>);

/**
 * Functional component to create a modal window for Code Editor
 * @param props
 * @returns {JSX.Element}
 */
const CodeEditorModal = () => {
  const { state } = useCodeEditorContext();
  const { element, language, lightTheme } = state;

  const containerRef = useMonacoEditor();
  const { closeEditor: onClose } = useCodeEditorActions();

  const getScriptType = () => {
    if (isGroovyLanguage(language)) return 'Groovy';
    if (isJavaScriptLanguage(language)) return 'JavaScript';

    return '';
  };

  const getElementName = (element) => {
    const scriptType = getScriptType(language);

    if (element.businessObject.name && scriptType) return `${element.businessObject.name} | ${scriptType}`;
    if (element.businessObject.name) return `${element.businessObject.name}`;

    return scriptType;
  };

  return (
    <Modal onClose={ onClose } className="editor-modal">
      <div className="modal-header">
        <h2 className="modal-title">
          Script Editor
        </h2>
        <h5>{getElementName(element)}</h5>
      </div>
      <Body>
        <div className={ `editor-container ${ lightTheme ? 'light' : 'dark'}` }>
          <div ref={ containerRef } className="code-editor" />
        </div>
      </Body>
      <Footer>
        <ModalActions
          onClose={ onClose }
        />
      </Footer>
    </Modal>
  );
};

export default CodeEditorModal;
