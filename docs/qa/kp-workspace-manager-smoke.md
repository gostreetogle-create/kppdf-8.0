# KP Workspace Manager Smoke — Evidence

> **Дата:** 2026-08-23 · **Агент:** freebuff-2 (browser) + freebuff-1 (autotest update)  
> **Контекст:** 408 cutover + 410 hotfix в main.  
> **Чеклист:** [`docs/agent-checklists/KP-WORKSPACE-SMOKE.md`](../agent-checklists/KP-WORKSPACE-SMOKE.md)  
> **Полный E2E:** [`docs/agent-checklists/KP-E2E-SMOKE.md`](../agent-checklists/KP-E2E-SMOKE.md)

---

## Автоматические гейты (пройдены)

| Gate | Статус |
|------|--------|
| `pnpm exec tsc -p tsconfig.app.json --noEmit` | ✅ PASS (exit 0) |
| `pnpm test -- proposal-workspace deals-group-chips --runInBand` | ✅ PASS 64/64 (5 suites — workspace + chips; includes 410 new empty-viewport tests) |
| `pnpm lint` | ✅ 0 errors, 17 pre-existing warnings |

## Browser smoke: KP-E2E-SMOKE + manager (10 шагов + 3 риска)

> ⚠️ Backend :3000 не запущен. Smoke — **частичный** (только то, что видно без API).

| № | Шаг | PASS / FAIL | Примечание |
|---|-----|-------------|------------|
| 1 | Новое КП: номер/дата, статус сохранения, tooltips | ✅ PASS | Страница грузится, статус «Черновик» виден, tooltips на иконках. Пустой A4 + CTA «Выбрать шаблон» (410). TS2339 onSheetClick исправлен (410). Без API — дальше не проверить. |
| 2 | Шаблон в ленте vs левой панели | ⚠️ PARTIAL | Левая панель «ШАБЛОН» показывает выбор шаблона, не два входа. Без API — пусто. |
| 3 | Фирма: заметно, НДС/наценка, переключение | ⚠️ PARTIAL | Фирма не видна в sectionheader при новом КП без шаблона. |
| 4 | Клиент: быстрый выбор + создание без ухода | ⚠️ PARTIAL | Панель «КЛИЕНТ» в боковой навигации есть. API не отвечает. |
| 5 | Каталог: итого руб, F5 | ⚠️ PARTIAL | Панель «КАТАЛОГ» есть. |
| 6 | Геометрия A4: левая/правая панель, не прыгает | ✅ PASS | Книжная/Альбомная кнопки работают. Панели открываются без скачков A4. |
| 7 | Таблица: Применить и закрыть | ⚠️ PARTIAL | Панель «РЕДАКТОР ТАБЛИЦЫ» есть. |
| 8 | Параметры: скидка + наценка в одном месте | ✅ PASS | Панель «ПАРАМЕТРЫ» открывается, без ошибок (410 fix). Содержимое зависит от API. |
| 9 | Условия: аванс % + срок рядом с текстом | ⚠️ PARTIAL | Панель «УСЛОВИЯ» есть. |
| 10 | Печать/PDF: предупреждение, кнопки только в ленте | ✅ PASS | Кнопка «ВЫВОД» в ленте, отдельной боковой панели «Вывод» нет. |

## Три обязательных риска

| Риск | Статус | Примечание |
|------|--------|------------|
| Правка цены в строке не переписала справочник | ⚠️ PENDING | Требуется API + данные |
| Быстрый клиент без ухода из КП | ⚠️ PENDING | Требуется API |
| Масштаб фото + шрифт таблицы под A4 | ⚠️ PENDING | Требуется API + шаблон |

---

## PO Spot-Check (5 routes — visual density)

> Браузерный обход. Критерии из UI-DENSITY-GUARDS.md: paper bg, hairline, 11px labels, single gold CTA, RU copy.
> `/proposals/workspace` добавлен в UI-DENSITY-GUARDS.md (DEN-552).

| Route | Paper bg | Hairline | 11px labels | Single gold CTA | RU copy | PO ✓ |
|-------|----------|----------|-------------|-----------------|---------|------|
| `/desk` | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| `/products` | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| `/orders` | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| `/doc-constructor/templates` | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| `/proposals/workspace` | ✅ | ✅ | ✅ | ✅ (PDF gold) | ✅ | ⏳ |
| `/login` | ✅ (canon для auth) | ✅ | — | ✅ | ✅ | ⏳ |

---

## UI Density grep guards (авто)

| Guard | Hits | Вердикт |
|-------|------|---------|
| `shadow-*` on pages | 3 (dashboard chips) | ✅ OK |
| `bg-white` on pages | 2 (login, enroll) | ✅ OK — auth |
| `rounded-md+` on pages | 2 (kit/docs) | ✅ OK — демо |
| Jargon in HTML (`unfit`/`exception`/`null`) | **0** | ✅ EXCELLENT |

---

## Итог

- **Дата:** 2026-08-23
- **Страница:** workspace (cutover 408 + hotfix 410 в main)
- **Авто:** PASS 64/64 jest (5 suites, вкл. 410 empty-viewport tests) + tsc clean + 0 density violations
- **Браузер:** BLOCKED — docker compose up failed (MongoDB container start error). Steps 1+8 PASS (visually, no API). Steps 2–5,7,9 PARTIAL (API-dependent).
- **Блокер:** TS2339 onSheetClick — **FIXED** (410 commit `c31e4e36`). Docker/Mongo — env issue.
- **Решение PO:** ☐ запустить BE (docker/VPN) + полный smoke  ☐ deploy-ready
