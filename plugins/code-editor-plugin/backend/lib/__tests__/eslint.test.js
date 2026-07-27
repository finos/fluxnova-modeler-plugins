import { ESLint } from 'eslint';
import * as markers from '../../util/markers';
import { lintJavaScript } from '../eslint';
import Logger from '../../../shared-util/logger';
import { readFileSync } from 'fs';
import vm from 'vm';

jest.mock('../../../shared-util/logger');
jest.mock('fs');
jest.mock('vm');

const mockLintText = jest.fn();
jest.mock('eslint', () => ({
  ESLint: jest.fn().mockImplementation(() => ({
    lintText: mockLintText
  }))
}));

describe('eslint', () => {
  const testScript = 'const x = 1';
  let mockCreateContext;
  let mockRunInContext;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(markers, 'createLintResponse');
    jest.spyOn(markers, 'mapESLintResponseToMarkers');

    mockCreateContext = jest.fn();
    mockRunInContext = jest.fn();
    vm.createContext = mockCreateContext;
    vm.runInContext = mockRunInContext;
  });

  it('should return a formatted response when linting issues are present', async () => {
    const mockResult = {
      filePath: 'somePath',
      messages: [ { ruleId: 'semi', message: 'Missing semicolon.' } ],
      errorCount: 1,
      warningCount: 0,
    };
    const mockMarkers = [ { endColumn: NaN, endLineNumber: 1, message: 'Missing semicolon.', severity: 8, source: 'ESLint', startColumn: 1, startLineNumber: 1 } ];
    mockLintText.mockResolvedValue([ mockResult ]);


    const lintPromise = lintJavaScript(testScript);

    await expect(lintPromise).resolves.toStrictEqual({
      success: true,
      data: {
        errorCount: mockResult.errorCount,
        warnCount: mockResult.warningCount,
        infoCount: 0,
        markers: mockMarkers,
        rawResult: mockResult,
      },
    });
    expect(ESLint).toHaveBeenCalledTimes(1);
    expect(mockLintText).toHaveBeenCalledWith(testScript);
    expect(markers.mapESLintResponseToMarkers).toHaveBeenCalledWith(mockResult);
    expect(markers.createLintResponse).toHaveBeenCalledWith(true, {
      markers: mockMarkers, errorCount: 1, warnCount: 0, infoCount: 0, rawResult: mockResult
    });
  });

  it('should return a successful empty response if no linting issues present', async () => {
    mockLintText.mockResolvedValue([]);

    const lintPromise = lintJavaScript(testScript);

    await expect(lintPromise).resolves.toStrictEqual({
      success: true,
      data: {
        errorCount: 0,
        warnCount: 0,
        infoCount: 0,
        markers: [],
      },
    });

    expect(ESLint).toHaveBeenCalledTimes(1);
    expect(mockLintText).toHaveBeenCalledWith(testScript);
    expect(markers.mapESLintResponseToMarkers).not.toHaveBeenCalled();
  });

  it('should log an error and return a fail response if linting throws', async () => {
    const lintError = new Error('ESLint aint linting');
    mockLintText.mockRejectedValue(lintError);

    const lintPromise = lintJavaScript('script');

    await expect(lintPromise).resolves.toStrictEqual({
      success: false,
      data: {
        markers: [],
        errorCount: 0,
        warnCount: 0,
        infoCount: 0,
      },
      error: lintError.message,
    });

    expect(Logger.error).toHaveBeenCalledWith('error linting js script', lintError);
  });

  describe('loadUserConfig', () => {
    const validConfig = {
      files: [ '**/*.js' ],
      languageOptions: { ecmaVersion: 2022 },
      rules: { 'no-unused-vars': 'warn' },
      customRules: { 'custom-rule': {} }
    };

    beforeEach(() => {
      readFileSync.mockReturnValue('module.exports = {}');
      mockRunInContext.mockImplementation((code, sandbox) => {
        sandbox.module.exports = validConfig;
      });
    });

    it('should load and apply valid user config', async () => {
      mockLintText.mockResolvedValue([]);

      await lintJavaScript(testScript);

      expect(readFileSync).toHaveBeenCalledWith(expect.stringContaining('config/eslint.config.js'), 'utf-8');
      expect(ESLint).toHaveBeenCalledWith(expect.objectContaining({
        overrideConfig: [ {
          files: validConfig.files,
          languageOptions: validConfig.languageOptions,
          rules: validConfig.rules
        } ],
        plugins: { custom: { rules: validConfig.customRules } }
      }));
    });

    it('should filter out non-allowed config keys', async () => {
      mockRunInContext.mockImplementation((code, sandbox) => {
        sandbox.module.exports = {
          ...validConfig,
          maliciousKey: 'hack',
          plugins: { bad: 'maliciousCode' }
        };
      });
      mockLintText.mockResolvedValue([]);

      await lintJavaScript(testScript);

      const eslintCall = ESLint.mock.calls[0][0];
      expect(eslintCall.overrideConfig[0]).not.toHaveProperty('maliciousKey');
      expect(eslintCall.overrideConfig[0]).not.toHaveProperty('plugins');
    });

    it('should use defaults when config is invalid', async () => {
      mockRunInContext.mockImplementation((code, sandbox) => {
        sandbox.module.exports = function() {};
      });
      mockLintText.mockResolvedValue([]);

      await lintJavaScript(testScript);

      expect(Logger.error).toHaveBeenCalledWith('Invalid eslint config format (must be an object), using defaults');
      expect(ESLint).toHaveBeenCalledWith(expect.objectContaining({
        overrideConfig: [ {
          files: [ '**/*.js' ],
          languageOptions: { ecmaVersion: 2022, sourceType: 'script' },
          rules: {}
        } ]
      }));
    });

    it('should use defaults when config returns null', async () => {
      mockRunInContext.mockImplementation((code, sandbox) => {
        sandbox.module.exports = null;
      });
      mockLintText.mockResolvedValue([]);

      await lintJavaScript(testScript);

      expect(Logger.error).toHaveBeenCalledWith('Invalid eslint config format (must be an object), using defaults');
      expect(ESLint).toHaveBeenCalledWith(expect.objectContaining({
        overrideConfig: [ {
          files: [ '**/*.js' ],
          languageOptions: { ecmaVersion: 2022, sourceType: 'script' },
          rules: {}
        } ]
      }));
    });

    it('should use defaults when config file cannot be read', async () => {
      readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      mockLintText.mockResolvedValue([]);

      await lintJavaScript(testScript);

      expect(Logger.error).toHaveBeenCalledWith('Failed to load eslint config, using defaults:', 'File not found');
      expect(ESLint).toHaveBeenCalledWith(expect.objectContaining({
        overrideConfig: [ {
          files: [ '**/*.js' ],
          languageOptions: { ecmaVersion: 2022, sourceType: 'script' },
          rules: {}
        } ]
      }));
    });

    it('should use defaults when VM execution fails', async () => {
      mockRunInContext.mockImplementation(() => {
        throw new Error('VM execution error');
      });
      mockLintText.mockResolvedValue([]);

      await lintJavaScript(testScript);

      expect(Logger.error).toHaveBeenCalledWith('Failed to load eslint config, using defaults:', 'VM execution error');
      expect(ESLint).toHaveBeenCalledWith(expect.objectContaining({
        overrideConfig: [ {
          files: [ '**/*.js' ],
          languageOptions: { ecmaVersion: 2022, sourceType: 'script' },
          rules: {}
        } ]
      }));
    });

    it('should apply user rules and use defaults for missing keys', async () => {
      mockRunInContext.mockImplementation((code, sandbox) => {
        sandbox.module.exports = { rules: { 'no-console': 'error' } };
      });
      mockLintText.mockResolvedValue([]);

      await lintJavaScript(testScript);

      expect(ESLint).toHaveBeenCalledWith(expect.objectContaining({
        overrideConfig: [ {
          files: [ '**/*.js' ],
          languageOptions: { ecmaVersion: 2022, sourceType: 'script' },
          rules: { 'no-console': 'error' }
        } ]
      }));
    });

  });
});