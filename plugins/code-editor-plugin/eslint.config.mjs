import bpmnIoPlugin from 'eslint-plugin-bpmn-io';
import pluginJest from 'eslint-plugin-jest';

export default [
  {
    ignores: [
      'dist/',
      'node_modules/',
      'coverage/',
    ],
  },

  ...bpmnIoPlugin.configs.recommended,
  ...bpmnIoPlugin.configs.browser,
  ...bpmnIoPlugin.configs.jsx,
  ...bpmnIoPlugin.configs.node,

  {
    files: [ '**/*.spec.js', '**/*.test.js' ],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: {
        ...pluginJest.environments.globals.globals,
      }
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
];