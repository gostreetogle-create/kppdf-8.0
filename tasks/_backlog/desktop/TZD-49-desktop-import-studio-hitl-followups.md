# TZD-49: Desktop Import Studio — HITL journal + CAD follow-ups (PARK)

> Successor после **TZD-48** (блокеры 0.5.3). Не брать, пока TZD-48 не DONE.  
> Источник: аудит 2026-08-16 + known_limitation TZD-48.

РОЛЬ АГЕНТА: Desktop (+ BE proposals при необходимости)

ЗАВИСИМОСТИ: **TZD-48 DONE**

LAYER: 3

CONFLICT KEYS: `desktop/src/App.svelte` ; `desktop/src/core/specification-import.ts` ; `desktop/src/core/import-targets.ts` ; (если journal) `backend/src/modules/**` proposals/product write path

PAGES: N/A  
PAGE_DOCS: N/A

STATUS: **PARK** — выдавать отдельным решением PO после релиза 0.5.3

---

## Цель (приоритет внутри)

1. **Единый write-path:** product / module / counterparty через mutation journal (как materials), без прямого `apiPost` из студии на «send».  
2. Spec confirm: lookup сущности по article/sku (не `limit=100`).  
3. CAD: маппинг Длина/Ширина/Толщина/Масса → dimensions/weight; fallback имени модуля (= article) с пометкой.  
4. AI: новая Llama-сессия на запрос; sample rows в промпт; опц. auto-restart после download.  
5. (Опц.) сужение Tauri `fs:scope` с `$HOME/**` до inbox + appData.

## НЕ

- GPU / новые модели без PO  
- Deploy / wipe  
- Переписывать Excel header heuristics без регресса тестов

## AC (когда снимут PARK)

- [ ] Non-material studio send не пишет SoT до confirm journal  
- [ ] Нет дублей от limit=100 на confirm состава  
- [ ] Gates desktop tsc + svelte-check + focused tests PASS  
- [ ] Archive TZD-49.done
