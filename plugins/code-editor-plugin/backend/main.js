const { LintingServer } = require('./lib/linting-server');
const { buildMenuItems, emitEvent, showDialog } = require('./util/electron-helpers');
const Logger = require('../shared-util/logger');
const { CODE_EDITOR_CONFIG, QUIT, APP_CLIENT_READY } = require('../shared-util/constants');

module.exports = executeOnce(main);

/**
 * Main function to initialize linting server
 * @param {Object} app - ElectronApp instance
 * @returns {Promise<Object>}
 */
async function main(app) {
  return new Promise((resolve, reject) => {
    app.on(QUIT, async () => {
      Logger.info('Stopping linting server');
      await LintingServer.deleteInstance();
    });

    app.on(APP_CLIENT_READY, async () => {
      try {
        const lintingServer = LintingServer.getInstance();
        const lintingServerUrl = await lintingServer.start();
        emitEvent(app, CODE_EDITOR_CONFIG, {
          lintingServerUrl,
        });

        const menus = buildMenuItems(app);

        Logger.info(`Linting server ready at ${lintingServerUrl}`);
        resolve({
          lintingServer,
          lintingServerUrl,
          menus
        });
      } catch (err) {
        Logger.error('Failed to start linting server:', err);
        showDialog(app, {
          title: 'Failed to start to Linting Server',
          type: 'error',
          message: err.message,
        });
        reject(err);
      }
    });
  });
}


/**
 * Wrapper to make sure that wrapped function is executed only once.
 *
 * @param {function} fn
 */
function executeOnce(fn) {
  let executed = false;
  let returnValue = [];

  return function(app) {
    if (executed) {
      return returnValue;
    }

    executed = true;
    fn(app).then(result => {
      returnValue = result.menus;
    }).catch(error => {
      showDialog(app, {
        title: 'Linting Plugin',
        message: 'Couldn\'t start linting server: ' + error,
        type: 'error'
      });
    });

    return returnValue;
  };
}

