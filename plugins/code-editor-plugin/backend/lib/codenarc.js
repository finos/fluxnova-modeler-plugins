import NpmGroovyLint from 'npm-groovy-lint';
import { createEmptyLintResponse, createLintResponse, mapCodeNarcResponseToMarkers } from '../util/markers';
import Logger from '../../shared-util/logger';
import path from 'path';
import { existsSync } from 'fs';

export async function lintGroovy(script, options = {}) {
  try {
    const configPath = path.join(__dirname, 'config/.groovylintrc.json');
    if (!existsSync(configPath)) {
      Logger.error('Groovy linting config file not found');
      return createEmptyLintResponse(false, 'Groovy linting config file not found');
    }

    const linter = new NpmGroovyLint({
      source: script,
      output: 'none',
      config: configPath,
      ...options
    });

    await linter.run();

    if (linter.status === 2 || linter.error?.msg) {
      let errorMsg = linter.error?.msg;

      if (errorMsg.includes('No such file or directory')) {
        errorMsg += ' - Note: Ruleset paths in .groovylintrc.json must be absolute paths.';
      }
      Logger.error('npm-groovy-lint error:', errorMsg);
      return createEmptyLintResponse(false, errorMsg);
    }

    return createLintResponse(true, {
      markers: mapCodeNarcResponseToMarkers(linter?.lintResult?.files['0']?.errors, script),
      errorCount: linter?.lintResult?.summary?.totalFoundErrorNumber,
      warnCount: linter?.lintResult?.summary?.totalFoundWarningNumber,
      infoCount: linter?.lintResult?.summary?.totalFoundInfoNumber,
      rawResult: linter?.lintResult,
    });
  } catch (err) {
    Logger.error('error linting groovy script', err);
    return createEmptyLintResponse(false, err.message);
  }
}