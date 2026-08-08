═══════════════════════════════════════════════════════════════
TZ-OPS-301: Шум локального старта + слабый admin пароль (deploy)
═══════════════════════════════════════════════════════════════

> PARK · не блокирует работу в браузере · чинить перед/на деплое  
> Найдено 2026-08-08 при `npm run start:no-browser`

STATUS: PARK (до явного «задеплой» / PO)

## Что оставить до деплоя (не мешает сейчас)

| Сигнал | Почему later |
|--------|----------------|
| `INSECURE_ADMIN_PASSWORD_TOO_SHORT` (length=8, need≥12) | Dev allow-list; на prod FAIL — сменить `.env` / secret |
| `LocalDemoSeed` E11000 duplicate sku DEMO-LOCAL-MAT-* | Идемпотентность seed; не ломает health |
| docker-compose `version` obsolete warning | Косметика compose |
| Node `NO_COLOR` / `DEP0190` shell deprecation | Шум tooling |

## AC когда un-park

- [ ] Prod admin password ≥12 / без weak markers  
- [ ] Demo seed idempotent (no duplicate key WARN)  
- [ ] Optional: drop compose `version:`  

НЕ: трогать product UX в этой TZ.
