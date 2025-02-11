import { Args, Command } from '@oclif/core';
import chalk from 'chalk';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { StringOutputParser } from 'langchain/schema/output_parser';

export default class Analyze extends Command {
  static description = 'Analyze code architecture using AI';

  static args = {
    query: Args.string({
      description: 'Query or project path to analyze',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(Analyze);
    const query = args.query;

    this.log(chalk.blue(`Starting code architecture analysis for: ${query}`));

    try {
      const model = new ChatOpenAI({
        modelName: 'gpt-4-0125-preview',
        temperature: 0.7,
      });

      const template = `Analyze the following code-related query:
      {query}
      
      Provide insights about:
      1. Code architecture patterns
      2. Potential improvements
      3. Best practices to consider
      `;

      const prompt = PromptTemplate.fromTemplate(template);
      const chain = prompt.pipe(model).pipe(new StringOutputParser());

      const response = await chain.invoke({
        query,
      });

      this.log(chalk.green('\nAnalysis Results:'));
      this.log(response);
    } catch (error) {
      this.error(chalk.red('Analysis failed:'), { exit: 1 });
    }
  }
} 