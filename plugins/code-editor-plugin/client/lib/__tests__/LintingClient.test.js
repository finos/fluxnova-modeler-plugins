import LintingClient from '../LintingClient';
import Logger from '../../../shared-util/logger';

jest.mock('../../../shared-util/logger');

const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
  onopen: null,
  onclose: null,
  onmessage: null,
  onerror: null
};

global.WebSocket = jest.fn(() => mockWebSocket);
global.WebSocket.OPEN = 1;
global.WebSocket.CLOSED = 3;

Object.defineProperty(global, 'window', {
  value: {
    crypto: {
      randomUUID: jest.fn(() => 'test-uuid-123')
    }
  },
  writable: true
});

describe('LintingClient', () => {
  let client;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWebSocket.readyState = 1;
    client = new LintingClient('ws://localhost:8080');
  });

  it('should initialize with correct properties', () => {
    expect(client._wsUrl).toBe('ws://localhost:8080');
    expect(client._isConnected).toBe(false);
    expect(client._wsClient).toBe(null);
    expect(client._messageTimeout).toBe(10000);
    expect(client._callbacks).toBeInstanceOf(Map);
  });

  it('should connect successfully', async () => {
    const connectPromise = client.connect();
    mockWebSocket.onopen();

    const result = await connectPromise;

    expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8080');
    expect(client._isConnected).toBe(true);
    expect(result).toBe('ws://localhost:8080');
    expect(Logger.debug).toHaveBeenCalledWith('Linting Client connected to ws://localhost:8080');
  });

  it('should return early if already connected', async () => {
    client._isConnected = true;
    client._wsClient = mockWebSocket;

    const promise = client.connect();
    await expect(promise).resolves.toBe('ws://localhost:8080');
    expect(Logger.debug).toHaveBeenCalledWith('Linting Client already connected to ws://localhost:8080');
    expect(global.WebSocket).not.toHaveBeenCalled();
  });

  it('should handle connection error', async () => {
    const error = new Error('Connection failed');
    const connectPromise = client.connect();
    mockWebSocket.onerror(error);

    await expect(connectPromise).rejects.toThrow(error);
    expect(Logger.error).toHaveBeenCalledWith(`Linting Client WebSocket error: ${error}`);
  });

  it('should handle WebSocket creation error', async () => {
    global.WebSocket.mockImplementationOnce(() => {
      throw new Error('WebSocket creation failed');
    });

    await expect(client.connect()).rejects.toThrow('WebSocket creation failed');
    expect(Logger.error).toHaveBeenCalledWith('Error connecting to linting server: WebSocket creation failed');
  });

  it('should handle close event', async () => {
    const connectPromise = client.connect();
    mockWebSocket.onopen();
    await connectPromise;

    mockWebSocket.onclose();

    expect(client._isConnected).toBe(false);
    expect(Logger.debug).toHaveBeenCalledWith('Disconnected from ws://localhost:8080');
  });

  it('should handle message and resolve callback', () => {
    const resolve = jest.fn();
    const onProgress = jest.fn();
    const callback = { resolve, onProgress };
    client._callbacks.set('test-id', callback);

    const messageEvent = {
      data: JSON.stringify({
        id: 'test-id',
        type: 'lint-result',
        payload: { data: 'test data' }
      })
    };

    client._handleMessage(messageEvent);

    expect(onProgress).toHaveBeenCalledWith({ data: 'test data' });
    expect(resolve).toHaveBeenCalledWith({
      id: 'test-id',
      type: 'lint-result',
      payload: { data: 'test data' }
    });
    expect(client._callbacks.has('test-id')).toBe(false);
    expect(Logger.debug).toHaveBeenCalledWith('Received message:', {
      id: 'test-id',
      type: 'lint-result',
      payload: { data: 'test data' }
    });
  });

  it('should ignore message without callback', () => {
    const messageEvent = {
      data: JSON.stringify({
        id: 'unknown-id',
        type: 'lint-result',
        payload: { data: 'test data' }
      })
    };

    expect(() => client._handleMessage(messageEvent)).not.toThrow();
  });

  it('should handle message without payload data', () => {
    const callback = { resolve: jest.fn(), onProgress: jest.fn() };
    client._callbacks.set('test-id', callback);

    const messageEvent = {
      data: JSON.stringify({
        id: 'test-id',
        type: 'lint-result',
        payload: null
      })
    };

    client._handleMessage(messageEvent);

    expect(callback.onProgress).not.toHaveBeenCalled();
  });

  it('should validate JavaScript script', async () => {
    client._isConnected = true;
    client._wsClient = mockWebSocket;
    const onProgress = jest.fn();

    const promise = client.validateScript('console.log("test");', 'javascript', onProgress);

    expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
      id: 'lint-javascript-test-uuid-123',
      type: 'lint-js',
      payload: { script: 'console.log("test");', language: 'javascript' }
    }));

    const callback = client._callbacks.get('lint-javascript-test-uuid-123');
    expect(callback.onProgress).toBe(onProgress);

    callback.resolve({ success: true });
    const result = await promise;
    expect(result).toEqual({ success: true });
  });

  it('should check server status', async () => {
    client._isConnected = true;
    client._wsClient = mockWebSocket;

    client.checkStatus();

    expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({
      id: 'status-check',
      type: 'get-server-info',
      payload: undefined
    }));
  });

  it('should reject send when not connected', async () => {
    client._isConnected = false;

    await expect(client.send('test', 'test-type', {})).rejects.toThrow('WebSocket not connected');
  });

  it('should reject send when websocket not open', async () => {
    client._isConnected = true;
    client._wsClient = { ...mockWebSocket, readyState: 3 };

    await expect(client.send('test', 'test-type', {})).rejects.toThrow('WebSocket not connected');
  });

  it('should reject send when no websocket client', async () => {
    client._isConnected = true;
    client._wsClient = null;

    await expect(client.send('test', 'test-type', {})).rejects.toThrow('WebSocket not connected');
  });

  it('should timeout request', async () => {
    client._isConnected = true;
    client._wsClient = mockWebSocket;
    client._messageTimeout = 1000;

    const promise = client.send('timeout-test', 'test-type', {});
    client._callbacks.delete('timeout-test');

    jest.advanceTimersByTime(1000);

    await expect(promise).rejects.toThrow('Validation request timed out');

    jest.useRealTimers();
  });

  it('should return correct request type for JavaScript', () => {
    expect(client.getRequestType('js')).toBe('lint-js');
    expect(client.getRequestType('JS')).toBe('lint-js');
    expect(client.getRequestType('javascript')).toBe('lint-js');
    expect(client.getRequestType('JavaScript')).toBe('lint-js');
    expect(client.getRequestType(' js ')).toBe('lint-js');
  });

  it('should return groovy type for non-JavaScript languages', () => {
    expect(client.getRequestType('groovy')).toBe('lint-groovy');
    expect(client.getRequestType('python')).toBe('lint-groovy');
    expect(client.getRequestType('')).toBe('lint-groovy');
    expect(client.getRequestType(null)).toBe('lint-groovy');
    expect(client.getRequestType(undefined)).toBe('lint-groovy');
  });

  it('should disconnect when connected', async () => {
    client._isConnected = true;
    client._wsClient = mockWebSocket;
    client._callbacks.set('test', { resolve: jest.fn() });

    await client.disconnect();

    expect(mockWebSocket.close).toHaveBeenCalled();
    expect(client._isConnected).toBe(false);
    expect(client._wsClient).toBe(null);
    expect(client._callbacks.size).toBe(0);
    expect(Logger.debug).toHaveBeenCalledWith('Linting Client disconnected');
  });

  it('should resolve immediately when not connected', async () => {
    client._isConnected = false;

    await expect(client.disconnect()).resolves.toBeUndefined();
    expect(mockWebSocket.close).not.toHaveBeenCalled();
  });
});
