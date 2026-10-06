const fs = require('fs');
const path = require('path');

const executionTypesContent = fs.readFileSync(
  path.resolve(__dirname, '../../types/execution-types.d.ts'),
  'utf8'
);

module.exports = executionTypesContent;