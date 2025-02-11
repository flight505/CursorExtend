import {Command} from '@oclif/command';
import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';

export default class SetupConfig extends Command {
  static description = 'Guided setup for creating .mdc configuration file';

  async run() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'OPENAI_API_KEY',
        message: 'Enter your OPENAI_API_KEY:',
        default: process.env.OPENAI_API_KEY || ''
      },
      {
        type: 'input',
        name: 'TAVILY_API_KEY',
        message: 'Enter your TAVILY_API_KEY:',
        default: process.env.TAVILY_API_KEY || ''
      },
      {
        type: 'input',
        name: 'projectName',
        message: 'Enter your project name:',
        default: 'awesome-cursor-mpc-server'
      }
    ]);

    const configPath = path.join(process.cwd(), 'mdc-config.json');
    fs.writeFileSync(configPath, JSON.stringify(answers, null, 2), { encoding: 'utf-8' });
    this.log(`Configuration saved to ${configPath}`);
  }
} 