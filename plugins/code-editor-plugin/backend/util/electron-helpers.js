const { LINTING_SERVER_STATUS } = require('../../shared-util/constants');
const { LintingServer } = require('../lib/linting-server');

/**
 * Emits an event to the main process
 * @param {Object} app - ElectronApp instance
 * @param {string} type - Event type
 * @param {Object} payload - Event payload
 */
function emitEvent(app, type, payload) {
  app.emit('menu:action', 'emit-event', {
    type,
    payload,
  });
}

/**
 * Shows a dialog that can be configured.
 *
 * @param {Object} app - ElectronApp instance
 * @param {Object} options - Options.
 * @param {Array} [options.buttons] - Buttons.
 * @param {string} [options.detail] - detail.
 * @param {string} [options.message] - Message.
 * @param {string} [options.title] - Title.
 * @param {string} options.type - Type (info, warning, error, question).
 */
function showDialog(app, options) {
  app.emit('menu:action', 'show-dialog', options);
}


/**
 * Display notification.
 *
 * @param {Object} app - ElectronApp instance
 * @param {Object} options - Options
 * @param {string} options.title - Title
 * @param {import('react').ReactNode} [options.content] - Content
 * @param {'info'|'success'|'error'|'warning'} [options.type='info'] - Type
 * @param {number} [options.duration=4000] - Duration
 */
function displayNotification(app, options) {
  app.emit('menu:action', 'display-notification', options);
}

/**
 * Build menu items for the plugin
 * @param {Object} app - ElectronApp instance
 * @returns {Object} - Electron menu object
 */
function buildMenuItems(app) {
  return [
    {
      label: 'Toggle CodeEditor',
      enabled: true,
      action: function() {
        app.emit('menu:action', 'toggleCodeEditor');
      }
    },
    {
      label: 'Show Linting Server Status',
      enabled: true,
      action: function() {
        const lintingServer = LintingServer.getInstance();
        const serverStatus = lintingServer.getStatus();
        emitEvent(app, LINTING_SERVER_STATUS, serverStatus);
      }
    },
  ];
}


export {
  emitEvent,
  showDialog,
  displayNotification,
  buildMenuItems
};