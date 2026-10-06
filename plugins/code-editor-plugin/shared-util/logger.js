const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const COLORS = {
  DEBUG: '\x1b[36m',
  INFO: '\x1b[32m',
  WARN: '\x1b[33m',
  ERROR: '\x1b[31m',
  RESET: '\x1b[0m',
};

const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'production'
  ? LOG_LEVELS.ERROR
  : LOG_LEVELS.DEBUG;

class Logger {
  static _getPrefix(level) {
    return `${COLORS[level]}${level} [code-editor-plugin] ${new Date().toISOString()} ${COLORS.RESET}`;
  }

  static debug(message, ...args) {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.DEBUG) {
      console.debug(`${this._getPrefix('DEBUG')} ${message}`, ...args);
    }
  }

  static info(message, ...args) {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.INFO) {
      console.info(`${this._getPrefix('INFO')} ${message}`, ...args);
    }
  }

  static warn(message, ...args) {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.WARN) {
      console.warn(`${this._getPrefix('WARN')} ${message}`, ...args);
    }
  }

  static error(message, ...args) {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.ERROR) {
      console.error(`${this._getPrefix('ERROR')} ${message}`, ...args);
    }
  }
}

module.exports = Logger;