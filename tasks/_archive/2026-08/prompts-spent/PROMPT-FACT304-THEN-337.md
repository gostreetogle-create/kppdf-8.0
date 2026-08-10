# Промпт: добить FACT-304 → сразу CATALOG-337

Кому: агент Shop-north / materials (не Catalog-UX, который уже закрыл COMPOSE/DIALOG).  
Копируй целиком:

```
SoT: D:\kppdf-8.0 main. Прочитай GEMINI.md + OrchestratorKit/AGENTS.md.

Сейчас на main уже DONE: COMPOSE-301, DIALOG-305, PRODUCTS-307, DIALOG-304.
В _active только TZ-UX-FACT-304 (давно CLAIMED). В рабочей копии уже есть WIP
на materials/** + fact adoption audit + возможно material-dimensions util —
это твой слот. Не трогай desktop/**, orders, supply, products.page.

ШАГ 1 — закрой TZ-UX-FACT-304:
  source: tasks/_backlog/shop-north-b/TZ-UX-FACT-304-material-detail-facts.md
  checklist: docs/agent-checklists/TZ-UX-FACT-304.md
  AC: FactStack passport на material-detail; dimensions/stock/where-used живы;
      audit material ADOPTED; FE tsc + material-detail tests PASS.
  Commit+push ТОЛЬКО materials/fact-card/audit/checklist/progress/archive keys.
  Archive → tasks/_archive/2026-08/TZ-UX-FACT-304.done.md; убери _active.
  Если dimensions-normalize util готов и в зоне materials — можно включить
  в тот же commit; иначе отдельным thin follow-up, не блокируй archive.

ШАГ 2 — сразу TZ-CATALOG-337 (после archive FACT-304):
  tasks/TZ-CATALOG-337-material-detail-a-plus.md
  A+ shell как product/module: PiPageChrome, sticky left hero+FactStack+Photo/Price,
  right where-used+stock; БЕЗ ProductBomPanel.
  Gates из TZ; archive; commit+push.

BAN: deploy без команды PO; воскрешение ModuleMaterials; перепись COMPOSE/DIALOG.

СТАРТ: closeout FACT-304 сейчас.
```
