# Промпт агенту (копируй целиком в ответ)

**Не закрывать чат.** 307+304 уже DONE — но **P0 пропущены**. Сейчас только это:

---

```
STOP. Очередь CATALOG-UX-C НЕ завершена. PRODUCTS-307 и DIALOG-304 DONE — ок, не трогай.
Пропущены P0, из‑за которых PO открыл тему:

SoT: D:\kppdf-8.0 main. Прочитай GEMINI.md + OrchestratorKit/AGENTS.md +
tasks/_backlog/catalog-ux-c/WAVE-CATALOG-UX-C.md + docs/PO-DIARY.md §1–§4.

СЕЙЧАС СТРОГО ПО ПОРЯДКУ (без стопов «поехали»):

1) TZ-UX-COMPOSE-301
   tasks/TZ-UX-COMPOSE-301-module-composition-discoverability.md
   - ModuleForm: секция Состав + data-test="composition-hint"
     (состав модули/материалы на карточке или QC L; НЕ воскрешать ModuleMaterials)
   - product-composition-picker: restrictToModule → default activeKind = 'material'
     (вкладка Модуль остаётся)
   - BomPanel module root: «+ В корень модуля» видима, даже если выбран материал
   - tests + docs; archive; commit+push

2) TZ-UX-DIALOG-305
   tasks/TZ-UX-DIALOG-305-catalog-kind-c-width-parity.md
   - ModuleForm = kind C: variant content + maxWidth min(1120px, calc(100vw - 2rem))
     как material/product FullEditor
   - composition picker тот же maxWidth
   - audit docs/audits/2026-08-09-catalog-dialog-width-parity.md + cookbook note
   - tests; archive; commit+push

3) Если tasks/_active/ ещё имеет TZ-UX-FACT-304 → НЕ трогай materials/**, скип CATALOG-337.
   Если FACT-304 archived → TZ-CATALOG-337 (material A+ shell).

BAN: products.page (307 done), DIALOG-304 redo, desktop, supply, FACT-304 keys если жив, deploy.

СТАРТ: claim COMPOSE-301 сейчас.
```
