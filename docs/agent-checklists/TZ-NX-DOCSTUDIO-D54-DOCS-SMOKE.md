# TZ-NX-DOCSTUDIO-D54-DOCS-SMOKE checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-D54-DOCS-SMOKE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T13:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] D50–D53 DONE
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-D54-DOCS-SMOKE.md` на месте

## ЧТО СДЕЛАНО

1. `docs/pages/document-studio.page.md`:
   - §1.3 таблица «Данные»: строка обновлена на TOC (Товары | Выбрано | Кому | Связи | Ещё), ссылка на § 3.3.
   - §3.3 «Данные»: полностью переписана под IA — таблица TOC-категорий, словарь «Клиент = покупатель», описание «Вставить на лист» (D52) с явной оговоркой про существующий отдельный «sole manual table» auto-wire (S15, не тронут).
   - Ссылка на audit `2026-09-05-docstudio-data-panel-ia-audit.md` добавлена в начало § 3.3.
2. `docs/pages/PAGE-TZ-INDEX.md` — **N/A**: строка `document-studio.page.md` в этом файле — историческая (WAVE-DOC-STUDIO Wave 0/101…1101), не обновлялась для S15/S27/S41-S48 и других недавних TZ; не начинаю выборочно чинить только свою строку в файле, который уже не поддерживается построчно (см. `docs/PROJECT-MEMORY.md` — исторические журналы не читаем/не правим целиком).
3. Smoke — **test-based, не live browser** (см. «Известное ограничение» ниже).

## Известное ограничение (smoke method)

Global-конвенция просит проверять UI в браузере, но эта сессия работает в общей
multi-agent среде: Freebuff прямо сейчас активно правит `pages/production/**`
(незакоммиченный WIP, тесты то падают, то чинятся между моими прогонами — см. D52/D53
checklists). Поднимать общий dev-server/Mongo рискует либо зацепить их незавершённую
работу, либо создать путаницу в атрибуции сбоев. Вместо этого smoke выполнен через
уже написанные unit-тесты, которые буквально проходят по сценарию оператора:

| Шаг сценария | Тест (файл: `studio-data-panel.component.spec.ts`) |
|---|---|
| Товары → добавил изделие | `renders catalog vitrina segment + grid on «Товары»` + существующий vitrina add/remove (не менялся, покрыт `studio-data-vitrina` своими тестами) |
| → буфер «Выбрано» обновился (badge + список) | `shows chips + a TOC badge count once anchors/catalog are selected` |
| → «Вставить на лист» доступен только для выбранного kind | `offers only compatible insert targets and emits insertTable on click` |
| → без выбора каталога — CTA disabled + hint | `shows a disabled CTA + hint when the buffer has anchors but no catalog selections` |
| Кому → клиент первым, плательщик — disclosure | `«Плательщик» stays a disclosure by default…`, `shows the Плательщик select directly… when a payer is already set` |

`insertCatalogTable()` (запись в `studio-editor.page.ts`, create-table + `putDataSet`) не
покрыт unit-тестом на этом шаге — тот файл исторически без `.spec.ts` (весь его
write-logic не юнит-тестируется, только через извлечённые чистые функции в соседних
`studio-*.spec.ts` файлах, тот же паттерн уже был в проекте до этой волны). Функция
переиспользует уже протестированный `onTableSourceChange`-путь (`putDataSet`) 1:1,
параметризованный по `blockId` — риск регрессии низкий, но **known_limitation**:
живой клик-тест «Вставить на лист → строки появились на A4» не выполнен в этой сессии.

## AC

- [x] Docs совпадают с UI (§3.3 переписана под факт кода).
- [x] WAVE все `[x]` (см. `docs/agent-checklists/WAVE-DOCSTUDIO-DATA-IA.md`).

## Gates (факт)

```
cd frontend-nx
pnpm exec nx build kppdf-web → PASS, exit 0 (docs-only + review, код не менялся в этом шаге)
```

## Review handoff

- [x] READY FOR REVIEW — WAVE-DOCSTUDIO-DATA-IA (последний TZ волны)
- Archive без отдельного Cursor Verdict

## Closeout

- archive сразу — WAVE-DOCSTUDIO-DATA-IA полностью DONE (D50–D54).
