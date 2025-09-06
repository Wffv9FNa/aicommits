<div align="center">
  <div>
    <img src=".github/screenshot.png" alt="AI Commits"/>
    <h1 align="center">AI Commits - Enhanced Fork</h1>
  </div>
 <p>A CLI that writes your git commit messages for you with AI. Never write a commit message again.</p>
 <p><strong>🚀 Fork</strong> - This is an enhanced version with OpenRouter support, allowing you to use Claude, GPT-4, and other AI models via OpenRouter's API.</p>
</div>

---

# Original Project

This is a fork of the original [aicommits](https://github.com/Nutlope/aicommits) project by [Hassan El Mghari](https://github.com/Nutlope).
This fork adds OpenRouter support for access to additional AI models.
<div>
<a href="https://www.npmjs.com/package/aicommits"><img src="https://img.shields.io/npm/v/aicommits" alt="Original version"></a>
</div>

---

Table of contents
=================
<!--ts-->

* [Features](#features)
  * [Setup](#setup)
    * [Installation](#installation)
    * [Configuration](#configuration)
      * [Option A - OpenAI (Default)](#option-a---openai-default)
      * [Option B - OpenRouter](#option-b---openrouter)
  * [Usage](#usage)
    * [CLI Mode](#cli-mode)
      * [Generate Multiple Recommendations](#generate-multiple-recommendations)
      * [Generating Conventional Commits](#generating-conventional-commits)
    * [Git Hook](#git-hook)
      * [Install](#install)
      * [Uninstall](#uninstall)
      * [Usage](#usage-1)
  * [Configuration Values](#configuration-values)
    * [Reading a configuration value](#reading-a-configuration-value)
    * [Setting a configuration value](#setting-a-configuration-value)
    * [Configuration Options](#configuration-options)
    * [provider](#provider)
    * [OPENAI_KEY](#openai_key)
    * [OPENROUTER_KEY](#openrouter_key)
    * [OPENROUTER_SITE_URL](#openrouter_site_url)
    * [OPENROUTER_SITE_NAME](#openrouter_site_name)
    * [locale](#locale)
    * [generate](#generate)
    * [proxy](#proxy)
    * [model](#model)
    * [timeout](#timeout)
    * [max-length](#max-length)
    * [type](#type)
  * [Examples](#examples)
    * [Complete OpenRouter Setup](#complete-openrouter-setup)
    * [Switch Between Providers](#switch-between-providers)
    * [Generate Multiple Commit Options](#generate-multiple-commit-options)
  * [How it works](#how-it-works)
    * [Development](#development)
<!--te-->
---

## Features

- **Multiple AI Providers**: Support for both OpenAI and OpenRouter
- **Advanced Models**: Access to Claude 3.5 Sonnet, GPT-4, and other models via OpenRouter
- **Cost Effective**: OpenRouter often provides better pricing than direct API access
- **Git Integration**: Seamless integration with Git hooks
- **Conventional Commits**: Generate commit messages following conventional commit standards
- **Multiple Languages**: Support for various locales
- **Flexible Configuration**: Easy setup and customization

## Setup

> The minimum supported version of Node.js is the latest v14. Check your Node.js version with `node --version`.

### Installation

Install this enhanced version:

```sh
# From GitHub
npm install -g git+https://github.com/Wffv9FNa/aicommits.git

# Or from tarball (if you have the .tgz file)
npm install -g wffv9fna-aicommits-1.0.0.tgz
```

### Configuration

Choose your AI provider and configure the API key:

#### Option A - OpenAI (Default)

```sh
# Set OpenAI API key
aicommits config set OPENAI_KEY=<your-openai-key>

# Optional: Set model (default: gpt-3.5-turbo)
aicommits config set model=gpt-4
```

#### Option B - OpenRouter

```sh
# Switch to OpenRouter
aicommits config set provider=openrouter

# Set OpenRouter API key
aicommits config set OPENROUTER_KEY=<your-openrouter-key>

# Choose a model (recommended: Claude 3.5 Sonnet)
aicommits config set model=anthropic/claude-3.5-sonnet

# Optional: Set site information for OpenRouter analytics
aicommits config set OPENROUTER_SITE_URL=https://your-site.com
aicommits config set OPENROUTER_SITE_NAME="Your Site Name"
```

This will create a `.aicommits` file in your home directory.

## Usage

### CLI Mode

You can call `aicommits` directly to generate a commit message for your staged changes:

```sh
git add <files...>
aicommits
```

`aicommits` passes down unknown flags to `git commit`, so you can pass in commit flags.

For example, you can stage all changes in tracked files as you commit:

```sh
aicommits --all # or -a
```

> 👉 **Tip:** Use the `aic` alias if `aicommits` is too long for you.

#### Generate Multiple Recommendations

Sometimes the recommended commit message isn't the best so you want it to generate a few to pick from. You can generate multiple commit messages at once by passing in the `--generate <i>` flag, where 'i' is the number of generated messages:

```sh
aicommits --generate 3 # or -g 3
```

> Warning: this uses more tokens, meaning it costs more.

#### Generating Conventional Commits

If you'd like to generate Conventional Commits, you can use the `--type` flag followed by `conventional`. This will prompt `aicommits` to format the commit message according to the Conventional Commits specification:

```sh
aicommits --type conventional # or -t conventional
```

This feature can be useful if your project follows the Conventional Commits standard or if you're using tools that rely on this commit format.

### Git Hook

You can also integrate _aicommits_ with Git via the prepare-commit-msg hook. This lets you use Git like you normally would, and edit the commit message before committing.

#### Install

In the Git repository you want to install the hook in:

```sh
aicommits hook install
```

#### Uninstall

In the Git repository you want to uninstall the hook from:

```sh
aicommits hook uninstall
```

#### Usage

1. Stage your files and commit:

   ```sh
   git add <files...>
   git commit # Only generates a message when it's not passed in
   ```

   > If you ever want to write your own message instead of generating one, you can simply pass one in:
    `git commit -m "My message"`

2. Aicommits will generate the commit message for you and pass it back to Git. Git will open it with the configured editor for you to review/edit it.

3. Save and close the editor to commit!

## Configuration Values

### Reading a configuration value

To retrieve a configuration option, use the command:

```sh
aicommits config get <key>
```

For example, to retrieve the API key, you can use:

```sh
aicommits config get OPENAI_KEY
```

You can also retrieve multiple configuration options at once by separating them with spaces:

```sh
aicommits config get OPENAI_KEY generate
```

### Setting a configuration value

To set a configuration option, use the command:

```sh
aicommits config set <key>=<value>
```

For example, to set the API key, you can use:

```sh
aicommits config set OPENAI_KEY=<your-api-key>
```

You can also set multiple configuration options at once by separating them with spaces, like:

```sh
aicommits config set OPENAI_KEY=<your-api-key> generate=3 locale=en
```

### Configuration Options

#### provider

Default: `openai`

The AI provider to use. Available options:

- `openai`: Use OpenAI's API (default)
- `openrouter`: Use OpenRouter's API

#### OPENAI_KEY

Required when using `provider=openai`

The OpenAI API key. You can retrieve it from [OpenAI API Keys page](https://platform.openai.com/account/api-keys).

#### OPENROUTER_KEY

Required when using `provider=openrouter`

The OpenRouter API key. You can retrieve it from [OpenRouter Keys page](https://openrouter.ai/keys).

#### OPENROUTER_SITE_URL

Optional when using `provider=openrouter`

Your site URL that will be sent as the `HTTP-Referer` header to OpenRouter. This helps your application appear in OpenRouter's rankings and leaderboards, making it discoverable to other users.

#### OPENROUTER_SITE_NAME

Optional when using `provider=openrouter`

Your site name that will be sent as the `X-Title` header to OpenRouter. This is how your application will be labeled in OpenRouter's rankings and analytics. It helps users identify your application in OpenRouter's ecosystem.

#### locale

Default: `en`

The locale to use for the generated commit messages. Consult the list of codes in: [List of ISO 639-1 codes](https://wikipedia.org/wiki/List_of_ISO_639-1_codes).

#### generate

Default: `1`

The number of commit messages to generate to pick from.

Note, this will use more tokens as it generates more results.

#### proxy

Set a HTTP/HTTPS proxy to use for requests.

To clear the proxy option, you can use the command (note the empty value after the equals sign):

```sh
aicommits config set proxy=
```

#### model

Default: `gpt-3.5-turbo` (for OpenAI) or `anthropic/claude-3.5-sonnet` (for OpenRouter)

The model to use for generating commit messages. The format depends on your provider:

- For OpenAI: Use model names from [OpenAI's model list](https://platform.openai.com/docs/models/model-endpoint-compatibility)
  - Example: `gpt-3.5-turbo`, `gpt-4`

- For OpenRouter: Use provider-prefixed model names from [OpenRouter's models](https://openrouter.ai/docs#models)
  - Example: `anthropic/claude-3.5-sonnet`, `openai/gpt-4`

> Tip: OpenRouter gives you access to multiple AI models, including Claude and GPT-4, potentially at better pricing. Check their website for the latest model availability and pricing.

#### timeout

The timeout for network requests to the AI API in milliseconds.

Default: `10000` (10 seconds)

```sh
aicommits config set timeout=20000 # 20s
```

#### max-length

The maximum character length of the generated commit message.

Default: `50`

```sh
aicommits config set max-length=100
```

#### type

Default: `""` (Empty string)

The type of commit message to generate. Set this to "conventional" to generate commit messages that follow the Conventional Commits specification:

```sh
aicommits config set type=conventional
```

You can clear this option by setting it to an empty string:

```sh
aicommits config set type=
```

## Examples

### Complete OpenRouter Setup

```sh
# Install
npm install -g git+https://github.com/Wffv9FNa/aicommits.git

# Configuration
aicommits config set provider=openrouter
aicommits config set OPENROUTER_KEY=sk-or-your-key-here
aicommits config set model=anthropic/claude-3.5-sonnet
aicommits config set OPENROUTER_SITE_URL=https://myproject.com  # Optional
aicommits config set OPENROUTER_SITE_NAME="My Project"          # Optional

# Usage
git add .
aicommits
```

### Switch Between Providers

```sh
# Switch to OpenAI
aicommits config set provider=openai
aicommits config set OPENAI_KEY=sk-your-openai-key
aicommits config set model=gpt-4

# Switch back to OpenRouter
aicommits config set provider=openrouter
aicommits config set OPENROUTER_KEY=sk-or-your-openrouter-key
aicommits config set model=anthropic/claude-3.5-sonnet
```

### Generate Multiple Commit Options

```sh
# Generate 3 different commit message options
aicommits --generate 3

# Or set it permanently
aicommits config set generate=3
```

## How it works

This CLI tool runs `git diff` to grab all your latest code changes, sends them to your chosen AI provider (OpenAI or OpenRouter), then returns the AI generated commit message.

### Development

To run the tests, you'll need to set up your environment with the required API keys:

1. Create a `.env` file in the project root:

   ```sh
   # OpenAI API Key (required for OpenAI provider tests)
   OPENAI_KEY=sk-your-openai-key

   # OpenRouter API Key (required for OpenRouter provider tests)
   OPENROUTER_KEY=sk-or-your-openrouter-key

   # Test Environment
   NODE_ENV=test
   ```

2. Install dependencies:

   ```sh
   pnpm install
   ```

3. Run tests:

   ```sh
   pnpm test
   ```

Note: You need at least one of the API keys (OPENAI_KEY or OPENROUTER_KEY) to run the tests.
