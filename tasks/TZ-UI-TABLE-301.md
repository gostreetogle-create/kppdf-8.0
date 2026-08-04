═══════════════════════════════════════════════════════════════
TZ-UI-TABLE-301: Table kit — design SoT (docs only)
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend Architect / docs (Mode A style)
ЗАВИСИМОСТИ: нет. ∥ с DICT-308 (другие keys — только docs).
LAYER: 1 (docs)

SoT рядом: docs/superpowers/specs/2026-08-04-group-chip-workspace-design.md §4
Живой код (READ ONLY, не менять): frontend/src/app/shared/ui/pi-table.component.ts

CONFLICT KEYS:
  docs/superpowers/specs/2026-08-04-table-kit-design.md (NEW) ;
  docs/PO-DIARY.md (§5 короткая запись) ;
  tasks/_backlog/ui/README.md (NEW или update) ;
  docs/agent-checklists/TZ-UI-TABLE-301.md ;
  tasks/_active/TZ-UI-TABLE-301.md

ЧТО ДЕЛАТЬ:
1. Прочитай pi-table.component.ts + pi-table-templates + 2–3 page docs
   (materials/products/modules) — только audit, код НЕ трогать.
2. Напиши design SoT: семейство таблиц с ОДИНАКОВЫМ визуалом и разными
   способностями (минимум для CRM):
   - Flat (sort, row actions, pagination)
   - Expandable row (подстрока / состав)
   - Tree / nested (категории; drag optional как capability flag)
   - (опц.) Selectable / dense — если нужно для склада; иначе backlog
3. Зафиксируй: один kit → правка chrome в одном месте; страницы только
   выбирают variant + capabilities.
4. Карта миграции: какие страницы сейчас pi-table / raw table / CDK tree
   (таблица «as-is → to-be»). Child-TZ на код НЕ писать в этом файле
   подробно — только нумерация-предложение TZ-UI-TABLE-302+.
5. Связь с Group Chip Workspace: body группы = одна из table variants.
6. READY FOR REVIEW: короткий блок можно в progress.md + checklist;
   Cursor spot-check docs.

AC:
- SoT файл существует и читается без кода.
- 3+ variants описаны + visual sameness rules.
- as-is inventory (хотя бы справочники + materials/products/modules).
- Явно: НЕ менять frontend/src в этой TZ.
- tsc не требуется (docs-only).

НЕ: править pi-table / pages; DICT-308 files; backend; commit/push без PO;
  archive до Cursor PASS на docs.
