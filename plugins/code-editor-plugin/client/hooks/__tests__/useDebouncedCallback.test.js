import { renderHook } from '@testing-library/react';
import TestUtilities from '../../../shared-util/test-utilities';
import useDebouncedCallback from '../useDebouncedCallback';
import { debounce } from '../../../shared-util/common';

jest.mock('../../../shared-util/common', () => ({
  ...jest.requireActual('../../../shared-util/common'),
  debounce: jest.fn((fn) => fn),
}));

describe('useDebouncedCallback', () => {
  it('should call the callback after the specified delay', () => {
    const callback = jest.fn();
    const delay = 500;
    const { result } = renderHook(() => useDebouncedCallback(callback, delay));

    TestUtilities.actSync(() => {
      result.current('test');
    });

    expect(debounce).toHaveBeenCalledWith(expect.any(Function), delay);
    expect(callback).toHaveBeenCalledWith('test');
  });

  it('should return a memoized function', () => {
    const callback = jest.fn();
    const delay = 500;
    const { result, rerender } = renderHook(() => useDebouncedCallback(callback, delay));

    const firstCall = result.current;

    rerender();

    const secondCall = result.current;

    expect(firstCall).toBe(secondCall);
  });
});