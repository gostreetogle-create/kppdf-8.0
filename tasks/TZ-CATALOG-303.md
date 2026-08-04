═══════════════════════════════════════════════════════════════
TZ-CATALOG-303: Graph guards — cycle + depth≤8 (смешанный путь)
═══════════════════════════════════════════════════════════════

> Канон: `tasks/TZ-CATALOG-300.md` §3.1–3.2.  
> Тяжесть: **тяжёлая** · Риск: **критический** · Код: другой ИИ →  
> **Cursor review ОБЯЗАТЕЛЕН** перед DONE.  
> Параллель: **нет**. После 302 DONE.

РОЛЬ АГЕНТА: Backend Developer

ЗАВИСИМОСТИ: TZ-CATALOG-302 DONE  
LAYER: 4

CONFLICT KEYS:
  backend/src/modules/product-module/product-module.service.ts ;
  backend/src/modules/product/product.service.ts ;
  backend/src/modules/catalog-graph/  (новый shared helper — предпочтительно) ;
  backend/test/jest/catalog-graph-guard.spec.ts (new) ;
  backend/test/e2e/product-modules.e2e-spec.ts ;
  backend/test/e2e/products-attach-modules.e2e-spec.ts

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Вынести `assertNoCycleAndDepth(root, proposedEdge)` в shared helper
  (не дублировать в product и module service).

Правила depth (канон 300):
- Корень обхода = depth 0.
- Ребёнок = +1.
- Max child depth = 8; попытка создать ребро, дающее path length > 8 → 422.
- Смешанный путь: Product → Module → Module → Material учитывается
  (Material — лист, дальше не идём).

Циклы:
- Self-ref запрещён.
- A⊃…⊃A запрещён, в т.ч. через будущий Product→Product (305): уже
  заложить обход lineType=product если поле появится; если enum ещё без
  product — готовить walker к module+material и legacy.

Legacy в графе (до 304):
- При обходе читать composition если непустой, иначе
  productModuleIds / materials[].
- Нельзя обойти guard записью только в legacy, если composition endpoints
  уже основные — на POST composition guard обязателен; на legacy attachModule
  тоже вызвать тот же assert (если attach остаётся writable).

ШАГ 2: Подключить assert на POST/PATCH composition (module + product).

ШАГ 3: Unit tests (обязательно):
- linear depth 8 ok, 9 fail;
- cycle module A→B→A fail;
- (если stub) product A→product B→product A fail;
- self-ref fail;
- maxDepth query validation для будущего tree (минимум: helper exports).

ШАГ 4: Опционально в этом TZ или явно «следующий кусок Wave 2»:
  `GET /modules/:id/tree?maxDepth=8` и `GET /products/:id/tree?maxDepth=8`.
  Если объём велик — tree endpoints можно оформить мини-шагом в конце 303
  или known_limitation → сразу после 303 отдельным микрофиксом; предпочтение:
  **сделать tree в 303**, раз guards уже есть.

═══════════════════════════════════════════════════════════════
AC
═══════════════════════════════════════════════════════════════

1. Любая попытка цикла → 400/409 с понятным RU/EN сообщением.
2. Depth > 8 → 422.
3. Jest suite catalog-graph-guard: ≥5 кейсов PASS.
4. tsc PASS; e2e не красные.
5. **Cursor** пишет Architect verdict в checklist перед DONE.

НЕ: удаление legacy; Excel; UI.

═══════════════════════════════════════════════════════════════
ПРОМПТ ИСПОЛНИТЕЛЮ
═══════════════════════════════════════════════════════════════

```text
GEMINI.md + TZ-CATALOG-300 §3 + TZ-CATALOG-303.md.
Только guards (+ tree API если влезает в AC). Не migration 304.
Checklist TZ-CATALOG-303.md. После кода — PO: «Cursor, проверь 303».
```
