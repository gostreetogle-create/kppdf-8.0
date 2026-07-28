═══════════════════════════════════════════════════════════════
РОУТИННЫЙ ПРОМПТ — для параллельного backend-агента (Layer 4)
═══════════════════════════════════════════════════════════════

> **Назначение:** простая рутинная механическая работа. Другой агент
> (Buffy) делает ФРОНТЕНД параллельно в другой feature-branch.
> Ты — **ТОЛЬКО backend**, каталоги `backend/src/**`. В `frontend/**` НЕ ПИШИ.
>
> **Контроль качества:** Buffy проверит ТВОЮ работу после завершения
> через `pnpm --filter backend tsc --noEmit` (PASS required) + diff review.
> Не допускай regressions.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ: TZ-230.D (Pre-existing TS Errors Cleanup)
═══════════════════════════════════════════════════════════════

**Контекст:** в `backend/src/services/*` (~10-15 файлов) накопилось
22 pre-existing TypeScript ошибки, которые блокируют strict-mode CI.
audit-di.ts (если найдёшь — один или несколько файлов с префиксом `audit`)
содержит ложно-позитивные type mismatches.

**Цель:** все ошибки исправить, typecheck exit 0, runtime NOT меняется.

═══════════════════════════════════════════════════════════════
ШАГ 1 — RUN BASELINE DIAGNOSTIC
═══════════════════════════════════════════════════════════════

```bash
cd /path/to/repo
git fetch origin
git checkout main && git pull --rebase
git checkout -b feature/tz-230-d-ts-cleanup

cd backend
pnpm exec tsc -p tsconfig.build.json --noEmit 2>&1 | tee /tmp/tsc-baseline.log
```

Проанализируй ВЫВОД. Если ошибок меньше 22 — задокументируй в progress.md
("found N errors at baseline, expected 22"). Если больше или меньше —
НЕ ПАНИКУЙ, начни чинить.

═══════════════════════════════════════════════════════════════
ШАГ 2 — FIX ПО ПРИОРИТЕТУ
═══════════════════════════════════════════════════════════════

**Приоритеты:**
1. **CRITICAL:** ошибки которые блокируют BOOT приложения (service.module registration, missing deps)
2. **HIGH:** Type projection errors в mongo queries (`as unknown as Types.ObjectId` хаки)
3. **MEDIUM:** missing imports / unused imports / explicit `any` leaks
4. **LOW:** implicit `any` в колбэках / signature mismatches в tests

**СТРОГО:**
- **НЕ меняй runtime behavior.** Только типы.
- **НЕ удаляй существующие unit tests** — если они падают из-за типов, почини ТОЛЬКО types в test (НИКОГДА не `@ts-ignore`).
- **НЕ меняй API контракты** (DTO shapes, controller signatures).
- **МОЖНО** добавить type-narrowing guards (`is Populated<T>` helpers), explicit generic parameters, type assertions на safe boundaries.

**Подсказки по частым паттернам:**

```typescript
// ❌ as unknown as Types.ObjectId — антипаттерн, почини через DTO decorator
// ✅ import { ToObjectId } from '@/common/decorators/to-object-id.decorator';

// ❌ any в callback
.subscribe((data: any) => ...)
.subscribe((data: unknown) => ... as MyType)  // НЕ ПРАВЬ это, это отдельно в TZ-220.A
.subscribe((data) => applyTypeGuard(data))  // ✅ если есть type guard

// ❌ missing return statement
async function foo(): Promise<X> {
  if (cond) return ...;
  // ❌ нет return
}
// ✅ add explicit return null OR return at end of branch
```

═══════════════════════════════════════════════════════════════
ШАГ 3 — VERIFY
═══════════════════════════════════════════════════════════════

```bash
cd backend
pnpm exec tsc -p tsconfig.build.json --noEmit  # ОБЯЗАТЕЛЬНО exit 0
pnpm exec lint                   # ESLint не должен упасть
pnpm exec jest                   # existing tests ВСЕ должны зелёные

# ИСПРАВЬ любые breakage в TESTS (НЕ УДАЛЯЙ тесты, почини types)
```

Если `pnpm exec jest` падает на старых тестах, которые ты НЕ трогал —
возможно baseline был broken в TS. Задокументируй это в progress.md
("test failures on baseline, не моя ответственность, annotated").

═══════════════════════════════════════════════════════════════
ШАГ 4 — REPORT (отправь Buffy через git push НЕ требуется, через progress.md)
═══════════════════════════════════════════════════════════════

Закоммить в feature branch:
```bash
git add backend/src/services/*  # конкретные файлы которые правил
git commit -m "fix(backend): TZ-230.D — fix 22 pre-existing TypeScript errors

- Type-only changes, runtime behavior identical
- 22 errors fixed (list 3-4 categories: ObjectId cast / unused imports / etc.)
- All existing tests still pass

🤖 Generated as routine cleanup. Cross-reviewed by Buffy on merge."
git push -u origin feature/tz-230-d-ts-cleanup
```

Добавь в `progress.md` (additive, в КОНЕЦ):
```markdown
## [YYYY-MM-DD] — Завершено: TZ-230.D (Pre-existing TS Errors Cleanup)

**Исполнитель:** Backend Routine Agent (Layer 4)
**Статус:** Ready for review by Buffy
**Что сделано:** N ошибок исправлено в M файлах. Категории: ...
**Запуск baseline (до):** `tsc` reported N errors
**Запуск baseline (после):** `tsc` exit 0
**Files changed:** [git diff --stat]
**Branch:** feature/tz-230-d-ts-cleanup (PUSHED)
```

═══════════════════════════════════════════════════════════════
DEFINITION OF DONE
═══════════════════════════════════════════════════════════════

- [ ] `pnpm --filter backend tsc --noEmit` exit 0
- [ ] `pnpm --filter backend test` все existing specs PASS
- [ ] `pnpm --filter backend lint` exit 0 (или pre-existing warnings НЕ увеличены)
- [ ] git commit на feature branch с semantic message
- [ ] git push в origin успешен (для Buffy-review через PR)
- [ ] progress.md entry с headline "Исполнитель: Backend Routine Agent"

═══════════════════════════════════════════════════════════════
ANTI-PATTERNS
═══════════════════════════════════════════════════════════════

❌ **НЕ** добавляй `@ts-ignore` / `@ts-expect-error` / `// eslint-disable` — это скрывает ошибку.
❌ **НЕ** используй `as any` массы для починки типов.
❌ **НЕ** меняй runtime behavior (т.е. не правь логику, только типы).
❌ **НЕ** правь `frontend/**`, `docs/**`, `OrchestratorKit/**` — это territory другого агента.
❌ **НЕ** коммить в main (работай в feature branch).

═══════════════════════════════════════════════════════════════
END OF ROUTINE PROMPT (TZ-230.D)
═══════════════════════════════════════════════════════════════
