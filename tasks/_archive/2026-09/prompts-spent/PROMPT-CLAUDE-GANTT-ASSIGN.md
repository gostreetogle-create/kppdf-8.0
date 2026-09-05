# PROMPT — Claude: Gantt assignment (verify → implement)

Скопируй блок ниже в **Claude Code**.

```
═══ START ═══

Executor · D:\kppdf-8.0 · main · agent_id: claude

Прочитай:
  GEMINI.md · CLAUDE.md · kppdf-executor-loop · docs/PO-CANON.md · docs/PO-SHARED-UNDERSTANDING.md
  docs/audits/2026-09-05-gantt-worker-assignment-audit.md
  docs/agent-checklists/WAVE-NX-GANTT-ASSIGN.md
  tasks/_ready/nx-gantt/TZ-NX-GANTT-G14-BAR-ASSIGNEE.md
  tasks/_ready/nx-gantt/TZ-NX-GANTT-G13-PEOPLE-LINKS.md

═══ ШАГ 0 — VERIFY (analysis, без кода, ≤1 экран) ═══

Подтверди или поправь (с путями):
1) Сегодня workerLabel на Ганте = навыки Worker.workTypeIds, не поручение на заказ.
2) G11 chip на строке — CANCELLED (компактность).
3) Нужен Order.estimateWorkerOverrides + UI multi-select в work-detail панели.
4) Пустой override → «Не назначен»; кандидаты в select = workers с этим workTypeId в skills.

Если не согласен по сути — STOP, напиши blocker PO. Если ок — сразу ШАГ 1 (не жди «поехали»).

═══ ШАГ 1 — G14-BE ONLY (сейчас, параллельно Freebuff) ═══

Claim: скопируй/веди TZ G14, в Claim slot явно scope=backend-only first.
Conflict keys СЕЙЧАС: только
  backend/src/modules/order/order.schema.ts
  backend/src/modules/order/dto/* (новый patch dto)
  backend/src/modules/order/order.service.ts
  backend/src/modules/order/order.controller.ts
  backend/src/modules/order/order.service.spec.ts
  (+ controller spec если надо)

Сделай:
- estimateWorkerOverrides[] на Order (ключ как estimateDayOverrides + workerIds[])
- PATCH endpoint (org-scope assertOrgAccess ДО save, как HARDEN/TX)
- тесты: set/clear override; cross-org reject
- НЕ трогай frontend-nx / frontend

Gates: cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test && pnpm lint
Commit/push (только свои BE файлы + docs checklist/archive partial если нужно).
Отметь в WAVE-NX-GANTT-ASSIGN: G14-BE [x].

═══ ШАГ 2 — G13 + G14-FE (только если keys свободны) ═══

Перед Claim FE:
  git status · tasks/_active/ · WAVE-NX-GANTT-POLISH
Если Freebuff (или кто угодно) держит
  frontend-nx/.../production/**
→ STOP после ШАГа 1. Отчёт: «G14-BE DONE SHA=…; FE ждёт свободный production/**». Не пересекайся.

Если production/** свободен:
  Claim G13 → NX /people минимум + кликабельные ФИО в панели WT
  затем G14-FE → multi-select пишет PATCH, facade читает override
  LAST каждой FE: cd frontend-nx && pnpm exec nx build kppdf-web
  Archive G13/G14 .done.md · WAVE все [x] · _NOW · push

═══ ЗАПРЕТЫ ═══

- Чип ФИО на свёрнутой строке дерева (G11)
- Drag assign / merge «По заказам|По рабочим»
- Менять смысл Worker.workTypeIds
- Freebuff polish / Doc Studio Data IA
- wipe / deploy

═══ ФИНАЛ ═══

Краткий отчёт PO: что verify, SHA BE, сделан ли FE или ждёт.

═══ END ═══
```
