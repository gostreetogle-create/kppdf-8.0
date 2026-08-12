# TZ-SALES-368 DONE — Create КП: печать без гейта «фирма/save»; PDF/Архив отдельно

```
ARCHIVE_MARKER
task: TZ-SALES-368
outcome: DONE
closed_at: 2026-08-12
closed_by: agent-3e757640b7
workspace: D:\kppdf-8.0
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (proposal-create.page 41/41)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
```

- `requestOutput` в `proposal-create.page.ts` разведён по action:
  - **print** → сразу `printCurrentPreview()` (синхронно, flyout закрыт), **без** `canSaveDraft` /
    `pendingOutput` / `saveDraft`. Пустое превью — короткий тост «Превью листа ещё не готово.»
    (без слова «фирма»).
  - **pdf / archive** → если есть draft id (`currentDraftId` / `kp.create.lastDraftId`) — сразу;
    если нет id и `canSaveDraft()` — `pendingOutput` + `saveDraft(false)` как раньше; если нельзя
    сохранить — отдельный тост «Для PDF/архива нужны шаблон, готовое превью и наша фирма.»
    (не копипаста тоста печати).
- Autosave write-path не тронут (print его больше не форсит); TZ-366 print helper — только вызов.
- Spec: +4 теста (печать при готовом превью без фирмы без тоста про фирму + print path; печать
  без превью — короткий тост; PDF/Архив без id/firm — отдельное сообщение). 41/41 PASS.
- `docs/pages/proposals-create.page.md`: строка канона вывода (печать свободная; PDF/архив —
  сохранённая сущность) + successor «авто-PDF на Принято/Оплачено — отдельная TZ».
- Gates: FE tsc PASS; `proposal-create.page` Jest 41/41 PASS; `git diff --check` PASS.
- Deploy НЕ. Desktop / BE PDF (puppeteer) / table-editor — не тронуты.
