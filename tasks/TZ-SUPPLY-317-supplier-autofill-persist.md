═══════════════════════════════════════════════════════════════
TZ-SUPPLY-317: Поставщик — autofill + save карточки
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component Engineer
ЗАВИСИМОСТИ: TZ-SUPPLY-316 (не блокирует; другой concern)
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/supply/supply-quick-order.component.ts; frontend/src/app/pages/supply/supply-quick-order.component.spec.ts

Проверено: `docs/audits/2026-08-23-supply-supplier-fields-audit.md`;
  `patchSupplier` / `patchContact` / `onSupplierChange` в supply-quick-order.component.ts;
  Organization DTO `@IsEmail()` + silent PATCH; PO: выбор поставщика → сайт/почта пустые,
  непонятно как сохранить правку в карточку поставщика.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. Сайт/почта уже читаются из `suppliers()` и пишутся через `patchSupplier` → `orgsSvc.update`.
2. Каждый keystroke → PATCH; `@IsEmail()` режет неполную почту; ошибка silent.
3. Нет UX «это правка поставщика, сохранится само».
4. При выборе поставщика нет `findById` fallback, если live list ещё не подмешан.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Commit сайт/почта по blur + debounce (не keystroke)

- Template: `(ngModelChange)` только обновляет **локальный draft** (или сразу local signal),
  а `PATCH` — на `(blur)` и/или debounce ~500ms после последнего ввода.
- Canonical: один helper `commitSupplierField(supplierId, { website? | email? })`.
- Перед PATCH: `trim`; пустая строка → слать `undefined` / omit (не `''`), чтобы не ломать `@IsEmail()`.
- `switchMap`/cancel предыдущий in-flight PATCH на тот же supplierId+field.
- На `res.ok === false`: toast/inline `data-test="supply-quick-supplier-save-error"`,
  откатить local `suppliers()` к pre-edit значению.
- На успех: короткий индикатор у полей сайт/почта: «сохранено» 1.5s
  (`data-test="supply-quick-supplier-saved"`). Без отдельной кнопки Save.

ШАГ 2: То же для телефона/почты менеджера (`patchContact`)

- blur/debounce + omit empty email; Person update; ошибка видима; откат.
- Не менять layout секций ▸.

ШАГ 3: Выбор поставщика — гарантированный autofill

В `onSupplierChange`:
1. Как сейчас: patch row + load contacts.
2. Если `OBJECT_ID_RE` и у найденного supplier нет website **и** нет email
   (оба falsy) **или** supplier отсутствует в signal — `orgsSvc.findById(id)` и
   `merge` в `suppliers()` через `mapSupplier`.
3. После merge DOM должен показать значения из карточки (тест с flush findById).

ШАГ 4: Микрокопирайт (1 строка, не баннер)

Под группой сайт+почта поставщика (или `title` на inputs):
«Сайт и почта сохраняются в карточке поставщика».
Под телефоном/почтой менеджера:
«Контакты сохраняются у менеджера».
`data-test="supply-quick-supplier-persist-hint"` / `…-manager-persist-hint`.

ШАГ 5: Тесты (обязательные)

1. Выбор mock-поставщика с website/email → inputs показывают значения
   (уже частично есть — усилить assert website+email value после onSupplierChange).
2. commit email valid → один PATCH `/organizations/:id` с email; blur triggers.
3. partial email mid-type **не** шлёт PATCH на каждый символ (после debounce policy —
   либо 0 PATCH until blur, либо ≤1 после debounce с final value).
4. findById path: suppliers без website → onSupplierChange → expect findById → fields filled.
5. PATCH fail → error hook visible + local revert.

ШАГ 6: Gates

```bash
cd frontend
pnpm test -- src/app/pages/supply/supply-quick-order.component.spec.ts
```

Archive + checklist Claim по executor loop. Не трогать CSS Paper & Ink layout.

═══════════════════════════════════════════════════════════════
НЕ ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

- Не добавлять кнопку «Сохранить» в блок (autosave по blur — канон).
- Не писать website/email в SupplyRequest row schema.
- Не бэкенд seed «Лакокраска».
- Не менять material/category filter (316).
- Не трогать чужой WIP.

═══════════════════════════════════════════════════════════════
ACCEPTANCE
═══════════════════════════════════════════════════════════════

- [ ] Выбрал поставщика с сайтом/почтой в API → поля заполнены без ручного ввода.
- [ ] Ввёл сайт/почту → после blur ушло в Organization; повторный выбор / F5 — значения на месте.
- [ ] Невалидная почта не «глотается» молча; ошибка видна.
- [ ] Подсказка про сохранение в карточке видна.
- [ ] Менеджер телефон/почта — тот же контракт.
- [ ] Spec зелёный.

═══════════════════════════════════════════════════════════════
known_limitation
═══════════════════════════════════════════════════════════════

Если в БД у org сайт/почта реально пустые — поля останутся пустыми после select
(это данные, не баг UI). PO правит в справочнике или прямо в этих полях после фикса.
