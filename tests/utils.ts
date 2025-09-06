import path from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { execa, execaNode, type Options } from 'execa';
import {
	createFixture as createFixtureBase,
	type FileTree,
	type FsFixture,
} from 'fs-fixture';

const aicommitsPath = path.resolve('./dist/cli.mjs');

const createAicommits = (fixture: FsFixture) => {
	const homeEnv = {
		HOME: fixture.path, // Linux
		USERPROFILE: fixture.path, // Windows
	};

	return (args?: string[], options?: Options) =>
		execaNode(aicommitsPath, args, {
			cwd: fixture.path,
			...options,
			extendEnv: false,
			env: {
				...homeEnv,
				NODE_ENV: 'test',
				FIXTURE_PATH: fixture.path,
				...process.env,  // Include all environment variables
				...options?.env,
			},

			// Block tsx nodeOptions
			nodeOptions: [],
		});
};

export const createGit = async (cwd: string) => {
	const git = (command: string, args?: string[], options?: Options) =>
		execa('git', [command, ...(args || [])], {
			cwd,
			...options,
		});

	await git('init', [
		// In case of different default branch name
		'--initial-branch=master',
	]);

	await git('config', ['user.name', 'name']);
	await git('config', ['user.email', 'email']);

	return git;
};

export const createFixture = async (source?: string | FileTree) => {
	const fixture = await createFixtureBase(source);
	const aicommits = createAicommits(fixture);

	// Ensure the fixture directory exists
	await fs.mkdir(fixture.path, { recursive: true });

	return {
		fixture,
		aicommits,
	};
};

export const files = Object.freeze({
	'.aicommits': [
		process.env.OPENROUTER_KEY
			? [
				`OPENROUTER_KEY=${process.env.OPENROUTER_KEY}`,
				'provider=openrouter',
				'model=anthropic/claude-3.5-sonnet'
			]
			: [
				'OPENAI_KEY=sk-abc',
				'provider=openai',
				'model=gpt-3.5-turbo'
			]
	].flat().join('\n'),
	'data.json': Array.from(
		{ length: 10 },
		(_, i) => `${i}. Lorem ipsum dolor sit amet`
	).join('\n'),
});

// Load environment variables from .env file
dotenv.config();

export const assertAiProviderToken = () => {
	if (!process.env.OPENAI_KEY && !process.env.OPENROUTER_KEY) {
		throw new Error(
			'⚠️  Either OPENAI_KEY or OPENROUTER_KEY is necessary to run these tests. Skipping...'
		);
	}
};

// See ./diffs/README.md in order to generate diff files
export const getDiff = async (diffName: string): Promise<string> =>
	fs.readFile(new URL(`fixtures/${diffName}`, import.meta.url), 'utf8');
