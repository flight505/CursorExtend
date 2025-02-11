#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { config } from 'dotenv';
import { writeFile } from 'fs/promises';
import { createServer } from './server.js';

// Load existing env
config();

const spinner = ora();

async function validateOpenAIKey(key) {
  if (!key) return 'OpenAI API key is required';
  if (!key.startsWith('sk-')) return 'Invalid OpenAI API key format';
  return true;
}

async function setupEnvironment() {
  console.log(chalk.blue.bold('\n🚀 Welcome to CursorExtend - Your AI-Powered Code Assistant!\n'));

  const questions = [
    {
      type: 'password',
      name: 'OPENAI_API_KEY',
      message: 'Enter your OpenAI API key (required):',
      validate: validateOpenAIKey,
      default: process.env.OPENAI_API_KEY
    },
    {
      type: 'password',
      name: 'GITHUB_TOKEN',
      message: 'Enter GitHub token for higher rate limits (press Enter to skip):',
      default: process.env.GITHUB_TOKEN || ''
    },
    {
      type: 'password',
      name: 'TAVILY_API_KEY',
      message: 'Enter Tavily API key for web search (press Enter to skip):',
      default: process.env.TAVILY_API_KEY || ''
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
      default: 'high'
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