# TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD: «+ Текст» → библиотека

**РОЛЬ АГЕНТА:** Executor FE DocStudio — freebuff  
**ЗАВИСИМОСТИ:** Нет (библиотека уже работает в Свойствах)  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio/:id` Элементы  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` · `docs/pages/text-block-categories.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-elements-panel.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-elements-panel.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-text-properties.component.ts` (extract shared picker if needed) ;  
`frontend-nx/apps/kppdf-web/src/app/doc-studio/dialogs/` (новый диалог ИЛИ reuse) ;  
`docs/pages/document-studio.page.md` ;  
`docs/audits/2026-09-13-docstudio-text-library-insert-entry.md`

IMPLICIT CONFLICT: `nx build kppdf-web`

### Preflight

Проверено: audit выше; `studio-text-properties` library filters; `addTextToActiveLayer` / `createTextLayer`; registries text-blocks.  
PO «плюсик текст → список по категориям» → код: TextBlock + TextBlockCategory, entry сегодня только в Properties.

### Symptom

Библиотека есть, но «+ Текст» создаёт пустой слой — оператор не находит вставку из сохранённых.

### ЧТО ДЕЛАТЬ

1. **Entry на «+ Текст»:** клик открывает picker (диалог или inline в панели Элементы — предпочтительно **существующий Pi-dialog**, не новый виджет-ради-виджета):
   - Категория (корни) → Подкатегория → список имён (тот же контракт, что Свойства / TZ-NX-TEXT-PICKER-FORM).
   - Пункт / кнопка **«Пустой текст»** = сегодняшнее `addTextToActiveLayer` / `createTextLayer`.
   - Выбор текста из библиотеки → создать (или заполнить активный текстовый слой, если уже text — как сейчас hint) контентом выбранного TextBlock + применить style если библиотека его хранит (parity с `applyLibraryText`).
2. **Reuse:** не дублировать HTTP/фильтры — вынести общий кусок из `studio-text-properties` или вызвать тот же `applyLibraryText` path после create.
3. **Hint** в Элементах: одна строка — «из библиотеки или пустой»; ссылка/упоминание Реестры → Тексты опционально коротко.
4. **Свойства:** блок «Из библиотеки» **оставить** (замена текста в уже выбранном блоке).
5. **page.md:** «+ Текст» = библиотека + пустой; save по-прежнему из Свойств / реестра.
6. Spec: click + Текст → dialog/picker opens; pick empty → create; pick library id → content applied (mock services ok).

### НЕ

- Новый write-path TextBlock API  
- Удалять picker из Свойств  
- IMAGE-PASSPORT / PREVIEW / table TZ  
- Deploy

### AC

1. Live: Элементы → + Текст → видно категории/подкатегории/список → выбор вставляет на лист.  
2. «Пустой текст» по-прежнему создаёт пустой слой.  
3. Save в библиотеку из Свойств не регресс.  
4. Gates: focused studio specs + `nx build kppdf-web` PASS last.

### Claim

```
agent_id: claude
claimed_at: 2026-09-14T07:38:11Z
branch: main
baseline_sha: 5404024d
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: Claude
verification:
  - acceptance criteria: PASS (all 4, including live smoke — see checklist Gates section)
  - typecheck: PASS
  - tests: PASS
  - lint: PASS (0 new errors vs pre-existing baseline of 38/38, verified via git-stash -u A/B)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD.done.md)
  - progress.md: N/A (redirected to docs/agent-checklists/_NOW.md per repo convention)
  - status synchronization: PASS
