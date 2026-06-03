#!/usr/bin/env python3
"""Thin MCP server that proxies requests to a running LiteLLM Docker container.

Usage:
    uv run python litellm_mcp_server.py \
        --proxy-url http://localhost:4001/v1 \
        --api-key sk-Test1234! \
        --name tim
"""

import argparse
import sys
from openai import OpenAI
from mcp.server.fastmcp import FastMCP

MODELS = ["cheap", "complex", "reasoning", "local-model"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="LiteLLM MCP proxy")
    parser.add_argument("--proxy-url", required=True, help="Proxy base URL, e.g. http://localhost:4001/v1")
    parser.add_argument("--api-key", required=True, help="Proxy API key (master key)")
    parser.add_argument("--name", required=True, choices=["tim", "chrisann", "shared"], help="User name")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    server_name = f"LiteLLM ({args.name.capitalize()})"
    mcp = FastMCP(server_name)

    client = OpenAI(base_url=args.proxy_url, api_key=args.api_key)

    @mcp.tool(name="list_models")
    def list_models() -> str:
        """List all available models in this LiteLLM instance."""
        lines = [f"Available models in {server_name}:"]
        for m in MODELS:
            lines.append(f"- {m}")
        return "\n".join(lines)

    @mcp.tool(name="chat_completion")
    def chat_completion(model: str, prompt: str, system_prompt: str = None) -> str:
        """Send a chat completion request to a specific model.

        Args:
            model: The model name (e.g. cheap, complex, reasoning, local-model).
            prompt: The user query or message.
            system_prompt: Optional system instructions.
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            response = client.chat.completions.create(model=model, messages=messages)
            return response.choices[0].message.content
        except Exception as e:
            return f"Error calling model '{model}': {str(e)}"

    for model in MODELS:

        def make_tool(m_name: str):
            def tool_func(prompt: str, system_prompt: str = None) -> str:
                return chat_completion(model=m_name, prompt=prompt, system_prompt=system_prompt)

            tool_func.__name__ = f"call_{m_name.replace('-', '_')}"
            tool_func.__doc__ = f"Call the model '{m_name}'.\n\nArgs:\n    prompt: The user query.\n    system_prompt: Optional system instructions."
            return tool_func

        mcp.add_tool(make_tool(model))

    mcp.run()


if __name__ == "__main__":
    main()
