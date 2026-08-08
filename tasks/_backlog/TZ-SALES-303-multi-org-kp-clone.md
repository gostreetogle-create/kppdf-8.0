═══════════════════════════════════════════════════════════════
TZ-SALES-303: Семья КП — master + варианты Organization + sync
═══════════════════════════════════════════════════════════════

> READY · канон D21 (уточнён PO 2026-08-08): не «мёртвые копии», а **главное КП**  
> + связанные по фирмам; правка состава в master → sync вариантов.  
> `docs/audits/2026-08-08-sales-to-shop-flow-canon.md`

STATUS: READY — если агент уже CLAIM по старой спеке «независимый clone» → **перечитай этот файл** и доведи до AC ниже (не archive на half-bake).

РОЛЬ АГЕНТА: Backend + Frontend (proposals / quotation)

ЗАВИСИМОСТИ: SALES-301 DONE

LAYER: 3

PAGES: `/proposals`
PAGE_DOCS: flow canon D21; proposals page note

CONFLICT KEYS:
backend/src/modules/quotation/**;
backend/src/modules/proposal/**;
frontend/src/app/pages/commercial/proposals/**;
docs/agent-checklists/TZ-SALES-303.md;
docs/agent-checklists/_active-map.md;
docs/audits/2026-08-08-sales-to-shop-flow-canon.md;

НЕ трогать: `app.module.ts` / `supply/**` (SUPPLY-301); deploy; dictionaries; orders tree

---

## Domain preflight

| Слово PO | Код-канон |
|----------|-----------|
| Главное КП | Quotation/Proposal с `familyRole: 'master'` (или `isMaster: true`) |
| КП других фирм | `familyRole: 'variant'`, `masterId`, `organizationId` |
| Фирма на бланке | **Organization** ≠ Counterparty |
| Состав/qty правятся | **только на master** → sync lines на все variant |
| Цена варианта | пересчёт: строки master × наценка/правила Organization (− скидки линии если есть) |
| Версия | `familyVersion` (число) на master; при sync после того как семья уже создавалась — +1; UI «v1 / v2» или `.1` в номере — выбрать один формат и задокументировать |

Семья: 1 master → N variant (разные organizationId). Заказчик (counterparty) общий.

**Ещё не в коде** (проверить grep) — реализовать с нуля в этом TZ.

---

## ЧТО ДЕЛАТЬ

### 1. Модель семьи
- Поля на КП: `masterId?`, `familyRole: 'master'|'variant'|'solo'`, `familyVersion` (master), `organizationId` обязателен у variant.  
- Solo = обычное КП без семьи (как сейчас).

### 2. API
- `POST /…/:id/expand-for-organizations` `{ organizationIds[] }` — id должен быть master или solo→становится master; создаёт/обновляет variant на каждую org (idempotent: повторный вызов не плодит дубли той же org).  
- `PATCH` линий **только master** (variant lines read-only или 400).  
- При изменении lines master → sync productId+qty (+скидки состава если живут на линии) во все variant + пересчёт сумм + `familyVersion++` (если уже были variant).  
- `GET` list: для master отдавать `variantCount` / `variants[]` summary (org name, id, total).

### 3. UI список КП
- Строка master (или solo): клик/chevron → **раскрытие** связанных variant (фирма, номер, сумма, ссылка открыть).  
- Variant в плоском списке можно скрыть или показать indented — default: **в основном списке только master/solo**, variant видны в expand (меньше шума).  
- Действие «Для нескольких фирм…» на master → multi-select Organization → expand-for-organizations.  
- Редактирование состава — экран/диалог **master**; на variant — баннер «состав с главного КП, правка там» + печать.

### 4. Печать
- Печать variant как сейчас (свой шаблон org).  
- После sync master — перепечатать variant без пересоздания семьи.

### 5. Tests + docs
- Sync qty на master → все variant qty совпали; totals могут отличаться (markup).  
- Expand list API/UI.  
- Не ломать convert master→order (variant в заказ **не** конвертить без явного — default convert только master/solo).  
- RU docs short; **commit+push** после PASS.

## НЕ

- Независимые «мёртвые» клоны без sync (старая формулировка — отменена)  
- Split заказа; Counterparty как «фирма бланка»  
- Полный архив отправок по почте (достаточно familyVersion + при желании thin versions[] later SALES-302)  
- SUPPLY / NAV / deploy  

## AC

- [ ] Семья master + N variant по Organization  
- [ ] Список: expand строки → связанные фирмы  
- [ ] Правка состава/qty на master → sync variant + version bump  
- [ ] Variant не правит состав сам; печать variant ок  
- [ ] Convert в заказ — только master/solo (или явно задокументированный выбор)  
- [ ] tsc + jest зоны PASS; archive; **git push**  

known_limitation: красивая «точка в номере КП-12.3» может быть display от familyVersion; полная история каждого send — SALES-302 если не влезло.
