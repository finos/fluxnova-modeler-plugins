/**
 * Retrieves a config value for a plugin.
 *
 * @param {Object} config - The modeler config object
 * @param {string} pluginName - Name of the plugin
 * @param {string} key - Key of the config value
 * @param {*} defaultValue - Default value to return if the key is not found
 * @returns {Promise<*>} Resolves config value or the default value
 */
export const getConfigValue = async (config, pluginName, key, defaultValue = null) => {
  try {
    const value = await config.getForPlugin(pluginName, key);
    return value !== undefined && value !== null ? value : defaultValue;
  } catch (error) {
    console.error(`Failed to get config value for ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Sets a configuration value for a specific plugin.
 *
 * @param {Object} config - The modeler config object
 * @param {string} pluginName - Name of the plugin
 * @param {string} key - Key of the config value
 * @param {*} value - Value to set
 * @returns {Promise<void>}
 */
export const setConfigValue = async (config, pluginName, key, value) => {
  try {
    await config.setForPlugin(pluginName, key, value);
  } catch (error) {
    console.error(`Failed to set config value for ${key}:`, error);
  }
};