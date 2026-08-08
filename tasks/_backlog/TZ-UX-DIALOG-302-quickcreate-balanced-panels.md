═══════════════════════════════════════════════════════════════
TZ-UX-DIALOG-302: Канон диалогов + QuickCreate шире / 2 колонки
═══════════════════════════════════════════════════════════════

> READY · canon: `docs/audits/2026-08-08-dialog-layout-canon.md`  
> + `docs/DIALOG-COOKBOOK.md`

STATUS: READY

РОЛЬ: Frontend

LAYER: 3

PAGES: products/modules QuickCreate; shared dialog docs
CONFLICT KEYS:
frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts;
frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts;
frontend/src/app/pages/products/products.page.ts;
frontend/src/app/pages/modules/modules.page.ts;
frontend/src/app/shared/ui/dialog/pi-dialog.component.ts;
docs/DIALOG-COOKBOOK.md;
docs/audits/2026-08-08-dialog-layout-canon.md;
docs/pages/ui-dialog-canon.md;
docs/agent-checklists/TZ-UX-DIALOG-302.md;
docs/agent-checklists/_active-map.md;

---

## ЧТО ДЕЛАТЬ

### 1. Docs эталон
- Обновить `DIALOG-COOKBOOK.md` § Width: kinds A–D из audit; правило «prefer width over height for dense forms».  
- Создать короткий `docs/pages/ui-dialog-canon.md` (ссылка на cookbook + таблица kinds) — эталон для будущих TZ.

### 2. QuickCreate layout
- `SIZE_TO_WIDTH`: S→`md`, M→`lg`, L→`xl` (или L + maxWidth min(920px,…)).  
- Body fields: CSS grid `grid-cols-1 md:grid-cols-2` gap when size M или L (и/или visibleKeys.length ≥ 4).  
- Ограничить высоту body (max ~70vh) + scroll; footer не уезжает.  
- Opener на products/modules: не фиксировать узкий `width:'md'` если мешает — согласовать с shell (можно не передавать width, пусть решает компонент).

### 3. PiDialog (только если нужно)
- Если xl для form недостаточно — один аккуратный bump form xl → min(880–920px) **или** maxWidth path; не плодить 5 новых tier.

### 4. Audit grep (в checklist / audit md)
- Список `dialog.open(` с width/maxWidth — отметить outliers vs A–D (таблица).  
- Не рефакторить все FullEditor в этом TZ (кроме явного конфликта с QuickCreate).

### 5. Tests
- QuickCreate spec: dialogWidth S/M/L mapping; optional grid class present for L.  
- FE tsc PASS.

## НЕ

- Новые Overlay / свои модалки  
- Менять FieldKey / API profiles  
- Production cockpit; deploy  
- Переписывать все material/product FullEditor «заодно»  

## AC

- [ ] Cookbook + ui-dialog-canon.md с kinds A–D  
- [ ] QuickCreate L заметно шире, не на всю высоту без ширины; M/L 2-col  
- [ ] products/modules create opener согласован  
- [ ] Outliers table в audit  
- [ ] jest quick-create + tsc PASS; archive; push  

known_limitation: полное выравнивание всех legacy form-dialogs → successors по таблице outliers.
