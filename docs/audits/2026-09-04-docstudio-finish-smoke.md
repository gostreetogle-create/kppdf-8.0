# Doc Studio FINISH — operator smoke (S37)

date: 2026-09-04  
HEAD: `4fd4052c`  
surface: NX `http://localhost:4201` + BE `http://127.0.0.1:3000`  
doc under test: `6a9a6d1df32e4bc7cbe26b79` (renamed **S37 SMOKE КП**, linked QTN)  
agent: cursor (evidence-only; no product patches)

## Stack

| Check | Result |
|-------|--------|
| `GET /api/health` | 200 |
| NX `:4201` | 200 |
| Login admin | OK |

## AC matrix

| # | Scenario | Result | Notes |
|---|----------|--------|-------|
| 1 | Новое КП → Данные → витрина 2 изделия → строки | **PASS** | «Новое КП» создало документ; витрина показала карточки; выбраны СМОК + Мангал («2 изделия»); в **Просмотр** таблица с 2 строками (имя+кол-во=1). В Editor editable cells иногда пустые до Preview — hydrate виден в Preview/PDF path. |
| 2 | Клиент + `{{counterparty.name}}` → Просмотр | **FAIL** | Клиент выбирается в панели Данных. Полный цикл вставки ERP-токена в текст → Preview с подстановкой имени **не завершён** в этой сессии (picker «Поле ERP» не дал подтверждённой вставки). |
| 3 | Сохранить → network; F5 имя/строки | **PASS** | Save ушёл в disabled после записи; rename persisted (`doc.name=S37 SMOKE КП`); reopen URL сохранил имя и catalogSelections (2 product ids). |
| 4 | PDF скачивается | **PASS** | `POST /api/studio-documents/:id/pdf` → `%PDF-` · 19517 bytes (`\.worktrees\s37-smoke.pdf`). UI кнопка PDF тоже стартует генерацию. |
| 5 | `/proposals` видит КП / «В студии» | **PASS** | Список QTN-2026-033… с бейджем **«В студии»**; CTA «Создать в студии». |
| 6 | Rename + formula one control | **PASS** | Диалог «Переименовать документ» → `S37 SMOKE КП`. В свойствах текста **ровно один** combobox «Формула» (без дубля). |

## Side notes (не блокеры archive, но запах)

- Диалог «Документ изменён в другом месте» при параллельном orch/`putDataSet` — мешал smoke; orch S37 остановлен.
- GET `/pdf` = 404; правильный метод **POST**.

## Verdict

**FAIL** (из‑за AC2). По правилам TZ: **не** archive DONE. Hotfix: `tasks/_ready/TZ-NX-DOCSTUDIO-S37B-COUNTERPARTY-TOKEN-PREVIEW.md`.

## Evidence artefacts

- Local PDF: `.worktrees/s37-smoke.pdf`
- Browser notes above; screenshots captured in session (`s37-01`…`s37-04` in Cursor temp screenshots).
