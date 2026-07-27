import sendRequest from '../http';
import Logger from '../../../shared-util/logger';

jest.mock('../../../shared-util/logger');
jest.mock('node:fs');

describe('http.test', () => {
  describe('positive tests', () => {
    beforeEach(
      () =>
        (global.fetch = jest.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () => 'DATA',
          })
        ))
    );

    it('should send an http request', async () => {
      const response = await sendRequest('REQUEST_URL', { abc: 123 });
      expect(response).toEqual({ data: 'DATA', status: 200 });
    });

    it('should return a custom message', async () => {
      const statusMessageMap = { 200: 'CUSTOM_MESSAGE' };
      const response = await sendRequest(
        'REQUEST_URL',
        { abc: 123 },
        statusMessageMap
      );
      expect(response).toEqual({
        data: 'DATA',
        message: 'CUSTOM_MESSAGE',
        status: 200,
      });
    });
  });

  describe('negative tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle a network error when running locally', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      const response = await sendRequest('http://localhost', {
        abc: 123,
      });
      expect(response).toEqual({
        error: 'Connection failed: Network error',
        message: undefined,
        status: undefined,
      });
      expect(Logger.error).toHaveBeenCalledWith('Connection failed: Network error');
    });

    it('should handle a server error', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          text: () => Promise.resolve('ERROR'),
        })
      );

      const response = await sendRequest('REQUEST_URL', { abc: 123 });
      expect(response).toEqual({
        error: 'HTTP error. Status 400: ERROR',
        message: undefined,
        status: 400
      });
      expect(Logger.error).toHaveBeenCalledWith('HTTP error. Status 400: ERROR');
    });

    it('should handle an error parsing server error message', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 299,
          text: async () => {
            throw new Error('PARSING_ERROR');
          },
        })
      );

      const response = await sendRequest('REQUEST_URL', { abc: 123 });
      expect(response).toEqual({
        error: 'Request failed: PARSING_ERROR',
        status: 299,
      });
      expect(Logger.error).toHaveBeenCalledWith('Request failed: PARSING_ERROR');
    });

    it('should handle an unexpected error', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: async () => {
            throw new Error('UNEXPECTED_ERROR');
          },
        })
      );

      const response = await sendRequest('REQUEST_URL', { abc: 123 });
      expect(response).toEqual({
        error: 'Request failed: UNEXPECTED_ERROR',
        status: 200,
      });
      expect(Logger.error).toHaveBeenCalledWith('Request failed: UNEXPECTED_ERROR');
    });
  });
});
