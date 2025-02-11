# Cursor MCP Server with o3-mini 🚀

A lightweight MCP (Model Context Protocol) server for Cursor, powered by OpenAI's o3-mini model. Supports both command-line and SSE (Server-Sent Events) modes.

## Features 🌟

- 🤖 Powered by o3-mini model for efficient code analysis
- 🔄 Dual-mode support:
  - Command mode for local development
  - SSE mode for network-based access
- 🛠️ Simple CLI interface
- 🔑 Environment-based configuration
- 🎯 High reasoning effort by default

## Installation 🔧

```bash
# Clone the repository
git clone https://github.com/yourusername/cursor-mcp.git
cd cursor-mcp

# Install dependencies
npm install

# Optional: Install globally
npm install -g .
```

## Configuration ⚙️

1. Create an env.js file:
```javascript
export const OPENAI_API_KEY = "your-openai-key";
```

Or set environment variable:
```bash
export OPENAI_API_KEY="your-openai-key"
```

## Usage 💡

### Starting the Server

Command Mode (default):
```bash
npm start
# or if installed globally
cursor-mcp start
```

SSE Mode:
```bash
npm run start:sse
# or if installed globally
cursor-mcp start --mode sse
```

### Adding to Cursor

1. Open Cursor Settings (⌘ + ,)
2. Go to Features tab
3. Find MCP section
4. Click "+ Add New MCP Server"

For Command Mode:
- Name: o3-mini-mcp
- Type: command
- Command: node /path/to/index.js

For SSE Mode:
- Name: o3-mini-mcp
- Type: sse
- URL: http://localhost:3000/sse

## Testing 🧪

1. After adding the server to Cursor:
2. Open Composer (⌘ + K)
3. Type: "Use the o3-mini-mcp to analyze this code"
4. The server should process your request using the o3-mini model

## Troubleshooting 🔍

Common issues:
- Check if OPENAI_API_KEY is set
- Ensure server is running (look for "MCP Server started" message)
- Try restarting Cursor
- Check server logs for errors

## Development 👨‍💻

```bash
# Run in development mode (auto-restart)
npm run dev
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License 📄

MIT

## Acknowledgments 🙏

- Built for [Cursor](https://cursor.sh)
- Powered by [OpenAI](https://openai.com/)
- Uses [Express](https://expressjs.com/) for SSE mode
