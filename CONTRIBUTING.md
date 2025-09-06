# Contribution Guide

## Setting up the project

Use [nvm](https://nvm.sh) to use the appropriate Node.js version from `.nvmrc`:
```sh
nvm i
```

Install the dependencies using pnpm:
```sh
pnpm i
```

## Building the project
Run the `build` script:
```sh
pnpm build
```

The package is bundled using [pkgroll](https://github.com/privatenumber/pkgroll) (Rollup). It infers the entry-points from `package.json` so there are no build configurations.


### Development (watch) mode
During development, you can use the watch flag (`--watch, -w`) to automatically rebuild the package on file changes:
```sh
pnpm build -w
```

## Running the package locally
Since pkgroll knows the entry-point is a binary (being in `package.json#bin`), it automatically adds the Node.js hashbang to the top of the file, and chmods it so it's executable.

You can run the distribution file in any directory:
```sh
./dist/cli.mjs
```

Or in non-UNIX environments, you can use Node.js to run the file:
```sh
node ./dist/cli.mjs
```

## Testing

Testing requires passing in API keys as environment variables. You can test with either OpenAI or OpenRouter:

**Option 1 - OpenAI:**
```sh
OPENAI_KEY=<your OPENAI key> pnpm test
```

**Option 2 - OpenRouter:**
```sh
OPENROUTER_KEY=<your OPENROUTER key> pnpm test
```

**Using template scripts:**
For convenience, you can copy and modify the template test scripts:
```sh
# Copy and edit with your API keys
cp run-tests.sh.template run-tests.sh
cp test-openrouter.sh.template test-openrouter.sh

# Edit the files to add your API keys, then run:
./run-tests.sh
# or
./test-openrouter.sh
```

You can still run tests without API keys, but this will skip the main functionality tests:
```sh
pnpm test
```


## Using & testing your changes

Let's say you made some changes in a fork/branch and you want to test it in a project. You can publish the package to a GitHub branch using [`git-publish`](https://github.com/privatenumber/git-publish):

Publish your current branch to a `npm/*` branch on your GitHub repository:
```sh
$ pnpm dlx git-publish

✔ Successfully published branch! Install with command:
  → npm i 'Nutlope/aicommits#npm/develop'
```

> Note: The `Nutlope/aicommits` will be replaced with your fork's URL.

Now, you can run the branch in your project:
```sh
$ pnpm dlx 'Nutlope/aicommits#npm/develop' # same as running `npx aicommits`
```
