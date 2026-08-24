# Audit: `.ai/` folder advice vs kppdf agent wiring (2026-08-24)

> Docs-only. Источники: внешний совет (`.ai/` + symlinks + Explore→Plan→Code), peer MCP `claude_code`, Perplexity review, life-coder optic (PO = driver, AI = conveyor).

## Take / reject

| Idea | Decision | Why |
|------|----------|-----|
| `.ai/rules` + `.ai/skills` as SoT | **Reject** | SoT already: `docs/` + `GEMINI.md` + `.agents/skills/` |
| Symlinks into `.cursor/rules` / `.claude/rules` | **Reject** | `.claude/` gitignored; Windows symlinks fragile; tracked path = `.cursor/rules/*.mdc` |
| Explore → Plan → Code | **Take spirit** | Maps to TZ + Claim / grilling → TZ; not chat-confirm mid-wave |
| Mandatory page.md / patterns / FIC before work | **Take** | Wire via `kppdf-context-preflight` |
| Wait for confirm before code | **Reject** | Breaks continuous executor + PO-CANON |
| Awesome-claude-code / awesome-cursorrules bulk import | **Reject** | See `docs/agents/CLAUDE-CODE.md`, `SKILLS-MAP.md` |
| Thin context-priming skill | **Take** | `.agents/skills/kppdf-context-preflight/` |

## Why no `.claude/rules`

`.gitignore` ignores `.claude/`. Project rules for Claude CLI live in root `CLAUDE.md` → `GEMINI.md` + `.agents/skills/`. Not unfinished — deliberate.

## Why no `.ai/`

Second SoT diverges from `docs/` within one wave. Cursor already has Mode A rules; executors already have Claim + loop.

## Life-coder lens

- PO tests live site comfort; does not answer tech grilling.
- AI autocorrects sketchy intent to canons (UX-FORM, Paper & Ink, DEVELOPMENT-PATTERNS).
- Preflight artifact = agent/checklist audit trail, **not** an essay for PO.
- Ask PO only: non-standard business / wipe / deploy / conflict with accepted layout (Yes/No).

## Anti-ceremony

`Context read` must list **concrete paths** opened with tools. Ban: «прочитал документацию».

## Implementation pointer

Skill: `.agents/skills/kppdf-context-preflight/SKILL.md`  
Cursor rule: `.cursor/rules/context-preflight.mdc`  
Hard route: root `README.md` + `docs/agents/SKILLS-MAP.md`
