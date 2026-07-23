import Logger from '../logger';
import { debounce, isGroovyLanguage, isJavaScriptLanguage, isLocalhost, parseJson } from '../common';

jest.mock('../logger');

describe('common.test', () => {
  it.each([
    [ '{"abc": "123", "def": true}', { abc: '123', def: true } ],
    [ { abc: 123 }, { abc: 123 } ],
    [ 'string', 'string' ],
    [ true, true ],
  ])('should parse json: %s', (input, output) => {
    const result = parseJson(input, false);
    expect(result).toEqual(output);
    expect(Logger.error).toHaveBeenCalledTimes(0);
  });

  it('should log error when parsing invalid json', () => {
    const invalidJson = '{invalid json}';
    const result = parseJson(invalidJson, true);
    expect(result).toBe(invalidJson);
    expect(Logger.error).toHaveBeenCalledWith('Failed to parse JSON', expect.any(Error));
  });

  it.each([
    [ 'http://localhost', true ],
    [ 'https://localhost', true ],
    [ 'http://localhost:8080', true ],
    [ 'https://localhost:8080', true ],
    [ 'http://127.0.0.1', true ],
    [ 'https://127.0.0.1', true ],
    [ 'http://127.0.0.1:8080', true ],
    [ 'https://127.0.0.1:8080', true ],
    [ 'localhost', false ],
    [ 'localhost:8080', false ],
    [ '127.0.0.1', false ],
    [ '127.0.0.1:8080', false ],
    [ 'abc', false ],
    [ 123, false ],
  ])('should check if url points to local server: %s', (input, output) => {
    expect(isLocalhost(input)).toBe(output);
  });

  it.each([
    [ 'groovy', true ],
    [ 'Groovy', true ],
    [ 'GROOVY', true ],
    [ '  groovy  ', true ],
    [ 'javascript', false ],
    [ 'js', false ],
    [ '', false ],
    [ null, false ],
    [ undefined, false ],
  ])('should check if language is groovy: %s', (input, output) => {
    expect(isGroovyLanguage(input)).toBe(output);
  });

  it.each([
    [ 'javascript', true ],
    [ 'JavaScript', true ],
    [ 'JAVASCRIPT', true ],
    [ 'js', true ],
    [ 'JS', true ],
    [ '  javascript  ', true ],
    [ '  js  ', true ],
    [ 'groovy', false ],
    [ 'java', false ],
    [ '', false ],
    [ null, false ],
    [ undefined, false ],
  ])('should check if language is javascript: %s', (input, output) => {
    expect(isJavaScriptLanguage(input)).toBe(output);
  });
  describe('debounce', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('should call the function after the specified delay', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 200);

      debounced('a');
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(200);
      expect(fn).toHaveBeenCalledWith('a');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should reset the timer on subsequent calls', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 200);

      debounced('a');
      jest.advanceTimersByTime(100);
      debounced('b');
      jest.advanceTimersByTime(100);
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith('b');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass all arguments to the callback', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced(1, 'two', { three: 3 });
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith(1, 'two', { three: 3 });
    });

    it('should preserve this context', () => {
      let captured;
      const fn = jest.fn(function() { captured = this; });
      const debounced = debounce(fn, 100);

      const context = { name: 'test' };
      debounced.call(context);
      jest.advanceTimersByTime(100);
      expect(captured).toBe(context);
    });

    it('should cancel pending invocation', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 200);

      debounced('a');
      debounced.cancel();
      jest.advanceTimersByTime(200);
      expect(fn).not.toHaveBeenCalled();
    });
  });
});
