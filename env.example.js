// Copy this file to env.js and add your API key
export const OPENAI_API_KEY = "your-openai-key";
export const TAVILY_API_KEY = "your-tavily-key";  // Optional for web search

// o3-mini settings (2025 reasoning model)
export const settings = {
  model: "o3-mini",
  reasoningEffort: "high",     // low, medium, or high reasoning effort
  functions: [                 // Enable tools/functions support
    "codeAnalysis",
    "webSearch"
  ]
}; 