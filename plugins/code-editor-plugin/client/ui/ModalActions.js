import React from 'react';
import LintStatusIndicator from './LintStatusIndicator';
import Sun from '../resources/icons/sun.svg';
import Moon from '../resources/icons/moon.svg';
import MinimapOn from '../resources/icons/minimap-on.svg';
import MinimapOff from '../resources/icons/minimap-off.svg';
import Lint from '../resources/icons/lint.svg';
import { useCodeEditorContext } from '../CodeEditorContext';
import LintCountIndicator from './LintCountIndicator';
import { LINT_ENABLED_KEY, LIGHT_THEME_KEY, MINIMAP_KEY, PLUGIN_NAME } from '../../shared-util/constants';
import { setConfigValue } from '../util/ConfigHelper';

export default function ModalActions({ onClose }) {
  const { state, dispatch, config } = useCodeEditorContext();
  const { lightTheme, minimap, lintEnabled } = state;

  const togglePreference = async (preference) => {
    const currVal = state[preference];
    const newVal = !currVal;

    dispatch({
      type: 'SET_PREFERENCES',
      payload: { [preference]: newVal }
    });

    await setConfigValue(config, PLUGIN_NAME, preference, newVal);
  };

  return (
    <div className="footer-container">
      <LintStatusIndicator />

      <div className="footer-actions">
        <LintCountIndicator />
        <button title="Theme Toggle" className="icon-toggle" onClick={ () => togglePreference(LIGHT_THEME_KEY) }>
          <Sun className={ `theme-icon ${lightTheme ? 'inactive' : 'active'}` } />
          <Moon className={ `theme-icon ${lightTheme ? 'active' : 'inactive'}` } />
        </button>

        <button title="Minimap Toggle" className="icon-toggle" onClick={ () => togglePreference(MINIMAP_KEY) }>
          <MinimapOff className={ `minimap-icon ${minimap ? 'inactive' : 'active'}` } />
          <MinimapOn className={ `minimap-icon ${minimap ? 'active blue' : 'inactive'}` } />
        </button>

        <button title="Linting Toggle" className="icon-toggle" onClick={ () => togglePreference(LINT_ENABLED_KEY) }>
          <Lint className={ `lint-icon ${lintEnabled ? 'active blue' : ''}` } />
        </button>
        <button type="button" className="btn btn-secondary" onClick={ onClose }> Close</button>
      </div>
    </div>
  );
}