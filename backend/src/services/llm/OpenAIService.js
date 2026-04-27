const { OpenAI } = require('openai');
const logger = require('../../utils/logger');
const { createFingerprint } = require('../discovery/utils');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    if (this.apiKey) {
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
  }

  /**
   * Clusters an array of raw signals based on semantic similarity of their pain_quotes/names.
   * Modifies and returns the array with standardized `problem_fingerprint` and `problem_name`.
   * @param {Array} rawSignals
   * @returns {Promise<Array>} The clustered signals
   */
  async clusterSignals(rawSignals) {
    if (!this.client || rawSignals.length === 0) {
      logger.info('[OpenAIService] No OpenAI API Key found or no signals, falling back to basic fingerprinting.');
      // Fallback behavior: Just ensure basic fingerprint exists
      return rawSignals.map(signal => {
        if (signal && !signal.problem_fingerprint) {
          signal.problem_fingerprint = createFingerprint(signal.problem_name);
        }
        return signal;
      });
    }

    try {
      logger.info(`[OpenAIService] Sending ${rawSignals.length} signals to LLM for semantic clustering...`);

      // We only send necessary data to the LLM to save tokens
      const signalsForLLM = rawSignals.map(s => ({
        id: s.signal_id,
        name: s.problem_name,
        quote: s.raw_quote || s.problem_name
      }));

      const prompt = `
You are an expert product discovery engine. I am providing you a list of raw signals (user complaints, needs, trends).
Your job is to cluster these signals into cohesive, unified "Opportunities" based on semantic meaning.
For example, "I hate dealing with AML compliance" and "Looking for SOC 2 tools" might both be clustered into "Compliance Management Software".

Input Signals:
${JSON.stringify(signalsForLLM, null, 2)}

Return a JSON array of objects. Each object must have:
- "id": The exact signal_id from the input.
- "unified_problem_name": A short, descriptive name for the overarching problem cluster this signal belongs to (e.g. "Automated Tax Compliance").
- "unified_fingerprint": A snake_case version of the unified_problem_name (e.g. "automated_tax_compliance").

Return ONLY valid JSON, nothing else. Format:
[
  { "id": "...", "unified_problem_name": "...", "unified_fingerprint": "..." }
]
`;

      // Adjust prompt slightly for json_object requirement
      const jsonPrompt = prompt + `\nWrap your array in a JSON object with the key "clusters".`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: jsonPrompt }],
        response_format: { type: 'json_object' },
      });

      const responseContent = response.choices[0].message.content;
      const parsed = JSON.parse(responseContent);
      const clusters = parsed.clusters || [];

      // Create a map for quick lookup
      const clusterMap = new Map();
      for (const item of clusters) {
        clusterMap.set(item.id, item);
      }

      // Apply clusters back to the raw signals
      return rawSignals.map(signal => {
        if (!signal) return signal;
        const mapped = clusterMap.get(signal.signal_id);
        if (mapped) {
          signal.problem_name = mapped.unified_problem_name;
          signal.problem_fingerprint = mapped.unified_fingerprint;
        } else {
          // Fallback if LLM missed it
          if (!signal.problem_fingerprint) {
             signal.problem_fingerprint = createFingerprint(signal.problem_name);
          }
        }
        return signal;
      });

    } catch (error) {
      logger.error(`[OpenAIService] LLM clustering failed: ${error.message}`);
      return rawSignals.map(signal => {
        if (signal && !signal.problem_fingerprint) {
          signal.problem_fingerprint = createFingerprint(signal.problem_name);
        }
        return signal;
      });
    }
  }
}

module.exports = new OpenAIService();