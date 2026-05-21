import React, { useState } from 'react';
import { useCodeEditorContext } from '../CodeEditorContext';
import Tooltip from './Tooltip';

const LINT_STATUSES = {
  DISABLED: { color: 'gray', text: 'Linting is disabled.' },
  UNAVAILABLE: { color: 'red', text: 'Linting is unavailable.' },
  RUNNING: { color: 'green', text: 'Linting is running.' },
  PENDING: { color: 'blue', text: 'Linting is pending.' },
};

function getStatus(lintStatus, lintEnabled) {
  if (!lintEnabled) return LINT_STATUSES.DISABLED;
  if (lintStatus?.error) return LINT_STATUSES.UNAVAILABLE;
  if (lintStatus?.success) return LINT_STATUSES.RUNNING;
  return LINT_STATUSES.PENDING;
}

export default function LintStatusIndicator() {
  const { state } = useCodeEditorContext();
  const { lintStatus, lintEnabled } = state;
  const [ copied, setCopied ] = useState(false);
  const hasError = lintEnabled && lintStatus?.error;

  const copyToClipboard = async () => {
    if (!hasError) return;
    try {
      await window.navigator.clipboard.writeText(lintStatus?.error);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error(
        'Unable to copy to clipboard.',
        err
      );
    }
  };

  const TooltipContent = () => (
    copied ? (
      <div className="tooltip-content">
        Copied to clipboard.
      </div>
    ) : (
      <div className="tooltip-content">
        <b>Error:</b> {lintStatus?.error}
      </div>
    )
  );

  const { color, text } = getStatus(lintStatus, lintEnabled);

  return (
    <div className="lint-indicator">
      <span className={ `status-dot status-${color}` } data-testid="status-dot" />
      {hasError ? (
        <Tooltip content={ <TooltipContent /> } direction="top">
          <span className="tooltip-label clickable" onClick={ copyToClipboard }>{text}</span>
        </Tooltip>
      ) : (
        <span className="tooltip-label" onClick={ copyToClipboard }>{text}</span>
      )}
    </div>
  );
}