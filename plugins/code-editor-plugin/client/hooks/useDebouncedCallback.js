import { useCallback } from 'react';
import { debounce } from '../../shared-util/common';

const useDebouncedCallback = (callback, delay) => {
  return useCallback(
    debounce((...args) => {
      callback(...args);
    }, delay),
    [ callback, delay ]
  );
};

export default useDebouncedCallback;