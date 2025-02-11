import express from 'express';
import OpenAI from 'openai';
import chalk from 'chalk';

// Define available tools
const tools = {
  analyze_code: {
    name: "analyze_code",
    description: "Analyzes code using o3-mini model with configurable reasoning effort",
    parameters: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "The code to analyze"
        },
        context: {
          type: "string",
          description: "Additional context about the code"
        }
      },
      required: ["code"]
    }
  }
};

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

  // Keep track of active connections
  const connections = new Set();

  // SSE endpoint
  app.get('/sse', (req, res) => {
    // Configure SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Send initial connection message
    const registrationMessage = {
      type: 'register',
      tools: Object.values(tools)
    };
    res.write(`data: ${JSON.stringify(registrationMessage)}\n\n`);

    // Add to active connections
    connections.add(res);
    console.log(chalk.green('🔌 Client connected to SSE endpoint'));
    console.log(chalk.blue(`Active connections: ${connections.size}`));

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write('data: {"type":"ping"}\n\n');
    }, 30000);

    // Handle MCP requests
    req.on('data', async (chunk) => {
      try {
        const request = JSON.parse(chunk);
        console.log(chalk.blue('📝 Received request:'), request);

        switch (request.type) {
          case 'invoke': {
            const { tool, parameters, id } = request;
            
            if (tool === 'analyze_code') {
              console.log(chalk.blue('🔍 Analyzing code...'));
              
              const completion = await openai.chat.completions.create({
                model: "o3-mini",
                reasoning_effort: config.REASONING_EFFORT || "high",
                messages: [
                  {
                    role: "system",
                    content: "You are an expert code analyzer. Analyze the following code and provide insights."
                  },
                  {
                    role: "user",
                    content: `Code to analyze:\n${parameters.code}\n\nContext:\n${parameters.context || 'No additional context provided'}`
                  }
                ],
                store: true
              });

              const response = {
                type: 'response',
                id,
                tool,
                result: completion.choices[0].message.content
              };

              console.log(chalk.green('✅ Analysis completed'));
              res.write(`data: ${JSON.stringify(response)}\n\n`);
            } else {
              throw new Error(`Unknown tool: ${tool}`);
            }
            break;
          }

          default:
            console.log(chalk.yellow(`⚠️ Unhandled request type: ${request.type}`));
        }
      } catch (error) {
        console.error(chalk.red('❌ Error processing request:'), error.message);
        
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
      clearInterval(keepAlive);
      connections.delete(res);
      console.log(chalk.yellow('🔌 Client disconnected from SSE endpoint'));
      console.log(chalk.blue(`Active connections: ${connections.size}`));
    });

    // Handle errors
    req.on('error', (error) => {
      console.error(chalk.red('❌ Connection error:'), error.message);
      clearInterval(keepAlive);
      connections.delete(res);
    });
  });

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      resolve(server);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error(chalk.red('❌ Server error:'), error.message);
      process.exit(1);
    });
  });
} 