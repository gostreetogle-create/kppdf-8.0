# agents/skills/install-list.md — FREE-TO-INSTALL skills (19)

> **Source of truth:** TZ-233 EVIDENCE TABLE (см. `tasks/TZ-233.md`).
> Список прошёл отбор через анализ архивных TZ: каждый скилл здесь имеет
> конкретный исторический баг/регрессию, которую он предотвратил бы.
>
> **Категория:**
> - **Tier 1** — must-have, используется на КАЖДОМ TZ (ритуалы).
> - **Tier 2** — часто нужен (review / testing / type-safety).
> - **Tier 3** — нишевый, но подтверждён архивным инцидентом.

---

## Tier 1 — Ритуалы (на каждом TZ)

### 1. writing-plans (obra/superpowers)
**Что делает у нас:** даёт ритуал «zero-to-shipped» — структурированный план с самого начала TZ, а не post-factum.
**Evidence:** `tasks/TZ-233.md` строки 1-7 (writing-plans row).

### 2. executing-plans (obra/superpowers)
**Что делает у нас:** добавляет step «rerun discovery → resubplan» перед коммитом, ловит ошибки в архитектурных допущениях.
**Evidence:** `tasks/TZ-233.md` строки 8-14 (executing-plans row).

### 3. verification-before-completion (obra/superpowers)
**Что делает у нас:** требует доказать «sort state survives pagination» / «GET /organizations returns N=1» перед тем как считать TZ готовым.
**Evidence:** `tasks/TZ-233.md` строки 15-21 (verification-before-completion row).

### 4. using-git-worktrees (obra/superpowers)
**Что делает у нас:** изоляция per-pattern при миграциях (textarea / switch / select / checkbox), баг в checkbox не блокирует textarea branch.
**Evidence:** `tasks/TZ-233.md` строки 22-28 (git-worktrees row).

### 5. git-commit (github/awesome-copilot)
**Что делает у нас:** body-template `fix(scope): tiered throttling + HttpOnly cookies` → 2 атомарных коммита вместо комбайна.
**Evidence:** `tasks/TZ-233.md` строки 29-35 (git-commit row).

### 6. finishing-a-development-branch (obra/superpowers)
**Что делает у нас:** merge / close-out / archive / update STATUS ритуал — предотвращает DEFERRED TZ на месяцы.
**Evidence:** `tasks/TZ-233.md` строки 36-42 (finishing-a-development-branch row).

### 7. brainstorming (obra/superpowers)
**Что делает у нас:** ритуал сравнения вариантов с матрицей решений ДО того, как TZ становится ready.
**Evidence:** `tasks/TZ-233.md` строки 119-125 (brainstorming row).

### 8. review (mattpocock)
**Что делает у нас:** self-review checklist перед sweep-коммитом — подсвечивает unvalidated bulkWrite / findByIdAndUpdate до того, как попадут в прод.
**Evidence:** `tasks/TZ-233.md` строки 43-49 (review row).

---

## Tier 2 — Review / Test / Type-safety

### 9. requesting-code-review (obra/superpowers)
**Что делает у нас:** формулирует review-ask как поведенческий контракт («catch все parallel-update 409»), а не код-формализм.
**Evidence:** `tasks/TZ-233.md` строки 138-144 (requesting-code-review row).

### 10. receiving-code-review (obra/superpowers)
**Что делает у нас:** превращает review-комментарии («не atomic» / «enum mismatch») в конкретные шаги, а не в защиту.
**Evidence:** `tasks/TZ-233.md` строки 145-151 (receiving-code-review row).

### 11. typescript-advanced-types (wshobson)
**Что делает у нас:** универсальный шаблон с `TemplateRef<{ $implicit: T }>` — variance-знания, не escape hatch через `any`.
**Evidence:** `tasks/TZ-233.md` строки 50-56 (typescript-advanced-types row).

### 12. webapp-testing (anthropics)
**Что делает у нас:** e2e testing на dialogs + browser dialog coverage ловит сломанные dialog guards / empty-route guards.
**Evidence:** `tasks/TZ-233.md` строки 81-87 (webapp-testing row).

### 13. nodejs-backend-patterns (wshobson)
**Что делает у нас:** canonical NestJS DI / interceptor / soft-delete plugin patterns для cross-service tx (Order.reserveStock / Contract.activate).
**Evidence:** `tasks/TZ-233.md` строки 57-63 (nodejs-backend-patterns row).

### 14. api-design-principles (wshobson)
**Что делает у нас:** единый envelope `<=canonical>` + server принимает page params с самого начала, а не patchwork по 3 доменам.
**Evidence:** `tasks/TZ-233.md` строки 64-70 (api-design-principles row).

### 15. accessibility (addyosmani)
**Что делает у нас:** предотвращает regression-class a11y (multi-select, Relay button, accessible table rows), а не единичные incident-fix.
**Evidence:** `tasks/TZ-233.md` строки 88-94 (accessibility row).

### 16. tdd (mattpocock)
**Что делает у нас:** failing test → impl → green для фич с чётким «правильно / неправильно» поведением (Optimistic Locking VersionError filter).
**Evidence:** `tasks/TZ-233.md` строки 126-132 (tdd row).

---

## Tier 3 — Нишевые, но подтверждённые инцидентом

### 17. performance (addyosmani)
**Что делает у нас:** N+1 / over-fetch в findAll, 2 fetches per keystroke — типичный perf skill.
**Evidence:** `tasks/TZ-233.md` строки 95-101 (performance row).

### 18. pdf (anthropics)
**Что делает у нас:** design-final + token-system для PDF-design (DocumentConstructor design system).
**Evidence:** `tasks/TZ-233.md` строки 102-108 (pdf row).

### 19. systematic-debugging (obra/superpowers)
**Что делает у нас:** leaking pipe / hot observables + EAV atomicity bulkWrite — debug должен восстанавливать «что именно не было atomic».
**Evidence:** `tasks/TZ-233.md` строки 133-139 (systematic-debugging row).

---

## Сводка

| Tier | Кол-во | Назначение |
|------|--------|------------|
| Tier 1 | 8 | Ритуалы (на каждом TZ) |
| Tier 2 | 8 | Review / Test / Type-safety |
| Tier 3 | 3 | Нишевые (perf / pdf / debug) |
| **Итого** | **19** | |

Все 19 — **KEEP** в Project Settings → Preloaded skills.
