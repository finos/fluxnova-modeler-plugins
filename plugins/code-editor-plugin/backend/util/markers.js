export const MarkerSeverity = {
  Hint: 1,
  Info: 2,
  Warning: 4,
  Error: 8
};

export function createMarker({
  startLineNumber = 1,
  startColumn = 1,
  endLineNumber = startLineNumber,
  endColumn = -1,
  message = '',
  severity = MarkerSeverity.Error,
  source = ''
} = {}) {
  return {
    startLineNumber,
    startColumn,
    endLineNumber,
    endColumn,
    message,
    severity,
    source
  };
}

export function mapESLintResponseToMarkers(eslintResult) {
  if (!eslintResult || !Array.isArray(eslintResult.messages)) return [];

  return eslintResult.messages.map((msg) => createMarker({
    startLineNumber: msg.line || 1,
    startColumn: msg.column || 1,
    endLineNumber: msg.endLine || msg.line,
    endColumn: msg.endColumn || (msg.column + 1),
    message: msg.message,
    severity: mapSeverity(msg.severity),
    source: 'ESLint'
  }));
}

export function mapCodeNarcResponseToMarkers(codeNarcResult, script = '') {
  if (!codeNarcResult || !Array.isArray(codeNarcResult)) return [];
  const sourceLines = script.split('\n');

  return codeNarcResult.map((error) => {
    const lineNumber = typeof error.line === 'string' ? parseInt(error.line, 10) : (error.line || 1);
    const lineIndex = lineNumber - 1;

    let startColumn = 1;
    let endColumn = -1;
    let endLineNumber = lineNumber;

    if (error.range) {
      startColumn = (error.range.start?.character ?? 0) + 1;
      endLineNumber = error.range.end?.line ?? lineNumber;
      endColumn = (error.range.end?.character ?? -1) + 1;
    } else if (sourceLines[lineIndex]) {
      const line = sourceLines[lineIndex];
      const firstNonWhitespace = line.search(/\S/);
      startColumn = firstNonWhitespace >= 0 ? firstNonWhitespace + 1 : 1;
      endColumn = line.length + 1;
    }

    return createMarker({
      startLineNumber: lineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      message: error.msg || '',
      severity: mapSeverity(error.severity),
      source: 'CodeNarc'
    });
  });
}

export function mapSeverity(severity) {
  if (typeof severity === 'number') { // eslint
    switch (severity) {
    case 2:
      return MarkerSeverity.Error;
    case 1:
      return MarkerSeverity.Warning;
    default:
      return MarkerSeverity.Info;
    }
  }

  if (typeof severity === 'string') {
    switch (severity.toLowerCase()) {
    case 'error':
      return MarkerSeverity.Error;
    case 'warning':
      return MarkerSeverity.Warning;
    case 'info':
      return MarkerSeverity.Info;
    case 'hint':
      return MarkerSeverity.Hint;
    default:
      return MarkerSeverity.Info;
    }
  }

  return MarkerSeverity.Error;
}

export function createLintResponse(success, data = {}, error = null) {
  const response = {
    success
  };
  if (!success && error) response.error = error;
  if (data && Object.keys(data).length > 0) response.data = data;

  return response;
}

export function createEmptyLintResponse(success, error = null) {
  return createLintResponse(success, {
    markers: [],
    errorCount: 0,
    warnCount: 0,
    infoCount: 0,
  }, error);
}