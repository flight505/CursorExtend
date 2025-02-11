# Standard library imports
import asyncio
import logging
import operator
import os
from typing import Annotated, List, Literal, Tuple, Union

# Third-party imports
from langchain.agents import Tool
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import create_react_agent
from pydantic import BaseModel, Field
from rich.console import Console
from rich.logging import RichHandler
from typing_extensions import TypedDict

"""
CursorExtend Agent for code analysis and generation using LangGraph and LangChain.

This module implements a plan-and-execute style agent for conducting code analysis
using a combination of LLM planning and tool-based execution. The agent follows a
workflow that:

1. Creates a plan for analyzing code architecture and patterns
2. Executes each step of the plan using available tools
3. Replans as needed based on execution results
4. Provides a final response with actionable insights

The agent uses:
- LangGraph for workflow management
- LangChain for LLM integration
- Tavily for web search capabilities
- OpenAI's o3-mini model for language processing

Usage:
    from cursor_extend.core.agent import process_query
    await process_query("analyze the dependency structure of this codebase")

Environment Variables Required:
    OPENAI_API_KEY: API key for OpenAI
    TAVILY_API_KEY: API key for Tavily search

Author: Jesper
Date: 2024
"""

# Constants
RECURSION_LIMIT = 40
MODEL_NAME = "o3-mini"
MAX_SEARCH_RESULTS = 3

# Setup rich console and logging
console = Console()
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[RichHandler(console=console, rich_tracebacks=True)]
)
logger = logging.getLogger("cursor_extend")

def setup_environment() -> None:
    """Initialize environment variables and validate their presence."""
    try:
        required_vars = ["OPENAI_API_KEY", "TAVILY_API_KEY"]
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    except Exception:
        logger.error("Failed to load environment variables", exc_info=True)
        raise

# Updated system prompt for code analysis
SYSTEM_PROMPT = """You are an expert code architect and analyst in 2024.
First, create a plan to analyze the given code-related query.
Then use tools to gather information about the codebase structure, patterns, and potential improvements.
Use the tavily tool to search for best practices and common patterns.
Finally, synthesize your findings into actionable recommendations."""

class Plan(BaseModel):
    """Plan to follow for code analysis."""
    steps: List[str] = Field(description="Analysis steps to follow, in sorted order")

class Response(BaseModel):
    """Response to user query."""
    response: str

class Act(BaseModel):
    """Action to perform during analysis."""
    action: Union[Response, Plan] = Field(
        description="Next action. Use Response for final answers, Plan for further analysis."
    )

class PlanExecute(TypedDict):
    """State for plan execution workflow."""
    input: str
    plan: List[str]
    past_steps: Annotated[List[Tuple], operator.add]
    response: str

def initialize_components() -> tuple[list[Tool], ChatOpenAI]:
    """Initialize agent tools and language model."""
    try:
        tools = [TavilySearchResults(max_results=MAX_SEARCH_RESULTS)]
        llm = ChatOpenAI(model=MODEL_NAME)
        return tools, llm
    except Exception:
        logger.error("Failed to initialize components", exc_info=True)
        raise

# Planning prompts
planner_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are a code analysis expert in 2024. For the given objective, create a step-by-step analysis plan.
Each step should focus on understanding code architecture, patterns, and potential improvements.
Consider:
1. Code structure and organization
2. Dependency relationships
3. Design patterns used
4. Potential technical debt
5. Performance considerations
6. Security implications

Make each step specific and actionable. The final step should synthesize findings into concrete recommendations."""
    ),
    ("placeholder", "{messages}"),
])

replanner_prompt = ChatPromptTemplate.from_template(
    """Analyze the current progress and determine next steps.
Consider what additional information is needed about:
- Code architecture
- Implementation patterns
- Best practices
- Potential improvements

Original objective:
{input}

Current plan:
{plan}

Completed steps:
{past_steps}

Determine if more analysis is needed or if we can provide recommendations."""
)

async def execute_step(state: PlanExecute) -> dict:
    """Execute a single step in the analysis plan."""
    try:
        plan = state["plan"]
        plan_str = "\n".join(f"{i+1}. {step}" for i, step in enumerate(plan))
        task = plan[0]
        task_formatted = f"""Following this analysis plan:
{plan_str}

Execute step {1}: {task}"""
        agent_response = await agent_executor.ainvoke(
            {"messages": [("user", task_formatted)]}
        )
        logger.info("Executed analysis step: %s", task)
        return {
            "past_steps": [(task, agent_response["messages"][-1].content)],
        }
    except Exception:
        logger.error("Failed to execute analysis step", exc_info=True)
        raise

async def plan_step(state: PlanExecute) -> dict:
    """Create initial code analysis plan."""
    try:
        plan = await planner.ainvoke({"messages": [("user", state["input"])]})
        logger.info("Created analysis plan with %d steps", len(plan.steps))
        return {"plan": plan.steps}
    except Exception:
        logger.error("Failed to create analysis plan", exc_info=True)
        raise

async def replan_step(state: PlanExecute) -> dict:
    """Revise analysis plan based on findings."""
    try:
        output = await replanner.ainvoke(state)
        if isinstance(output.action, Response):
            logger.info("Analysis complete, generating recommendations")
            return {"response": output.action.response}
        else:
            logger.info("Replanning with %d additional steps", len(output.action.steps))
            return {"plan": output.action.steps}
    except Exception:
        logger.error("Failed to replan analysis", exc_info=True)
        raise

def should_continue(state: PlanExecute) -> Union[Literal["agent"], Literal[END]]:
    """Determine if analysis should continue."""
    return END if "response" in state and state["response"] else "agent"

def setup_workflow() -> StateGraph:
    """Configure the analysis workflow graph."""
    try:
        workflow = StateGraph(PlanExecute)
        workflow.add_node("planner", plan_step)
        workflow.add_node("agent", execute_step)
        workflow.add_node("replan", replan_step)
        workflow.add_edge(START, "planner")
        workflow.add_edge("planner", "agent")
        workflow.add_edge("agent", "replan")
        workflow.add_conditional_edges(
            "replan",
            should_continue,
            ["agent", END],
        )
        return workflow
    except Exception:
        logger.error("Failed to setup workflow", exc_info=True)
        raise

# Initialize components
setup_environment()
tools, llm = initialize_components()
agent_executor = create_react_agent(llm, tools, state_modifier=SYSTEM_PROMPT)
planner = planner_prompt | llm.with_structured_output(Plan)
replanner = replanner_prompt | llm.with_structured_output(Act)

# Compile workflow
try:
    app = setup_workflow().compile()
except Exception:
    logger.error("Failed to compile workflow", exc_info=True)
    raise

async def process_query(query: str) -> None:
    """Process a code analysis query.
    Args:
        query: The analysis query to process

    Raises:
        Exception: If query processing fails
    """
    try:
        logger.info("Processing analysis query: %s", query)
        config = {"recursion_limit": RECURSION_LIMIT}
        async for event in app.astream({"input": query}, config=config):
            for k, v in event.items():
                if k != "__end__":
                    console.print(v)
        logger.info("Analysis completed successfully")
    except Exception:
        logger.error("Failed to process analysis query", exc_info=True)
        raise

def main() -> None:
    """CLI entry point."""
    try:
        import argparse
        parser = argparse.ArgumentParser(
            description='CursorExtend Agent for code analysis'
        )
        parser.add_argument(
            'query',
            type=str,
            help='Code analysis query to process'
        )
        args = parser.parse_args()

        asyncio.run(process_query(args.query))
    except KeyboardInterrupt:
        logger.info("Analysis interrupted by user")
    except Exception:
        logger.error("Application error", exc_info=True)
        raise

if __name__ == "__main__":
    main()
