import express from 'express';
import OpenAI from 'openai';
import chalk from 'chalk';

export async function createServer(config) {
  const openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY
  });

  const app = express();
  const port = process.env.PORT || 3000;

  // Middleware to parse JSON
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_, res) => {
    res.json({ status: 'ok' });
  });

  // SSE endpoint
  app.get('/sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    console.log(chalk.green('🔌 Client connected to SSE endpoint'));

    // Handle MCP requests
    req.on('data', async (chunk) => {
      try {
        const request = JSON.parse(chunk);
        
        if (request.type === 'query') {
          console.log(chalk.blue('📝 Processing query:'), request.query);

          const completion = await openai.chat.completions.create({
            model: "o3-mini",
            reasoning_effort: config.REASONING_EFFORT || "high",
            messages: [
              {
                role: "user",
                content: request.query
              }
            ],
            store: true
          });

          const response = {
            type: 'response',
            id: request.id,
            content: completion.choices[0].message.content
          };

          console.log(chalk.green('✅ Query processed successfully'));
          res.write(`data: ${JSON.stringify(response)}\n\n`);
        }
      } catch (error) {
        console.error(chalk.red('❌ Error processing query:'), error.message);
        
        const errorResponse = {
          type: 'error',
          id: request?.id,
          error: error.message
        };
        res.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
      }
    });

    // Handle client disconnect
    req.on('close', () => {
      console.log(chalk.yellow('🔌 Client disconnected from SSE endpoint'));
    });
  });

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
} 