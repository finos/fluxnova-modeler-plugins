import React from 'react';
import LintCountIcon from './LintCountIcon';
import { useCodeEditorContext } from '../CodeEditorContext';

export default function LintCountIndicator() {
  const { state } = useCodeEditorContext();
  const { lintStatus, lintEnabled } = state;

  if (!lintEnabled) return null;

  const hasIssues = lintStatus.warnCount > 0 || lintStatus.errorCount > 0 || lintStatus.infoCount > 0;

  return (
    <div className="lint-count-indicator">
      <>
        {lintStatus.warnCount > 0 && (
          <LintCountIcon severity="warning" value={ lintStatus.warnCount } />
        )}
        {lintStatus.errorCount > 0 && (
          <LintCountIcon severity="error" value={ lintStatus.errorCount } />
        )}
        {lintStatus.infoCount > 0 && (
          <LintCountIcon severity="info" value={ lintStatus.infoCount } />
        )}
        {hasIssues && (
          <div className="footer-separator" />
        )}
      </>
    </div>
  );
}