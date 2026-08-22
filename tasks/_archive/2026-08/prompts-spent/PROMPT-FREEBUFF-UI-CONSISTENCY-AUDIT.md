# PROMPT — Freebuff: аудит визуальной консистентности UI (read-only, без кода)

> Один чат Freebuff. Read-only: **не менять код**, только проверка и отчёт.

Скопируй **весь блок ниже** в новый чат Freebuff и начни немедленно.

---

```text
Ты — аудитор UI kppdf-8.0 (НЕ executor: код не трогаешь). Репо: D:\kppdf-8.0
Прочитай: docs/paper-and-ink.md + docs/DARK-THEME.md + docs/UX-FORM-CANON.md
+ этот файл.

ЦЕЛЬ: найти места во frontend/src, где UI отклоняется от канона Paper & Ink /
Cool Graphite & Gold — разные шрифты/размеры на однотипных элементах, самодельные
диалоги/dropdown вместо общих компонентов, нарушения тёмной темы.

СТРОГО ЗАПРЕЩЕНО:
- Менять любой код (frontend/, backend/, desktop/, mobile/).
- git add / commit / push кроме итогового файла отчёта.
- Deploy / claim в tasks/_active/ — это не executor-задача.

═══ ЧТО ДЕЛАТЬ ═══
1. Отметь в docs/agent-checklists/_NOW.md одной строкой в ACTIVE:
   "AUDIT (read-only): UI consistency — Freebuff, <дата/время>".
2. Найди все диалоговые окна (search по CDK/MatDialog/`app-pi-dialog`/самописным
   модалкам) — сравни разметку/паддинги/заголовки между собой. Список мест, где
   диалог НЕ использует общий shared-компонент, а собран вручную.
3. То же для выпадающих списков (select/dropdown/autocomplete) — найди все
   реализации, отметь, где не переиспользуется общий `Pi*` компонент из
   `frontend/src/app/shared/ui/`.
4. Шрифты/типографика: grep по frontend/src на прямые `font-family`, `font-size`,
   `text-[0-9]px` и подобные значения мимо Tailwind-токенов/дизайн-системы —
   список файл:строка.
5. Тёмная тема — проверь ровно по чек-листу "Anti-goals" из docs/DARK-THEME.md
   (например: `bg-sunrise-warm text-paper`, raw `green-500/700` вместо semantic
   success-токенов, `--color-paper` только в `@layer base .dark`, `color: white`
   на gold/sunrise-warm в dark, `bg-black/[0.02]` вместо paper-2/muted-foreground).
   Для каждого нарушения — grep-совпадение с file:line.
6. Не чини — только фиксируй находки с severity (high = ломает читаемость/a11y
   в dark, medium = визуальная нестыковка, low = мелкая деталь).

═══ СТОП ═══
- Неоднозначно, канон это нарушение или осознанное исключение → помечай
  "UNCERTAIN", не решай сам.

═══ DoD ═══
- Новый файл docs/audits/2026-08-22-ui-consistency-audit.md: разделы «Диалоги»,
  «Dropdown/select», «Типографика», «Тёмная тема (anti-goals)», «Новое
  замечено» — каждая находка с file:line и severity.
- docs/agent-checklists/_NOW.md: строка про аудит помечена done.
- Код не тронут.
- Финальное сообщение: путь к отчёту + сколько находок по severity.
```

---

**Как пользоваться:** один чат Freebuff, ждать финальное сообщение с путём к
отчёту. Фиксы — отдельными точечными TZ по одному компоненту за раз, не разом
(чтобы не сломать приложение, как в прошлых попытках).
