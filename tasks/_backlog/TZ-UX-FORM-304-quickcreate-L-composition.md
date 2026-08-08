═══════════════════════════════════════════════════════════════
TZ-UX-FORM-304: QuickCreate L — блок Состав (reuse ProductBomPanel)
═══════════════════════════════════════════════════════════════

STATUS: READY

РОЛЬ: Frontend

ЗАВИСИМОСТИ: TZ-UX-FORM-302; ideally FORM-303; product-detail BOM

LAYER: 3

CONFLICT KEYS:
frontend/src/app/shared/ui/quick-create/**;
frontend/src/app/pages/products/product-bom-panel.component.ts;
frontend/src/app/shared/ui/dialog/pi-dialog.component.ts;
docs/audits/2026-08-08-quickcreate-L-full-passport.md;
docs/pages/ui-form-sections-canon.md;
docs/agent-checklists/TZ-UX-FORM-304.md;
docs/agent-checklists/_active-map.md;

НЕ: invent second tree; BE composition rules; deploy; FormProfile keys for BOM

---

## ИСХОДНОЕ

Состав API нужен `productId`. Сейчас QC: POST → close. Нужен поток «создал → остался в диалоге → собрал».

## ЧТО ДЕЛАТЬ

1. L product: после успешного create — **не закрывать** сразу; режим `created` с id.
2. Секция «Состав»: заголовок + те же действия что на карточке («+ Из каталога» и т.д.) через
   **reuse** `ProductBomPanel` (или тонкая обёртка), не новое дерево.
3. Чуть шире dialog L при режиме состава: `min(1100px, 100vw-2rem)` или form xl bump — без kind D 1400.
4. Footer: «Готово» закрывает; состав опционален (можно закрыть с пустым BOM).
5. Module L: same if BOM panel supports rootKind=module; else product-only + known_limitation.

## AC

- [ ] Create L → состав доступен в том же окне на живом id
- [ ] Add from catalog работает как на /products/:id
- [ ] Reuse panel; jest smoke + tsc; archive; push
