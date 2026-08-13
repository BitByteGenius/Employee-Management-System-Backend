/**
 * Simple logger wrapper.
 * In production, replace with winston/pino.
 */
const isProd = process.env.NODE_ENV === 'production';

const Logger = {
  info: (msg, ...args) => console.log(`[INFO]  ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN]  ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
  debug: (msg, ...args) => {
    if (!isProd) console.debug(`[DEBUG] ${msg}`, ...args);
  },
};

module.exports = Logger;
