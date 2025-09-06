import type { TiktokenModel } from '@dqbd/tiktoken';

export type ExtendedModel = TiktokenModel | 'openai/gpt-3.5-turbo' | 'anthropic/claude-3.5-sonnet';
import type { CommitType, AIProvider } from './config.js';
import { generateCommitMessage as generateOpenAICommitMessage } from './openai.js';
import { generateCommitMessage as generateOpenRouterCommitMessage } from './openrouter.js';
import { KnownError } from './error.js';

interface ProviderConfig {
  provider: AIProvider;
  openaiKey?: string;
  openrouterKey?: string;
  openrouterSiteUrl?: string;
  openrouterSiteName?: string;
  model: ExtendedModel;
  locale: string;
  diff: string;
  completions: number;
  maxLength: number;
  type: CommitType;
  timeout: number;
  proxy?: string;
}

export async function generateCommitMessage({
  provider,
  openaiKey,
  openrouterKey,
  openrouterSiteUrl,
  openrouterSiteName,
  model,
  locale,
  diff,
  completions,
  maxLength,
  type,
  timeout,
  proxy,
}: ProviderConfig): Promise<string[]> {
  switch (provider) {
    case 'openai':
      if (!openaiKey) {
        throw new KnownError(
          'OpenAI API key is required. Set it using: aicommits config set OPENAI_KEY=<your token>'
        );
      }
      return generateOpenAICommitMessage(
        openaiKey,
        model,
        locale,
        diff,
        completions,
        maxLength,
        type,
        timeout,
        proxy
      );

    case 'openrouter':
      if (!openrouterKey) {
        throw new KnownError(
          'OpenRouter API key is required. Set it using: aicommits config set OPENROUTER_KEY=<your token>'
        );
      }
      return generateOpenRouterCommitMessage(
        openrouterKey,
        model,
        locale,
        diff,
        completions,
        maxLength,
        type,
        timeout,
        {
          siteUrl: openrouterSiteUrl,
          siteName: openrouterSiteName,
        },
        proxy
      );

    default:
      throw new KnownError(
        `Unknown AI provider: ${provider}. Valid options are: openai, openrouter`
      );
  }
}
