import React from 'react';
import TestUtilities from '../../../shared-util/test-utilities';
import ModalActions from '../ModalActions';
import { CodeEditorContext } from '../../CodeEditorContext';
import { LINT_ENABLED_KEY, LIGHT_THEME_KEY, MINIMAP_KEY, PLUGIN_NAME } from '../../../shared-util/constants';

let state, mockDispatch, mockConfig;
const useRender = async ({ onCloseMock }) => (
  await TestUtilities.render(
    <CodeEditorContext.Provider value={ { state, dispatch: mockDispatch, config: mockConfig } }>
      <ModalActions onClose={ onCloseMock } />
    </CodeEditorContext.Provider>
  )
);

describe('ModalActions', () => {
  let onCloseMock;

  beforeEach(() => {
    onCloseMock = jest.fn();
    mockDispatch = jest.fn();
    mockConfig = {
      setForPlugin: jest.fn(),
    };
    state = {
      lightTheme: false,
      minimap: false,
      lintEnabled: true,
      lintStatus: {},
    };
  });

  it('render the modal actions', async () => {
    state = { ...state, minimap: true };
    await useRender({ onCloseMock });

    const themeToggle = await TestUtilities.getByTitle('Theme Toggle');
    expect(themeToggle).toBeInTheDocument();

    const minimapToggle = await TestUtilities.getByTitle('Minimap Toggle');
    expect(minimapToggle).toBeInTheDocument();

    const closeButton = await TestUtilities.getByText('Close');
    expect(closeButton).toBeInTheDocument();
  });

  it.each([
    [ 'Theme Toggle', LIGHT_THEME_KEY, 'lightTheme', false, true ],
    [ 'Minimap Toggle', MINIMAP_KEY, 'minimap', false, true ],
    [ 'Linting Toggle', LINT_ENABLED_KEY, 'lintEnabled', true, false ],
  ])('should toggle %s preference and save to config', async (title, key, preference, initialValue, expectedValue) => {
    state = { ...state, [preference]: initialValue, language: 'javascript' };
    await useRender({ onCloseMock });

    const toggle = await TestUtilities.getByTitle(title);
    await TestUtilities.click(toggle);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_PREFERENCES',
      payload: { [key]: expectedValue }
    });

    expect(mockConfig.setForPlugin).toHaveBeenCalledWith(PLUGIN_NAME, key, expectedValue);
  });

  it('should call onClose when close button is clicked', async () => {
    state = { ...state, minimap: true };
    await useRender({ onCloseMock });

    const closeButton = await TestUtilities.getByText('Close');
    await TestUtilities.click(closeButton);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
