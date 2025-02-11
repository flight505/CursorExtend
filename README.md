# CursorExtend 🚀

A powerful monorepo containing agentic tools for code generation, analysis, and project management. Built with TypeScript/Node.js and Python.

## Features 🌟

### CLI Tools (Node.js) 🛠️
- Guided setup wizard for project configuration
- Deep Research Agent for code architecture analysis
- Integration with GitHub, StackOverflow, and web search
- Modular plugin architecture
- ML Workflow & Data Pipeline Manager

### Python Package 🐍
- Advanced code analysis capabilities
- LangGraph and LangChain integration
- OpenAI's latest models support
- Rich console output for better UX

## Project Structure 📁

```
CursorExtend/
├── packages/                    # Monorepo packages
│   ├── cli/                    # TypeScript CLI tool
│   │   ├── src/               # Source code
│   │   ├── package.json       # Package configuration
│   │   └── tsconfig.json      # TypeScript configuration
│   └── python/                # Python package
│       ├── cursorextend/      # Main package code
│       ├── tests/             # Test suite
│       └── pyproject.toml     # Project configuration
├── package.json               # Root package configuration
└── README.md                 # Project documentation
```

## Installation 🛠️

### CLI Tool (Node.js)

```bash
# Install the CLI tool globally
npm install -g @cursorextend/cli

# Or use it directly from the repository
git clone https://github.com/yourusername/CursorExtend.git
cd CursorExtend
npm install
cd packages/cli
npm link
```

### Python Package

```bash
# Install using uv
uv pip install cursorextend

# Or install from source
git clone https://github.com/yourusername/CursorExtend.git
cd CursorExtend/packages/python
uv venv
source .venv/bin/activate  # On Unix/macOS
# or
.venv\Scripts\activate    # On Windows

uv pip install -e ".[dev]"
```

## Usage 💡

### CLI Tool
```bash
# Run the setup wizard
cursorextend setup

# Analyze code architecture
cursorextend analyze ./path/to/project

# Run ML pipeline management
cursorextend ml start
```

### Python Package
```python
from cursorextend import DeepResearchAgent

agent = DeepResearchAgent()
results = agent.analyze("your research query here")
```

## Environment Variables 🔑

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `GITHUB_TOKEN`: Your GitHub API token (for CLI tool)

## Development 👨‍💻

### CLI Tool
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

### Python Package
```bash
# Run tests
pytest

# Run linter and formatter
ruff check .
ruff check . --fix
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments 🙏

- Built with [Oclif](https://oclif.io/) for CLI
- Powered by [LangChain](https://github.com/hwchase17/langchain) and [LangGraph](https://github.com/langchain-ai/langgraph)
- Uses [OpenAI](https://openai.com/) models
- Integrates with GitHub, StackOverflow, and web search APIs
