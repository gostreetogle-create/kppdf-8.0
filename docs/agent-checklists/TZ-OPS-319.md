# TZ-OPS-319 checklist

> Status: **DONE**

## Claim slot

- agent_id: freebuff (closeout)
- claimed_at: 2026-08-22T19:11:51+03:00

## Acceptance

- [x] .husky/pre-push существует, bash -n PASS
- [x] Вызывает tsc --noEmit для backend + frontend
- [x] docs/GIT-POLICY.md: строка про --no-verify для форс-мажора
- [x] Никаких изменений в .github/

## Gates

- bash -n PASS
- tsc PASS (оба контура)

## Known limitations

- Хук устанавливается только после pnpm install (prepare script)