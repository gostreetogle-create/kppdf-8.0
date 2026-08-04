═══════════════════════════════════════════════════════════════
TZ-DICT-300: Dictionaries — канон UX/IA (master)
═══════════════════════════════════════════════════════════════

> Domain preflight: «Справочники» = FE pages under nav `reference` +
> routes `/dictionaries*`, `/categories`, `/doc-template-categories`.
> Не путать с каталогом Product/Module/Material (CATALOG-*).
>
> Audit: `docs/audits/2026-08-04-dictionaries-ux-ia-audit.md`
> Wave: `tasks/DICT-WAVE1.md`
> PO smell: половина экрана — тексты; нет sticky search/filter/sort;
> таблицы/CRUD/drag не как один люксовый каталог; меню плоское.

РОЛЬ: Cursor Mode A (канон) · исполнители — child TZ

LAYER: 0 (docs / orchestration)

DEPENDS: нет (∥ CATALOG-304 backend OK — разные conflict keys)

CONFLICT KEYS:
  tasks/TZ-DICT-300.md;
  tasks/DICT-WAVE1.md;
  tasks/_backlog/dictionaries/**;
  docs/audits/2026-08-04-dictionaries-ux-ia-audit.md;
  docs/agent-checklists/_active-map.md (строка DICT)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

Проверено: `dictionaries.page.ts` (Units на /dictionaries),
`categories.page.ts` (bloat header+section), `color-references.page.ts`,
`app-layout.component.ts` nav `reference`, `docs/pages/dictionaries.page.md`,
`docs/pages/categories.page.md`, PO-DIARY §1–§2.

═══════════════════════════════════════════════════════════════
КАНОН (D1–D4)
═══════════════════════════════════════════════════════════════

D1. **Chrome:** title only (+ optional count). Запрещены: eyebrow
    «раздел · справочники»; длинный description; section title/hint,
    дублирующие toolbar.

D2. **Dictionary List Shell:** sticky bar = search + optional filters +
    optional sort + primary CTA + compact total. Прилипает к таблице/дереву.
    Paper & Ink, hairline, русский UI.

D3. **Hub:** `/dictionaries` = карточки-оглавление, не Units.
    Units → `/dictionaries/units` (+ redirect со старого поведения).

D4. **Nav groups:** Классификация / Измерения / Оформление / Документы
    (+ Обзор). Без новых backend entities.

═══════════════════════════════════════════════════════════════
CHILD ORDER
═══════════════════════════════════════════════════════════════

301 audit confirm (optional if audit file already accepted)
→ **302** Dictionary List Shell (shared) — SERIAL
→ **303** Hub + nav IA
→ parallel page cutovers: **304** Units · **305** Categories · **306** Colors · **307** Doc+Text cats

∥ с CATALOG-304/305: да для DICT FE; нет если трогают те же shared UI files что другой FE.

═══════════════════════════════════════════════════════════════
НЕ
═══════════════════════════════════════════════════════════════

НЕ: CATALOG composition/migration; Product/Module pages; Z-002 full DSL;
  новые сущности справочников; удаление Category types.
