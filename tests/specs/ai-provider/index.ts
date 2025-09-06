import { expect, testSuite } from 'manten';
import { generateCommitMessage } from '../../../src/utils/ai-provider.js';
import type { ValidConfig } from '../../../src/utils/config.js';
import { getDiff } from '../../utils.js';

const { OPENAI_KEY, OPENROUTER_KEY } = process.env;

export default testSuite(({ describe }) => {
  describe('AI Provider Selection', ({ test }) => {
    test('Should throw error when no API key is provided for OpenAI', async () => {
      const gitDiff = await getDiff('new-feature.diff');

      await expect(
        generateCommitMessage({
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          locale: 'en',
          diff: gitDiff,
          completions: 1,
          maxLength: 50,
          type: '',
          timeout: 7000,
        })
      ).rejects.toThrow('OpenAI API key is required');
    });

    test('Should throw error when no API key is provided for OpenRouter', async () => {
      const gitDiff = await getDiff('new-feature.diff');

      await expect(
        generateCommitMessage({
          provider: 'openrouter',
          model: 'openai/gpt-3.5-turbo',
          locale: 'en',
          diff: gitDiff,
          completions: 1,
          maxLength: 50,
          type: '',
          timeout: 7000,
        })
      ).rejects.toThrow('OpenRouter API key is required');
    });

    if (OPENAI_KEY) {
      test('Should successfully generate commit with OpenAI', async () => {
        const gitDiff = await getDiff('new-feature.diff');

        const messages = await generateCommitMessage({
          provider: 'openai',
          openaiKey: OPENAI_KEY,
          model: 'gpt-3.5-turbo',
          locale: 'en',
          diff: gitDiff,
          completions: 1,
          maxLength: 50,
          type: 'conventional',
          timeout: 7000,
        });

        expect(messages).toBeInstanceOf(Array);
        expect(messages.length).toBe(1);
        expect(messages[0]).toMatch(/(feat(\(.*\))?):/);
      });
    }

    if (OPENROUTER_KEY) {
      test('Should successfully generate commit with OpenRouter', async () => {
        const gitDiff = await getDiff('new-feature.diff');

        const messages = await generateCommitMessage({
          provider: 'openrouter',
          openrouterKey: OPENROUTER_KEY,
          model: 'openai/gpt-3.5-turbo',
          locale: 'en',
          diff: gitDiff,
          completions: 1,
          maxLength: 50,
          type: 'conventional',
          timeout: 7000,
        });

        expect(messages).toBeInstanceOf(Array);
        expect(messages.length).toBe(1);
        expect(messages[0]).toMatch(/(feat(\(.*\))?):/);
      });

      test('Should handle OpenRouter site info correctly', async () => {
        const gitDiff = await getDiff('new-feature.diff');

        const messages = await generateCommitMessage({
          provider: 'openrouter',
          openrouterKey: OPENROUTER_KEY,
          openrouterSiteUrl: 'https://example.com',
          openrouterSiteName: 'Test Site',
          model: 'openai/gpt-3.5-turbo',
          locale: 'en',
          diff: gitDiff,
          completions: 1,
          maxLength: 50,
          type: 'conventional',
          timeout: 7000,
        });

        expect(messages).toBeInstanceOf(Array);
        expect(messages.length).toBe(1);
        expect(messages[0]).toMatch(/(feat(\(.*\))?):/);
      });
    }
  });
});
