# TZ-NX-DOCSTUDIO-S10-DATA-PANEL-POLISH: payer/supplier, PiSelect, catalog chips

**РОЛЬ АГЕНТА:** Executor (backend + frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §2–§3  
**ЗАВИСИМОСТИ:** S9-FINISH DONE (`58d7b795`, `afb86f58`, `30b3eede`)  
**CONFLICT KEYS:** `studio-data-panel*`; `studio-editor.page.ts`; `document-template.service.ts` (`buildSubstitutionBag`); `select.component.ts` или studio selects only

## Domain preflight

Проверено: S9A archive заявил payer/supplier, но в `studio-data-panel` только client/КП/заказ; `buildSubstitutionBag` грузит только `client`+`issuer` anchors (document-template.service.ts ~1607–1621). PiSelect trigger пустой — slot `[selected-label]` не заполнен (select.component.ts:59). Catalog chips в «Данные» не реализованы (только anchor chips).

## ИСХОДНОЕ

- «Выбрано» показывает client/payer/supplier **только если** anchors уже в context — picker payer/supplier **нет**.
- `{{anchor.payer.*}}` в picker есть, backend bag для payer/supplier **нет**.
- Витрина PATCH + resolver catalog-* работают; в панели «Данные» нет сводки N изделий/материалов и remove chip.

## ЧТО ДЕЛАТЬ

1. **PiSelect label:** в studio-data-panel (или fix в SelectComponent) — trigger показывает label выбранной опции, не пустой placeholder.
2. **Pickers payer + supplier** в «Данные» (Counterparty list); PATCH `context.anchors.payer|supplier`.
3. **buildSubstitutionBag:** загрузка counterparty для anchorKey payer/supplier → `bag.anchor.payer|supplier`.
4. **Cascade:** при выборе КП/заказа → auto-fill `anchors.client` + `counterpartyId` если client пуст (frontend или reuse backend cascade в preview).
5. **Catalog chips** в «Данные»: N изделий / модулей / деталей / материалов; remove chip → uncheck vitrina + sync table dataSets (reuse `onCatalogSelectionChange` logic).
6. Tests: backend substitution bag payer≠client; studio data-panel spec smoke.

## НЕ ИЗМЕНЯТЬ

- Catalog resolver core (S9B done)
- Deploy / wipe

## КРИТЕРИИ ПРИЁМКИ

1. PiSelect клиент/КП/заказ показывает выбранное имя в trigger.
2. client + payer разные → Preview разные `{{anchor.*}}` токены.
3. КП без клиента → client подставился.
4. Chip «3 изделия» + remove → vitrina uncheck + table rows sync.
5. `backend test -- studio-output` + `nx build kppdf-web` exit 0 (build last).

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S10-DATA-PANEL-POLISH.done.md`
