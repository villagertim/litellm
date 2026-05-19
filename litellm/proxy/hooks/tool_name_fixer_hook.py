"""
LiteLLM proxy hook that adds the `name` field to `tool` role messages
before forwarding to the backend.

Some providers (e.g. vLLM) require `name` in tool response messages,
but clients like opencode may omit it. This hook backfills the `name`
by matching `tool_call_id` against the preceding assistant message's
tool_calls.
"""

from typing import Optional
from litellm.integrations.custom_logger import CustomLogger
from litellm.proxy.proxy_server import DualCache, UserAPIKeyAuth
from litellm.types.utils import CallTypesLiteral


class ToolNameFixerHook(CustomLogger):
    def __init__(self):
        pass

    async def async_pre_call_hook(
        self,
        user_api_key_dict: UserAPIKeyAuth,
        cache: DualCache,
        data: dict,
        call_type: CallTypesLiteral,
    ):
        messages = data.get("messages", [])
        if not messages:
            return data

        # Build lookup: tool_call_id -> function name from assistant messages
        tool_call_names: dict[str, str] = {}
        for msg in messages:
            if isinstance(msg, dict) and msg.get("role") == "assistant":
                tool_calls = msg.get("tool_calls", [])
                if tool_calls:
                    for tc in tool_calls:
                        tc_id = tc.get("id", "") if isinstance(tc, dict) else getattr(tc, "id", "")
                        fn = tc.get("function", {}) if isinstance(tc, dict) else getattr(tc, "function", {})
                        fn_name = fn.get("name", "") if isinstance(fn, dict) else getattr(fn, "name", "")
                        if tc_id and fn_name:
                            tool_call_names[tc_id] = fn_name

        if not tool_call_names:
            return data

        # Patch tool messages missing the name field
        patched = False
        for msg in messages:
            if isinstance(msg, dict) and msg.get("role") == "tool" and msg.get("name") is None:
                tc_id = msg.get("tool_call_id", "")
                if tc_id in tool_call_names:
                    msg["name"] = tool_call_names[tc_id]
                    patched = True

        if patched:
            data["messages"] = messages

        return data


tool_name_fixer = ToolNameFixerHook()
