═══════════════════════════════════════════════════════════════
TZ-UX-312: Состав — крупнее фото, плотнее строка
═══════════════════════════════════════════════════════════════

STATUS: READY · **HOT** (PO после UX-311)

РОЛЬ: Frontend (composition-tree only)

ЗАВИСИМОСТИ: TZ-UX-311 DONE

LAYER: 3

PAGES: /products/:id ; /modules/:id ; orders detail BOM
PAGE_DOCS: ui-composition-tree.md

Проверено: composition-tree — thumb `w-5 h-5` (20px); row `px-2 py-1.5 min-h-9`;
  PO: фото мелкое; увеличить по высоте; внутренние отступы ближе к краю (~0.5mm);
  шапку строки чуть выше (~+3mm).

CONFLICT KEYS:
frontend/src/app/shared/ui/composition/composition-tree.component.ts;
frontend/src/app/shared/ui/composition/composition-tree.component.spec.ts;
docs/pages/ui-composition-tree.md;
docs/agent-checklists/TZ-UX-312.md;
docs/agent-checklists/_active-map.md;
tasks/_backlog/QUEUE.md;

НЕ: catalog-graph API; BomPanel logic; QuickCreate; DEDUP-*; app-layout; deploy

PARALLEL OK с long-haul (DEDUP-302…UX-310) — не трогать их файлы.

---

## ЧТО ДЕЛАТЬ

1. **Thumb:** увеличить до ~**36–40px** (`h-9 w-9` или `h-10 w-10`), `rounded-sm`, `object-cover`,
   placeholder той же коробки. Цель: фото доминирует по высоте строки рядом с текстом.
2. **Строка (header карточки узла):**
   - чуть выше: ориентир `min-h-11` / `min-h-12` (≈ +2–3mm к нынешнему);
   - плотнее к краям: `px-1` (или `px-1.5`), `py-1`, `gap-1` — минимум «воздуха»,
     визуально ~0.5mm–2px у краёв, без обрезки focus-ring/badge.
3. Имя: сохранить `line-clamp-2 break-words`; выровнять `items-center` или
   `items-center` с thumb (текст может быть 2 строки — thumb по вертикали центр).
4. Не раздувать nest padding (`comp-tree__nest`) в этом TZ — только row header.
5. Docs: одна строка в ui-composition-tree (thumb size + density).
6. Jest: data-test thumb size class / snapshot classes.

## AC

- [ ] Thumb заметно крупнее 20px (≥36px)
- [ ] Меньше внутренний padding строки; текст/фото ближе к краям
- [ ] Строка чуть выше; длинные имена по-прежнему 2 строки
- [ ] jest composition-tree + tsc PASS; archive; push; deploy нет

Verification:
```
cd frontend && pnpm exec jest src/app/shared/ui/composition/composition-tree.component.spec.ts --no-cache
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
```
