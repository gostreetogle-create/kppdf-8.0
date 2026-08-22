# TZ-DESK-421 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-DESK-421.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после audit/archive обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T11:15:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (team-room CLI unavailable in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/`; TZ-SUPPLY-314 не трогаю; TZ-DESK-421 не имеет конфликтного product key
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DESK-421-tray-execution-panel-audit.md` на месте

## Acceptance

- [x] Создан audit `docs/audits/2026-08-22-desk-order-tray-execution-panel-audit.md`
- [x] Разобран каждый текущий элемент правой колонки: полезность для next action и рекомендуемая форма
- [x] Проверен существующий `DeskNote`; новая chat-сущность не предлагается
- [x] Предложена конкретная IA: default open/collapsed, CTA вместо мелких ссылок, removable/low-value content
- [x] Зафиксировано, что существующие routerLink-переходы не меняются
- [x] Open questions: 5; предложен TZ-DESK-422 с conflict keys

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: docs-only
- [x] FIC §A–E: N/A — нет route, permission, module, MCP или capability
- [x] page.md / PAGE-TZ-INDEX: N/A — документный аудит не меняет route/UI contract
- [x] SECTION-READINESS: N/A — readiness не меняется
- [x] Чужой WIP не в коммите; conflict keys соблюдены; product code не изменён
- [x] Coupling map: N/A — анализирует существующие поля, но не меняет их
- [x] Канон: `docs/DOCS-INTEGRITY.md` прочитан

## Gates (факт)

- `git diff --check -- docs/audits/2026-08-22-desk-order-tray-execution-panel-audit.md ...` → PASS
- Real-code references checked against `order-hub-tray.component.ts`, DeskNote FE/BE and `docs/COUPLING-MAP.md`
- No code tests required: docs-only TZ; product code unchanged

## Executor report

- Создан audit по всем элементам правой панели; конкретная successor IA и TZ-DESK-422 зафиксированы.
- Conflict disclosure: не затронуты TZ-SUPPLY-314, TZ-DESK-420 и product code.
- Known limitation: отдельный human screenshot review для 421 не проводился; документ основан на живом коде и каноне.

## Review handoff

- [x] READY FOR REVIEW зафиксирован в checklist
- [x] Review diff выполнен; acceptance PASS

## Closeout (после PASS)

- [x] archive + lock + удалить `_active`; `progress.md` отсутствует, N/A
- [x] Status = DONE after archive
- closed_at: 2026-08-22T11:20:00+03:00
