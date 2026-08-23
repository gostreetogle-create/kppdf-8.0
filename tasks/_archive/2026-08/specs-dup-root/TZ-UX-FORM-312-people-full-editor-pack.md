═══════════════════════════════════════════════════════════════
TZ-UX-FORM-312: FullEditor людей — упаковать поля
═══════════════════════════════════════════════════════════════

> Канон: `docs/pages/ui-form-field-capacity.md`. Сущность **Worker** (People), не User.

РОЛЬ АГЕНТА: Frontend UI Engineer (Freebuff)

ЗАВИСИМОСТИ: FORM-308 DONE. Параллель: FORM-313 `order-form-panel` — другие файлы.

LAYER: 3

PAGES: /people
PAGE_DOCS: people.page.md

CONFLICT KEYS: frontend/src/app/pages/people/people-form-dialog.component.ts; frontend/src/app/pages/people/people-form-dialog.component.spec.ts

Проверено: `people-form-dialog.component.ts` ~61 `sm:grid-cols-3` ФИО (равные колонки ок по смыслу); ~114 и ~133 `sm:grid-cols-2` должность|отдел и email|телефон (телефон на полширины). Секции `app-pi-form-section` оставить. Spec-файла нет — создать тонкий. Payload/FormControl names не менять.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Сетка 12-col внутри секций

- ФИО: `md:grid-cols-12`, три поля по `md:col-span-4` (не обязательно менять, если уже три равных).
- Должность / отдел: не 50/50 если отдел короткий — должность `md:col-span-8`, отдел `md:col-span-4` **или** оба sm; не два full-bleed.
- Email `md:col-span-8`; телефон `md:col-span-4` + `max-w` ~14rem / `text-right` не обязателен. Не `w-full` на полдиалога для телефона.
- Заметки: rows не увеличивать. Виды работ / чекбоксы не раздувать.

ШАГ 2: Хелперы `colSpanClass`/`controlMaxClass` если ключи есть; иначе литералы. Не править `field-capacity.ts`. Если `app-pi-input` не берёт class — обёртка/style как FORM-310/311.

ШАГ 3: Новый `people-form-dialog.component.spec.ts` — телефон не в `sm:grid-cols-2` паре на полширины; те же data-test.

НЕ: order-form-panel, product/module/material dialogs, User/admin, backend, git add -A, деплой.

Gates:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- people-form-dialog --runInBand
cd frontend && pnpm lint
```

Archive: `tasks/_archive/2026-08/TZ-UX-FORM-312.done.md`. Без деплоя.
