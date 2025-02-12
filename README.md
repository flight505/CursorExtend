# CursorExtend

AI-powered command-line tool to enhance Cursor IDE with deep code architecture analysis.

## Features

- Interactive setup for API keys and configuration
- Deep code architecture analysis using AI
- Integration with Cursor through MCP server
- Multi-source research combining GitHub, MDN, npm, PyPI, and arXiv data

## Installation

```bash
# Clone the repository
git clone https://github.com/flight505/CursorExtend.git
cd CursorExtend

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Setup

Run the guided setup to configure your API keys:

```bash
npm run start setup
```

### Analyze Code

```bash
npm run start analyze "analyze the dependency structure of this codebase"
```

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Run linter
npm run lint
```

## License

MIT

## Acknowledgments 🙏

- Built for [Cursor](https://cursor.sh)
- Powered by [OpenAI](https://openai.com/)
- Uses [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
