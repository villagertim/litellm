# LiteLLM Consolidation — Infrastructure Debrief

**Date:** 2026-06-03  
**Who initiated:** Tim  
**Scope:** Shared hermes-agent infrastructure — affects both Tim and Chrisann agents

---

## Why We Did This

The system was running out of RAM. With 15 GB total and Docker Desktop's QEMU VM consuming ~5 GB, there was little headroom. Three separate LiteLLM proxy containers were running simultaneously:

| Container | Purpose | Memory |
|---|---|---|
| `litellm_shared` (port 4100) | IDE / Antigravity systems work | ~214 MB |
| `litellm_tim` (port 4001) | Tim's Hermes agent | ~682 MB |
| `litellm_chrisann` (port 4002) | Chrisann's Hermes agent | ~652 MB |

**Total: ~1.35 GB for three processes doing the same job.** When swap hit 4/4 GB (completely full), the entire system slowed to a crawl.

---

## What We Changed

### 1. `/home/cia-one/dev/litellm/config_all.yaml` (NEW)

A merged model config combining all three prior configs into one file. The key insight: `config_shared.yaml` and `config_tim.yaml` were **byte-for-byte identical**. `config_chrisann.yaml` was identical except for the API key env var name.

**Routing strategy:** Model name prefixing. Tim/shared models keep their existing names. Chrisann's models get a `chrisann-` prefix. LiteLLM resolves the `api_key` field at model-load time from env vars, so one container can hold two sets of models wired to different upstream OpenRouter keys.

```
cheap, complex, reasoning, tts, whisper, local-model  →  TIM_OPENROUTER_KEY
chrisann-cheap, chrisann-complex, ...                 →  CHRISANN_OPENROUTER_KEY
```

Both keys already existed in `/home/cia-one/dev/litellm/.env`.

**TTS model correction:** The existing configs had `openai/gpt-4o-mini-tts-2025-12-15` (date-suffixed). Hermes 0.15 source (`tools/tts_tool.py`) defines `DEFAULT_OPENAI_MODEL = "gpt-4o-mini-tts"` with no date suffix. Fixed in `config_all.yaml`.

### 2. `/home/cia-one/dev/litellm/docker-compose.yml` (MODIFIED)

Added a single `litellm` service that replaces all three:

```yaml
ports:
  - "4001:4000"   # was litellm-tim
  - "4002:4000"   # was litellm-chrisann
  - "4100:4000"   # was litellm-shared
networks:
  litellm_default:
    aliases:
      - litellm-tim
      - litellm-chrisann
      - litellm-shared
```

**Port 4000 is occupied by NoMachine** on this host — do not add `4000:4000`.

The DNS aliases mean all existing clients (Tim's agent, Chrisann's agent, IDE MCP connections) connect using their old hostnames and never know anything changed.

The old service entries (`litellm-shared`, `litellm-tim`, `litellm-chrisann`) were removed from the compose file.

### 3. `/home/cia-one/dev/hermes-agent/data/chrisann/hermes/config.yaml` (MODIFIED)

Three model name fields updated to use the `chrisann-` prefix:

```diff
- model.default: cheap          → chrisann-cheap
- auxiliary.vision.model: cheap → chrisann-cheap
- stt.openai.model: whisper     → chrisann-whisper
```

The URL (`http://litellm-chrisann:4000/v1`) is **unchanged** — the Docker alias handles that.

Note: `data/` is in `.gitignore` for the hermes-agent repo (intentional — runtime user data). This change is live on disk but not version-controlled.

### 4. LiteLLM Virtual Keys (created via admin API, stored in Postgres DB)

Three keys now exist in the merged instance:

| Key | Alias | Allowed Models |
|---|---|---|
| `$LITELLM_MASTER_KEY (see /home/cia-one/dev/litellm/.env)` | master key | all models (IDE/systems use) |
| `$TIM_LITELLM_KEY (see /home/cia-one/dev/litellm/.tim.env)` | tim-agent | cheap, complex, reasoning, tts, whisper, local-model |
| `$CHRISANN_LITELLM_KEY (see /home/cia-one/dev/litellm/.chrisann.env)` | chrisann-agent | chrisann-cheap, chrisann-complex, chrisann-reasoning, chrisann-tts, chrisann-whisper, chrisann-local-model |

No agent `.env` files changed — the existing keys became virtual keys.

**Important:** Virtual keys are stored in `litellm_db` (Postgres). If the DB is wiped, keys must be re-created. Command to recreate:

```bash
# Tim's key
curl -X POST http://localhost:4001/key/generate \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY (see /home/cia-one/dev/litellm/.env)" \
  -H "Content-Type: application/json" \
  -d '{"key":"$TIM_LITELLM_KEY (see /home/cia-one/dev/litellm/.tim.env)","key_alias":"tim-agent","models":["cheap","complex","reasoning","tts","whisper","local-model"]}'

# Chrisann's key
curl -X POST http://localhost:4001/key/generate \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY (see /home/cia-one/dev/litellm/.env)" \
  -H "Content-Type: application/json" \
  -d '{"key":"$CHRISANN_LITELLM_KEY (see /home/cia-one/dev/litellm/.chrisann.env)","key_alias":"chrisann-agent","models":["chrisann-cheap","chrisann-complex","chrisann-reasoning","chrisann-tts","chrisann-whisper","chrisann-local-model"]}'
```

---

## Findings Along the Way

### Hermes Agent Model Usage (what actually goes through LiteLLM)

| Feature | Goes through LiteLLM? | Notes |
|---|---|---|
| Main chat (`cheap`, `complex`, `reasoning`) | ✅ Yes | Core LiteLLM purpose |
| Vision (`auxiliary.vision`) | ✅ Yes | Uses `cheap` tier |
| Local model (`local-model`) | ✅ Yes | vLLM @ 192.168.4.124:8001 |
| TTS | ❌ No | Goes directly to provider (Edge TTS by default, or `api.openai.com` for OpenAI provider) |
| STT/Whisper | ❌ No | Goes directly to `api.openai.com` unless `stt.openai.base_url` is explicitly set |
| image_gen | ❌ No | Direct provider APIs (Krea, FAL, DALL-E) |
| video_gen | ❌ No | Direct provider APIs |

**Implication:** The `tts` and `whisper` model entries in LiteLLM are available but not actively called by either agent in their current configuration. To route audio through LiteLLM, you'd need to add `base_url` and `api_key` to the `stt.openai` config block in each agent's `config.yaml`.

### Vanilla Hermes 0.15 vs This Setup

A vanilla Hermes 0.15 install uses:
- Main model: `anthropic/claude-opus-4.6` directly via OpenRouter
- Auxiliary model: `google/gemini-3-flash-preview` (hardcoded in `agent/auxiliary_client.py` as `_OPENROUTER_MODEL`)
- TTS: Edge TTS (free/local) by default
- STT: Local faster-whisper by default

This setup is **more sophisticated** — LiteLLM provides:
- Named tiers (`cheap` = 3-backend load-balanced pool) instead of raw model names
- Load balancing and retry logic
- Per-user billing isolation
- Cost tracking per virtual key in the admin dashboard

### Docker Network Pitfall

**First attempt** used `networks: default: name: litellm_default` in the top-level networks section. This caused the new container to start on a different network than `litellm_db`, breaking DB connectivity. The container also failed to bind host ports.

**Fix:** Declare `litellm_default` as `external: true` and have the `litellm` service explicitly join it by name with aliases. The `litellm_default` network was auto-created by Docker Compose from the project directory name (`litellm/` → project name `litellm` → default network `litellm_default`).

```yaml
# WRONG — causes network isolation
networks:
  default:
    name: litellm_default

# CORRECT — joins the existing external network
networks:
  litellm_default:
    external: true
```

### Port Conflicts During Migration

Can't bind two containers to the same host port simultaneously. Old containers must be stopped **before** the merged container starts. Since the image was already built by the first (failed) attempt, the second start was fast (~1 second for the container, ~30 seconds for Prisma migrations).

Stop order used:
```bash
docker compose stop litellm-tim litellm-chrisann litellm-shared
docker compose up -d litellm
```

---

## Current State (post-consolidation)

```
localhost:4001  →  litellm (merged)  →  Tim's models via TIM_OPENROUTER_KEY
localhost:4002  →  litellm (merged)  →  Chrisann's models via CHRISANN_OPENROUTER_KEY
localhost:4100  →  litellm (merged)  →  All models via TIM_OPENROUTER_KEY (IDE/systems)

Docker internal (litellm_default network):
  litellm-tim:4000      →  alias → litellm container
  litellm-chrisann:4000 →  alias → litellm container
  litellm-shared:4000   →  alias → litellm container
```

Memory after consolidation: **~1,013 MB** (was ~1,350 MB across 3 containers). Net saving: ~340 MB observed (models still loading into memory; full saving realized after warm-up).

---

## Files Reference

| File | Status | Repo |
|---|---|---|
| `/home/cia-one/dev/litellm/config_all.yaml` | New | litellm |
| `/home/cia-one/dev/litellm/docker-compose.yml` | Modified | litellm |
| `/home/cia-one/dev/litellm/config_shared.yaml` | Superseded (kept for reference) | litellm |
| `/home/cia-one/dev/litellm/config_tim.yaml` | Superseded (kept for reference) | litellm |
| `/home/cia-one/dev/litellm/config_chrisann.yaml` | Superseded (kept for reference) | litellm |
| `/home/cia-one/dev/hermes-agent/data/chrisann/hermes/config.yaml` | Modified | hermes-agent (gitignored) |
