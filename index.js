#!/usr/bin/env node
import { createInterface } from 'readline';
import OpenAI from 'openai';
import chalk from 'chalk';

// Initialize environment
let env = {};
try {
  env = await import('./env.js');
} catch (error) {
  console.error(chalk.yellow('No env.js found. Using environment variables.'));
  env = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
  };
}

if (!env.OPENAI_API_KEY) {
  console.error(chalk.red('Error: OpenAI API key not found!'));
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY
});

// Initialize readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Handle MCP protocol
rl.on('line', async (line) => {
  try {
    const request = JSON.parse(line);
    
    if (request.type === 'query') {
      const completion = await openai.chat.completions.create({
        model: "o3-mini",
        reasoning_effort: request.effort || "high",
        messages: [
          {
            role: "user",
            content: request.query
          }
        ],
        store: true
      });

      // Send response back to Cursor
      const response = {
        type: 'response',
        id: request.id,
        content: completion.choices[0].message.content
      };

      console.log(JSON.stringify(response));
    }
  } catch (error) {
    // Send error back to Cursor
    const errorResponse = {
      type: 'error',
      id: request?.id,
      error: error.message
    };
    console.error(JSON.stringify(errorResponse));
  }
});

// Handle process termination
process.on('SIGINT', () => {
  rl.close();
  process.exit(0);
});

// Log server start
console.error(chalk.green('MCP Server started with o3-mini reasoning model')); 