import OpenAI from 'openai';
import { z } from 'zod';

// Configuration schema
const ConfigSchema = z.object({
  openaiKey: z.string(),
  githubToken: z.string().optional(),
  model: z.enum(['o3-mini', 'gpt-4o', 'gpt-4o-mini']).default('o3-mini'),
});

type Config = z.infer<typeof ConfigSchema>;

export class DeepResearchAgent {
  private openai: OpenAI;
  private config: Config;

  constructor(config: Config) {
    this.config = ConfigSchema.parse(config);
    this.openai = new OpenAI({
      apiKey: this.config.openaiKey
    });
  }

  /**
   * Analyze code architecture based on query
   */
  async analyzeCode(query: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert code architect and analyst in 2024. Create a step-by-step plan to analyze the given codebase query. 
                     Focus on understanding the code structure, dependencies, design patterns, technical debt, performance, and security.`
          },
          {
            role: 'user',
            content: query
          }
        ]
      });

      return completion.choices[0]?.message?.content || 'No analysis generated';
    } catch (error) {
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 