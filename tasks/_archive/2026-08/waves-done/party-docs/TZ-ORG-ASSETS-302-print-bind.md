═══════════════════════════════════════════════════════════════
TZ-ORG-ASSETS-302: Requisites print + image bindings
═══════════════════════════════════════════════════════════════

STATUS: BLOCKED_UNTIL_ASSETS301_AND_306 · WAVE-PARTY-DOCS #6
DEPENDS ON: TZ-ORG-ASSETS-301 DONE + TZ-ORDERS-306 DONE → тогда READY
LAYER: 3–4
CHECKLIST: docs/agent-checklists/TZ-ORG-ASSETS-302.md
PAGES: documents / print pipeline
PAGE_DOCS: (documents + organizations)

РОЛЬ: Backend print/registry + thin FE if placeholders

CONFLICT KEYS:
backend/src/modules/documents/**;
backend/src/modules/print*/** OR backend print/pdf paths discovered in audit;
frontend document template registry if image slots;
docs/agent-checklists/TZ-ORG-ASSETS-302.md;

---

## ИСХОДНОЕ

Peers: bind в существующие template image/background + registry contract-change.  
Не писать новый PDF engine.

## ЧТО ДЕЛАТЬ

1. Audit: где реквизиты Org/CP уже подставляются в PDF/шаблоны.  
2. Плейсхолдеры/слоты: logo, seal, signature из typed vault current Org.  
3. Реквизиты фирмы + клиента в КП/договор/счёт по существующему pipeline.  
4. Smoke: order → stub КП → PDF содержит реквизиты + logo (если загружен).  
5. Docs: что слоты доступны дизайнеру шаблона.

## НЕ

- Новый генератор PDF  
- DaData  
- Desktop MCP tools  
- deploy  

## AC

1. С печатью видны реквизиты + изображения vault (если есть).  
2. Без vault — graceful (пусто / placeholder, не crash).  
3. Gates + archive + push; deploy NO.
