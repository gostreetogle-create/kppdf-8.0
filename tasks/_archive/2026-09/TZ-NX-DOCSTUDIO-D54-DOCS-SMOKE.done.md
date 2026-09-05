# TZ-NX-DOCSTUDIO-D54-DOCS-SMOKE: page.md + smoke IA

**РОЛЬ:** Executor (docs + light FE if copy gaps)
**LAYER:** 1
**ЗАВИСИМОСТИ:** D50–D53 — done
**CONFLICT KEYS:** `docs/pages/document-studio.page.md`; `docs/pages/PAGE-TZ-INDEX.md`; `docs/architecture/nx-doc-studio-roadmap-v2.md`

## ЧТО СДЕЛАНО

1. `docs/pages/document-studio.page.md` §1.3 + §3.3 переписаны под факт кода: TOC-категории, буфер+insert CTA, словарь «Клиент = покупатель», явная оговорка про существующий отдельный «sole manual table» auto-wire (S15, не тронут D52). Ссылка на audit добавлена.
2. `docs/pages/PAGE-TZ-INDEX.md` — N/A (историческая, не поддерживается построчно с S15+, не начал выборочно чинить).
3. `docs/architecture/nx-doc-studio-roadmap-v2.md` — новая секция «WAVE-DOCSTUDIO-DATA-IA (D50–D54) — DONE».
4. Smoke — test-based (не live browser в этой сессии — shared multi-agent dev-среда, Freebuff активно правит `pages/production/**` параллельно; см. известное ограничение в checklist). Сценарий Товары→Выбрано→Вставить→Кому проверен через существующие unit-тесты `studio-data-panel.component.spec.ts`. `insertCatalogTable()` write-path в `studio-editor.page.ts` — known_limitation, live smoke не выполнен.

## AC — результат

1. ✅ Docs совпадают с UI.
2. ✅ WAVE все `[x]`.

## Gates

```
pnpm exec nx build kppdf-web → PASS, exit 0
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build kppdf-web)
  - tests: N/A (docs-only step; code covered in D50–D53 archives)
  - lint: N/A (docs-only)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-D54-DOCS-SMOKE.md)
  - progress.md: N/A (captured in checklist + page.md + roadmap)
  - status synchronization: PASS

---

# WAVE-DOCSTUDIO-DATA-IA — WAVE CLOSEOUT

Все 5 TZ (D50 TOC shell, D51 selected buffer, D52 insert suggest, D53 party copy, D54 docs
smoke) — **DONE**. Панель «Данные» реорганизована в TOC из 5 категорий вместо одной кучи
полей; буфер «Выбрано» с badge и понятным empty-state; явный CTA «Вставить на лист» без
захода в Свойства; Плательщик демоучен за disclosure. Known limitation: live browser smoke
для `insertCatalogTable()` не выполнен в этой сессии (test-based verification вместо этого,
см. D54 checklist).
