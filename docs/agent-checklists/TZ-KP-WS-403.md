# TZ-KP-WS-403 — Checklist

**Status:** DONE

## Claim slot

| Поле | Значение |
|------|----------|
| agent_id | freebuff-1 |
| claimed_at | 2026-08-23T15:10:00+0300 |
| workspace | D:\kppdf-8.0 |
| team_room_claim | unavailable |

## Задача

Left panel (catalog / template / recipient) + hydration + autosave + preview center.

**CONFLICT KEYS:** `proposal-product-rail.component.*`; `proposal-create-template-picker.*`; `proposal-create-recipient.*`; `proposal-workspace*.ts`; `pi-proposals.service.ts`
Проверка: `_active/` пуст; ни один из перечисленных файлов не менялся (только чтение + монтирование).

## Шаги

- [x] `ProposalWorkspaceDraftService` (hydration/autosave/build — зеркало create) + spec 9
- [x] Page: @switch панели (catalog tier-wide, template picker, recipient) + template center в sheet-host
- [x] Shell: `panelWide` + `sheetHost` входы (A4 не reflow)
- [x] Page spec: 11 тестов (rails + поведение + монтирование панелей)
- [x] Gates: tsc 0 · jest proposal 152/152 · eslint 0 · ng build 0 errors
- [x] Docs: kp-workspace.page.md
- [x] Archive `.done.md`

## AC

- [x] `?id=` гидратирует template + lines + recipient
- [x] Add product → autosave → F5 persists
- [x] Template change rebuilds preview
- [x] Builder returnUrl → workspace
- [x] Panel 480px; каталог tier-L wide
- [x] Тесты продукт-рейла/picker/recipient не сломаны
- [x] tsc + lint PASS

## Proof of adoption

1. Routed: `/proposals/workspace?id=` — 3 левые панели + A4-центр
2. Tests: draft 9 + page 11
3. Docs: kp-workspace.page.md
4. Migration: единый write-path — `ProposalWorkspaceDraftService.saveDraft` (запрещён второй payload-патч)
5. Legacy: create god-page; правые панели (404)
