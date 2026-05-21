import Logger from '../../shared-util/logger';
import { parseJson, isJavaScriptLanguage } from '../../shared-util/common';

export default class LintingClient {
  _wsClient = null;
  _wsUrl = null;
  _isConnected = false;
  _callbacks = new Map();
  _messageTimeout = 10000;

  constructor(wsUrl) {
    this._wsUrl = wsUrl;
  }

  connect() {
    if (this.isConnected()) {
      Logger.debug(`Linting Client already connected to ${this._wsUrl}`);
      return Promise.resolve(this._wsUrl);
    }

    return new Promise((resolve, reject) => {
      try {
        this._wsClient = new WebSocket(this._wsUrl);

        this._wsClient.onopen = () => {
          this._isConnected = true;
          Logger.debug(`Linting Client connected to ${this._wsUrl}`);
          resolve(this._wsUrl);
        };

        this._wsClient.onclose = () => {
          this._isConnected = false;
          Logger.debug(`Disconnected from ${this._wsUrl}`);
          resolve(this._wsUrl);
        };

        this._wsClient.onmessage = (e) => this._handleMessage(e);

        this._wsClient.onerror = (err) => {
          Logger.error(`Linting Client WebSocket error: ${err}`);
          reject(err);
        };
      } catch (err) {
        Logger.error(`Error connecting to linting server: ${err.message}`);
        reject(err);
      }
    });
  }

  _handleMessage(event) {
    const resp = parseJson(event.data);
    const { id } = resp;
    Logger.debug('Received message:', resp);

    const callback = this._callbacks.get(id);
    if (!callback) return;

    const { resolve, onProgress } = callback;

    if (onProgress && resp.payload) {
      onProgress(resp.payload);
    }

    this._callbacks.delete(id);
    resolve(resp);
  }

  validateScript(script, language, onProgress) {
    const id = `lint-${language.toLowerCase().trim()}-${window.crypto.randomUUID()}`;
    const type = this.getRequestType(language);
    return this.send(id, type, { script, language }, onProgress);
  }

  checkStatus() {
    return this.send('status-check', 'get-server-info');
  }

  send(id, type, payload, onProgress) {
    return new Promise((resolve, reject) => {
      if (!this._isConnected || this._wsClient?.readyState !== WebSocket.OPEN) {
        return reject(new Error('WebSocket not connected'));
      }

      this._callbacks.set(id, { resolve, reject, onProgress });

      this._wsClient.send(JSON.stringify({
        id,
        type,
        payload,
      }));

      setTimeout(() => {
        if (!this._callbacks.has(id)) {
          this._callbacks.delete(id);
          reject(new Error('Validation request timed out'));
        }
      }, this._messageTimeout);
    });
  }

  getRequestType(language) {
    return isJavaScriptLanguage(language) ? 'lint-js' : 'lint-groovy';
  }

  disconnect() {
    if (!this._isConnected) return Promise.resolve();

    return new Promise((resolve) => {
      if (this._wsClient) {
        this._wsClient.close();
        this._isConnected = false;
        this._callbacks.clear();
        this._wsClient = null;
        Logger.debug('Linting Client disconnected');
        resolve();
      }
    });
  }

  isConnected() {
    return this._isConnected && this._wsClient?.readyState === WebSocket.OPEN;
  }
}