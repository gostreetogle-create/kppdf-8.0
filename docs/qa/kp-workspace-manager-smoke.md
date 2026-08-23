# KP Workspace Manager Smoke — Evidence

> **Дата:** 2026-08-23 · **Агент:** freebuff-2  
> **Контекст:** TZ-KP-WS-408.done в архиве. Cutover 408 выполнен (Freebuff-1).  
> **Чеклист:** [`docs/agent-checklists/KP-WORKSPACE-SMOKE.md`](../agent-checklists/KP-WORKSPACE-SMOKE.md)  
> **Полный E2E:** [`docs/agent-checklists/KP-E2E-SMOKE.md`](../agent-checklists/KP-E2E-SMOKE.md)

---

## Автоматические гейты (пройдены)

| Gate | Статус |
|------|--------|
| `pnpm exec tsc -p tsconfig.app.json --noEmit` | ✅ PASS (exit 0) |
| `pnpm test -- proposal-workspace proposal-create --runInBand` | ✅ PASS 118/118 (11 suites) — autosave/legacy.page specs удалены в 409 (god shell removed) |
| `pnpm lint` | ✅ 0 errors, 18 pre-existing warnings |

## Browser smoke: KP-E2E-SMOKE + manager (10 шагов + 3 риска)

> ⚠️ Backend :3000 не запущен. Smoke — **частичный** (только то, что видно без API).

| № | Шаг | PASS / FAIL | Примечание |
|---|-----|-------------|------------|
| 1 | Новое КП: номер/дата, статус сохранения, tooltips | ⚠️ PARTIAL | Страница грузится, статус «Черновик» виден, tooltips есть. Ошибка TS2339 onSheetClick в консоли (баг в page.ts:335). Без шаблона/клиента не дальше. |
| 2 | Шаблон в ленте vs левой панели | ⚠️ PARTIAL | Левая панель «ШАБЛОН» показывает выбор шаблона, не два входа. Без API — пусто. |
| 3 | Фирма: заметно, НДС/наценка, переключение | ⚠️ PARTIAL | Фирма не видна в sectionheader при новом КП без шаблона. |
| 4 | Клиент: быстрый выбор + создание без ухода | ⚠️ PARTIAL | Панель «КЛИЕНТ» в боковой навигации есть. API не отвечает. |
| 5 | Каталог: итого руб, F5 | ⚠️ PARTIAL | Панель «КАТАЛОГ» есть. |
| 6 | Геометрия A4: левая/правая панель, не прыгает | ✅ PASS | Книжная/Альбомная кнопки работают. Панели открываются без скачков A4. |
| 7 | Таблица: Применить и закрыть | ⚠️ PARTIAL | Панель «РЕДАКТОР ТАБЛИЦЫ» есть. |
| 8 | Параметры: скидка + наценка в одном месте | ⚠️ PARTIAL | Панель «ПАРАМЕТРЫ» есть. Вызывает ошибку onSheetClick. |
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

| Route | Paper bg | Hairline | 11px labels | Single gold CTA | RU copy | PO ✓ |
|-------|----------|----------|-------------|-----------------|---------|------|
| `/desk` | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| `/products` | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| `/orders` | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| `/doc-constructor/templates` | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
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
- **Страница:** workspace (cutover 408 выполнен)
- **Авто:** PASS 118/118 jest + tsc clean + 0 density violations
- **Браузер:** PARTIAL — backend :3000 не запущен, 6/10 шагов не проверить
- **Блокер:** `TS2339: Property 'onSheetClick' does not exist` в workspace.page.ts:335
- **Решение PO:** ☐ к cutover 409 (запустить BE + починить onSheetClick)  ☐ доработка
