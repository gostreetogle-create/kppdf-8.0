# Промпт — ops: hygiene после SALES-319/321 + closeout TABLES-305 (если visual ок)

Пока PO смотрит Create КП (321), агент делает **полезную операционку** без deploy и без DOC-344 builder.

Скопируй блок:

```text
Оркестратор: PO сейчас смотрит visual Create КП (321 уже archived). Тебе — hygiene + tables closeout. Не трогай DOC-344 builder WIP.

ШАГ 1 — sync + hygiene docs (обязательно):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) git fetch; работай на origin/main (после 44a1583e / новее)
3) Обнови статус волны в файлах (только docs, без product code):
   - tasks/_backlog/QUEUE.md — E: 317/319/321 DONE; NEXT не 321
   - tasks/_backlog/kp-vitrine/WAVE-KP-VITRINE.md — 319+321 DONE
   - docs/pages/PAGE-TZ-INDEX.md + proposals-create.page.md если ещё пишут «321 READY / FAIL»
4) Checkpoint в docs/agent-checklists/_active-map.md
5) Commit+push: docs(ops): KP wave 319/321 DONE hygiene

ШАГ 2 — TZ-DOC-TABLES-305 closeout (код уже в main 70308fd4):
6) Проверь: tasks/_active/TZ-DOC-TABLES-305.md ещё есть; checklist BLOCKED только из‑за visual SDK
7) НЕ пиши новый UI. Если Cursor/PO visual диалога таблиц ещё НЕ подтверждён — оставь 305 в _active и в Executor report напиши «ждёт visual PO».
8) Если в чате/чеклисте уже есть явный visual PASS на /doc-constructor/tables (compact dialog) — тогда archive 305:
   checklist DONE, archive, lock, progress, убрать _active, commit+push closeout.
9) Иначе STOP после ШАГ 1 — не выдумывай PASS.

ЗАПРЕТ: DOC-344 builder keys; proposal-create*; deploy; SALES-322 PARK.

Отчёт: что запушил + статус 305 (archived | still waiting visual).
```
