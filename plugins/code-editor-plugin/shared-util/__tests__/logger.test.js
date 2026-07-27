import Logger from '../logger';

describe('logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'info');
    jest.spyOn(console, 'error');
    jest.spyOn(console, 'warn');
    jest.spyOn(console, 'debug');
  });

  it('should log debug messages with the correct prefix', () => {
    Logger.debug('A debug message');
    expect(console.debug).toHaveBeenCalledTimes(1);
    const call = console.debug.mock.calls[0][0];
    expect(call).toContain('DEBUG [code-editor-plugin]');
    expect(call).toContain('A debug message');
  });

  it('should log info messages with the correct prefix', () => {
    Logger.info('An info message');
    expect(console.info).toHaveBeenCalledTimes(1);
    const call = console.info.mock.calls[0][0];
    expect(call).toContain('INFO [code-editor-plugin]');
    expect(call).toContain('An info message');
  });

  it('should log warn messages with the correct prefix', () => {
    Logger.warn('A warn message');
    expect(console.warn).toHaveBeenCalledTimes(1);
    const call = console.warn.mock.calls[0][0];
    expect(call).toContain('WARN [code-editor-plugin]');
    expect(call).toContain('A warn message');
  });

  it('should log error messages with the correct prefix', () => {
    Logger.error('An error message');
    expect(console.error).toHaveBeenCalledTimes(1);
    const call = console.error.mock.calls[0][0];
    expect(call).toContain('ERROR [code-editor-plugin]');
    expect(call).toContain('An error message');
  });
});