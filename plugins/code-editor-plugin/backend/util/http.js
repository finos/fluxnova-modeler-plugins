const { isLocalhost } = require('../../shared-util/common');
const Logger = require('../../shared-util/logger');

async function sendRequest(url, options, statusMessageMap = {}) {
  let response, status, message;

  try {
    response = await fetch(url, { ...options });
    status = response.status;
    message = statusMessageMap[status];

    if (!response.ok) {
      const errorText = await response.text();
      const errorMsg = `HTTP error. Status ${status}: ${errorText}`;
      Logger.error(errorMsg);
      return {
        error: errorMsg,
        message,
        status,
      };
    }

    const data = await response.json();
    return { data, message, status };
  } catch (error) {
    const isNetworkError = !response || isLocalhost(url);

    if (isNetworkError) {
      const errorMsg = `Connection failed: ${error.message}`;
      Logger.error(errorMsg);
      return {
        error: errorMsg,
        message,
        status
      };
    }

    const errorMsg = `Request failed: ${error.message}`;
    Logger.error(errorMsg);
    return {
      error: errorMsg,
      status: response?.status,
    };
  }
}

module.exports = sendRequest;