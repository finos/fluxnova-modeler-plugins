import { getConfigValue, setConfigValue } from '../ConfigHelper';

describe('ConfigHelper', () => {
  let configMock;

  beforeEach(() => {
    configMock = {
      getForPlugin: jest.fn(),
      setForPlugin: jest.fn()
    };

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getConfigValue', () => {
    test('should return the config value if it exists', async () => {
      configMock.getForPlugin.mockResolvedValue('someValue');

      const result = await getConfigValue(configMock, 'somePlugin', 'someKey', 'defaultValue');

      expect(configMock.getForPlugin).toHaveBeenCalledWith('somePlugin', 'someKey');
      expect(result).toBe('someValue');
    });

    test('should return the default value if the config value does not exist', async () => {
      configMock.getForPlugin.mockResolvedValue(undefined);

      const result = await getConfigValue(configMock, 'somePlugin', 'someKey', 'defaultValue');

      expect(configMock.getForPlugin).toHaveBeenCalledWith('somePlugin', 'someKey');
      expect(result).toBe('defaultValue');
    });

    test('should return the default value and log error if config call fails', async () => {
      const error = new Error('Failed to get config');
      configMock.getForPlugin.mockRejectedValue(error);

      const result = await getConfigValue(configMock, 'somePlugin', 'someKey', 'defaultValue');

      expect(configMock.getForPlugin).toHaveBeenCalledWith('somePlugin', 'someKey');
      expect(result).toBe('defaultValue');
      expect(console.error).toHaveBeenCalledWith('Failed to get config value for someKey:', error);
    });
  });

  describe('setConfigValue', () => {
    test('should set the value in config', async () => {
      await setConfigValue(configMock, 'somePlugin', 'someKey', 'someValue');
      expect(configMock.setForPlugin).toHaveBeenCalledWith('somePlugin', 'someKey', 'someValue');
    });

    test('should log an error if setting the config value fails', async () => {
      const error = new Error('Failed to set config');
      configMock.setForPlugin.mockRejectedValue(error);

      await setConfigValue(configMock, 'somePlugin', 'someKey', 'someValue');
      expect(configMock.setForPlugin).toHaveBeenCalledWith('somePlugin', 'someKey', 'someValue');
      expect(console.error).toHaveBeenCalledWith('Failed to set config value for someKey:', error);
    });
  });
});

