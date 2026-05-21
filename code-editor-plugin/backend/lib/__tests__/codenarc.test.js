import * as markers from '../../util/markers';
import { lintGroovy } from '../codenarc';
import Logger from '../../../shared-util/logger';
import { existsSync } from 'fs';

jest.mock('../../../shared-util/logger');
jest.mock('fs');

const mockRun = jest.fn();
const mockLinter = {
  run: mockRun,
  status: 0,
  lintResult: {
    files: {
      '0': { errors: [] }
    },
    summary: {
      totalFoundErrorNumber: 0,
      totalFoundWarningNumber: 0,
      totalFoundInfoNumber: 0
    }
  }
};

jest.mock('npm-groovy-lint', () => {
  return jest.fn(() => mockLinter);
});

describe('codenarc', () => {
  const testScript = 'def x = 1';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(markers, 'createLintResponse');
    jest.spyOn(markers, 'createEmptyLintResponse');
    jest.spyOn(markers, 'mapCodeNarcResponseToMarkers');
    existsSync.mockReturnValue(true);
    mockRun.mockResolvedValue();

    mockLinter.status = 0;
    mockLinter.error = undefined;
    mockLinter.lintResult = {
      files: {
        '0': { errors: [] }
      },
      summary: {
        totalFoundErrorNumber: 0,
        totalFoundWarningNumber: 0,
        totalFoundInfoNumber: 0
      }
    };
  });

  it('should return a formatted response when linting issues are present', async () => {
    const mockErrors = [ { line: 1, msg: 'Missing semicolon.', severity: 'error' } ];
    const mockMarkers = [ { endColumn: 10, endLineNumber: 1, message: 'Missing semicolon.', severity: 8, source: 'CodeNarc', startColumn: 1, startLineNumber: 1 } ];

    mockLinter.lintResult = {
      files: {
        '0': { errors: mockErrors }
      },
      summary: {
        totalFoundErrorNumber: 1,
        totalFoundWarningNumber: 0,
        totalFoundInfoNumber: 0
      }
    };

    const result = await lintGroovy(testScript);

    expect(result).toStrictEqual({
      success: true,
      data: {
        errorCount: 1,
        warnCount: 0,
        infoCount: 0,
        markers: mockMarkers,
        rawResult: expect.objectContaining({
          summary: expect.objectContaining({
            totalFoundErrorNumber: 1
          })
        }),
      },
    });
    expect(mockRun).toHaveBeenCalled();
    expect(markers.mapCodeNarcResponseToMarkers).toHaveBeenCalledWith(mockErrors, testScript);
    expect(markers.createLintResponse).toHaveBeenCalledWith(true, {
      markers: mockMarkers,
      errorCount: 1,
      warnCount: 0,
      infoCount: 0,
      rawResult: expect.any(Object)
    });
  });

  it('should return a successful empty response if no linting issues present', async () => {
    const result = await lintGroovy(testScript);

    expect(result).toStrictEqual({
      success: true,
      data: {
        errorCount: 0,
        warnCount: 0,
        infoCount: 0,
        markers: [],
        rawResult: expect.objectContaining({
          files: { '0': { errors: [] } }
        }),
      },
    });

    expect(mockRun).toHaveBeenCalled();
    expect(markers.mapCodeNarcResponseToMarkers).toHaveBeenCalledWith([], testScript);
  });

  it('should return error response when config file does not exist', async () => {
    existsSync.mockReturnValue(false);

    const result = await lintGroovy(testScript);

    expect(result).toStrictEqual({
      success: false,
      data: {
        markers: [],
        errorCount: 0,
        warnCount: 0,
        infoCount: 0,
      },
      error: 'Groovy linting config file not found',
    });

    expect(Logger.error).toHaveBeenCalledWith('Groovy linting config file not found');
    expect(mockRun).not.toHaveBeenCalled();
  });

  it('should return error response when linter status is 2', async () => {
    mockLinter.status = 2;
    mockLinter.error = { msg: 'Linting failed' };

    const result = await lintGroovy(testScript);

    expect(result).toStrictEqual({
      success: false,
      data: {
        markers: [],
        errorCount: 0,
        warnCount: 0,
        infoCount: 0,
      },
      error: 'Linting failed',
    });

    expect(Logger.error).toHaveBeenCalledWith('npm-groovy-lint error:', 'Linting failed');
  });

  it('should add helpful message for missing file error', async () => {
    const errorMsg = 'Error: ENOENT: No such file or directory, open /path/to/file';
    mockLinter.status = 2;
    mockLinter.error = { msg: errorMsg };

    const result = await lintGroovy(testScript);

    expect(result).toStrictEqual({
      success: false,
      data: {
        markers: [],
        errorCount: 0,
        warnCount: 0,
        infoCount: 0,
      },
      error: errorMsg + ' - Note: Ruleset paths in .groovylintrc.json must be absolute paths.',
    });

    expect(Logger.error).toHaveBeenCalledWith(
      'npm-groovy-lint error:',
      errorMsg + ' - Note: Ruleset paths in .groovylintrc.json must be absolute paths.'
    );
  });

  it('should return error response when linter has error message', async () => {
    mockLinter.error = { msg: 'Unexpected error' };

    const result = await lintGroovy(testScript);

    expect(result).toStrictEqual({
      success: false,
      data: {
        markers: [],
        errorCount: 0,
        warnCount: 0,
        infoCount: 0,
      },
      error: 'Unexpected error',
    });

    expect(Logger.error).toHaveBeenCalledWith('npm-groovy-lint error:', 'Unexpected error');
  });

  it('should log an error and return a fail response if linting throws', async () => {
    const lintError = new Error('Groovy linter crashed');
    mockRun.mockRejectedValue(lintError);

    const result = await lintGroovy(testScript);

    expect(result).toStrictEqual({
      success: false,
      data: {
        markers: [],
        errorCount: 0,
        warnCount: 0,
        infoCount: 0,
      },
      error: lintError.message,
    });

    expect(Logger.error).toHaveBeenCalledWith('error linting groovy script', lintError);
  });
});