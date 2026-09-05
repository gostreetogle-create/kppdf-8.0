# TZ-NX-GANTT-L0-PEER-REVIEW: независимый review порта Ганта G3–G6

**РОЛЬ АГЕНТА:** Reviewer → краткий audit md (код читать; product patch **только** если найден backend-only дефект с отдельным мини-fix в том же TZ ≤1 файла; иначе только findings)  
**LAYER:** 1  
**PAGES:** production  
**ЗАВИСИМОСТИ:** G3–G6 на main (`db6dd6e1`…`26b87bc3`); G7 может идти параллельно у Freebuff (docs smoke)  
**CONFLICT KEYS:** `docs/audits/2026-09-05-gantt-nx-l0-peer-review.md` (создать); **не** править `frontend-nx/apps/kppdf-web/src/app/pages/production/**` пока Freebuff в G7 (если нужен FE-fix — finding + successor TZ в `_ready`, не патч)  
**IMPLICIT:** можно читать production/**; писать FE — STOP/DEFER

## ИСХОДНОЕ

Freebuff довёл NX Гант L0 почти до G7. Нужен второй взгляд (Cloud Code) на качество порта до того, как PO начнёт жить на экране.

Коммиты смотреть: `db6dd6e1` (G3), `f0eb20a4`/`208ef9a3` (G4), `4d09f2bc` (G5), `26b87bc3` (G6).  
Эталон: legacy `frontend/src/app/pages/production/**` + `docs/pages/production-cockpit.page.md` + `docs/ux/production-gantt-studio-spec.md`.

## ЧТО ДЕЛАТЬ

1. Прочитать diff/файлы G3–G6 (bars, facade, write path, workers).  
2. Написать `docs/audits/2026-09-05-gantt-nx-l0-peer-review.md`:  
   - что совпало с legacy (OK)  
   - P0 / P1 / P2 findings: факт + path:line + риск + минимальный фикс + acceptance  
   - явные gaps vs L1+ (не требовать делать сейчас)  
3. Фокус риска:  
   - optimistic write / fail revert (G5)  
   - scroll/range после earlier plannedDate (G4)  
   - workers mode реально read-only (G6)  
   - второй write-path / catalog days без confirm  
   - менеджер-only gates  
4. Если найден **backend-only** баг в estimate-days/start (org leak, crash) — можно починить в этом TZ + тест.  
5. FE-баги → только finding + черновик `tasks/_ready/TZ-NX-GANTT-G8-…md` (не реализовывать).  
6. Commit/push **docs** (+ optional BE fix). Не трогать WAVE G7 closeout Freebuff.

## НЕ

- Переписывать визуал. L1–L6 фичи. Studio.  
- Патчить FE production/** (конфликт с G7).  
- Deploy.

## AC

1. Audit md существует, ≥3 конкретных наблюдения (OK или finding).  
2. Каждый P0/P1 = факт + path + acceptance.  
3. `_active` очищен; push.

## Archive

`tasks/_archive/2026-09/TZ-NX-GANTT-L0-PEER-REVIEW.done.md`

## Claim slot
- agent_id: claude
- claimed_at: 2026-09-05T04:39:22Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

### Preflight Check Output
- **Context read:** `TZ-NX-GANTT-L0-PEER-REVIEW.md`, `PROMPT-19-GANTT-L0-PEER-REVIEW.md`
- **Key Constraints:** reviewer posture — read production/**, do NOT patch FE (Freebuff on G7); backend-only fix allowed if found, ≤1 file; findings-only for FE bugs (draft successor TZ in `_ready`, don't implement)
- **Planned Deliverable:** read G3-G6 diffs + current frontend-nx production files + legacy production baseline + specs → audit md with P0/P1/P2 findings (fact + path:line + risk + fix + acceptance) → optional BE mini-fix → archive + commit/push
- **Validation Path:** ≥3 concrete observations in audit; each P0/P1 has fact+path+acceptance; `_active` cleared; push

## Что сделано (см. полный отчёт `docs/agent-checklists/TZ-NX-GANTT-L0-PEER-REVIEW.md`)

Audit: `docs/audits/2026-09-05-gantt-nx-l0-peer-review.md`. 5 «matches legacy» +
P0 (backend cross-org write on estimate-days/estimate-start, fixed + tested) +
P1 (range never widens forward, finding) + P2 (test overclaims coverage,
finding). Successor FE TZ: `tasks/_ready/TZ-NX-GANTT-G9-RANGE-REFIT-FORWARD.md`.

## Gates (факт)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit  → PASS
cd backend && pnpm test  → PASS, 126 suites / 1169 tests (incl. 4 new)
cd backend && pnpm lint  → PASS, 0 errors
```

## Финализация (ARCHIVE_MARKER)

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: Claude
verification:
  - acceptance criteria: PASS (audit ≥3 observations; each P0/P1 fact+path+acceptance; _active cleared)
  - typecheck: PASS
  - tests: PASS (1169/1169 incl. 4 new)
  - lint: PASS (0 errors)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-GANTT-L0-PEER-REVIEW.md)
  - progress.md: N/A (review + narrow security bugfix, no architecture change)
  - status synchronization: PASS
```
