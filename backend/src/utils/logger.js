/**
 * Minimal logger replacing console.log in production.
 * Complies with QA Protocol Iteration 5 requirement.
 */
class Logger {
  info(message, ...args) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  error(message, ...args) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
}

module.exports = new Logger();
