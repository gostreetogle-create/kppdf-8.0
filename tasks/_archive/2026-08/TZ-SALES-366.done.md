# TZ-SALES-366 DONE — браузерная «Печать» КП вне sandbox-превью

```
ARCHIVE_MARKER
task: TZ-SALES-366
outcome: DONE
date: 2026-08-12
agent: kppdf-8.0/freebuff (agent-adeea875e2)
workspace: D:\kppdf-8.0 (Freebuff worktree d300021a)
```

- Причина: «Скачать ▾ → Печать» звал `contentWindow.print()` внутри sandboxed A4 iframe
  (`sandbox="allow-same-origin"` без `allow-modals`) → Chrome `Ignored call to 'print()'`;
  вдобавок `#previewFrame` + `@for` страниц видел только первый лист многостраничного КП.
- Фикс в `proposal-create-template-center.component.ts` (CONFLICT KEY): `printPreview()`
  больше не трогает превью-ленту — собирает тот же build HTML всех листов
  (`previewHtml` — полный документ с `.doc-page` и `@page A4`) и печатает его во временном
  невидимом **родительском** iframe (`data-test="kp-temp-print-frame"`, без sandbox — модалки
  разрешены), `srcdoc` задаётся до вставки (первый load = сам бланк, не about:blank),
  печать по `load` (guard `about:srcdoc`), кадр убирается по `afterprint`/таймауту (Safari).
  В head добавляется печатный CSS: `print-color-adjust:exact` (фон «как на экране»,
  паритет с PDF-`printBackground`) и явный `page-break-after` между листами.
- Превью-лента осталась `sandbox="allow-same-origin"` **без** `allow-scripts`/`allow-modals`
  (AC); убран ставший ненужным `#previewFrame` viewChild. `proposal-create.page.ts` **не тронут**
  (вызов `templateCenter.printPreview()` и toast пустого превью остались как были).
- Пустое/loading превью: `printPreview()` молча выходит — RU toast уже на page, пустого диалога нет.
- Многостраничность: одно «Печать» печатает все листы (один документ, page-break между `.doc-page`).
- Маршрут `?id=&action=print` (список «Все КП») идёт тем же `requestOutput('print') →
  printCurrentPreview → templateCenter.printPreview()` — фикс покрывает его без правок списка.
- PDF (`/quotations/:id/pdf`, puppeteer-core) и «Архив документов» (`GeneratedDocument`) **не тронуты**;
  третий серверный print не добавлялся; TZ-SALES-320 остаётся PARK.
- Новый spec `proposal-create-template-center.component.spec.ts`: превью sandbox без
  allow-scripts (single + multi-page), print path существует (temp frame + srcdoc всех листов +
  print CSS + print() во временном кадре + удаление), пустое превью без кадра.
- Gates: `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS (exit 0, 0 diagnostics);
  `pnpm exec jest --testPathPattern="proposal-create-template-center|proposal-create.page" --no-coverage`
  PASS 42/42 (2 suites); changed-file ESLint PASS; Prettier code style PASS; `git diff --check` PASS;
  `git diff` не содержит `proposal-create.page.ts` / `quotation-output*` / puppeteer / Desktop.
- Docs: `docs/pages/proposals-create.page.md` — одна честная строка про print вне sandbox-превью
  (TZ-SALES-366), PDF отдельно.
- Known limits: нативный системный диалог печати невозможно открыть в headless-сессии —
  DOM/unit-проверка print-пути покрыта Jest; live browser smoke «Все КП → Печать» — вручную
  после деплоя (deploy НЕ).
- NEXT: TZ-SALES-362 (тиры S/L) после merge 359 на page.ts; печать пачки (320) — после
  удовлетворения студией. Deploy НЕ.
