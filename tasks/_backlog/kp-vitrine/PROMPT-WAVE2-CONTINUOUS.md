# Промпт: WAVE-2 Create КП (323 → 324 → 325)

Скопируй агенту целиком. Непрерывный исполнитель: claim → code → gates → visual (где требует TZ) → archive → commit/push → next.

---

```text
Ты — непрерывный исполнитель kppdf-8.0 на D:\kppdf-8.0 / main.

Очередь wave-2 (строго по порядку):
1) TZ-SALES-323 — A4 fit без scrollbar (FE scale + build HTML page box)
2) TZ-SALES-324 — empty table → <table> skeleton (thead + 1 пустая строка)
3) TZ-SALES-325 — draftLines/previewLines → назначенная line-items table

SoT:
- Wave: tasks/_backlog/kp-vitrine/WAVE-KP-VITRINE.md
- Аудит: docs/audits/2026-08-09-kp-create-preview-wave2.md
- TZ: tasks/_backlog/kp-vitrine/TZ-SALES-323-*.md · 324-*.md · 325-*.md
- Промпты-детали: PROMPT-SALES-323.md · 324 · 325
- Spec LOCK: docs/ux/kp-create-studio-spec.md §0 FROZEN
- Канон агента: GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4

CLAIM первым (до кода) на каждую TZ:
1) Get-Location + git rev-parse → D:\kppdf-8.0; clean → git pull --ff-only
2) tasks/_active/<ID>.md + docs/agent-checklists/<ID>.md по _TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id, claimed_at ISO, workspace
4) _active-map + чужие _active CONFLICT KEYS → конфликт = STOP/DEFERRED
5) Особенно STOP если чужой claim на:
   - proposal-create*
   - document-template.service.ts
   - table-template.service.ts (для 324/325)
   - build-document.dto / pi-document-templates.service (для 325)
6) DOC-344 = builder FE — не трогать его keys; если overlap на shared FE service в 325 — DEFER 325
7) Team Room claim best-effort

Правила волны:
- 323: чинить и FE contain, и CSS body/doc-content; измерить scrollWidth/Height ≤ client +1px; archive только после Cursor/PO visual PASS по scroll
- 324: preview([]) → <table> thead + N пустых td; НЕ <p>Нет данных</p>; Builder «Нет данных» в td = known_limit
- 325: claim ТОЛЬКО после DONE 323+324; НЕ заливать все live tables; target = settings.kpLineItems / role line-items, иначе ровно 1 live table, иначе none; key aliases из TZ; preview payload не в Mongo; snapshot mode не трогать

BAN / OUT OF SCOPE всей волны:
- TZ-SALES-322 snapshot/stale refresh
- TZ-SALES-320 print
- FROZEN 317 rails/overlay/flushBody «улучшения»
- Builder drag / BuilderCanvas / DOC-344
- DOC-TABLES-305
- Persist Quotation Save / auto-update старых КП
- Fuzzy mapping по RU labels
- deploy / deploy.ps1
- mid-queue «поехали?»

После каждой TZ: gates из файла TZ → checklist ## Executor report (auto) → READY FOR REVIEW → archive по правилу TZ (323/325 ждут visual PASS) → commit+push scoped → Checkpoint в _active-map → сразу следующая.

Конец 325 DONE: NEXT idle; Deploy предложить? да (без запуска); 320/322 остаются PARK.
```

---

**По-человечески:** агент по очереди уберёт скролл листа, сделает пустую таблицу как бланк Excel, потом покажет товары из рейла в правильной таблице КП — без snapshot, печати и деплоя.
