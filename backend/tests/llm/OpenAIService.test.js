const OpenAIService = require('../../src/services/llm/OpenAIService');

// We don't require 'openai' here to avoid module not found in some environments
// Instead we mock it via jest.mock with a factory that doesn't need to resolve the real module if not needed
// but since OpenAIService.js requires it, we must ensure it's mocked.
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }))
  };
}, { virtual: true });

describe('OpenAIService', () => {
  let mockOpenAIInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';

    // OpenAIService is a singleton and might have been initialized already.
    // If it was initialized without a key, it won't have a client.
    // We force a client for testing the clustering logic.
    if (!OpenAIService.client) {
        const { OpenAI } = require('openai');
        OpenAIService.client = new OpenAI({ apiKey: 'test-key' });
    }
    mockOpenAIInstance = OpenAIService.client;
  });

  it('should cluster signals using OpenAI and correctly map them back', async () => {
    const rawSignals = [
      { signal_id: '1', problem_name: 'Old Name 1', raw_quote: 'Quote 1' },
      { signal_id: '2', problem_name: 'Old Name 2', raw_quote: 'Quote 2' }
    ];

    const mockLLMResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            clusters: [
              { id: '1', unified_problem_name: 'Unified Name', unified_fingerprint: 'unified_fp' },
              { id: '2', unified_problem_name: 'Unified Name', unified_fingerprint: 'unified_fp' }
            ]
          })
        }
      }]
    };

    mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockLLMResponse);

    const result = await OpenAIService.clusterSignals(rawSignals);

    expect(result.length).toBe(2);
    expect(result[0].problem_name).toBe('Unified Name');
    expect(result[0].problem_fingerprint).toBe('unified_fp');
    expect(result[1].problem_name).toBe('Unified Name');
    expect(result[1].problem_fingerprint).toBe('unified_fp');
  });

  it('should fallback to basic fingerprinting if signal is not in LLM response', async () => {
    const rawSignals = [
      { signal_id: '1', problem_name: 'Unmapped Problem' }
    ];

    const mockLLMResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            clusters: []
          })
        }
      }]
    };

    mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockLLMResponse);

    const result = await OpenAIService.clusterSignals(rawSignals);

    expect(result.length).toBe(1);
    expect(result[0].problem_name).toBe('Unmapped Problem');
    expect(result[0].problem_fingerprint).toBe('unmapped_problem');
  });

  it('should fallback if OpenAI client is not initialized', async () => {
    const originalClient = OpenAIService.client;
    OpenAIService.client = null;

    const rawSignals = [
      { signal_id: '1', problem_name: 'Some Problem' }
    ];

    const result = await OpenAIService.clusterSignals(rawSignals);

    expect(result.length).toBe(1);
    expect(result[0].problem_fingerprint).toBe('some_problem');

    OpenAIService.client = originalClient;
  });
});
