# Qwen2.5-Coder + vLLM: Tool Calling via LiteLLM Proxy

## Problem

`tool_choice="auto"` with a Qwen2.5-Coder model served via vLLM fails:

```
"auto" tool choice requires --enable-auto-tool-choice and --tool-call-parser to be set
```

## Root Cause

This error comes from **vLLM**, not LiteLLM. vLLM requires server-side flags to enable parsing of unstructured model output into structured `tool_calls`. LiteLLM is just proxying the error through.

## Fix (Primary)

Add these flags to the vLLM server startup:

```bash
--enable-auto-tool-choice --tool-call-parser hermes
```

Per [vLLM docs](https://docs.vllm.ai/en/latest/features/tool_calling.html#qwen-models), Qwen2.5 models (including Coder variants) use the `hermes` parser because their `tokenizer_config.json` already includes a Hermes-style tool-use chat template.

If the `hermes` parser produces poor results (e.g. tool calls returned as raw text / code blocks instead of structured responses), try:
- `--tool-call-parser qwen` — legacy Qwen parser
- A [custom plugin parser](https://github.com/hanXen/vllm-qwen2.5-coder-tool-parser) for the `<tools>` tag format

## Fallback: LiteLLM Proxy Hook

If the vLLM-side parser can't be fixed, the LiteLLM proxy can do its own post-response parsing via the **`CustomLogger` hook** system.

### Mechanism

LiteLLM proxy supports `async_post_call_success_hook()` on `CustomLogger` subclasses (see `litellm/integrations/custom_logger.py`). This hook fires after the LLM returns but before the response goes to the client, and can modify the `ModelResponse`.

There is existing precedent in `litellm/proxy/hooks/litellm_skills/main.py`:

- `SkillsInjectionHook._extract_tool_calls()` (line 407) — parses tool calls from both OpenAI and Anthropic format responses
- `SkillsInjectionHook.async_post_call_success_deployment_hook()` — used for the code execution agentic loop

### Implementation Sketch

Create `litellm/proxy/hooks/tool_call_fallback_hook.py`:

```python
import json
import re
from typing import Optional
from litellm.integrations.custom_logger import CustomLogger
from litellm.proxy.utils import ProxyLogging
from litellm.types.utils import ModelResponse, ChatCompletionMessageToolCall

class ToolCallFallbackHook(CustomLogger):
    """
    For models whose backend (e.g. vLLM without --enable-auto-tool-choice)
    returns tool calls as raw text in `content` instead of structured
    `tool_calls`. Extracts tool calls from text and restructures the
    response.
    """
    def __init__(self):
        self.target_models: list[str] = ["local-model"]

    def _extract_tool_calls_from_text(self, text: str) -> Optional[list[dict]]:
        """
        Try various extraction strategies:
        1. XML <tool_call> tags (Qwen2.5-Coder native format)
        2. ```json ... ``` code blocks
        3. [TOOL_CALLS] prefix
        """
        # Strategy 1: <tool_call> tags
        pattern = r'<tool_call>(.*?)</tool_call>'
        matches = re.findall(pattern, text, re.DOTALL)
        if matches:
            calls = []
            for i, m in enumerate(matches):
                try:
                    call = json.loads(m.strip())
                    calls.append({
                        "id": f"call_{i}",
                        "type": "function",
                        "function": {
                            "name": call.get("name", ""),
                            "arguments": json.dumps(call.get("arguments", {}))
                        }
                    })
                except json.JSONDecodeError:
                    pass
            return calls if calls else None

        # Strategy 2: JSON code blocks
        pattern = r'```(?:json)?\s*(\[.*?\])\s*```'
        match = re.search(pattern, text, re.DOTALL)
        if match:
            try:
                calls_data = json.loads(match.group(1))
                calls = []
                for i, call in enumerate(calls_data):
                    calls.append({
                        "id": f"call_{i}",
                        "type": "function",
                        "function": {
                            "name": call.get("name", ""),
                            "arguments": json.dumps(call.get("arguments", {}))
                        }
                    })
                return calls if calls else None
            except (json.JSONDecodeError, TypeError):
                pass

        return None

    async def async_post_call_success_hook(
        self,
        data: dict,
        user_api_key_dict,
        response
    ):
        model = data.get("model", "")
        if model not in self.target_models:
            return response

        if not isinstance(response, ModelResponse):
            return response

        for choice in response.choices:
            msg = choice.message
            if msg.tool_calls or not msg.content:
                continue  # already structured or empty

            parsed = self._extract_tool_calls_from_text(msg.content)
            if parsed:
                msg.tool_calls = [
                    ChatCompletionMessageToolCall(**tc)
                    for tc in parsed
                ]
                msg.content = None  # move tool calls out of content

        return response
```

### Registration

Add to `litellm/proxy/hooks/__init__.py` and configure via `general_settings` in the YAML:

```yaml
general_settings:
  master_key: "..."
  database_url: "..."
  alerting: []
  custom_callback_handlers:
    - callbacks: ["tool_call_fallback_hook"]
```

Or register programmatically in `proxy_server.py`.

### Limitations

- **Format-dependent**: The extraction regex must match the model's actual output format. Different models use different conventions (Hermes `<tool_call>`, Llama JSON, raw JSON arrays, pythonic lists, etc.).
- **No schema enforcement**: Unlike vLLM's structured outputs backend, this approach can't guarantee valid JSON arguments.
- **No streaming support**: The hook operates on the final assembled response, not streaming chunks.
- **vLLM-specific**: This issue doesn't arise with OpenAI, Anthropic, or other providers that natively support `tool_choice="auto"`.

## Verification

After applying either fix, test with:

```bash
curl -s http://localhost:4001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-Test2486!" \
  -d '{
    "model": "local-model",
    "messages": [{"role": "user", "content": "Whats the weather in San Francisco?"}],
    "tools": [{"type": "function", "function": {"name": "get_weather", "description": "Get weather", "parameters": {"type": "object", "properties": {"location": {"type": "string"}}, "required": ["location"]}}}],
    "tool_choice": "auto"
  }'
```

Expect `response.choices[0].message.tool_calls` to contain structured tool calls, not raw text.
