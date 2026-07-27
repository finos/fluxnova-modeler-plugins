import Logger from './logger';

export function parseJson(jsonString, doLogError = true) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    if (doLogError) Logger.error('Failed to parse JSON', error);
    return jsonString;
  }
}

export function isLocalhost(url) {
  return /^(http|https):\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url);
}

export function isGroovyLanguage(language) {
  return language?.toLowerCase().trim() === 'groovy';
}

export function isJavaScriptLanguage(language) {
  const normalized = language?.toLowerCase().trim();
  return normalized === 'js' || normalized === 'javascript';
}

export function debounce(fn, delay) {
  let timer;
  const debounced = function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}