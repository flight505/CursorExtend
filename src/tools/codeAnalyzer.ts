import { z } from "zod";
import { DeepResearchAgent } from "./agent.js";

export const codeAnalyzerToolName = "analyze";
export const codeAnalyzerToolDescription = "Analyze code architecture and provide insights";

export const CodeAnalyzerToolSchema = z.object({
  query: z.string().describe("The analysis query to run"),
  context: z.string().optional().describe("Additional context about the code"),
  effort: z.enum(["low", "medium", "high"]).default("high").describe("Reasoning effort level"),
});

export type CodeAnalyzerToolInput = z.infer<typeof CodeAnalyzerToolSchema>;

export async function runCodeAnalyzerTool(
  input: CodeAnalyzerToolInput,
  config: { openaiKey: string; githubToken?: string }
): Promise<string> {
  const agent = new DeepResearchAgent({
    openaiKey: config.openaiKey,
    githubToken: config.githubToken,
    model: "o3-mini", // Using our default model
  });

  try {
    const analysis = await agent.analyzeCode(input.query);
    return analysis;
  } catch (error) {
    throw new Error(`Code analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
} 