# TZD-50: Desktop Excel Form Studio (скачать форму V1)

> **Фундамент волны** WAVE-DESKTOP-EXCEL-FORMS (скачал → заполнил → загрузил →
> проверка → подтвердил → SoT). PO отказался от Google Sheets в пользу Desktop.
>
> РОЛЬ АГЕНТА: Desktop UI + Desktop core (Svelte/Tauri); без frontend SPA;
> BE не трогал (journal propose/POST API уже существовали).
>
> ЗАВИСИМОСТИ: нет (фундамент волны). TZD-49 PARK, TZD-51 — successor.
>
> LAYER: 3 (App.svelte — единственный CLAIM; TZD-49 PARK не параллелился)

CONFLICT KEYS: `desktop/src/App.svelte` ; `desktop/src/core/excel-form-template.ts` ;
`desktop/src/core/excel-form-template.test.ts` ; `desktop/src/importers/excel.ts` ;
`desktop/src/core/multi-import.ts` ; `desktop/src/core/multi-import.test.ts` ;
`desktop/src/core/inbox.ts` ; `desktop/src/core/import-mapping.ts` ;
`desktop/docs/MCP.md` ; `docs/agent-checklists/TZD-50.md`

CHECKLIST: `docs/agent-checklists/TZD-50.md`
REVIEW: required (Cursor Verdict **PASS** 2026-08-16 до archive)

---

## Что сделано (коротко)

1. **Каталог Form Studio:** `FormCategoryKey` `catalog|counterparties`; allowlist V1
   (material/product/module → catalog; counterparty → counterparties); колонки
   re-export из `IMPORT_TARGETS`; UI категория → таблица (disabled + RU-hint
   «Сначала выберите категорию»).
2. **Генерация `.xlsx`:** `desktop/src/core/excel-form-template.ts` — лист «Данные»
   (RU-заголовки, ` *` у обязательных, пустая строка-скелет) + скрытый `_kppdf`
   (`templateVersion 1.0.0`, `targetKey`, `generatedAt`, `columnKeys`, `app=kppdf-desktop`);
   файл `kppdf-{targetKey}-form.xlsx`; кнопка «Скачать Excel-форму» без требования
   аккаунта + RU-toast.
3. **Round-trip:** `excel.ts` — `fingerprint` в `ExcelWorkbookPreview`, лист `_kppdf`
   исключён из превью; `readFormFingerprint` (неизвестный/битый паспорт → null =
   safe ignore); `inbox.ts` — fingerprint в `InboxAudit`; App.svelte `prepareMapping` —
   один блок на targetKey + identity-карта (суффикс ` *` снимается; переименованные
   заголовки → красный unfit, отправка закрыта).
4. **Контур качества:** статусы target-aware (`duplicate`/`invalid`/`needs_review`/
   `ok_update`/`ok_new`) в `multi-import.ts` (dedupe article/sku/inn; каталог тянется
   страницами, потолок 1000 — честная подсказка); на send только ok_new/ok_update;
   итог «записано N / отклонено M» + отчёт отклонений `.csv` (BOM, `;`).
5. **UX:** зона «Формы Excel» рядом с «Импорт Excel»; RU-only; keyboard-доступно.

## Verification

- `cd desktop && npx tsc --noEmit` → **PASS** (0 ошибок) — повторно на closeout
- `cd desktop && npx svelte-check --threshold error` → **PASS** (0 errors, 0 warnings) — повторно на closeout
- `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` → **PASS 56/56**
  (новые: excel-form-template 9; multi-import обновлён под статусы; excel 5/5 — регресса нет)
- checklist: DONE (`docs/agent-checklists/TZD-50.md`)
- cursor verdict: PASS (2026-08-16, до closeout)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T17:58:00+03:00
closed_by: buffy-codebuff (desktop executor)
TZ: TZD-50
DEP: none (фундамент волны; TZD-49 PARK, TZD-51 successor)

verification:
  - acceptance criteria: PASS (все чекбоксы TZD-50 + Cursor Verdict PASS)
  - typecheck: PASS (desktop tsc --noEmit, повторно на closeout)
  - svelte-check: PASS (0 errors, 0 warnings, повторно на closeout)
  - desktop tests: PASS 56/56 (вкл. excel-form-template 9, multi-import, excel 5)
  - checklist: DONE (docs/agent-checklists/TZD-50.md, Status DONE + Executor report (auto))
  - cursor verdict: PASS (2026-08-16, spot-check allowlist V1 / _kppdf / UI / статусы / gates)
  - commit: 10dde79a8f6e7e0af34bc53ee49e65adc442dc67 (feat(desktop): Excel Form Studio download + round-trip (TZD-50))
  - push: НЕ делал (по GIT-POLICY / слову PO)

## Files

- `desktop/src/core/excel-form-template.ts` (new), `desktop/src/core/excel-form-template.test.ts` (new)
- `desktop/src/App.svelte` (Form Studio UI + round-trip wiring + summary/report)
- `desktop/src/importers/excel.ts` (read `_kppdf` fingerprint, скрытый лист вне превью)
- `desktop/src/core/multi-import.ts` (+test) (статусы target-aware, dedupe, existing-keys)
- `desktop/src/core/inbox.ts` (fingerprint в InboxAudit)
- `desktop/src/core/import-mapping.ts` (RowValidationStatus: conflict/error → duplicate/invalid/needs_review; validateMappedRows перенесён в multi-import)
- `desktop/docs/MCP.md` (раздел «Формы Excel (TZD-50)»)
- `docs/agent-checklists/TZD-50.md`

## Known limits (successor)

- Справочники warehouse/workType/colorReference/category → **TZD-51** (V2 allowlist + createEntities + dedupe)
- Единый journal для non-material → TZD-49 PARK
- Дедуп по каталогу ограничен 1000 ключей на таблицу (честная подсказка)
- Паспорта изделий → WAVE-PRODUCT-PASSPORTS
