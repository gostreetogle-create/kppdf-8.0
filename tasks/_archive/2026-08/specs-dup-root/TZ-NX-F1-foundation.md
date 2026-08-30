# TZ-NX-F1: Styles + util/http + API tokens

**РОЛЬ АГЕНТА:** Executor (Gemini / Claude CLI / Freebuff)  
**ЗАВИСИМОСТИ:** `tasks/TZ-NX-F0-bootstrap.md` — **DONE**  
**LAYER:** 1 (CSS/infra)  
**CONFLICT KEYS:** `frontend/global-styles`; `frontend/tailwind-postcss`; `frontend/fonts-assets`; `frontend/core-runtime`; `frontend-nx/libs/ui/paper-and-ink/src/styles/`; `frontend-nx/libs/util/http/`; `frontend-nx/apps/kppdf-web/project.json`; `frontend-nx/apps/kppdf-web/src/app/app.config.ts`

**PAGES:** N/A  
**PAGE_DOCS:** N/A

## CLAIM

```text
agent_id: cursor
claimed_at: 2026-08-29T09:18:00+03:00
task: TZ-NX-F1-foundation
```

---

## F1 COMPLETION (2026-08-29)

**Outcome:** DONE

### Evidence

```text
cd frontend-nx && pnpm install                                    → OK
cd frontend-nx && pnpm exec nx build kppdf-web                    → SUCCESS
cd frontend-nx && pnpm exec nx test http                            → 5/5 passed
cd frontend-nx && pnpm exec nx test kppdf-web                       → passed
cd frontend-nx && pnpm exec nx run-many -t lint --all             → SUCCESS
cd frontend-nx && pnpm exec tsc -p libs/util/http/tsconfig.lib.json --noEmit → OK
```

### Delivered

- `libs/ui/paper-and-ink/src/styles/global.css` — byte-copy legacy + `@source` apps/** libs/**
- `postcss.config.json` + `.npmrc` hoist (`@tailwindcss/postcss`) — Tailwind v4 build fix
- `tailwind.config.ts` — content `./apps/**` + `./libs/**`
- `libs/util/http/` — `silent-http.ts`, `api.tokens.ts`, specs
- `app.config.ts` — `provideHttpClient` + `API_BASE_URL: '/api'`
- `paper-and-ink` lib — **4** scaffold `.ts` only (no F2a creep)

### Token duplicate audit

`--z-base` … `--z-max` — single block (line ~103). No duplicate removals required (grep confirmed single definitions).

### Next wave

- **TZ-NX-F2a-ui-primitives** — Pi components (отдельный Claim)
