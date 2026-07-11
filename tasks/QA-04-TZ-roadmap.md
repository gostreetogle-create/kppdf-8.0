# QA-04-TZ-roadmap — Мастер-классификация QA-находок → TZ-спецификации

**Дата:** 2026-07-11
**Назначение:** Связать 27 уникальных QA-находок (из QA-01..05) с канноническими TZ-спецификациями (TZ-91..101). Устранить дублирование (3 пересечения QA-01:1.4 ↔ QA-03:3.1, QA-02:2.1 ↔ QA-03:3.2, QA-03:3.8) и определить Layer для каждой фазы.

**Источник:** `tasks/QA-01-security.md` · `tasks/QA-02-frontend.md` · `tasks/QA-03-backend.md` · `tasks/QA-04-summary.md` · `tasks/QA-05-build-tests.md`
**Валидация:** 30/30 находок real на 2026-07-11 (basher cross-check с реальным кодом)
**Конвенция:** TZ-* specs в формате TZ-85/TZ-90 (8 sections, Phases A→E + LAYER per Phase, Dependencies, Cross-references)

---

## Tier 1: критичные TZ (правильные specs, READY → execute)

| # | TZ spec | Scope | Файл(ы) | LAYER | Зависимости | Эстимейт LoC |
|---|---------|-------|---------|-------|-------------|--------------|
| 1 | **TZ-91** | 🔴 Critical | backend: 5 файлов | A=1 · B=2 · C=2 · D=1 | → TZ-92 (audit context), → TZ-83 (existing layout) | ~250 |
|   | *Critical Security Hardening* | QA-01:1.1 / 1.2 / 1.3 / 1.5 / 1.7 / 1.8 / 1.9 / 1.10 | frontend: 0 | (D=docs) | | |
| 2 | **TZ-92** | 🟠 High | backend: 3 файла | A=2 · B=2 · C=1 | ← TZ-91 (audit context для cross-ref) | ~80 |
|   | *Audit Trail + /auth/me Cleanup* | QA-01:1.4 + QA-03:3.1 + QA-03:3.3 | frontend: 0 | (Serial B+C) | | |
| 3 | **TZ-93** | 🟠 High | backend: 4 файла | A=2 · B=1 · C=1 | → TZ-83 (patterns), TZ-85 (cost calc prelude) | ~180 |
|   | *Backend Pagination Standard* | QA-02:2.1 + QA-03:3.2 | frontend: 3 | (Mixed stack) | | |
| 4 | **TZ-94** | 🟠 High | backend: 0 | A=2 · B=1 (trivial) | → TZ-91 (role guards must align) | ~60 |
|   | *Frontend Auth Guards + Config* | QA-02:2.2 / 2.3 / 2.4 | frontend: 3 | | | |
| 5 | **TZ-95** | 🟠 High + ⚠️ meta | backend: 4 e2e + 1 config | A=2 · B=1 · C=1 | ↔ TZ-91 (admin password change affects tests) | ~120 |
|   | *E2E Tests Standardization* | QA-05:5.1 / 5.2 / 5.3 | frontend: 0 | | | |
| 6 | **TZ-96** | 🟡 Med | backend: 2 | A=2 · B=1 | → TZ-85 (re-launches QA-03:3.8 fix) | ~120 |
|   | *Cost Calculation Material Lookup — TONOTE* | QA-03:3.8 (which TZ-85A allegedly fixed — actually NOT) | frontend: 0 | **meta-TZ: invalidate TZ-85A claim + verify** | | |

## Tier 2: 1-line PRs (объединены в TZ-99 — без полных фаз)

| # | TZ spec | Scope | Файл(ы) | LAYER | Зависимости | Эстимейт LoC |
|---|---------|-------|---------|-------|-------------|--------------|
| 7 | **TZ-97** | 🟡 Med | backend: 2 файла | A=1 · B=1 | (parallel) | ~150 |
|   | *Photo Pipeline* | QA-03:3.5 / 3.6 | frontend: 0 | | | |
| 8 | **TZ-98** | 🟡 Med | backend: 0 · frontend: 6 | A=2 | ↔ TZ-83 (already started) | ~200 |
|   | *Frontend Rendering Quality* | QA-02:2.5 / 2.6 / 2.7 | (ListPages) | (could be 1 phase) | | |

## Tier 3: Low priority + deferred (1-line PRs OR отдельная фича)

| # | TZ spec | Scope | Файл(ы) | LAYER | Зависимости | Эстимейт LoC |
|---|---------|-------|---------|-------|-------------|--------------|
| 9 | **TZ-99** | 🔵 Low | backend: 1 (config) | A=1 (single commit) | ← TZ-95 (drift detection gate) | ~40 |
|   | *Backend Polish — admin/safe* | QA-03:3.4 (admin drift) + QA-05:5.4 (Swagger @ApiTags) | + ~70 controllers (decorator sweep) | | (Swagger-decorator sweep = A=2) | |
| 10 | **TZ-100** | 🔵 Low | backend: 2 (seed) | A=1 (single commit) | (parallel) | ~80 |
|    | *Default Seed Data* | QA-03:3.10 | frontend: 0 | | | |
| 11 | **TZ-101** | 🔵 Low | frontend: 1 (index.html) + 1 spec | A=1 (single commit) | (trivial) | ~15 |
|    | *Misc Frontend Polish* | QA-02:2.8 (favicon) / 2.9 (meta) / 2.10 (title) + QA-05:5.5 (button spec) | backend: 0 | | | |

---

## Matrix: 27 unique findings → 11 canonical TZs

| QA ID | Severity | Mapped to TZ | Status |
|-------|----------|--------------|--------|
| QA-01:1.1 | 🔴 CRITICAL | **TZ-91** | ⏳ drafted |
| QA-01:1.2 | 🔴 CRITICAL | **TZ-91** | ⏳ drafted |
| QA-01:1.3 | 🔴 CRITICAL | **TZ-91** | ⏳ drafted |
| QA-01:1.4 / QA-03:3.1 | 🟠 HIGH | **TZ-92** | spec-дrafter |
| QA-01:1.5 | 🟠 HIGH | **TZ-91** | (subordinate, trivial) |
| QA-01:1.6 | 🟠 HIGH | **TZ-91** (Phase C variant) | ⏳ drafted |
| QA-01:1.7 | 🟠 HIGH | **TZ-91** | ⏳ drafted |
| QA-01:1.8 | 🟠 HIGH | **TZ-91** | ⏳ drafted |
| QA-01:1.9 | 🟡 MEDIUM | **TZ-91** | (subordinate) |
| QA-01:1.10 | 🟡 MEDIUM | **TZ-91** | (subordinate) |
| QA-02:2.1 / QA-03:3.2 | 🟠 HIGH | **TZ-93** | spec-дrafter |
| QA-02:2.2 | 🟠 HIGH | **TZ-94** | spec-дrafter |
| QA-02:2.3 | 🟠 HIGH | **TZ-94** | spec-дrafter |
| QA-02:2.4 | 🟡 MEDIUM | **TZ-94** | (trivial) |
| QA-02:2.5 | 🟡 MEDIUM | **TZ-98** | spec-дrafter |
| QA-02:2.6 | 🟡 MEDIUM | **TZ-98** | spec-дrafter |
| QA-02:2.7 | 🟡 MEDIUM | **TZ-98** | spec-дrafter |
| QA-02:2.8 | 🔵 LOW | **TZ-101** | (1-line) |
| QA-02:2.9 | 🔵 LOW | **TZ-101** | (1-line) |
| QA-02:2.10 | 🔵 LOW | **TZ-101** | (1-line) |
| QA-03:3.3 | 🟠 HIGH | **TZ-92** | spec-дrafter |
| QA-03:3.4 | 🟡 MEDIUM | **TZ-99** | (1-line) |
| QA-03:3.5 | 🟡 MEDIUM | **TZ-97** | spec-дrafter |
| QA-03:3.6 | 🟡 MEDIUM | **TZ-97** | spec-дrafter |
| QA-03:3.7 | 🟡 MEDIUM | **TZ-99** | spec-дrafter |
| QA-03:3.8 | 🟡 MEDIUM | **TZ-96** ⚠️ **META** | spec-дrafter (verify TZ-85A claim) |
| QA-03:3.9 | 🔵 LOW | **TZ-99** | (deferred) |
| QA-03:3.10 | 🔵 LOW | **TZ-100** | spec-дrafter |
| QA-05:5.1 | 🟠 HIGH | **TZ-95** | spec-дrafter |
| QA-05:5.2 | 🟠 HIGH | **TZ-95** | spec-дrafter |
| QA-05:5.3 | 🟡 MEDIUM | **TZ-95** | spec-дrafter |
| QA-05:5.4 | 🔵 LOW | **TZ-99** | spec-дrafter |
| QA-05:5.5 | 🔵 LOW | **TZ-101** | (1-line) |

---

## Critical Path Ordering (recommended execution order)

1. **TZ-91 first** — 3 CRITICAL security findings block all other high-priority TZs (RBAC must align before TZ-93/TZ-94 changes; admin auth flow must match). Atomic commits: A=1 phase (token hardening + registerDto @IsIn), B=2 phase (RBAC sweep decorator), C=2 phase (Swagger gating + drift detection).
2. **TZ-92 next** — Audit trail aligns with TZ-91 same security context. Atomic commit per phase.
3. **TZ-93** — Cross-stack pagination (backend + frontend).
4. **TZ-94** — Frontend auth guards (small, low-risk after TZ-91).
5. **TZ-95** — E2E consistency fixup (1-line × multiple files).
6. **TZ-98** — Frontend rendering quality (debounce + global error handler + list-pages refactor).
7. **TZ-96 ⚠️** — Verify TZ-85A claim; if real then TZ-96 = cleanup; if real-deficit then TZ-96 = re-fix.
8. **TZ-97** — Photo pipeline (sharp thumbnails + orphan cleanup).
9. **TZ-99, TZ-100, TZ-101** — Polish + low priority 1-line PRs.

**Total estimated work:**
- Tier 1 (6 TZs): ~810 LoC, ~32 atomic commits (avg 5-6 commits per TZ × 6), ~3 weeks calendar
- Tier 2 (2 TZs): ~350 LoC, ~6 atomic commits, ~1 week
- Tier 3 (3 TZs): ~135 LoC, ~3 atomic commits, ~3 days

---

## Cross-references

- **TZ-83 ✅** — operational pages; basis for TZ-94 auth guards + TZ-93 frontend pagination patterns.
- **TZ-85 IN PROGRESS** — TZ-85A claims CostCalculation Material lookup wired (TZ-85A spec §2 decision 4), but basher cross-check на 2026-07-11 обнаружил TODO comment STILL present at `cost-calculation.service.ts:63`. **TZ-96 meta-issue** = проверить фактическое состояние.
- **TZ-86 ✅** — Document Constructor; не имеет backend security implications для spec-написания, но TZ-91 RBAC sweep должен cover document-templates controller.
- **TZ-90 ⏳ READY** — Dialog system standardization; не имеет прямого security overlap с QA-находками.
- **TZ-DIALOG-OVERFLOW-FIX / TZ-DIALOG-VISIBILITY-FIX ✅** — frontend only, не пересекаются с QA-01/02/03/05 находками.
- **TZ-AUDIT-6 / 8 / 9 ✅** — UI standards, не пересекаются с QA-01/02/03/05 находками.

---

## Verification artifact

- `tasks/QA-04-summary.md` — оригинальный отчет testing-команды (30 raw findings).
- `tasks/QA-04-TZ-roadmap.md` (this file) — классификация 27 unique findings → 11 canonical TZ specs.

---

**STATUS:** ⏳ READY — 1 roadmap artifact + 1 example TZ-91 full spec в этом commit. Остальные TZ-92..101 specs на дроверительно-следующем шаге (см. `🆕 Recent atomic commits` в `STATUS.md`).
