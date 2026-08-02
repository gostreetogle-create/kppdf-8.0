# LM Studio local agent (kppdf-8.0)

**Model:** `qwen/qwen2.5-coder-14b` via LM Studio  
**Endpoint:** `http://127.0.0.1:1234/v1`  
**Trust:** **LIMITED_HELPER** (draft only; senior review before any merge)

## Cursor limitation

Cursor **Agent** runs in the cloud and **cannot** call `127.0.0.1` without a public tunnel.
Do **not** set Override OpenAI Base URL to localhost for Agent. Use this local harness instead.

## Setup (one-time on this PC)

1. LM Studio → load **Qwen2.5-Coder-14B** (or matching id).
2. Developer tab → **Status: Running**, port **1234**, CORS enabled.
3. From repo root:

```powershell
pnpm lmstudio:check
```

Expect `"ok": true` and your model in `models`.

## Daily use

```powershell
# Health
pnpm lmstudio:check

# Free-form task
pnpm lmstudio -- --task "Summarize pageKey in 3 bullets"

# Attach source files into the prompt
pnpm lmstudio -- --task "Suggest a minimal unit test" --with frontend/src/app/core/capabilities/capability-route.guard.ts

# Prompt from file + write answer
pnpm lmstudio -- --file tmp/prompt.txt --out tmp/answer.txt

# Re-run eval suite
pnpm lmstudio:eval
```

Env: `LMSTUDIO_BASE_URL`, `LMSTUDIO_MODEL`, `LMSTUDIO_API_KEY`.

## When to use

| OK (with review) | Do not trust alone |
|------------------|--------------------|
| Pure TS helpers | Security / access review |
| Explain a pasted / `--with` snippet | Architecture / TZ authoring |
| Draft unit-test ideas | Layer-3 god files |
| Boilerplate sketches | Deploy / secrets / wipe / archive |

## Eval (2026-08-02)

| Case | Human takeaway |
|------|----------------|
| E1 pure TS | Solid |
| E2 guard review | False P0 — do not trust security review |
| E3 People route | Correct `NOT_ROUTED` |

Artifacts: `docs/agents/lmstudio-eval/`. Canonical human verdict stays **LIMITED_HELPER**.
