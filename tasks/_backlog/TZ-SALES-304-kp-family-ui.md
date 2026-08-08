═══════════════════════════════════════════════════════════════
TZ-SALES-304: Семья КП — UI слой (expand, редактор, диалог наценок)
═══════════════════════════════════════════════════════════════

> READY after **SALES-303** schema · не начинать раньше  
> Наполнять AC по замечаниям PO из браузера (тонкие правки ок)

STATUS: READY (RESERVED)

РОЛЬ: Frontend (+ тонкий BE если не хватило полей — тогда сначала доп. поле в 303-style patch)

ЗАВИСИМОСТИ: TZ-SALES-303 DONE

LAYER: 3

CONFLICT KEYS (черновик):
frontend/src/app/pages/commercial/proposals/**;
docs/agent-checklists/TZ-SALES-304.md;

## Черновик AC (уточнит PO после проб)

- [ ] Список: expand master → variant по фирмам  
- [ ] Клик variant → открыть экран КП (превью/редактор org-слоя)  
- [ ] Диалог «несколько фирм»: наценка editable + сумма столбиком → attach  
- [ ] Кнопка sync с master (если нужно вручную)  
- [ ] Не ломать solo КП  

НЕ: переписывать schema семьи; supply; deploy
