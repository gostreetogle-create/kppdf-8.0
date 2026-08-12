# TZD-40 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZD-40.done.md`
> Source: `tasks/_backlog/desktop/TZD-40-desktop-version-gate.md`

## Claim slot

- agent_id: Buffy (фоновый desktop исполнитель)
- claimed_at: 2026-08-12T16:29:08Z
- workspace: D:\kppdf-8.0 (ветка main)
- team_room_claim: unavailable — Team Room CLI: «Unknown task: TZD-40; sync tasks first» (backlog TZD не зарегистрирован в комнате, как TZD-14)

## Preflight

- [x] `git fetch && git checkout main && git pull --ff-only` → HEAD d0c6d179 (Desktop WIP landed)
- [x] `tasks/_active/` пуст; конфликтов по desktop-ключам нет (inbox: только TZ-SALES-* чужие)
- [x] TZ-40 + desktop/docs/PAIRING.md + INSTALL.md прочитаны
- [x] Шаг 1 (Desktop WIP) закоммичен и запушен до TZD-40

## Acceptance (TZ)

- [x] `GET /api/desktop/compat` возвращает min/recommended/downloadUrl/serverBuildId
- [x] Desktop ниже min → блок-баннер + MCP не running; кнопка «Скачать» ведёт на URL
- [x] Desktop между min и recommended → жёлтый баннер, MCP может работать
- [x] Desktop ≥ recommended → нет баннера
- [x] Unit: semver compare + UI/API tests
- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
- [x] `cd backend && pnpm test -- desktop`
- [x] `cd desktop && pnpm typecheck && pnpm mcp:check`
- [x] `git diff --check` PASS
- [x] RU copy; пароли не в логах

## Gates (факт)

- [x] backend `tsc --noEmit` — PASS
- [x] backend `jest desktop` — 10/10 PASS (compat service 3 + pairing-key 7)
- [x] desktop `pnpm typecheck` — PASS
- [x] desktop `pnpm check` (svelte-check) — 0 errors / 0 warnings
- [x] desktop `pnpm mcp:check` — 110/110 PASS
- [x] desktop `version-compat` (tsx --test) — 9/9 PASS
- [x] frontend `tsc --noEmit` — PASS
- [x] frontend `jest desktop` — 12/12 PASS (pairing-dialog 5 + desktop-download-url 7)
- [x] `git diff --check` — PASS

## Executor report

- BE: `DesktopCompatService` (env-driven, fail-open) + `@Public() GET /desktop/compat` + spec; `config.env.example` описывает `DESKTOP_MIN_VERSION` / `DESKTOP_RECOMMENDED_VERSION`.
- Desktop: `version-compat.ts` (compareSemver / decideCompat / resolveDownloadUrl + node:test), `App.svelte` баннер block/warn + гейт автозапуска MCP, capability `shell:allow-open`.
- FE: `DesktopPairingService.compat()` + pairing-dialog строка «Актуальная версия Desktop: X (мин. Y)» + spec.
- Docs: `desktop/docs/INSTALL.md` + `PAIRING.md` (баннер).
- Не трогал: `proposal-create*`, `proposals.page*`, `quotation*`, `document-template*`, `table-template*`, `deploy.ps1`, `ruvector.db`.
