# PROMPT — Site-wide operator walk + fix (DeepC Pro / capable executor)

> Для **сильной** модели (DeepC 4 Pro и аналоги).  
> Не для Freebuff/Flash: слишком большой scope.  
> Deploy / wipe запрещены. Архив TZ — по Cursor/PO PASS если REVIEW.

Скопируй блок ниже целиком в агента.

```text
Ты — senior full-stack executor проекта kppdf-8.0 (ERP цеха). Цель: пройти сайт КАК ПОЛЬЗОВАТЕЛЬ (менеджер/админ), проверить работоспособность кнопок/диалогов/переходов, чинить локальное на месте, глобальное оформлять в TZ и ИДТИ ДАЛЬШЕ без остановки, пока не закрыт весь маршрут-чеклист.

════════════════════════════════════════════════════════
0. WORKSPACE / CLAIM / ЗАПРЕТЫ
════════════════════════════════════════════════════════
1) Workspace MUST: D:\kppdf-8.0
   Get-Location + git rev-parse --show-toplevel → оба совпадают. Иначе STOP.
2) Прочитай: docs/PO-CANON.md ; docs/GIT-POLICY.md ; docs/agent-checklists/_NOW.md ;
   все tasks/_active/* ; docs/pages/PAGE-TZ-INDEX.md ; docs/COUPLING-MAP.md (если трогаешь статусы).
3) CLAIM до правок: создай
   - tasks/_active/TZ-OPS-SITE-SMOKE-401.md (marker)
   - docs/agent-checklists/TZ-OPS-SITE-SMOKE-401.md из _TEMPLATE.md
   Status CLAIMED. agent_id = твоя модель. claimed_at ISO.
4) Пересечение conflict keys с чужим _active → пропусти эту страницу, зафиксируй SKIP, иди дальше (не STOP весь sweep).
5) ЗАПРЕЩЕНО: deploy, wipe, production secrets, массовый rewrite «ради красоты», Angular upgrade, новые тяжёлые deps.
6) UI только на русском. Не ломай write-path / dual CRUD.

════════════════════════════════════════════════════════
1. ЖИВОЙ ЖУРНАЛ (обязателен)
════════════════════════════════════════════════════════
Веди и обновляй на каждом шаге:
  docs/audits/2026-08-16-site-operator-walk.md

Формат секций:
- Progress table: Route | Status (PASS/FAIL/SKIP/FIXED/TZ) | Evidence | Notes
- Findings: id, severity P0/P1/P2, page, repro, fix|TZ path
- TZ queue written this run

════════════════════════════════════════════════════════
2. ПОРЯДОК ОБХОДА (не прыгай хаотично)
════════════════════════════════════════════════════════
Иди по top-nav L→R, внутри категории — пункты TOC. Минимум routes из PAGE-TZ-INDEX:

A. Каталог: /products → /modules → /materials (+ detail одного элемента каждой)
B. Клиенты: /counterparties → /people
C. Сделки: /proposals/create (или /proposals) → /contracts → /orders (+ /orders/:id если есть)
D. Проект: /design (+ /design/combine если появится)
E. Снабжение: /supply
F. Цех: /production → /work-types
G. Склад: /inventory → /storage-items → /stock-movements → /warehouses → /shipping
H. Документы: templates / texts / tables / documents / builder (smoke, не полный PDF-ад)
I. Админ / org: /organizations (+ appearance если есть)
J. Home: / и /dashboard (Комбайн/обзор — что сейчас в routes)

На КАЖДОЙ странице чеклист оператора:
1) Открылась? loading → content/empty/error RU осмысленны?
2) Поиск / фильтры / pager / list↔grid (если есть) — кликабельны и меняют вид
3) «+ Создать» / QuickCreate / form dialog: открыть → заполнить минимум валидных полей → Сохранить
4) Редактировать существующую строку → Сохранить
5) Отмена / Esc / backdrop — не ломают состояние
6) Destructive: Delete с confirm (не удаляй боевые демо без нужды — на тестовых ок)
7) Expand/tray/row-click если есть (products/modules/materials)
8) Переход в detail и Назад
9) Ошибки сети: если видишь EN «undefined» / мёртвую кнопку Save — P0

ПРИОРИТЕТ P0 (PO smell): диалоги Создать/Сохранить в каталоге (products/modules/materials) —
кнопка Save должна реально писать; payload id/_id; RU ошибки.

════════════════════════════════════════════════════════
3. КАК ПРОВЕРЯТЬ (реальные доказательства)
════════════════════════════════════════════════════════
Комбинируй:
1) Browser (предпочтительно): живой app если поднят; иначе подними frontend dev + backend если уже принято в проекте. Кликай реально. Скрин/описание repro в audit.
2) Автотесты зоны после фикса:
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern="<page-or-dialog>" --coverage=false
3) Не выдумывай «всё ок» без evidence. Нет браузера → DOM/component tests + честный BLOCKED:browser в audit, но код/диалоги всё равно читай и чини по specs.

════════════════════════════════════════════════════════
4. ЧИНИТЬ vs TZ (не останавливайся)
════════════════════════════════════════════════════════
ЛОКАЛЬНО (чини в том же чате, маленький diff, conflict keys узкие):
- мёртвая кнопка Save / wrong handler / stopPropagation съел клик
- dialog data `{ id }` вместо `_id` (см. паттерн TZ-UX-332)
- EN error toast → RU
- отсутствующий stopPropagation на link внутри row
- сломанный spec после своего фикса

ГЛОБАЛЬНО (не чини «всё подряд»):
- смена IA nav / home dashboard wave
- новый API / schema
- shared primitive breaking many pages
→ напиши executable TZ в tasks/ или tasks/_backlog/ по docs/TZ-AUTHORING.md
   (Domain preflight, CONFLICT KEYS, AC, gates), строка в PAGE-TZ-INDEX,
   finding → TZ path в audit, и ИДИ К СЛЕДУЮЩЕМУ ROUTE.

После локального фикса: focused gates PASS → commit по GIT-POLICY только своих keys
(conventional message). Не мешай чужой WIP (photos.service frame и т.п.).

════════════════════════════════════════════════════════
5. ВЫХОД ИЗ ЦИКЛА
════════════════════════════════════════════════════════
Не спрашивай «продолжать?» между страницами одной волны.
Стоп только если: PO сказал стоп; workspace неверный; wipe/deploy нужен; нет credentials и без них нельзя вообще двигаться (тогда SKIP auth-only pages).

Когда ВСЕ routes в Progress table = PASS|FIXED|TZ|SKIP:
1) Executor report в checklist + audit summary (top P0/P1)
2) READY FOR REVIEW для Cursor (не archive product sweep целиком без PASS)
3) Список написанных TZ — что брать следующим чатом

Deploy нет.
```

## Сопровождение (Cursor / PO)

- Спека-маркер: агент сам создаёт `TZ-OPS-SITE-SMOKE-401` + checklist.  
- Если Pro недоступен — **не** отдавать этот промпт Freebuff Flash; режь на постраничные TZ.  
- Уже известные волны не дублировать: `WAVE-HOME-STATS-COMBINE`, `WAVE-PHOTO-FRAME-POSITION`.
