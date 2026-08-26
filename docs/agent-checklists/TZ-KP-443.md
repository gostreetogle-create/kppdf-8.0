# TZ-KP-443 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-KP-443.md` (на месте)
> Commit/push: по `docs/GIT-POLICY.md` (после gates)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude (Buffy / Codebuff, Freebuff)
- claimed_at: 2026-08-26T15:24:39Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI Team Room недоступен в этой среде; Claim slot заполнен в checklist — канон `GEMINI.md` § Claim)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:/kppdf-8.0` (branch main, HEAD 7eeddfa1)
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пуст (только .gitkeep); TZ-KP-443 LIVE в _NOW (Freebuff ×2, параллель DOC-443 — disjoint); чужих CLAIM на конфликт-keys нет
- [x] TZ / канон / deps прочитаны (GEMINI.md, PO-CANON, executor-loop, context-preflight)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-KP-443.md` на месте

### Preflight Check Output

- **Context read:** `proposal-workspace.store.ts` (orientation default portrait), `proposal-workspace-draft.service.ts`, `proposal-workspace-shell.component.{ts,html}`, `builder-inspector.component.ts`, `kp-workspace-geometry.md`, `kp-workspace.page.md` — будут открыты до кода
- **Key Constraints:** PO — ориентация только в шаблоне, КП зеркалит; geometry laws 1–5 не трогать; один write-path ориентации (template.orientation)
- **Planned Deliverable:** (1) store orientation = derived from template; (2) убрать segment с ribbon КП; (3) Lucide на builder chips; (4) docs law #6; (5) spec-тесты
- **Validation Path:** FIC §C (UI компонент) + gates: FE tsc, focused jest (shell/store/draft/inspector/demo), lint

## Acceptance

- [x] КП с landscape-шаблоном → лист альбомный без кликов на КП (store `orientation` = computed из `draft.selectedTemplate()?.orientation`; spec mirror-landscape)
- [x] На КП ribbon нет portrait/landscape toggle (markup + CSS удалены; spec `kp-orient-toggle` null)
- [x] В builder inspector — Lucide chips для ориентации (RectangleVertical/Horizontal); PATCH сохраняет (`templateUpdate` → `templatesSvc.update`, существующий путь); после F5 KP отражает (derived)
- [x] Geometry laws 1–5 не регрессируют (overlay panel, viewport, A4 — не тронуты; удалён только segment ribbon)
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [x] Focused jest: shell + store + draft + inspector — 72/72 PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (UI component + docs)
- [x] FIC §A–E: UI component change — §A (существующий путь, один write-path orientation = template PATCH), §C (pi-примитивы: Lucide, pi-focus-ring, aria-pressed сохранены), §E (docs обновлены); §B/§D — N/A (без роутов/permissions); §F — N/A (нет общего поля)
- [x] page.md / PAGE-TZ-INDEX обновлены (kp-workspace.page.md + kp-workspace-geometry.md — да; PAGE-TZ-INDEX строка добавлена)
- [x] SECTION-READINESS — N/A (нет нового раздела/роута)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (DOC-443 — disjoint)
- [x] Coupling map: `docs/COUPLING-MAP.md` — N/A (общее поле `Quotation` не менялось; `DocumentTemplate.orientation` уже существовал)
- [x] Канон: docs/DOCS-INTEGRITY.md (docs обновлены в той же TZ)

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)
- focused jest `proposal-workspace.store|shell|draft.service|builder-inspector` → PASS 72/72
- eslint (8 изменённых файлов) → 0 новых ошибок от TZ (pre-existing: page.ts 6, inspector 16 — no-raw-ui-values в legacy styles-блоках, подтверждено stash-сравнением HEAD)
- prettier --write 2 spec → PASS; diff-check → PASS
- pre-existing (не регрессия): `proposal-workspace.page.spec.ts` 3 фейла (kp-ws-text-block-create) — падает и на HEAD со stashed-правками

## Executor report

- Что сделано: (1) store `orientation` = computed из `draft.selectedTemplate()?.orientation ?? 'portrait'`, `setOrientation` удалён; (2) segment portrait/landscape убран с КП-ribbon (shell + demo + page binding); (3) builder-inspector chips получили Lucide RectangleVertical/RectangleHorizontal (не emoji), PATCH-путь без изменений; (4) docs law #6 + kp-workspace.page.md; (5) spec: store (TestBed + stub), shell (нет toggle), inspector (icons + emit) — 72/72.
- Conflict disclosure: TZ-DOC-443 параллельный агент работает в `tasks/_active/TZ-DOC-443.md` — keys disjoint, пересечений нет. Чужой WIP (dirty-дерево сессии) не коммитился.
- Known limits: live-browser smoke не выполнялся; PDF pipeline не тронут; 3 фейла page.spec pre-existing (не мои).

## Review handoff

- [x] READY FOR REVIEW — волна Freebuff ×2 (DOC-443 + KP-443) → Cursor Verdict по завершении волны; TZ-KP-443 отправил в archive после локальных gates (TZ не требует отдельного review-gate до archive)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-26T15:40:00Z
