Below is the full, detailed project guide for **CursorExtend**. This guide explains the overall vision, technology choices, integration with Exa and MCP for Cursor, setup instructions, and how our deep research agent will deliver intelligent code architecture analysis using public APIs. Use this guide to build, configure, and deploy the tool with minimal complexity.

---

# CursorExtend – A Comprehensive Guide

## 1. Introduction

**CursorExtend** is an AI-powered command‑line tool designed to enhance the Cursor IDE by enabling deep code architecture analysis. By integrating the Model Context Protocol (MCP) with a robust set of tools and intelligent prompts, CursorExtend allows developers to:
- Analyze code structure and dependencies
- Retrieve contextual information from public sources (web search, GitHub issues, MDN, npm, PyPI, arXiv, etc.)
- Configure project‑specific rules via interactive CLI prompts
- Seamlessly integrate with Cursor through a locally running MCP server

This guide outlines the entire project setup—from initial installation through advanced integration—ensuring a smooth and error‑free deployment.

---

## 2. Project Overview

**Key Objectives:**
- **Interactive Setup:**  
  Prompt users to enter required API keys (e.g., OPENAI_API_KEY) and optional keys (GITHUB_TOKEN, etc.) and save them in a local `.env` file.
- **MCP Server Integration:**  
  Follow the proven approach from [awesome‑cursor‑mpc‑server](https://github.com/kleneway/awesome-cursor-mpc-server) to launch a local MCP server (via SSE or stdio) that Cursor can consume.  
- **Deep Research Agent:**  
  Convert our existing deep research agent (originally in Python) into a TypeScript module that focuses on code architecture analysis. The agent will use Exa as the integrated search engine—leveraging its structured, semantic search results—and combine results from GitHub, MDN, npm, PyPI, and arXiv.
- **Modular Toolset:**  
  Provide a creative, expanded list of tools (e.g., dependency analyzers, security scanners, ML workflow assistants) and update prompts to allow intelligent decision‑making by the agent.
- **Minimal Complexity:**  
  Use Commander.js and Inquirer.js for a simple yet effective CLI without introducing additional complexity.

---

## 3. Technology Stack & Project Structure

### Technology Stack

- **Language & Runtime:** Node.js with TypeScript
- **CLI Libraries:**  
  - **Commander.js:** For basic command parsing  
  - **Inquirer.js:** For interactive prompts
- **Core Dependencies:**
  - **@modelcontextprotocol/sdk** (v^1.4.1) – MCP integration
  - **openai** (v^4.83.0) – LLM integration
  - **ora** (v^8.2.0) – CLI spinners
  - **chalk** (v^5.4.0) – Colored output for CLI messages
  - **@dotenvx/dotenvx** (v^1.35.0) – Environment variable management
  - **puppeteer** (v^24.1.1) – Optional, for advanced web scraping
  - **zod** (v^3.24.1) – Data validation

### Project Structure

```
.
├── README.md
├── package-lock.json
├── package.json
├── tsconfig.json
└── src
    ├── index.ts         // CLI entry point (Commander.js + Inquirer)
    └── tools
        └── agent.ts     // Deep Research Agent for code architecture analysis
```

---

## 4. Setup Instructions

### 4.1. Initial Project Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/flight505/CursorExtend.git
   cd CursorExtend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Run the CLI Tool:**

   ```bash
   npx cursorextend
   ```

### 4.2. Guided Setup & Configuration Wizard

Upon running `npx cursorextend`, the CLI will:

- **Display a Welcome Message:**

  ```
  🚀 Welcome to CursorExtend - Your AI-Powered Code Assistant!
  ```

- **Prompt for API Keys:**
  - **OPENAI_API_KEY (Required):**  
    _"Enter your OpenAI API key (required):"_
  - **GITHUB_TOKEN (Optional):**  
    _"Enter GitHub token for higher rate limits (press Enter to skip):"_
  - **Additional keys (if needed):**  
    Similar prompts for other services.

- **Model Configuration:**
  
  Present a selection for reasoning effort:

  ```
  Select reasoning effort for o3-mini:
  > High   (Best results, slower)
    Medium (Balanced)
    Low    (Faster, basic analysis)
  ```

- **Save Settings:**

  The tool validates inputs (using zod) and writes them to a `.env` file via @dotenvx/dotenvx.

- **Server Launch Instructions:**

  The CLI will start the MCP server and display a setup box similar to:

  ```
  📋 Copy these settings to Cursor:
  ┌─────────────────────────────────
  │ Name: CursorExtend
  │ Type: sse
  │ URL:  http://localhost:3000/sse
  └─────────────────────────────────
  ```

- **Status Overview:**

  Display the server status and key confirmations:

  ```
  ✅ Server running at http://localhost:3000
  🔍 Reasoning effort: HIGH
  🔑 API Keys: OpenAI ✓  GitHub ✓  [Other Service] ✗
  ```

---

## 5. MCP Server Integration for Cursor

### 5.1. Following the Awesome‑Cursor‑MPC‑Server Approach

- **Key Concepts:**
  - **MCP Server:** A local service (using @modelcontextprotocol/sdk) that exposes tools via MCP.  
  - **Integration:** Use the same method as in [awesome‑cursor‑mpc‑server](https://github.com/kleneway/awesome-cursor-mpc-server/tree/main) to ensure compatibility with Cursor.

- **Implementation Steps:**
  1. **Initialize the MCP Server:**  
     Configure the server to run over SSE or stdio, exposing our toolset.
  2. **Expose Tools:**  
     Integrate our deep research agent (agent.ts) and additional tools (e.g., dependency analyzer, security scanner) as MCP tools.
  3. **Configuration Output:**  
     The CLI prints the configuration snippet for the user to copy into the Cursor configuration file (using absolute paths and proper command syntax).

- **Documentation & Testing:**  
  Follow the instructions in the [awesome‑cursor‑mpc‑server repository](https://github.com/kleneway/awesome-cursor-mpc-server/tree/main) as a baseline. Test the integration in Cursor to ensure the MCP tools are correctly recognized and callable.

---

## 6. Deep Research Agent for Code Architecture Analysis

### 6.1. Conversion & Update

- **Conversion:**  
  Port the original Python deep research agent code to TypeScript in `src/tools/agent.ts`.
- **Revised System Prompt:**  
  Update the prompt to focus on code architecture:

  > "You are an expert code architect and analyst in 2024. Create a step‑by‑step plan to analyze the given codebase query. Focus on understanding the code structure, dependencies, design patterns, technical debt, performance, and security. Use Exa's API to fetch relevant data from web searches, GitHub issues, MDN documentation, npm & PyPI details, and research papers from arXiv."

### 6.2. Integrating Exa as the Primary Search Tool

- **Why Exa:**  
  Exa provides structured, semantic search results that return clean, parsed HTML content and rich metadata—ideal for our analysis.
- **Tool Initialization:**  
  In `agent.ts`, integrate Exa by using its API (via an appropriate Node.js HTTP client). Set parameters such as `max_results`, `search_depth`, and enable answer generation.
- **Enhanced Decision-Making:**  
  Update the agent's workflow to:
  - **Plan:** Generate an analysis plan for the codebase.
  - **Execute:** For each step, decide which public API to query (Exa for web search, GitHub for issues, etc.).
  - **Replan:** Adjust if additional information is needed.
  - **Synthesize:** Combine data from multiple sources and output actionable recommendations.

### 6.3. Expanded Intelligent Toolset

Our agent will include a suite of creative tools:
- **Exa Web Search Tool:**  
  Provides semantic, structured search results.
- **GitHub Issues & Repository Search Tool:**  
  Fetches and aggregates GitHub issues and repository metadata.
- **MDN Documentation Search Tool:**  
  Retrieves best practices and detailed documentation for web development.
- **Package Lookup Tools (npm & PyPI):**  
  Checks package details, versions, and popularity.
- **arXiv Research Tool:**  
  Searches for recent research papers on software design and architecture.
- **Automated Dependency Analyzer:**  
  Flags outdated or vulnerable dependencies.
- **Security & Performance Scanner:**  
  Runs static analysis for security and performance issues.
- **Optional ML Workflow Assistant:**  
  Analyzes ML pipelines for efficiency (if applicable).

---

## 7. Advanced Intelligent Prompts & Features

### 7.1. Updated Intelligent Prompts

Enhance prompts with additional instructions to:
- **Reference Real-Time Data:**  
  "Based on recent GitHub issues and Exa search results, identify any emerging design patterns or potential technical debt in the codebase."
- **Follow-Up Questions:**  
  Allow the agent to ask clarifying questions, such as:  
  "Would you like a detailed security analysis?" or "Should I check for outdated dependencies?"
- **Multi‑Source Synthesis:**  
  Instruct the agent to combine findings from Exa, GitHub, MDN, and package registries into a final, cohesive recommendation.

### 7.2. Future Trends & Boundary-Pushing Ideas

To push the boundaries for AI code assistants, consider integrating:
- **Real-Time Collaboration:**  
  Suggestions that work during live coding sessions.
- **Explainable AI Recommendations:**  
  Detailed, citation-backed explanations for each recommendation.
- **Persistent Context (Roots):**  
  Remember previous analyses for continuous improvement.
- **Automated CI/CD Integration:**  
  Optionally trigger analysis on code changes and flag regressions.
- **Customizable Source Prioritization:**  
  Allow users to set preferences for which data sources to prioritize based on their project needs.

---

## 8. Deployment, Testing, & Release

### 8.1. Testing

- **Unit Tests & Integration Tests:**  
  Use Jest or a similar testing framework to write tests for:
  - The interactive setup module.
  - The deep research agent workflow.
  - Each tool integration (Exa, GitHub, MDN, etc.).
- **Manual Testing:**  
  Run `npx cursorextend analyze "analyze the dependency structure of this codebase"` and verify that the agent correctly synthesizes information.

### 8.2. Documentation

- **Comprehensive README:**  
  Document installation, configuration, and usage instructions.
- **API Documentation:**  
  Include details on each integrated tool, prompt structure, and sample outputs.
- **Tutorial Videos & Guides:**  
  Create videos or written guides to help users set up and integrate with Cursor.

### 8.3. Release

- **Beta Release:**  
  Publish a beta version to gather feedback from early adopters.
- **Iterative Improvements:**  
  Refine features based on user input and testing results.
- **Official Launch:**  
  Once core functionality and integration are stable, release the stable version.

---

## 9. Final Roadmap Recap

1. **Initial Setup & CLI Skeleton (Phase 1):**  
   - Set up project structure with Commander.js and Inquirer.js.
2. **Guided Setup Module (Phase 2):**  
   - Implement interactive prompts for API keys and configuration; save to `.env`.
3. **Deep Research Agent Module (Phase 3):**  
   - Convert Python code to TypeScript; update prompts and integrate Exa with additional public API calls.
4. **MCP Server Integration (Phase 4):**  
   - Follow the approach from awesome‑cursor‑mpc‑server for seamless integration with Cursor.
5. **Advanced Intelligent Features & Toolset (Phase 5):**  
   - Expand the toolset with additional search and analysis tools; implement intelligent, adaptive prompts.
6. **Testing, Documentation & Release (Phase 6):**  
   - Thorough testing, comprehensive documentation, beta release, and then stable launch.

---

## 10. Conclusion & Next Steps

By proceeding with Exa as our integrated search engine and following the proven MCP integration approach from awesome‑cursor‑mpc‑server, **CursorExtend** will deliver a state‑of‑the‑art tool for deep code architecture analysis. Our updated intelligent prompts, expanded toolset, and modular design ensure that developers receive actionable, multi‑source insights with minimal configuration complexity.

**Next Steps:**
- Begin by setting up the project repository and installing dependencies.
- Implement the interactive CLI guided setup.
- Port and enhance the deep research agent to TypeScript, integrating Exa and other APIs.
- Set up the MCP server using the same configuration principles as awesome‑cursor‑mpc‑server.
- Test thoroughly and document each step for community adoption.
- Release the beta version and iterate based on feedback.

This guide serves as the blueprint for developing CursorExtend—a powerful, future‑proof MCP tool that pushes the boundaries for AI code assistants in the Cursor ecosystem.

--- 

Feel free to refer to this document throughout your development cycle to ensure consistent, error‑free progress.

# CursorExtend – Progress Update

## Completed Tasks ✅
1. Initial project setup
   - Created package.json with dependencies
   - Set up TypeScript configuration
   - Added ESLint for code quality
   - Configured Jest for testing
2. Basic project structure
   - Created src/index.ts with CLI setup
   - Added src/tools/agent.ts for deep research agent
3. Documentation
   - Updated README.md with installation and usage instructions
4. MCP Server Integration ✨
   - [x] Implemented MCP server using @modelcontextprotocol/sdk
   - [x] Successfully connected to Cursor
   - [x] Added analyze tool

## Implementation Notes 📝

### MCP Server Setup
1. **Key Files Structure:**
   ```
   src/
   ├── index.ts              # Main MCP server implementation
   ├── env/
   │   └── keys.ts          # API keys (preferred over .env)
   └── tools/
       ├── agent.ts         # Deep research agent
       └── codeAnalyzer.ts  # Tool implementation
   ```

2. **Critical Implementation Details:**
   - Use stdio transport instead of SSE for reliability
   - Store API keys in TypeScript files (src/env/keys.ts) rather than .env
   - Follow exact server setup from awesome-cursor-mpc-server-main
   - Keep server capabilities simple: `capabilities: { tools: {} }`

3. **Cursor Configuration:**
   ```
   Name: CursorTools
   Type: Command
   Command: /full/path/to/node /full/path/to/dist/index.js
   ```

4. **Tool Registration Pattern:**
   ```typescript
   server.setRequestHandler(ListToolsRequestSchema, async () => {
     return {
       tools: [{
         name: toolName,
         description: toolDescription,
         inputSchema: {
           type: "object",
           properties: {
             // Tool-specific properties
           },
           required: ["required_fields"],
         },
       }],
     };
   });
   ```

## Next Steps 🚀
1. Deep Research Agent Enhancement
   - [ ] Add Exa integration for semantic search
   - [ ] Implement GitHub API integration
   - [ ] Add MDN, npm, PyPI data sources
   - [ ] Integrate arXiv paper search
2. Tool Development
   - [ ] Create dependency analyzer
   - [ ] Add security scanner
   - [ ] Implement ML workflow assistant
3. Testing & Documentation
   - [ ] Write unit tests for core functionality
   - [ ] Add integration tests
   - [ ] Complete API documentation
   - [ ] Create usage examples

## Lessons Learned 💡
1. **Environment Setup:**
   - TypeScript-based environment files are more reliable than .env for MCP servers
   - Full paths in Cursor configuration prevent path resolution issues
   - stdio transport is more stable than SSE for local development

2. **Tool Implementation:**
   - Keep tool schemas simple and explicit
   - Use zod for runtime type validation
   - Return results in `{ result: string }` format
   - Use console.error for server logs (they don't interfere with the protocol)

3. **Best Practices:**
   - Follow awesome-cursor-mpc-server-main patterns exactly
   - Implement one tool first, then expand
   - Use explicit error handling with informative messages
   - Keep the server implementation minimal and focused