import fs from 'fs/promises';
import path from 'path';
import { testSuite, expect } from 'manten';
import { createFixture } from '../utils.js';

export default testSuite(({ describe }) => {
	describe('config', async ({ test, describe }) => {
		const { fixture, aicommits } = await createFixture();
		const configPath = path.join(fixture.path, '.aicommits');
		// Use either OpenAI or OpenRouter key for testing
		const useOpenRouter = Boolean(process.env.OPENROUTER_KEY);
		const configToken = useOpenRouter
			? `OPENROUTER_KEY=${process.env.OPENROUTER_KEY}`
			: 'OPENAI_KEY=sk-abc';

		// Initialize config with provider and model
		const initialConfig = useOpenRouter
			? `provider=openrouter\nmodel=anthropic/claude-3.5-sonnet\nOPENROUTER_KEY=${process.env.OPENROUTER_KEY}\n`
			: 'provider=openai\nmodel=gpt-3.5-turbo\n';
		await fs.writeFile(configPath, initialConfig, 'utf8');

		test('set unknown config file', async () => {
			const { stderr } = await aicommits(['config', 'set', 'UNKNOWN=1'], {
				reject: false,
			});

			expect(stderr).toMatch('Invalid config property: UNKNOWN');
		});

		test('set invalid API key', async () => {
			const { stderr } = await aicommits(['config', 'set', useOpenRouter ? 'OPENROUTER_KEY=abc' : 'OPENAI_KEY=abc'], {
				reject: false,
			});

			expect(stderr).toMatch(useOpenRouter
				? 'Invalid config property OPENROUTER_KEY: Must start with "sk-or-"'
				: 'Invalid config property OPENAI_KEY: Must start with "sk-"'
			);
		});

		await test('set config file', async () => {
			await aicommits(['config', 'set', configToken]);

			const configFile = await fs.readFile(configPath, 'utf8');
			expect(configFile).toMatch(configToken);
		});

		await test('get config file', async () => {
			const { stdout } = await aicommits(['config', 'get', useOpenRouter ? 'OPENROUTER_KEY' : 'OPENAI_KEY']);
			expect(stdout).toBe(configToken);
		});

		await test('reading unknown config', async () => {
			await fs.appendFile(configPath, 'UNKNOWN=1');

			const { stdout, stderr } = await aicommits(['config', 'get', 'UNKNOWN'], {
				reject: false,
			});

			expect(stdout).toBe('');
			expect(stderr).toBe('');
		});

		await describe('timeout', ({ test }) => {
			test('setting invalid timeout config', async () => {
				const { stderr } = await aicommits(['config', 'set', 'timeout=abc'], {
					reject: false,
				});

				expect(stderr).toMatch('Must be an integer');
			});

			test('setting valid timeout config', async () => {
				// Clear any existing config
				await fs.writeFile(configPath, '', 'utf8');

				const timeout = 'timeout=20000';
				await aicommits(['config', 'set', timeout]);

				const configFile = await fs.readFile(configPath, 'utf8');
				expect(configFile).toMatch(timeout);

				const get = await aicommits(['config', 'get', 'timeout']);
				expect(get.stdout).toBe(timeout);
			});
		});

		await describe('max-length', ({ test }) => {
			test('must be an integer', async () => {
				const { stderr } = await aicommits(
					['config', 'set', 'max-length=abc'],
					{
						reject: false,
					}
				);

				expect(stderr).toMatch('Must be an integer');
			});

			test('must be at least 20 characters', async () => {
				const { stderr } = await aicommits(['config', 'set', 'max-length=10'], {
					reject: false,
				});

				expect(stderr).toMatch(/must be greater than 20 characters/i);
			});

			test('updates config', async () => {
				// Set initial max-length
				await aicommits(['config', 'set', 'max-length=50']);
				const defaultConfig = await aicommits(['config', 'get', 'max-length']);
				expect(defaultConfig.stdout).toBe('max-length=50');

				const maxLength = 'max-length=60';
				await aicommits(['config', 'set', maxLength]);

				const configFile = await fs.readFile(configPath, 'utf8');
				expect(configFile).toMatch(maxLength);

				const get = await aicommits(['config', 'get', 'max-length']);
				expect(get.stdout).toBe(maxLength);
			});
		});

		await test('set config file', async () => {
			await aicommits(['config', 'set', configToken]);

			const configFile = await fs.readFile(configPath, 'utf8');
			expect(configFile).toMatch(configToken);
		});

		await test('get config file', async () => {
			const { stdout } = await aicommits(['config', 'get', useOpenRouter ? 'OPENROUTER_KEY' : 'OPENAI_KEY']);
			expect(stdout).toBe(configToken);
		});

		await fixture.rm();
	});
});
