const WebSocket = require('ws');
const Logger = require('../../shared-util/logger');

const { lintJavaScript } = require('./eslint');
const { lintGroovy } = require('./codenarc');
const { parseJson } = require('../../shared-util/common');

class LintingServer {
  static #instance = null;

  /**
     * Create a linting server
     * @param {Object} options - Config options
     * @param {number} [options.port=0] - Port for the WebSocket (0 = any available)
     * @param {string} [options.host='localhost'] - Host to bind the server to
     */
  constructor(options = {}) {
    this.port = options.port || 0;
    this.host = options.host || 'localhost';
    this.server = null;
    this.client = null;
    this.isRunning = false;
  }

  /**
   * Get the singleton instance of the linting server
   * @param {Object} options - Config options
   * @returns {LintingServer} - Linting server instance
   */
  static getInstance(options = {}) {
    if (!LintingServer.#instance) LintingServer.#instance = new LintingServer(options);
    return LintingServer.#instance;
  }

  /**
 * Restart the linting server instance
 * @returns {Promise<void>}
 */
  static async restartInstance() {
    if (LintingServer.#instance) {
      await LintingServer.#instance.stop();
      await LintingServer.#instance.start();
    } else {
      throw new Error('Cannot restart: server instance does not exist');
    }
  }

  /**
 * Delete the linting server instance
 * @returns {Promise<void>}
 */
  static async deleteInstance() {
    if (LintingServer.#instance) {
      await LintingServer.#instance.stop();
      LintingServer.#instance = null;
    }
  }

  /**
     * Start the linting server
     * @returns {Promise<string>} - WebSocket URL when server is started
     */
  async start() {
    if (this.isRunning) {
      Logger.info(`Linting Server already running on ${this.getUrl()}`);
      return this.getUrl();
    }

    return new Promise((resolve, reject) => {
      try {
        this.server = new WebSocket.Server({
          port: this.port,
          host: this.host
        });

        this.server.once('listening', () => {
          this.port = this.server.address().port;
          this.isRunning = true;
          this.server.on('connection', this._handleConnection.bind(this));
          Logger.info(`Linting Server started on ${this.getUrl()}`);
          resolve(this.getUrl());
        });

        this.server.once('error', (err) => {
          this._cleanup();
          Logger.error(`Failed to start server: ${this.getUrl()}`);
          reject(err);
        });
      } catch (err) {
        Logger.error(`Error creating server: ${err.message}`);
        reject(err);
      }
    });
  }

  /**
     * Handle new WebSocket connection
     * @param {WebSocket} ws - WebSocket connection
     * @param {Object} req - HTTP request.
     * @private
     */
  _handleConnection(ws, req) {
    if (this.client?.readyState === WebSocket.OPEN) {
      Logger.info('Closing previous client connection...');
      this.client.close();
    }

    this.client = ws;
    Logger.info('Client connected');

    ws.on('message', async (data) => {
      try {
        const message = parseJson(data.toString());
        const { type, id, payload } = message;

        await this._handleMessage(type, id, payload);
      } catch (err) {
        Logger.error('Error processing message', err);
        this.send({
          type: 'error',
          error: 'Invalid message format'
        });
      }
    });

    ws.on('close', () => {
      if (this.client === ws) {
        this.client = null;
        Logger.info('Client Disconnected');
      }
    });

    ws.on('error', (err) => {
      Logger.error('Websocket error', err);
    });
  }

  /**
     * Handle incoming message
     * @param {string} type - Message type
     * @param {string} id - Message ID
     * @param {Object} payload - Message Payload
     * @private
     */
  async _handleMessage(type, id, payload) {
    switch (type) {
    case 'lint-js':
      await this._handleJavaScriptRequest(id, payload);
      break;

    case 'lint-groovy':
      await this._handleGroovyRequest(id, payload);
      break;

    case 'get-server-info':
      this.send({
        type: 'server-info',
        id,
        payload: {
          url: this.getUrl(),
          isRunning: this.isRunning,
        }
      });
      break;

    default:
      Logger.info(`Message type not supported ${type}`);
      this.send({
        type: 'error',
        id,
        error: `Message type not supported ${type}`
      });
    }
  }

  /**
     * Handle JavaScript linting request
     * @param {string} id - Request ID
     * @param {Object} payload - Request payload
     * @private
     */
  async _handleJavaScriptRequest(id, payload) {
    const { script, options = {} } = payload;
    const eslintResult = await lintJavaScript(script, options);

    this.send({
      id,
      type: 'eslint-result',
      payload: {
        ...eslintResult,
      }
    });

  }

  async _handleGroovyRequest(id, payload) {
    const { script, options } = payload;
    const codenarcResult = await lintGroovy(script, options);

    this.send({
      id,
      type: 'codenarc-result',
      payload: {
        ...codenarcResult,
      }
    });
  }

  /**
     * Send message to the client
     * @param {Object} message - Message to send
     */
  send(message) {
    if (this.client?.readyState && WebSocket.OPEN) {
      this.client.send(JSON.stringify(message));
    }
  }

  /**
     * Get the WebSocket server URL
     * @returns {string|null} - The WebSocket URL or null if not running
     */
  getUrl() {
    return this.port ? `ws://${this.host}:${this.port}` : null;
  }

  /**
   * Get server status information
   * @returns {Object} - Server status details
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      url: this.getUrl(),
      hasClient: this.client?.readyState === WebSocket.OPEN,
      port: this.port,
      host: this.host
    };
  }

  /**
     * Stop the linting server
     * @returns {Promise<void>}
     */
  async stop() {
    if (!this.isRunning) return;

    return new Promise((resolve) => {
      if (this.client?.readyState && WebSocket.OPEN) {
        this.client.close();
      }
      this.client = null;

      if (this.server) {
        this.server.close(() => {
          this._cleanup();
          Logger.info('Linting server stopped');
          resolve();
        });
      } else {
        this._cleanup();
        resolve();
      }
    });
  }

  /**
     * Clean up server resources
     * @private
     */
  _cleanup() {
    this.isRunning = false;
    this.port = null;
    this.server = null;
  }
}

module.exports = { LintingServer };
