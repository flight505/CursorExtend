#!/usr/bin/env node

// Silence deprecation warnings
process.removeAllListeners('warning');

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import dotenvx from '@dotenvx/dotenvx';
import { writeFile } from 'fs/promises';
import { createServer } from './server.js';

// Load environment with dotenvx
dotenvx.config({ ignore: ['MISSING_ENV_FILE'] });

const spinner = ora();

async function setupEnvironment() {
  console.log(chalk.blue.bold('\n🚀 Welcome to CursorExtend - Your AI-Powered Code Assistant!\n'));

  const questions = [];

  // Required: OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    questions.push({
      type: 'password',
      name: 'OPENAI_API_KEY',
      message: 'Enter your OpenAI API key (required):',
      validate: key => key && key.startsWith('sk-') ? true : 'Invalid OpenAI API key format'
    });
  }

  // Required: Tavily API key for web search
  if (!process.env.TAVILY_API_KEY) {
    questions.push({
      type: 'password',
      name: 'TAVILY_API_KEY',
      message: 'Enter your Tavily API key for web search (required):',
      validate: key => key ? true : 'Tavily API key is required for web search functionality'
    });
  }

  // Only prompt for reasoning effort if not set
  if (!process.env.REASONING_EFFORT) {
    questions.push({
      type: 'list',
      name: 'REASONING_EFFORT',
      message: 'Select reasoning effort for o3-mini:',
      choices: [
        { name: 'High   (Best results, slower)', value: 'high' },
        { name: 'Medium (Balanced)', value: 'medium' },
        { name: 'Low    (Faster, basic analysis)', value: 'low' }
      ],
      default: 'high'
    });
  }

  // Only prompt if we have questions
  const answers = questions.length > 0 ? await inquirer.prompt(questions) : {};
  
  // Merge environment with answers
  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || answers.OPENAI_API_KEY,
    TAVILY_API_KEY: process.env.TAVILY_API_KEY || answers.TAVILY_API_KEY,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN, // Truly optional
    REASONING_EFFORT: process.env.REASONING_EFFORT || answers.REASONING_EFFORT || 'high'
  };
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