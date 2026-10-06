import { describe } from 'node:test';
import { createLintResponse, createEmptyLintResponse, createMarker, mapCodeNarcResponseToMarkers, mapESLintResponseToMarkers, mapSeverity, MarkerSeverity } from '../markers';

describe('markers', () => {
  it('should have the correct value for marker severity', () => {
    expect(MarkerSeverity).toStrictEqual({
      Hint: 1,
      Info: 2,
      Warning: 4,
      Error: 8,
    });
  });

  describe('createMarker', () => {
    it('should create a marker', () => {
      const props = {
        startLineNumber: 10,
        startColumn: 5,
        endLineNumber: 11,
        endColumn: 15,
        message: 'Test message',
        severity: MarkerSeverity.Warning,
        source: 'Test source',
      };
      const marker = createMarker(props);
      expect(marker).toStrictEqual({
        startLineNumber: 10,
        startColumn: 5,
        endLineNumber: 11,
        endColumn: 15,
        message: 'Test message',
        severity: MarkerSeverity.Warning,
        source: 'Test source',
      });
    });

    it('should return a marker with default values if no args are provided', () => {
      const marker = createMarker();
      expect(marker).toStrictEqual({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: -1,
        message: '',
        severity: MarkerSeverity.Error,
        source: ''
      });
    });

    it('should set endLineNumber to startLineNumber if not provided', () => {
      const marker = createMarker({ startLineNumber: 5 });
      expect(marker.endLineNumber).toStrictEqual(5);
    });
  });

  describe('eslintToMarkers', () => {
    it('should return an empty array for null or invalid eslint input', () => {
      expect(mapESLintResponseToMarkers(null)).toStrictEqual([]);
      expect(mapESLintResponseToMarkers({})).toStrictEqual([]);
    });

    it('should map eslint messages to monaco markers', () => {
      const mockEslintResult = {
        messages: [
          {
            line: 10,
            column: 5,
            endLine: 10,
            endColumn: 15,
            severity: 2, // err
            message: 'Null pointer',
          },
          {
            line: 25,
            column: 1,
            severity: 1, // warn
            message: 'Missing semicolon',
          }
        ]
      };
      const markers = mapESLintResponseToMarkers(mockEslintResult);
      expect(markers).toHaveLength(2);
      expect(markers[0]).toStrictEqual({
        startLineNumber: 10,
        startColumn: 5,
        endLineNumber: 10,
        endColumn: 15,
        message: 'Null pointer',
        severity: MarkerSeverity.Error,
        source: 'ESLint'
      });

      expect(markers[1]).toStrictEqual({
        startLineNumber: 25,
        startColumn: 1,
        endLineNumber: 25,
        endColumn: 2,
        message: 'Missing semicolon',
        severity: MarkerSeverity.Warning,
        source: 'ESLint'
      });
    });

    it('should handle missing line and column values in eslint results', () => {
      const mockEslintResult = {
        messages: [
          {
            message: 'Parse error',
            severity: 2
          }
        ]
      };
      const markers = mapESLintResponseToMarkers(mockEslintResult);
      expect(markers).toHaveLength(1);
      expect(markers[0]).toStrictEqual({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: NaN,
        message: 'Parse error',
        severity: MarkerSeverity.Error,
        source: 'ESLint'
      });
    });
  });
  describe('codeNarcToMarkers', () => {
    it('should return an empty array for null or invalid codenarc input', () => {
      expect(mapCodeNarcResponseToMarkers(null)).toStrictEqual([]);
      expect(mapCodeNarcResponseToMarkers({})).toStrictEqual([]);
    });

    it('should map codenarc messages to monaco markers without sourceText', () => {
      const mockCodeNarcResult = [
        {
          line: 5,
          msg: 'Syntax error',
          severity: 'Error'
        },
        {
          line: 10,
          range: {
            start: { character: 4 },
            end: { line: 10, character: 20 }
          },
          msg: 'Custom error',
          severity: 'Warning'
        }
      ];

      const markers = mapCodeNarcResponseToMarkers(mockCodeNarcResult);
      expect(markers).toHaveLength(2);
      expect(markers[0]).toStrictEqual({
        startLineNumber: 5,
        startColumn: 1,
        endLineNumber: 5,
        endColumn: -1,
        message: 'Syntax error',
        severity: MarkerSeverity.Error,
        source: 'CodeNarc'
      });

      expect(markers[1]).toStrictEqual({
        startLineNumber: 10,
        startColumn: 5,
        endLineNumber: 10,
        endColumn: 21,
        message: 'Custom error',
        severity: MarkerSeverity.Warning,
        source: 'CodeNarc'
      });
    });

    it('should trim whitespace when sourceText is provided', () => {
      const sourceText = 'def x = 1\n  def y = 2\n    def z = 3';
      const mockCodeNarcResult = [
        {
          line: 1,
          msg: 'Error on line 1',
          severity: 'error'
        },
        {
          line: 2,
          msg: 'Error on line 2',
          severity: 'warning'
        },
        {
          line: 3,
          msg: 'Error on line 3',
          severity: 'info'
        }
      ];

      const markers = mapCodeNarcResponseToMarkers(mockCodeNarcResult, sourceText);
      expect(markers).toHaveLength(3);
      expect(markers[0]).toStrictEqual({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 10,
        message: 'Error on line 1',
        severity: MarkerSeverity.Error,
        source: 'CodeNarc'
      });

      expect(markers[1]).toStrictEqual({
        startLineNumber: 2,
        startColumn: 3,
        endLineNumber: 2,
        endColumn: 12,
        message: 'Error on line 2',
        severity: MarkerSeverity.Warning,
        source: 'CodeNarc'
      });

      expect(markers[2]).toStrictEqual({
        startLineNumber: 3,
        startColumn: 5,
        endLineNumber: 3,
        endColumn: 14,
        message: 'Error on line 3',
        severity: MarkerSeverity.Info,
        source: 'CodeNarc'
      });
    });

    it('should handle string line numbers', () => {
      const sourceText = 'def x = 1';
      const mockCodeNarcResult = [
        {
          line: '1',
          msg: 'Error with string line',
          severity: 'error'
        }
      ];

      const markers = mapCodeNarcResponseToMarkers(mockCodeNarcResult, sourceText);
      expect(markers).toHaveLength(1);
      expect(markers[0]).toStrictEqual({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 10,
        message: 'Error with string line',
        severity: MarkerSeverity.Error,
        source: 'CodeNarc'
      });
    });

    it('should handle errors with range information', () => {
      const sourceText = 'def x = 1\ndef y = 2';
      const mockCodeNarcResult = [
        {
          line: 1,
          range: {
            start: { character: 4 },
            end: { line: 2, character: 3 }
          },
          msg: 'Error with range',
          severity: 'error'
        }
      ];

      const markers = mapCodeNarcResponseToMarkers(mockCodeNarcResult, sourceText);
      expect(markers).toHaveLength(1);
      expect(markers[0]).toStrictEqual({
        startLineNumber: 1,
        startColumn: 5,
        endLineNumber: 2,
        endColumn: 4,
        message: 'Error with range',
        severity: MarkerSeverity.Error,
        source: 'CodeNarc'
      });
    });

    it('should default to line 1 when line is missing', () => {
      const sourceText = 'def x = 1';
      const mockCodeNarcResult = [
        {
          msg: 'Error without line',
          severity: 'error'
        }
      ];

      const markers = mapCodeNarcResponseToMarkers(mockCodeNarcResult, sourceText);
      expect(markers).toHaveLength(1);
      expect(markers[0]).toStrictEqual({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 10,
        message: 'Error without line',
        severity: MarkerSeverity.Error,
        source: 'CodeNarc'
      });
    });

    it('should handle whitespace-only lines', () => {
      const sourceText = 'def x = 1\n   \ndef z = 3';
      const mockCodeNarcResult = [
        {
          line: 2,
          msg: 'Error on whitespace line',
          severity: 'warning'
        }
      ];

      const markers = mapCodeNarcResponseToMarkers(mockCodeNarcResult, sourceText);
      expect(markers).toHaveLength(1);
      expect(markers[0]).toStrictEqual({
        startLineNumber: 2,
        startColumn: 1,
        endLineNumber: 2,
        endColumn: 4,
        message: 'Error on whitespace line',
        severity: MarkerSeverity.Warning,
        source: 'CodeNarc'
      });
    });

    it('should handle missing msg field', () => {
      const sourceText = 'def x = 1';
      const mockCodeNarcResult = [
        {
          line: 1,
          severity: 'error'
        }
      ];

      const markers = mapCodeNarcResponseToMarkers(mockCodeNarcResult, sourceText);
      expect(markers).toHaveLength(1);
      expect(markers[0].message).toBe('');
    });
  });

  describe('mapSeverity', () => {
    it('should map eslint (numeric) 2 severity to Error', () => {
      expect(mapSeverity(2)).toBe(MarkerSeverity.Error);
    });

    it('should map eslint (numeric) 1 severity to Warning', () => {
      expect(mapSeverity(1)).toBe(MarkerSeverity.Warning);
    });

    it('should map other eslint numeric values to Info by default', () => {
      expect(mapSeverity(0)).toBe(MarkerSeverity.Info);
      expect(mapSeverity(3)).toBe(MarkerSeverity.Info);
      expect(mapSeverity(8)).toBe(MarkerSeverity.Info);
    });

    it('should map string "error" to Error', () => {
      expect(mapSeverity('error')).toBe(MarkerSeverity.Error);
      expect(mapSeverity('ERROR')).toBe(MarkerSeverity.Error);
    });

    it('should map string "warning" to Warning', () => {
      expect(mapSeverity('warning')).toBe(MarkerSeverity.Warning);
      expect(mapSeverity('wArniNg')).toBe(MarkerSeverity.Warning);
    });

    it('should map string "info" to Info', () => {
      expect(mapSeverity('info')).toBe(MarkerSeverity.Info);
      expect(mapSeverity('iNfO')).toBe(MarkerSeverity.Info);
    });

    it('should map string "hint" to Hint', () => {
      expect(mapSeverity('hint')).toBe(MarkerSeverity.Hint);
      expect(mapSeverity('HiNt')).toBe(MarkerSeverity.Hint);
    });

    it('should map other strings to Info by default', () => {
      expect(mapSeverity('nuclear')).toBe(MarkerSeverity.Info);
    });

    it('should return Error for null', () => {
      expect(mapSeverity(undefined)).toBe(MarkerSeverity.Error);
      expect(mapSeverity(null)).toBe(MarkerSeverity.Error);
      expect(mapSeverity({})).toBe(MarkerSeverity.Error);
    });
  });

  describe('createLintResponse', () => {
    it('should create a success response', () => {
      const response = createLintResponse(true);
      expect(response.success).toBe(true);
      expect(response.data).toBeUndefined();
      expect(response.error).toBeUndefined();
    });

    it('should create a failed response', () => {
      const response = createLintResponse(false);
      expect(response.success).toBe(false);
      expect(response.data).toBeUndefined();
      expect(response.error).toBeUndefined();
    });

    it('should include relevant data when provided', () => {
      const data = { count: 2, markers: [] };
      const error = { code: 'SOME_ERR' };
      const response = createLintResponse(false, data, error);
      expect(response.success).toBe(false);
      expect(response.data).toStrictEqual(data);
      expect(response.error).toStrictEqual(error);
    });
  });

  describe('createEmptyLintResponse', () => {
    it('should create an empty lint response', () => {
      const response = createEmptyLintResponse(true);
      expect(response).toStrictEqual({
        success: true,
        data: {
          markers: [],
          errorCount: 0,
          warnCount: 0,
          infoCount: 0,
        },
      });
    });

    it('should create an empty lint response with error', () => {
      const response = createEmptyLintResponse(false, 'Some error');
      expect(response).toStrictEqual({
        success: false,
        error: 'Some error',
        data: {
          markers: [],
          errorCount: 0,
          warnCount: 0,
          infoCount: 0,
        },
      });
    });
  });
});