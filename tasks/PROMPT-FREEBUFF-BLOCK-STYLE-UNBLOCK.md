# PROMPT — Freebuff · D1 UNBLOCK: снять ложные блокеры и закрыть волну

Два из четырёх блокеров оказались ложными, проверено Курсором. Копировать блок целиком.

```text
Ты — executor kppdf-8.0, продолжаешь свою волну
TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE (claim держится, новый не создавать).
git fetch origin ; git merge origin/main — Курсор уже закоммитил твой код.

ПРОВЕРЕНО КУРСОРОМ, факты вместо твоих предположений:

1) СТЕНД ЖИВ. Ты написал «стенд недоступен» — это не так. Backend отвечает на
   http://127.0.0.1:3000/api (health: GET /api/health → 200), frontend на :4200.
   Префикс /api — вот почему ты его не нашёл. Логиниться как в
   scripts/smoke/supply-smoke.mjs (роль admin).
   → Живая проверка PDF ВОЗМОЖНА и остаётся единственной реальной задачей.

2) ПОЛНЫЙ BACKEND-ТЕСТ ЗЕЛЁНЫЙ. Прогнано целиком: 117 сьютов, 1084 теста,
   0 падений. Твой блокер по sanitizer/jsdom устарел после твоей же починки —
   ты просто не перезапустил. Перезапусти и убедись сам.

3) LINT — твой блокер ПРАВДИВ, но это не блокер волны. pnpm lint в backend даёт
   51 ошибку в 63 файлах (47 no-unused-vars + 4 no-var-requires) плюс 198
   warning no-explicit-any. Ни одного из них нет в твоих файлах: block-style.ts,
   block-content-sanitizer.ts, block-style.css.ts, font.menu.ts,
   document-render.service.ts, template-block.* — чистые.
   → Запиши в known_limitation ИМЕННО ЭТИМИ ЦИФРАМИ и путями. НЕ запускай --fix
   на чужих файлах. Долг закроет отдельная TZ.

4) architecture:check — 3 старых нарушения в frontend/**, зона тебе запрещена.
   known_limitation, не блокер.

5) ТВОЙ КОД УЖЕ В GIT: коммит e7157e07 (29 файлов). Шрифты Tinos /
   Liberation Sans / Carlito с OFL-лицензиями, @font-face, COPY в Dockerfile и
   раздача через /fonts/ — решение принято, НЕ переделывай.
   Коммить теперь только свои файлы закрытия. Чужой WIP не подхватывать:
   backend/src/common/**, backend/src/modules/auth/**, backend/src/modules/unit/**.

ОСТАЛОСЬ СДЕЛАТЬ:

A) Живое доказательство на стенде: создать шаблон и блок с style
   (fontFamily из белого списка, fontSizePt, color, align), получить блок
   назад, отрендерить HTML и PDF. Доказать, что в выводе именно выбранная
   гарнитура и размер, а не молчаливая подстановка: показать в HTML
   font-family и @font-face, а в PDF — извлечённый список встроенных шрифтов
   либо визуальное сравнение двух гарнитур на одном блоке.
   Отдельно прогнать РЕГРЕСС живьём: блок без style рендерится как до волны.
   Артефакты в docs/agent-checklists/evidence/TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE/
B) Перезапустить pnpm test в backend, записать числа в ## Gates.
C) Status DONE, Integrity slot, ## Executor report (auto) — 5 полей и полный
   40-символьный SHA, архив
   tasks/_archive/2026-08/TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE.done.md +
   ARCHIVE_MARKER, удалить tasks/_active/TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE.md,
   progress.md, _NOW.md, PAGE-TZ-INDEX.md, FIC §A, commit/push своих файлов.

Если живое доказательство PDF физически не получается — это единственная
причина остаться BLOCKED, и тогда напиши ровно, какая команда и с какой ошибкой
падает. Остальные три пункта блокерами больше не считаются.
```
