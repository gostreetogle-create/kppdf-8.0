# PROMPT-FREEBUFF-DOCSTUDIO-CHROME-IA

> One-shot continuous: C1 → C2 → C3 → C4.  
> Старт сейчас (PO приоритет шапки). Claude может параллельно делать Desktop installer — **не** трогай `desktop/**` / downloads.  
> Не параллелить с другим `kppdf-web/src/**` TZ (hotfix — после C4).

---

CLAIM первым (до кода), на **каждый** TZ волны:
1) Get-Location + git rev-parse → D:\kppdf-8.0  
2) tasks/_active/<TASK-ID>.md + checklist по docs/agent-checklists/_TEMPLATE.md  
3) Status CLAIMED; Claim slot: agent_id=freebuff + claimed_at ISO + workspace  
4) _active-map + чужие _active keys → конфликт = STOP  
5) Team Room claim best-effort  

Затем: docs/AI-AGENT-GUIDE.md + GEMINI.md + текущий TZ path.  
После каждого TZ: gates → Executor report (auto) → archive → **следующий** C*.  
Deploy/wipe — запрещены.

---

[КОНТЕКСТ]

Ты Freebuff executor на kppdf-8.0 (NX). PO много раз просил починить шапку модуля «Докум.» — сегодня WAVE дожимает.

**Аудит (обязательно прочитай):** `docs/audits/2026-09-06-docstudio-chrome-ia-audit.md`  
**WAVE:** `docs/agent-checklists/WAVE-DOCSTUDIO-CHROME-IA.md`

Целевая IA:
- `/studio` = **Документы** (список экземпляров), **без** auto-resume в редактор
- `/studio/templates` = **Шаблоны**
- `/studio/:id` = **Студия** (редактор)
- Чип «Докум.» → `/studio`
- В редакторе сверху **только хлебные крошки** `Документы / Студия / {имя}`
- Действия Save / Editor|Preview / PDF / Archive → **правый** chrome-rail
- «Сохранить как…» только в панели Шаблон
- Левый rail: Данные + Выбрано без изменений
- A4 не reflow (`docs/pages/kp-workspace-geometry.md`)

Цепочка:

| # | SIZE | TZ |
|---|------|-----|
| 1 | S | `tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-C1-LANDING-LIST.md` |
| 2 | L | `tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-C2-THREE-SECTIONS.md` |
| 3 | L | `tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-C3-RIBBON-TO-RAILS.md` |
| 4 | S | `tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-C4-DOCS-CLOSEOUT.md` |

---

[ЗАДАЧА И ШАГИ]

1. Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 else STOP.
2. Выполни C1 полностью по TZ (убрать pickResume с list; entryPath=/studio; specs).
3. Archive C1 → Claim C2 → routes + templates page + nav cleanup + list chrome.
4. Archive C2 → Claim C3 → ribbon crumbs only; right rail actions; dirty guard на крошку; page.md §1.2.
5. Archive C3 → Claim C4 → docs Integrity / PAGE-TZ-INDEX / WAVE DONE / _NOW.
6. Каждый TZ: Executor report (auto) ≤15 lines с full SHA; `nx build kppdf-web` **последним**.

---

[ОГРАНИЧЕНИЯ]

- НЕ трогать backend схем, Data IA D50–D56 логику витрины, warehouse/supply, legacy `frontend/**`.
- НЕ возвращать auto-resume.
- НЕ плодить горизонтальный icon-strip.
- НЕ параллелить второй studio TZ.
- НЕ deploy / wipe / dropDatabase.
- Чужой WIP не стейджить.

---

[ФОРМАТ]

Перед кодом каждого TZ — короткий `<thinking>`: conflict keys, AC, риск geometry.  
Финальный отчёт по волне: 4 archive path + 4 commit SHA + «chrome IA DONE».

Self-check перед сдачей волны:
- [ ] `/studio` показывает список
- [ ] `/studio/templates` живой
- [ ] редактор: crumbs only, actions на right rail
- [ ] nx build green
- [ ] page.md = код
