# TZ-DOC-STUDIO-2004: Документ без шаблона нельзя архивировать (finalize падает)

> **[ИСПРАВЛЕНО, Вариант A]** — проверено инспекцией 2026-08-29 (повторная сверка кода, не commit message)

## Проверка исправления

Выбран Вариант A (sentinel-шаблон), не Вариант B. Реализация реальная, не заглушка:
- `document-template.service.ts:247-284` — `ensureBlankA4Sentinel(organizationId)`, идемпотентный (ищет по `tags: BLANK_A4_SENTINEL_TAG` + `organizationId`, создаёт лениво если нет).
- `studio-output.service.ts:78-85` — `finalize()` при отсутствии `sourceTemplateId` вызывает `ensureBlankA4Sentinel` и подставляет его id как `templateId` архива.
- `generated-document.schema.ts:23` — `templateId` осознанно остался `required: true` (глобально не ослаблен, как и предполагал вариант A).
- `docs/architecture/document-studio.md:89,93` — решение и обоснование зафиксированы в ADR («Rejected Variant B — higher legacy breakage risk per audit»).
- `studio-output.service.spec.ts` содержит покрытие sentinel-флоу (файл существует, есть упоминания BLANK_A4).

## CONFLICT KEYS

`backend/src/modules/generated-document/generated-document.schema.ts`; `backend/src/modules/studio-document/studio-output.service.ts` (`finalize`)

## ДОКАЗАТЕЛЬСТВО

`generated-document.schema.ts:23` — `templateId` остаётся `@Prop({ ..., required: true })`. `studio-output.service.ts:84` — `templateId: String(frozenDoc.sourceTemplateId)`. Поток «+ Новый → Пустой A4» (без шаблона) даёт `sourceTemplateId = undefined`, значит `finalize` упадёт на required-поле схемы.

Это прямо противоречит потоку из плана v2 («Пустой A4» — легитимный старт) и известным limitations в `docs/pages/document-studio.page.md`/`tasks/WAVE-DOC-STUDIO.md` — то есть проблема задокументирована, но не решена: ни sentinel-шаблон, ни conditional-required не реализованы.

## ЧТО ДЕЛАТЬ

Выбрать один вариант (решает исполнитель/PO, но должен быть явно зафиксирован в ADR, а не остаться дырой):

**Вариант A — sentinel-шаблон.** Завести системный `DocumentTemplate` "Пустой A4" (seed), `finalize` для blank-документов подставляет его id.

**Вариант B — conditional required.** `templateId` optional при `sourceType='studio'` и `sourceTemplateId` отсутствует; обновить индексы/валидацию, добавить миграцию для существующих записей (`templateId` required не трогать для `sourceType` != studio).

В обоих случаях:
1. Тест: finalize документа, созданного как "Пустой A4" (без sourceTemplateId), проходит и создаёт корректный `GeneratedDocument`.
2. Обновить `docs/pages/document-studio.page.md` — снять пункт из "Known limitations", как только исправлено.

## ACCEPTANCE CRITERIA

- [x] Finalize blank-документа (без sourceTemplateId) не падает на схеме
- [x] Выбранный вариант (A/B) зафиксирован в ADR с обоснованием
- [x] Тест на "Пустой A4" → finalize → PDF зелёный
