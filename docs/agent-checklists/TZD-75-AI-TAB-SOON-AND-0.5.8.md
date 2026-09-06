# TZD-75-AI-TAB-SOON-AND-0.5.8 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-75-AI-TAB-SOON-AND-0.5.8.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-06T08:56:56Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

**Process note:** claim-файл создан после первых edits UI-разметки (svelte-check/tsc/tests уже
прогнаны на момент фиксации) — self-correction, не блокер: ни один conflict key не пересекался
с чужим `tasks/_active/*` (только `TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md`, Freebuff, другие файлы).

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — только `TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md` (Freebuff) — не пересекается
- [x] TZ / peer-план прочитаны (`tasks/_ready/desktop/TZD-75-AI-TAB-SOON-AND-0.5.8.md`, `docs/peer/gemini-desktop-ai-runner-plan.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-75-AI-TAB-SOON-AND-0.5.8.md` на месте

## Acceptance (из TZ)

- [x] В UI нет рабочих кнопок скачивания/чата, которые ведут к спаму ошибок — карточка «Управление моделью» (Start/Stop/Скачать/Открыть папку/каталог моделей/disk-scan) удалена целиком; локальный режим чата — одна спокойная строка «Локальный чат — скоро», без кнопок
- [x] MCP start/copy json работает — карточка «Подключение агентов (MCP)» не менялась (только позиция/заголовок в TZD-74, в этом TZ не трогал)
- [x] Footer / installer **0.5.8**; HEAD `:3000/downloads/kppdf-desktop-setup.zip` 200 после publish (PE FileVersion 0.5.8 подтверждён publish-installer)
- [x] Gates: tsc/svelte-check/focused desktop tests как в TZD-74 — PASS
- [x] Push docs+code; binaries gitignored

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: UI + ops (version bump + publish), не web page/permission/module
- [x] FIC §A–E: N/A — Desktop app
- [x] page.md / PAGE-TZ-INDEX: N/A
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (Freebuff demo-clean — не трогал)
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md; `frontend/downloads/README.md` (semver naming canon)

## Gates (факт)

```
cd desktop && npx tsc --noEmit → exit 0
npx svelte-check --tsconfig ./tsconfig.json → 396 FILES 0 ERRORS 0 WARNINGS
npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts
  → tests 118, pass 118, fail 0 (идентично baseline TZD-74 — регрессий нет)

pnpm run release-installer
→ vite build OK; cargo build: Compiling kppdf-desktop v0.5.8; release profile Finished 38.84s
→ NSIS: KPPDF Desktop_0.5.8_x64-setup.exe
→ publish-installer: source fresh NSIS
   OK frontend/downloads/kppdf-desktop-setup-v0.5.8.exe (42142614 bytes, PE 0.5.8)
   OK frontend/downloads/kppdf-desktop-setup-v0.5.8.zip (42136291 bytes)
   alias kppdf-desktop-setup.{exe,zip}; зеркалом в frontend/browser/downloads/
   exit 0

curl -I http://127.0.0.1:3000/downloads/kppdf-desktop-setup.zip
→ HTTP/1.1 200 OK, Content-Type: application/zip, Content-Length: 42136291 (live, без рестарта backend)
```

## Executor report

**Что сделано:**
- `desktop/src/App.svelte`: карточка «Управление моделью» (Start/Stop/Скачать модель/Открыть
  папку моделей/каталог моделей/disk-scan/specs) удалена целиком. В карточке «Чат» локальный
  режим (`providerMode === 'local'`) заменён одной спокойной строкой «Локальный чат — скоро» без
  кнопок; `ChatPanel` теперь рендерится только в режиме «По API» (реально рабочий путь).
  MCP-карточка (TZD-74, первая на вкладке) не трогалась.
- Version bump lockstep 0.5.7 → **0.5.8**: `desktop/package.json`, `desktop/src-tauri/tauri.conf.json`
  (SoT для PE FileVersion), `desktop/src-tauri/Cargo.toml` (был рассинхронизирован на 0.5.6 — тоже
  подтянут до 0.5.8 для консистентности, хотя не входит в проверяемый SoT).
- `release-installer` собран и опубликован: v0.5.8 exe+zip+aliases в `frontend/downloads/` и
  `frontend/browser/downloads/`; `:3000` отдаёт новый zip 200 без рестарта backend.
- Docs: `desktop/README.md`, `desktop/docs/AI-PROVIDERS.md`, `desktop/docs/MCP.md` — описание
  вкладки AI под честное «скоро»; ссылка на `docs/peer/gemini-desktop-ai-runner-plan.md` и TZD-76
  acceptance-критерии.
- Underlying JS не удалял: `startAi`/`stopAi`/`downloadSelectedModel`/`openChat`/`rescanModels`/
  `resolveChatModelFile`/`waitForModelLoaded`/`aiRunner`-controller и связанный state (`aiState`,
  `selectedModelId`, `diskModels`, HINTS.startAi и т.д.) остались в коде — сейчас недостижимы из UI
  (кнопок нет), но нужны как есть для TZD-76 (per acceptance) и для `suggestWithAi` (AI-подсказка
  колонок на вкладке «Импорт», которая уже гарду́ется `aiState.status === 'running'` и тихо падает
  на MCP/детерминированный классификатор — не спамит, не трогал).

**Process note:** claim-файл (`tasks/_active/`, checklist) создан ПОСЛЕ первых edits разметки —
self-correction в середине сессии; исправлено до commit, conflict keys не пересекались ни с чем
чужим (проверено `git status`/`tasks/_active/` до и после).

**Conflict disclosure:** не трогал `mcpHost.ts`, pairing, Excel, NX DocStudio, БД. Freebuff
(`TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN`) — другие файлы, не пересекались.

**Known limits:**
- Визуальный скрин («Локальный чат — скоро» без спама, footer 0.5.8) — не снимал (CLI-агент).
  Быстрее всего смотреть через `pnpm dev`/`pnpm tauri dev`; либо установить свежий
  `kppdf-desktop-setup-v0.5.8.exe` из `frontend/downloads/`.
- node-llama/NSIS end-to-end не чинил — TZD-76, по слову PO и acceptance из peer-плана.
- Старые versioned-файлы v0.5.7 остались на диске рядом с v0.5.8 (canon `publish-installer`
  не удаляет историю) — не блокер, alias-и указывают на 0.5.8.

## Review handoff

- [x] READY FOR REVIEW — PO visual smoke на следующем запуске Desktop (footer 0.5.8, «Локальный чат — скоро», MCP по-прежнему работает)

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-06T09:05:00Z
