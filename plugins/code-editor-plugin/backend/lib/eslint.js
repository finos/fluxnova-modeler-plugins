import { ESLint } from 'eslint';
import Logger from '../../shared-util/logger';
import { createEmptyLintResponse, createLintResponse, mapESLintResponseToMarkers } from '../util/markers';
import path from 'path';
import { readFileSync } from 'fs';
import vm from 'vm';

const ALLOWED_KEYS = [ 'files', 'languageOptions', 'rules', 'customRules' ];
const DEFAULTS = {
  files: [ '**/*.js' ],
  languageOptions: { ecmaVersion: 2022, sourceType: 'script' },
  rules: {}
};

function loadUserConfig() {
  try {
    const configPath = path.join(__dirname, 'config/eslint.config.js');
    const configCode = readFileSync(configPath, 'utf-8');

    const sandbox = { module: { exports: {} } };
    vm.createContext(sandbox);
    vm.runInContext(configCode, sandbox, { filename: configPath, timeout: 5000 });

    const raw = sandbox.module.exports;
    if (typeof raw !== 'object' || raw === null || typeof raw === 'function') {
      Logger.error('Invalid eslint config format (must be an object), using defaults');
      return {};
    }

    const config = {};
    for (const key of ALLOWED_KEYS) {
      if (raw[key] !== undefined) config[key] = raw[key];
    }
    return config;
  } catch (err) {
    Logger.error('Failed to load eslint config, using defaults:', err.message);
    return {};
  }
}

export async function lintJavaScript(script, options = {}) {
  try {
    const config = loadUserConfig();
    const eslintOptions = {
      overrideConfig: [ {
        files: config.files || DEFAULTS.files,
        languageOptions: config.languageOptions || DEFAULTS.languageOptions,
        rules: config.rules || DEFAULTS.rules
      } ],
      overrideConfigFile: true,
      ...options
    };

    if (config.customRules) {
      eslintOptions.plugins = { custom: { rules: config.customRules } };
    }

    const linter = new ESLint(eslintOptions);

    const result = (await linter.lintText(script))[0];
    if (!result) return createEmptyLintResponse(true);

    return createLintResponse(true, {
      markers: mapESLintResponseToMarkers(result),
      errorCount: result.errorCount,
      warnCount: result.warningCount,
      infoCount: 0,
      rawResult: result,
    });
  } catch (err) {
    Logger.error('error linting js script', err);
    return createEmptyLintResponse(false, err.message);
  }
}