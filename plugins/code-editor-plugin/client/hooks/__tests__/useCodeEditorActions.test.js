import React from 'react';
import { renderHook } from '@testing-library/react';
import TestUtilities from '../../../shared-util/test-utilities';
import useCodeEditorActions from '../useCodeEditorActions';
import { CodeEditorContext } from '../../CodeEditorContext';
import { SAVE_CODE_EDITOR } from '../../../shared-util/constants';

describe('useCodeEditorActions', () => {
  let mockDispatch, mockEventBus, state;

  const wrapper = ({ children }) => (
    <CodeEditorContext.Provider value={ { state, dispatch: mockDispatch } }>
      {children}
    </CodeEditorContext.Provider>
  );

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockEventBus = { fire: jest.fn() };
    state = {
      modalOpen: true,
      eventBus: mockEventBus,
      element: { id: 'el-1' },
      node: { id: 'node-1' },
      data: 'console.log("hello");',
    };
  });

  describe('saveScript', () => {
    it('should fire SAVE_CODE_EDITOR with state.data by default', () => {
      const { result } = renderHook(() => useCodeEditorActions(), { wrapper });

      TestUtilities.actSync(() => result.current.saveScript());

      expect(mockEventBus.fire).toHaveBeenCalledWith(SAVE_CODE_EDITOR, {
        element: state.element,
        node: state.node,
        data: state.data,
      });
    });

    it('should fire SAVE_CODE_EDITOR with explicit data when provided', () => {
      const { result } = renderHook(() => useCodeEditorActions(), { wrapper });
      const customData = 'let x = 1;';

      TestUtilities.actSync(() => result.current.saveScript(customData));

      expect(mockEventBus.fire).toHaveBeenCalledWith(SAVE_CODE_EDITOR, {
        element: state.element,
        node: state.node,
        data: customData,
      });
    });

    it('should not fire when eventBus is null', () => {
      state.eventBus = null;
      const { result } = renderHook(() => useCodeEditorActions(), { wrapper });

      TestUtilities.actSync(() => result.current.saveScript());

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should not fire when element is null', () => {
      state.element = null;
      const { result } = renderHook(() => useCodeEditorActions(), { wrapper });

      TestUtilities.actSync(() => result.current.saveScript());

      expect(mockEventBus.fire).not.toHaveBeenCalled();
    });
  });

  describe('closeEditor', () => {
    it('should save and dispatch CLOSE_MODAL when modal is open', () => {
      const { result } = renderHook(() => useCodeEditorActions(), { wrapper });

      TestUtilities.actSync(() => result.current.closeEditor());

      expect(mockEventBus.fire).toHaveBeenCalledWith(SAVE_CODE_EDITOR, {
        element: state.element,
        node: state.node,
        data: state.data,
      });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });
    });

    it('should not save or dispatch when modal is not open', () => {
      state.modalOpen = false;
      const { result } = renderHook(() => useCodeEditorActions(), { wrapper });

      TestUtilities.actSync(() => result.current.closeEditor());

      expect(mockEventBus.fire).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
});
