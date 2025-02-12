#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  codeAnalyzerToolName,
  codeAnalyzerToolDescription,
  CodeAnalyzerToolSchema,
  runCodeAnalyzerTool,
} from "./tools/codeAnalyzer.js";

import { OPENAI_API_KEY, GITHUB_TOKEN } from "./env/keys.js";

if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY is required in src/env/keys.ts");
  process.exit(1);
}

/**
 * A minimal MCP server providing code analysis tools
 */

// 1. Create an MCP server instance
const server = new Server(
  {
    name: "cursor-tools",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 2. Define the list of tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error("Listing tools...");
  return {
    tools: [
      {
        name: codeAnalyzerToolName,
        description: codeAnalyzerToolDescription,
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The analysis query to run",
            },
            context: {
              type: "string",
              description: "Additional context about the code",
            },
            effort: {
              type: "string",
              enum: ["low", "medium", "high"],
              default: "high",
              description: "Reasoning effort level",
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

// 3. Implement the tool call logic
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.error(`Handling tool call: ${name}`);

  switch (name) {
    case codeAnalyzerToolName: {
      const validated = CodeAnalyzerToolSchema.parse(args);
      const result = await runCodeAnalyzerTool(validated, {
        openaiKey: OPENAI_API_KEY,
        githubToken: GITHUB_TOKEN,
      });
      return { result };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// 4. Start the MCP server with a stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CursorExtend MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
}); 