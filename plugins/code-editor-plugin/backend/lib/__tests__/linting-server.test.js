import WebSocket from 'ws';
import { LintingServer } from '../linting-server';
import Logger from '../../../shared-util/logger';
import { lintJavaScript } from '../eslint';
import { lintGroovy } from '../codenarc';

jest.mock('../../../shared-util/logger');
jest.mock('../../lib/eslint');
jest.mock('../codenarc', () => ({
  lintGroovy: jest.fn()
}));
jest.mock('node:fs');

const mockWsServer = {
  on: jest.fn(),
  once: jest.fn(),
  address: jest.fn(() => ({ port: 8080 })),
  close: jest.fn()
};

jest.mock('ws', () => ({
  Server: jest.fn(() => mockWsServer),
  OPEN: 1,
  CLOSED: 3
}));


describe('LintingServer', () => {
  let server, mockClient, req;

  beforeEach(() => {
    mockClient = {
      readyState: WebSocket.OPEN,
      send: jest.fn(),
      close: jest.fn(),
      on: jest.fn()
    };
    mockWsServer.address.mockReturnValue({ port: 8080 });
    server = new LintingServer({ port: 8080, host: '0.0.0.0' });
    req = { url: '/' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default options', () => {
    const defaultServer = new LintingServer();
    expect(defaultServer.port).toBe(0);
    expect(defaultServer.host).toBe('localhost');
  });

  it('should initialize with provided options', () => {
    expect(server.port).toBe(8080);
    expect(server.host).toBe('0.0.0.0');
  });

  it('should return URL if already running', async () => {
    server.isRunning = true;
    server.port = 8080;
    const result = await server.start();

    expect(result).toBe('ws://0.0.0.0:8080');
    expect(Logger.info).toHaveBeenCalledWith('Linting Server already running on ws://0.0.0.0:8080');
  });

  it('should start server successfully', async () => {
    mockWsServer.once.mockImplementationOnce((event, callback) => {
      if (event === 'listening') callback();
    });

    const result = await server.start();

    expect(result).toBe('ws://0.0.0.0:8080');
    expect(server.isRunning).toBe(true);
    expect(Logger.info).toHaveBeenCalledWith('Linting Server started on ws://0.0.0.0:8080');
  });

  it('should handle server creation error', async () => {
    WebSocket.Server.mockImplementationOnce(() => {
      throw new Error('Server creation failed');
    });

    const newServer = new LintingServer();
    await expect(newServer.start()).rejects.toThrowError('Server creation failed');
    expect(Logger.error).toHaveBeenCalledWith('Error creating server: Server creation failed');
  });

  it('should handle server listen error', async () => {
    const error = new Error('Listen failed');
    mockWsServer.once.mockImplementation((event, callback) => {
      if (event === 'error') {
        callback(error);
      }
    });

    await expect(server.start()).rejects.toThrow(error);
    expect(Logger.error).toHaveBeenCalledWith('Failed to start server: null');
  });

  it('should handle new connection and close previous client', () => {
    const prevClient = { readyState: WebSocket.OPEN, close: jest.fn() };

    server.client = prevClient;
    server._handleConnection(mockClient, req);

    expect(prevClient.close).toHaveBeenCalled();
    expect(server.client).toBe(mockClient);
    expect(Logger.info).toHaveBeenNthCalledWith(1, 'Closing previous client connection...');
    expect(Logger.info).toHaveBeenNthCalledWith(2, 'Client connected');
  });

  it('should handle valid message', async () => {
    server.client = mockClient;
    server._handleConnection(mockClient, { url: '/' });

    const msgData = JSON.stringify({ type: 'get-server-info', id: 123, payload: {} });
    const msgCallback = mockClient.on.mock.calls.find(call => call[0] === 'message')[1];
    await msgCallback(msgData);

    expect(mockClient.send).toHaveBeenCalledWith(JSON.stringify({
      type: 'server-info',
      id: 123,
      payload: {
        url: 'ws://0.0.0.0:8080',
        isRunning: false,
      }
    }));
  });

  it('should handle invalid message', async () => {
    server.client = mockClient;
    server.send = jest.fn();
    server._handleConnection(mockClient, { url: '/' });

    const msgCallback = mockClient.on.mock.calls.find(call => call[0] === 'message')[1];
    await msgCallback('invalid json');

    expect(Logger.error).toHaveBeenCalledWith('Failed to parse JSON', expect.any(Error));
    expect(server.send).toHaveBeenCalledWith({
      type: 'error',
      id: undefined,
      error: 'Message type not supported undefined'
    });
  });

  it('should handle message processing error', async () => {
    server.client = mockClient;
    server.send = jest.fn();
    server._handleConnection(mockClient, { url: '/' });

    jest.spyOn(server, '_handleMessage').mockRejectedValue(new Error('Processing failed'));

    const msgCallback = mockClient.on.mock.calls.find(call => call[0] === 'message')[1];
    const validMessage = JSON.stringify({ type: 'test', id: 1, payload: {} });
    await msgCallback(validMessage);

    expect(Logger.error).toHaveBeenCalledWith('Error processing message', expect.any(Error));
    expect(server.send).toHaveBeenCalledWith({
      type: 'error',
      error: 'Invalid message format'
    });
  });

  it('should handle client disconnect', () => {
    server.client = mockClient;
    server._handleConnection(mockClient, { url: '/' });

    const closeCallback = mockClient.on.mock.calls.find(call => call[0] === 'close')[1];
    closeCallback();

    expect(server.client).toBeNull();
    expect(Logger.info).toHaveBeenNthCalledWith(3, 'Client Disconnected');
  });

  it('should handle ws error', async () => {
    const error = new Error('WebSocket error');
    server._handleConnection(mockClient, { url: '/' });

    const errCallback = mockClient.on.mock.calls.find(call => call[0] === 'error')[1];
    errCallback(error);

    expect(Logger.error).toHaveBeenCalledWith('Websocket error', error);
  });

  it('should handle lint-js message', async () => {
    const mockEslintResult = { success: true, data: { markers: [] } };

    lintJavaScript.mockResolvedValue(mockEslintResult);
    server.send = jest.fn();

    await server._handleMessage('lint-js', 123, { script: 'console.log("test");', options: {} });

    expect(lintJavaScript).toHaveBeenCalledWith('console.log("test");', {});

    expect(server.send).toHaveBeenCalledWith({
      id: 123,
      type: 'eslint-result',
      payload: mockEslintResult,
    });
  });

  it('should handle lint-js error', async () => {
    const lintError = new Error('Linting failed');
    lintJavaScript.mockRejectedValue(lintError);
    server.send = jest.fn();

    await expect(server._handleMessage('lint-js', 123, { script: 'bad code', options: {} })).rejects.toThrow('Linting failed');
  });

  it('should handle lint-groovy message', async () => {
    const mockCodenarcResult = { success: true, data: { markers: [] } };
    lintGroovy.mockResolvedValue(mockCodenarcResult);
    server.send = jest.fn();

    await server._handleMessage('lint-groovy', 456, { script: 'println test', options: {} });

    expect(lintGroovy).toHaveBeenCalledWith('println test', {});
    expect(server.send).toHaveBeenCalledWith({
      id: 456,
      type: 'codenarc-result',
      payload: mockCodenarcResult,
    });
  });

  it('should handle unsupported message type', async () => {
    server.send = jest.fn();
    await server._handleMessage('unsupported-msg', 666, { });

    expect(Logger.info).toHaveBeenCalledWith('Message type not supported unsupported-msg');
    expect(server.send).toHaveBeenCalledWith({
      type: 'error',
      id: 666,
      error: 'Message type not supported unsupported-msg',
    });
  });

  it('should send message when client is open', () => {
    server.client = mockClient;
    const msg = { type: 'test', data: 'test' };

    server.send(msg);
    expect(mockClient.send).toHaveBeenCalledWith(JSON.stringify(msg));
  });

  it('should return correct URL', () => {
    server.port = 3000;
    server.host = 'localhost';

    expect(server.getUrl()).toEqual('ws://localhost:3000');
  });

  it('should return null URL when no port', () => {
    server.port = null;
    expect(server.getUrl()).toBeNull();
  });

  it('should stop server when not running', async () => {
    server.isRunning = false;
    await server.stop();

    expect(Logger.info).not.toHaveBeenCalledWith('Linting Server stopped');
  });

  it('should stop server and close client', async () => {
    server.isRunning = true;
    server.client = mockClient;
    server.server = mockWsServer;
    mockWsServer.close.mockImplementation(callback => callback());

    await server.stop();

    expect(mockClient.close).toHaveBeenCalled();
    expect(mockWsServer.close).toHaveBeenCalled();
    expect(server.client).toBeNull();
    expect(server.isRunning).toBe(false);
    expect(server.port).toBeNull();
    expect(server.server).toBeNull();
    expect(Logger.info).toHaveBeenCalledWith('Linting server stopped');
  });

  it('should stop server without client', async () => {
    server.isRunning = true;
    server.client = null;
    server.server = mockWsServer;
    mockWsServer.close.mockImplementation(callback => callback());

    await server.stop();

    expect(mockWsServer.close).toHaveBeenCalled();
    expect(server.isRunning).toBe(false);
    expect(server.port).toBeNull();
    expect(server.server).toBeNull();
  });

  it('should stop server without server instance', async () => {
    server.isRunning = true;
    server.server = null;

    await server.stop();

    expect(server.isRunning).toBe(false);
    expect(server.port).toBeNull();
  });

  it('should return server status', () => {
    server.isRunning = true;
    server.port = 8080;
    server.host = 'localhost';
    server.client = mockClient;

    const status = server.getStatus();

    expect(status).toEqual({
      isRunning: true,
      url: 'ws://localhost:8080',
      hasClient: true,
      port: 8080,
      host: 'localhost'
    });
  });

  it('should cleanup server resources', () => {
    server.isRunning = true;
    server.port = 8080;
    server.server = mockWsServer;

    server._cleanup();

    expect(server.isRunning).toBe(false);
    expect(server.port).toBeNull();
    expect(server.server).toBeNull();
  });
});

describe('Server Instance', () => {
  afterEach(async () => {
    await LintingServer.deleteInstance();
    jest.clearAllMocks();
  });

  it('should create and return server instance', () => {
    const instance1 = LintingServer.getInstance({ port: 9000 });
    const instance2 = LintingServer.getInstance({ port: 9001 });

    expect(instance1).toBe(instance2);
    expect(instance1).toBeInstanceOf(LintingServer);
  });

  it('should delete server instance', async () => {
    const instance = LintingServer.getInstance();
    instance.stop = jest.fn().mockResolvedValue(undefined);

    await LintingServer.deleteInstance();

    expect(instance.stop).toHaveBeenCalled();
  });

  it('should handle delete when no instance exists', async () => {
    await LintingServer.deleteInstance();
    await expect(LintingServer.deleteInstance()).resolves.toBeUndefined();
  });

  it('should restart server instance', async () => {
    const instance = LintingServer.getInstance();
    instance.stop = jest.fn().mockResolvedValue(undefined);
    instance.start = jest.fn().mockResolvedValue('ws://localhost:8080');

    await LintingServer.restartInstance();

    expect(instance.stop).toHaveBeenCalled();
    expect(instance.start).toHaveBeenCalled();
  });

  it('should throw error when restarting non-existent instance', async () => {
    await expect(LintingServer.restartInstance()).rejects.toThrow('Cannot restart: server instance does not exist');
  });
});