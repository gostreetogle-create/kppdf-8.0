═══════════════════════════════════════════════════════════════
TZ-SALES-303: Семья КП — schema + thin API (слой 1)
═══════════════════════════════════════════════════════════════

> READY (RESERVED) · **schema-first** · полный UX диалогов/expand — successor 304+  
> Канон: flow D21 · метод PO: сначала таблицы/поля, кнопки слоями после браузера  
> Промпт агенту — **только когда PO явно скажет «отдал промпт»**

STATUS: DONE → `tasks/_archive/2026-08/TZ-SALES-303.done.md` (2026-08-08)

РОЛЬ АГЕНТА: Backend (+ минимальный FE read, если нужно увидеть поля)

ЗАВИСИМОСТИ: SALES-301 DONE

LAYER: 4 (BE) / тонкий FE optional

PAGES: `/proposals` (не ломать текущий UI; можно не трогать FE в P0)
PAGE_DOCS: flow canon D21; этот TZ

CONFLICT KEYS:
backend/src/modules/quotation/**;
backend/src/modules/proposal/**;
docs/agent-checklists/TZ-SALES-303.md;
docs/agent-checklists/_active-map.md;
docs/audits/2026-08-08-sales-to-shop-flow-canon.md;
tasks/_backlog/TZ-SALES-304-*.md (создать stub successor);

НЕ: `app.module.ts` если модуль уже зарегистрирован; `supply/**`; deploy; dictionaries; тяжёлый UI multi-select

---

## Цель слоя 1 (забетонировать данные)

Хранить семью КП так, чтобы потом без миграционного ада навесить:
expand в списке, редактор variant, диалог наценок, sync состава.

### Поля (на сущности КП / Quotation — как в коде сейчас)

| Поле | Смысл |
|------|--------|
| `familyRole` | `'solo' \| 'master' \| 'variant'` (default `solo`) |
| `masterId?` | ObjectId → master (только у variant) |
| `organizationId` | наша фирма бланка (уже может быть — проверить; иначе добавить) |
| `familyVersion` | number, default 1 (на master; variant копирует/отображает) |
| `orgMarkupPercent?` | наценка именно этого КП/фирмы (override; default из Organization later) |

Индекс: `{ masterId: 1, organizationId: 1 }` unique sparse (один variant на org в семье).

Lines (productId, qty, скидки линии) — **как сейчас**; не дублировать новую таблицу lines.

### API (thin, без красивого UI)

1. `POST /:id/family/attach-organizations` `{ items: { organizationId, orgMarkupPercent? }[] }`  
   - solo → master; создать variant на org (idempotent).  
2. `POST /:id/family/sync-from-master` — копирует lines master → все variant; bump `familyVersion` на master.  
3. `GET /:id/family` — master + variants summary (id, org, totals, markup, version).  
4. Convert→order: как сейчас; **запрет convert variant** (400 + message) — только master/solo.

### Tests
- attach 2 orgs → 1 master + 2 variant  
- sync qty → variants match  
- convert variant → 400  
- unique org in family  

### FE в этом TZ
**Не обязателен.** Если трогаешь — только показать family badge в списке (optional). Диалог наценок / expand / полный редактор variant → **TZ-SALES-304** (stub создать пустым READY after 303).

## НЕ

- Решать A/B «можно ли править состав на variant» в коде жёстко навсегда — sync-from-master есть; ручной edit lines на variant **не строить** в 303 (поле оставить открытым: lines на variant = копия после sync).  
- Полный print multi UI  
- Переписывать шаблоны документов  

## AC

- [ ] Поля семьи в schema + migration/seed safe  
- [ ] attach + sync + GET family + запрет convert variant  
- [ ] jest PASS; tsc BE PASS  
- [ ] Stub file `TZ-SALES-304-kp-family-ui.md` (1 экран AC: expand+open variant+markup dialog)  
- [ ] archive 303; **commit+push**  

known_limitation: визуальный контроль в браузере — слой 304 после того как PO попробует данные/API или thin UI.
