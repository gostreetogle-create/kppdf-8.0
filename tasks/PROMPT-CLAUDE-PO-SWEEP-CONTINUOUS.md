# PROMPT — Claude continuous: PO-SWEEP 2026-09-12 (#00–#07)

Скопируй **целиком**. Одна сессия. Чеклист обязателен.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

═══ WAVE PO-SWEEP CONTINUOUS ═══
WAVE: docs/agent-checklists/WAVE-NX-PO-SWEEP-2026-09-12.md
ЖИВОЙ ЧЕКЛИСТ: docs/agent-checklists/PO-SWEEP-CONTINUOUS-CHECKLIST.md
Canon: docs/PO-CANON.md (studio: 1 клик table=select/resize; витрина магазин; A4 geometry)

Порядок жёсткий: 00→01→02→03→04→05→06→07.
Resume: первая PENDING/IN_WORK в чеклисте; DONE не переделывай.

═══ ПЕРЕД КАЖДОЙ СТАДИЕЙ (Architect gate, обязательно) ═══
1) Прочитай TZ целиком + короткий audit если указан.
2) 5–10 мин как архитектор: открой релевантный код; сверь симптом PO с фактом.
3) Запиши в claim/checklist note (1–3 строки): «Confirm: … / Small fix on-path: … / Deferred: …».
4) Мелкие недочёты в тех же conflict keys / той же странице — чини на ходу, упомяни в commit body.
5) Глобальный коллапс / неясная бизнес-развилка / чужая зона:
   - НЕ ломай волну. Создай TZ-вопрос:
     tasks/_ready/nx-po-sweep/deferred/TZ-NX-PO-SWEEP-Q-<from>-<slug>.md
     (факт, риск, вопрос Да/Нет или цифра, proposed default).
   - Чеклист: эта стадия DEFERRED_TZ + path (или DONE частичного + deferred).
   - Сразу следующая стадия. Cursor потом разберёт Q-*.
6) Wipe / deploy / /production Гант / полный orphan DB wipe → BLOCKED + STOP + report.

═══ ПОСЛЕ КАЖДОЙ СТАДИИ ═══
Claim slot → code → gates (для FE: nx test focused + nx build kppdf-web LAST) → archive TZ → commit → push
→ обновить PO-SWEEP-CONTINUOUS-CHECKLIST (DONE+SHA+время) + WAVE row → next.
Без «продолжать?».

═══ ОЧЕРЕДЬ ═══

00) tasks/TZ-OPS-NX-START-CACHE.md
    Audit: docs/audits/2026-09-12-nx-start-slow-ci-cache.md
    Убрать CI=true из nx child env; вернуть Angular cache/prebundle. Smoke 2× start --nx.

01) …/01-product-save-silent/TZ-NX-PO-SWEEP-01-product-save-silent.md
    Save при invalid: toast/focus, не молчать. Фото+dirty уже ок.

02) …/02-studio-table-click-resize/TZ-NX-PO-SWEEP-02-studio-table-click-resize.md
    1 клик=select/resize; dblclick или rail Свойства=панель. PO-CANON.

03) …/03-studio-props-outside-close/TZ-NX-PO-SWEEP-03-studio-props-outside-close.md
    Dismiss свойств кликом anywhere outside panel + selected block (не только пустой A4).

04) …/04-studio-data-vitrina-thumbs/TZ-NX-PO-SWEEP-04-studio-data-vitrina-thumbs.md
    Thumb слева на 4 вкладках; список flex до низа панели (убрать max-height 480px).

05) …/05-studio-table-photo-frame/TZ-NX-PO-SWEEP-05-studio-table-photo-frame.md
    Audit: docs/audits/2026-09-12-studio-table-photo-frame.md
    Photo.frame → ячейка; UI fit в Свойствах таблицы. Orphan wipe НЕ делать.

06) …/06-studio-wysiwyg-preview/TZ-NX-PO-SWEEP-06-studio-wysiwyg-preview.md
    Audit: docs/audits/2026-09-12-studio-editor-preview-wysiwyg.md
    Единый table CSS contract: editor === preview === PDF + iframe zoom parity.

07) …/07-studio-chrome-rail-categories/TZ-NX-PO-SWEEP-07-studio-chrome-rail-categories.md
    Audit: docs/audits/2026-09-12-studio-chrome-rail-categories.md
    Lifecycle → одна категория «Документ»+меню; панели Элементы…Шаблон оставить.

═══ ФИНАЛ ═══
Чеклист COMPLETE; WAVE status COMPLETE; _NOW Claude IDLE.
Executor report: таблица # → SHA (+ список DEFERRED_TZ path если были).

НЕ: /production; wipe; deploy без PO; desk; параллель двух page FIX; чужой WIP.
Не спрашивай «продолжать?» между стадиями.
```
