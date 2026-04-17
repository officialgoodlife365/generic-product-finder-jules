class BaseSourceModule {
  /**
   * @param {Object} config The module configuration from the source_registry
   */
  constructor(config) {
    this.config = config;
    this.moduleName = config.module_name;
    this.category = config.category || 'community_voice';
  }

  /**
   * Scans the source for pain signals.
   * @param {string[]} _niches Array of target niches
   * @param {Object} _keywords Dictionary of keyword arrays categorized by signal type
   * @param {Object} _dateRange { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
   * @param {Object} _options Additional scan options (max_results, etc.)
   * @returns {Promise<import('./types').SignalResult[]>}
   */
  async scan(_niches, _keywords, _dateRange, _options) {
    throw new Error('scan() must be implemented by the subclass');
  }

  /**
   * Standardizes error formatting to match the architecture specification.
   * @param {Error} error
   * @param {string} type
   * @param {number} signalsBeforeError
   * @param {Array} partialResults
   */
  formatError(error, type, signalsBeforeError = 0, partialResults = []) {
    const formattedError = new Error(error.message);
    formattedError.module_name = this.moduleName;
    formattedError.status = 'error';
    formattedError.error_type = type;
    formattedError.error_message = error.message;
    formattedError.signals_before_error = signalsBeforeError;
    formattedError.partial_results = partialResults;
    return formattedError;
  }

  /**
   * Calculates freshness weight based on date posted.
   * <30d = 1.2, 1-3mo = 1.0, 3-6mo = 0.8, 6-12mo = 0.6
   * @param {string|Date} datePosted
   * @returns {number}
   */
  calculateFreshnessWeight(datePosted) {
    const postDate = new Date(datePosted);
    const now = new Date();
    const diffDays = (now - postDate) / (1000 * 60 * 60 * 24);

    if (diffDays < 30) return 1.2;
    if (diffDays <= 90) return 1.0;
    if (diffDays <= 180) return 0.8;
    return 0.6;
  }
}

module.exports = BaseSourceModule;
