# TZ-UI-408: Админ-диалоги — токены шрифта, не 10px Mono

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: claude
sha: 546daf65

## Outcome

В шести диалогах `/admin/devices`:
- literal `'JetBrains Mono', monospace` заменён на `var(--font-mono)`;
- field labels подняты с `10px` до `11px`;
- input `13px`, разметка, API и copy не менялись;
- дополнительные mono-мета-стили в role dialog также переведены на `var(--font-mono)` и 11px.

## Verification

- acceptance criteria: PASS
- FE typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
- scoped static acceptance: PASS (0 `JetBrains Mono`, 0 `font-size: 10px` in six dialog files; expected `13px` input styles retained)
- FE lint: PASS, exit 0; 18 pre-existing architecture warnings, 0 errors
- browser live: N/A (no server/session available)
- page docs/index: existing `/admin/devices` entry already records TZ-UI-408; no doc change required
- review diff: PASS
- deploy: NOT RUN

## Executor report

Изменены только шесть CONFLICT KEYS. Чужие Desktop, TEST-420 и прочие dirty WIP, backend, `.github/` и deploy не затрагивались.
