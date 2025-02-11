#!/usr/bin/env node

// Silence deprecation warnings
process.removeAllListeners('warning');

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { config } from 'dotenv';
import { writeFile } from 'fs/promises';
import { createServer } from './server.js';
import { homedir } from 'os';
import { join } from 'path';
import { readFileSync } from 'fs';

// Load environment variables from all possible sources
function loadEnvironment() {
  const sources = [
    // Process environment
    process.env,
    // Local .env
    loadDotEnv('./.env'),
    // Global .env
    loadDotEnv(join(homedir(), '.env')),
    // zshrc
    loadShellConfig(join(homedir(), '.zshrc')),
    // bash_profile
    loadShellConfig(join(homedir(), '.bash_profile')),
    // bashrc
    loadShellConfig(join(homedir(), '.bashrc'))
  ];

  // Merge all sources, taking the first non-empty value
  return {
    OPENAI_API_KEY: findFirstValue(sources, 'OPENAI_API_KEY'),
    GITHUB_TOKEN: findFirstValue(sources, 'GITHUB_TOKEN'),
    TAVILY_API_KEY: findFirstValue(sources, 'TAVILY_API_KEY'),
    REASONING_EFFORT: findFirstValue(sources, 'REASONING_EFFORT')
  };
}

function loadDotEnv(path) {
  try {
    return config({ path }).parsed || {};
  } catch {
    return {};
  }
}

function loadShellConfig(path) {
  try {
    const content = readFileSync(path, 'utf8');
    const vars = {};
    const exportRegex = /export\s+([A-Z_]+)=["']?([^"'\n]+)["']?/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      vars[match[1]] = match[2];
    }
    return vars;
  } catch {
    return {};
  }
}

function findFirstValue(sources, key) {
  for (const source of sources) {
    if (source && source[key]) {
      return source[key];
    }
  }
  return null;
}

const spinner = ora();

async function validateOpenAIKey(key) {
  if (!key) return 'OpenAI API key is required';
  if (!key.startsWith('sk-')) return 'Invalid OpenAI API key format';
  return true;
}

async function setupEnvironment() {
  console.log(chalk.blue.bold('\n🚀 Welcome to CursorExtend - Your AI-Powered Code Assistant!\n'));

  // Load existing environment
  const env = loadEnvironment();

  const questions = [
    {
      type: 'password',
      name: 'OPENAI_API_KEY',
      message: 'Enter your OpenAI API key (required):',
      validate: validateOpenAIKey,
      default: env.OPENAI_API_KEY
    },
    {
      type: 'password',
      name: 'GITHUB_TOKEN',
      message: 'Enter GitHub token for higher rate limits (press Enter to skip):',
      default: env.GITHUB_TOKEN || ''
    },
    {
      type: 'password',
      name: 'TAVILY_API_KEY',
      message: 'Enter Tavily API key for web search (press Enter to skip):',
      default: env.TAVILY_API_KEY || ''
    },
    {
      type: 'list',
      name: 'REASONING_EFFORT',
      message: 'Select reasoning effort for o3-mini:',
      choices: [
        { name: 'High   (Best results, slower)', value: 'high' },
        { name: 'Medium (Balanced)', value: 'medium' },
        { name: 'Low    (Faster, basic analysis)', value: 'low' }
      ],
      default: env.REASONING_EFFORT || 'high'
    }
  ];

  const answers = await inquirer.prompt(questions);
  
  // Create .env file
  const envContent = Object.entries(answers)
    .filter(([_, value]) => value) // Skip empty values
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');

  await writeFile('.env', envContent);
  return answers;
}

async function startServer(config) {
  spinner.start('Starting server...');
  
  try {
    const server = await createServer(config);
    spinner.succeed('Server started successfully!');

    // Show Cursor setup instructions
    console.log(chalk.yellow('\n📋 Copy these settings to Cursor:'));
    console.log(chalk.white('┌─────────────────────────────────'));
    console.log(chalk.white('│ Name: CursorExtend'));
    console.log(chalk.white('│ Type: sse'));
    console.log(chalk.white('│ URL:  http://localhost:3000/sse'));
    console.log(chalk.white('└─────────────────────────────────\n'));

    // Show status
    console.log(chalk.green('✅ Server running at http://localhost:3000'));
    console.log(chalk.blue(`🔍 Reasoning effort: ${config.REASONING_EFFORT.toUpperCase()}`));
    console.log(chalk.blue('🔑 API Keys:'), 
      chalk.green('OpenAI ✓'),
      config.GITHUB_TOKEN ? chalk.green('GitHub ✓') : chalk.yellow('GitHub ✗'),
      config.TAVILY_API_KEY ? chalk.green('Tavily ✓') : chalk.yellow('Tavily ✗')
    );

    // Keep process alive and show logs
    console.log(chalk.gray('\nServer logs:'));
    
    return server;
  } catch (error) {
    spinner.fail('Failed to start server');
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

// Main flow
try {
  const config = await setupEnvironment();
  await startServer(config);
} catch (error) {
  console.error(chalk.red('Setup failed:'), error.message);
  process.exit(1);
} 