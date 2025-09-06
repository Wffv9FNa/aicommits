import path from 'path';
import fs from 'fs/promises';
import { testSuite, expect } from 'manten';
import {
	assertAiProviderToken,
	createFixture,
	createGit,
	files,
} from '../utils.js';

export default testSuite(({ describe }) => {
	describe('Git hook', ({ test }) => {
		assertAiProviderToken();

		test('errors when not in Git repo', async () => {
			const { fixture, aicommits } = await createFixture(files);
			const { exitCode, stderr } = await aicommits(['hook', 'install'], {
				reject: false,
			});

			expect(exitCode).toBe(1);
			expect(stderr).toMatch('The current directory must be a Git repository');

			await fixture.rm();
		});

		test('installs from Git repo subdirectory', async () => {
			const { fixture, aicommits } = await createFixture({
				...files,
				'some-dir': {
					'file.txt': '',
				},
			});
			await createGit(fixture.path);

			const { stdout } = await aicommits(['hook', 'install'], {
				cwd: path.join(fixture.path, 'some-dir'),
			});
			expect(stdout).toMatch('Hook installed');

			expect(await fixture.exists('.git/hooks/prepare-commit-msg')).toBe(true);

			await fixture.rm();
		});

		test('Commits', async () => {
			const { fixture, aicommits } = await createFixture(files);
			const git = await createGit(fixture.path);

			const { stdout } = await aicommits(['hook', 'install']);
			expect(stdout).toMatch('Hook installed');

			await git('add', ['data.json']);
			// Set up environment with the correct provider and key
			const useOpenRouter = Boolean(process.env.OPENROUTER_KEY);

			// Write initial config file
			const initialConfig = useOpenRouter
				? `provider=openrouter\nmodel=anthropic/claude-3.5-sonnet\nOPENROUTER_KEY=${process.env.OPENROUTER_KEY}`
				: `provider=openai\nmodel=gpt-3.5-turbo\nOPENAI_KEY=sk-test1234567890abcdef1234567890abcdef12345678`;
			const configPath = path.join(fixture.path, '.aicommits');
			await fs.mkdir(path.dirname(configPath), { recursive: true });
			await fs.writeFile(configPath, initialConfig, 'utf8');

			await git('commit', ['--no-edit'], {
				env: {
					...process.env,
					HOME: fixture.path,
					USERPROFILE: fixture.path,
					NODE_ENV: 'test',
					FIXTURE_PATH: fixture.path,
				},
			});

			const { stdout: commitMessage } = await git('log', ['--pretty=%B']);
			console.log('Committed with:', commitMessage);
			expect(commitMessage.startsWith('# ')).not.toBe(true);

			await fixture.rm();
		});
	});
});
