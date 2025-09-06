import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import ini from 'ini';
import type { TiktokenModel } from '@dqbd/tiktoken';
import { fileExists } from './fs.js';
import { KnownError } from './error.js';

const commitTypes = ['', 'conventional'] as const;
const aiProviders = ['openai', 'openrouter'] as const;

export type CommitType = (typeof commitTypes)[number];
export type AIProvider = (typeof aiProviders)[number];

const { hasOwnProperty } = Object.prototype;
export const hasOwn = (object: unknown, key: PropertyKey) =>
	hasOwnProperty.call(object, key);

const parseAssert = (name: string, condition: any, message: string) => {
	if (!condition) {
		throw new KnownError(`Invalid config property ${name}: ${message}`);
	}
};

const configParsers = {
	provider(provider?: string) {
		if (!provider) {
			return 'openai' as AIProvider;
		}

		parseAssert(
			'provider',
			aiProviders.includes(provider as AIProvider),
			'Must be either "openai" or "openrouter"'
		);

		return provider as AIProvider;
	},
	OPENAI_KEY(key?: string) {
		if (!key) {
			return undefined;
		}
		parseAssert('OPENAI_KEY', key.startsWith('sk-'), 'Must start with "sk-"');
		// Key can range from 43~51 characters. There's no spec to assert this.

		return key;
	},
	OPENROUTER_KEY(key?: string) {
		if (!key) {
			return undefined;
		}
		parseAssert('OPENROUTER_KEY', key.startsWith('sk-or-'), 'Must start with "sk-or-"');
		return key;
	},
	OPENROUTER_SITE_URL(url?: string) {
		if (!url) {
			return undefined;
		}
		parseAssert('OPENROUTER_SITE_URL', /^https?:\/\//.test(url), 'Must be a valid URL');
		return url;
	},
	OPENROUTER_SITE_NAME(name?: string) {
		if (!name) {
			return undefined;
		}
		parseAssert('OPENROUTER_SITE_NAME', name.length > 0, 'Cannot be empty');
		return name;
	},
	locale(locale?: string) {
		if (!locale) {
			return 'en';
		}

		parseAssert('locale', locale, 'Cannot be empty');
		parseAssert(
			'locale',
			/^[a-z-]+$/i.test(locale),
			'Must be a valid locale (letters and dashes/underscores). You can consult the list of codes in: https://wikipedia.org/wiki/List_of_ISO_639-1_codes'
		);
		return locale;
	},
	generate(count?: string) {
		if (!count) {
			return 1;
		}

		parseAssert('generate', /^\d+$/.test(count), 'Must be an integer');

		const parsed = Number(count);
		parseAssert('generate', parsed > 0, 'Must be greater than 0');
		parseAssert('generate', parsed <= 5, 'Must be less or equal to 5');

		return parsed;
	},
	type(type?: string) {
		if (!type) {
			return '';
		}

		parseAssert(
			'type',
			commitTypes.includes(type as CommitType),
			'Invalid commit type'
		);

		return type as CommitType;
	},
	proxy(url?: string) {
		if (!url || url.length === 0) {
			return undefined;
		}

		parseAssert('proxy', /^https?:\/\//.test(url), 'Must be a valid URL');

		return url;
	},
	model(model?: string) {
		if (!model || model.length === 0) {
			return 'gpt-3.5-turbo';
		}

		// OpenRouter models should be prefixed with provider name (e.g., 'openai/gpt-4')
		if (model.includes('/')) {
			return model as TiktokenModel;
		}

		return model as TiktokenModel;
	},
	timeout(timeout?: string) {
		if (!timeout) {
			return 10_000;
		}

		parseAssert('timeout', /^\d+$/.test(timeout), 'Must be an integer');

		const parsed = Number(timeout);
		parseAssert('timeout', parsed >= 500, 'Must be greater than 500ms');

		return parsed;
	},
	'max-length'(maxLength?: string) {
		if (!maxLength) {
			return 50;
		}

		parseAssert('max-length', /^\d+$/.test(maxLength), 'Must be an integer');

		const parsed = Number(maxLength);
		parseAssert(
			'max-length',
			parsed >= 20,
			'Must be greater than 20 characters'
		);

		return parsed;
	},
} as const;

type ConfigKeys = keyof typeof configParsers;

type RawConfig = {
	[key in ConfigKeys]?: string;
};

export type ValidConfig = {
	[Key in ConfigKeys]: ReturnType<(typeof configParsers)[Key]>;
};

const getConfigPath = () => {
  // If we're in a test environment and have a fixture path, use that
  if (process.env.NODE_ENV === 'test' && process.env.FIXTURE_PATH) {
    return path.join(process.env.FIXTURE_PATH, '.aicommits');
  }
  // Otherwise use the default path
  return path.join(os.homedir(), '.aicommits');
};

const readConfigFile = async (): Promise<RawConfig> => {
	const configPath = getConfigPath();
	const configExists = await fileExists(configPath);
	if (!configExists) {
		return Object.create(null);
	}

	const configString = await fs.readFile(configPath, 'utf8');
	return ini.parse(configString);
};

export const getConfig = async (
	cliConfig?: RawConfig,
	suppressErrors?: boolean
): Promise<ValidConfig> => {
	const config = await readConfigFile();
	const parsedConfig: Record<string, unknown> = {};

	for (const key of Object.keys(configParsers) as ConfigKeys[]) {
		const parser = configParsers[key];
		const value = cliConfig?.[key] ?? config[key];

		if (suppressErrors) {
			try {
				parsedConfig[key] = parser(value);
			} catch {}
		} else {
			parsedConfig[key] = parser(value);
		}
	}

	return parsedConfig as ValidConfig;
};

export const setConfigs = async (keyValues: [key: string, value: string][]) => {
	const config = await readConfigFile();

	for (const [key, value] of keyValues) {
		const validKey = key as keyof typeof configParsers;
		if (!(validKey in configParsers)) {
			throw new KnownError(`Invalid config property: ${key}`);
		}

		const parsed = configParsers[validKey](value);
		config[validKey] = parsed as any;
	}

	await fs.writeFile(getConfigPath(), ini.stringify(config), 'utf8');
};
