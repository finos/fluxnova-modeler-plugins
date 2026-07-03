import React from 'react';
import TestUtilities from '../../../shared-util/test-utilities';
import CodeEditorModal from '../CodeEditorModal';
import useMonacoEditor from '../../hooks/useMonacoEditor';
import { CodeEditorContext } from '../../CodeEditorContext';
import { SAVE_CODE_EDITOR } from '../../../shared-util/constants';

jest.mock('../../hooks/useMonacoEditor', () => jest.fn());

let state, mockDispatch;
const useRender = async () => (
  await TestUtilities.render(
    <CodeEditorContext.Provider value={ { state, dispatch: mockDispatch } }>
      <CodeEditorModal />
    </CodeEditorContext.Provider>
  )
);

describe('CodeEditorModal', () => {
  const mockElement = {
    businessObject: {
      name: 'Test Element'
    }
  };

  beforeEach(() => {
    mockDispatch = jest.fn();
    useMonacoEditor.mockReturnValue({ current: {} });
    state = {
      element: null,
      language: 'javascript',
      lightTheme: false,
      modalOpen: true,
    };
  });

  it('should render the modal with the correct title and buttons', async () => {
    state = { ...state, element: mockElement };
    await useRender();

    expect(TestUtilities.getByText('Script Editor')).toBeInTheDocument();
    expect(TestUtilities.getByText('Test Element | JavaScript')).toBeInTheDocument();
    expect(TestUtilities.getByText('Close')).toBeInTheDocument();
  });

  it('should dispatch CLOSE_MODAL when Close button is clicked', async () => {
    state = { ...state, element: mockElement };
    await useRender();

    await TestUtilities.clickByText('Close');

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });
  });

  it('should fire eventBus and dispatch CLOSE_MODAL on close', async () => {
    const mockEventBus = { fire: jest.fn() };
    state = { ...state, element: mockElement, node: { type: 'script' }, data: 'code', eventBus: mockEventBus };
    await useRender();

    await TestUtilities.clickByText('Close');

    expect(mockEventBus.fire).toHaveBeenCalledWith(SAVE_CODE_EDITOR, {
      element: mockElement,
      node: { type: 'script' },
      data: 'code',
    });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });
  });

  it('should not fire eventBus when eventBus is not in state', async () => {
    state = { ...state, element: mockElement, eventBus: null };
    await useRender();

    await TestUtilities.clickByText('Close');

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });
  });

  it('should call useMonacoEditor with no arguments', async () => {
    state = { ...state, element: mockElement };
    await useRender();

    expect(useMonacoEditor).toHaveBeenCalledWith();
  });

  it('should display the correct script type based on language', async () => {
    const testCases = [
      { language: 'groovy', element: mockElement, expected: 'Test Element | Groovy' },
      { language: 'js', element: mockElement, expected: 'Test Element | JavaScript' },
      { language: 'javascript', element: mockElement, expected: 'Test Element | JavaScript' },
      { language: 'grOOvy', element: mockElement, expected: 'Test Element | Groovy' },
      { language: 'js', element:  { businessObject: { name: '' } }, expected: 'JavaScript' },
      { language: '', element:  mockElement, expected: 'Test Element' },
    ];

    for (const testCase of testCases) {
      state = { ...state, element: testCase.element, language: testCase.language };
      const wrapper = await useRender();
      expect(TestUtilities.getByText(testCase.expected)).toBeInTheDocument();

      wrapper.unmount();
    }
  });

  it('should apply dark class when lightTheme is false', async () => {
    state = { ...state, element: mockElement, lightTheme: false };
    const { container } = await useRender();

    expect(container.querySelector('.editor-container.dark')).toBeInTheDocument();
  });

  it('should apply light class when lightTheme is true', async () => {
    state = { ...state, element: mockElement, lightTheme: true };
    const { container } = await useRender();

    expect(container.querySelector('.editor-container.light')).toBeInTheDocument();
  });
});