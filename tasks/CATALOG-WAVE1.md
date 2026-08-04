# CATALOG Wave 1 — оркестрация (301→305)

> Канон: [`TZ-CATALOG-300.md`](TZ-CATALOG-300.md)
> Audit: [`docs/audits/2026-08-04-catalog-coherence-audit.md`](../docs/audits/2026-08-04-catalog-coherence-audit.md)
> Методика аудитов: [`docs/AUDIT-METHODOLOGY.md`](../docs/AUDIT-METHODOLOGY.md)
> Wave 2 park: [`_backlog/catalog/`](_backlog/catalog/)
> **Параллель Wave 1 backend: НЕТ.** Строго 302 → 303 → 304 → 305.

---

## Карта

| ID | Название | Статус | Кто |
|----|----------|--------|-----|
| 301 | Material fields | **DONE** archive | — |
| **302** | Composition schema + endpoints | **NEXT** | другой ИИ → Cursor review |
| 303 | Cycle/depth guards | после 302 + Cursor PASS | другой ИИ → Cursor **must** |
| 304 | Legacy migration | после 303 + Cursor PASS | другой ИИ → Cursor **must** |
| 305 | Product→Product | после 304 + Cursor PASS | другой ИИ → Cursor spot-check |
| 310–315 | Wave 2 (where-used, UI, photos…) | backlog | позже |
| **316** | Material FE 301 fields | **можно сейчас** ∥ 302 | Cursor / другой ИИ |
| **317** | FE composition cutover | после 302 PASS; **GATE до 304** | другой ИИ FE |
| **319** | Docs sync | сейчас | Cursor |

> Readiness audit: [`docs/audits/2026-08-04-catalog-readiness-fe-be.md`](../docs/audits/2026-08-04-catalog-readiness-fe-be.md)  
> Review inbox: [`docs/agent-checklists/CATALOG-WAVE1-REVIEW.md`](../docs/agent-checklists/CATALOG-WAVE1-REVIEW.md)

---

## Промпт исполнителю — волна 302→305 подряд (копируй целиком)

```text
Ты — backend-исполнитель kppdf-8.0 в D:\kppdf-8.0 на ветке main.
Цель: без остановки закрыть CATALOG Wave 1 backend — TZ-CATALOG-302 → 303 → 304 → 305.
Каждую TZ довести до archive DONE (после своих gates). Frontend composition UI и Wave 2 (310+) НЕ трогать.

Обязательно прочитай ДО кода:
1) GEMINI.md
2) docs/AI-AGENT-GUIDE.md (роль исполнителя)
3) docs/AUDIT-METHODOLOGY.md (чтобы не «чинить заодно» findings вне текущей TZ)
4) docs/TZ-AUTHORING.md (кратко)
5) docs/PO-DIARY.md §1–§4
6) tasks/TZ-CATALOG-300.md (канон D1–D4, CompositionLine)
7) tasks/CATALOG-WAVE1.md
8) docs/audits/2026-08-04-catalog-coherence-audit.md (P0: не UI поверх legacy)

Правила потока:
- СТРОГО по одной TZ. Не параллелить 302+303. Не начинать следующую, пока текущая не: AC PASS + Executor report + archive + lock + progress.md + удаление из tasks/_active.
- Перед каждой TZ: checklist docs/agent-checklists/TZ-CATALOG-NNN.md (создай/заполни Preflight до первой правки).
- Team Room: join → claim TZ-CATALOG-NNN → heartbeat на долгой работе → complete с evidence path после archive.
- pnpm only. Conflict keys — только из текущей TZ. Чужие dirty-файлы не трогать.
- Commit/push — только если PO явно разрешил; иначе «no commit» в Executor report.
- После КАЖДОЙ TZ: допиши секцию в `docs/agent-checklists/CATALOG-WAVE1-REVIEW.md`
  (формат в файле). **Не** пиши PO в чат «проверь». Cursor/PO читают inbox.
- Следующую TZ стартуй только после `Verdict … status: PASS` в том же файле
  (или явного PASS от PO в сессии). Без PASS — жди, не угадывай.
- Если BLOCKED (Mongo/e2e/DI) — честно needs_help, не архивируй DONE.

═══ TZ-CATALOG-302 (сначала) ═══
Файл: tasks/TZ-CATALOG-302.md
- composition[] на Product и ProductModule (_id строк).
- CRUD endpoints /modules|products/:id/composition[/:lineId].
- Legacy productModuleIds[] / materials[] ОСТАВИТЬ; dual-read GET.
- НЕ lineType=product (305). НЕ полный DFS (303). НЕ migration wipe (304). НЕ frontend.
- Product + materialKind=raw → 400. Dedup (lineType,refId) → quantity++.
- attachModule пишет только legacy (не dual-write).
- Gates: backend tsc; e2e attach-modules + composition tests.
- Архив: tasks/_archive/2026-08/TZ-CATALOG-302.done.md + lock.
Стоп-слово PO: «проверь 302».

═══ TZ-CATALOG-303 (только после Cursor PASS на 302) ═══
Файл: tasks/TZ-CATALOG-303.md
- Shared helper assertNoCycleAndDepth (предпочтительно backend/src/modules/catalog-graph/).
- depth root=0, max child depth 8 → 422; cycles forbidden; self-ref forbidden.
- Подключить на POST/PATCH composition (+ legacy attach если ещё writable).
- Dual-read графа: composition если непустой, иначе legacy.
- Unit tests: depth 8 ok / 9 fail; cycle; self-ref.
- Gates: tsc + unit + e2e regression.
- Архив 303. Стоп: «проверь 303».

═══ TZ-CATALOG-304 (только после Cursor PASS на 303) ═══
Файл: tasks/TZ-CATALOG-304.md
- Migration dry-run + idempotent apply → composition; legacy поля оставить.
- skip-if-composition-nonempty (документировать).
- После apply: composition = единственный write; legacy attach → 400/410 или internal redirect в composition helper (один выбор, без dual-write drift).
- Cost-calculation dual-read чтобы не сломать e2e.
- Evidence: counters dry-run, повторный apply → 0 changes, sample до/после.
- Архив 304. Стоп: «проверь 304».

═══ TZ-CATALOG-305 (только после Cursor PASS на 304) ═══
Файл: tasks/TZ-CATALOG-305.md
- lineType += 'product'; unitPriceOverride optional (≥0); Module composition запрещает product → 400.
- Product→Product циклы ловит guard 303; isComplex вычисляется (не хранить в Mongo Phase 1).
- НЕ UI бейдж, НЕ cost rollup, НЕ Excel.
- Gates: tsc + tests. Архив 305. Стоп: «проверь 305» (spot-check).

Финал волны: обнови tasks/CATALOG-WAVE1.md и docs/agent-checklists/_active-map.md — Wave 1 backend DONE; Wave 2 остаётся backlog.
Не стартуй 310–315.
```

---

## Промпт только на 302 (если нельзя ждать review mid-wave)

См. предыдущую короткую версию: делай только 302, остановись на «проверь 302».
