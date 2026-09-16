# Аудит: свежая Ubuntu VM .52 + деплой 2026-09-13

> Реконструкция по git/штампам — отдельного session-журнала агент **не оставил**.  
> Живая приёмка: `tasks/TZ-VERIFY-2026-09-13-ENROLL-DEPLOY-VM52.md`.

## Хронология (факты из `main`)

| Когда | SHA | Что |
|-------|-----|-----|
| 2026-09-12 | `7500f862` | Prep: `DEPLOY-READY=READY`, target `73e335c3`, warm, NX |
| ~02:19 2026-09-13 | `b1f05fa8` | Штамп: **FRESH VM `192.168.1.52`**, старый `.103` потерян; `deploy.py` warm + seed на пустой Mongo; tunnel `kppdf-tunnel` восстановлен; код tip `ac68d96f` |
| ~02:40 | `9e1802fe` | Фикс enroll: `withComponentInputBinding()` + регресс-тест |
| ~02:44 | `842275a5` | Канон host `.103→.52` в `deploy/synology/*` + штамп `deployed 9e1802fe` |
| позже | `3c84d23d` | TZ глобальной проверки (VERIFY) |

## Что сделано по смыслу (не детальный bash-лог)

1. **Новая Ubuntu VM** на Synology VMM (`ubuntu24kppdf_8`, LAN **192.168.1.52**). Старая `.103` снята/недоступна.
2. Базовый стек по канону: Docker (`server-setup-ubuntu.sh`), data `/var/lib/kppdf80/`, app `/opt/kppdf-8.0/`, reverse tunnel VM→VPS → `https://kppdf-crm.ru`.
3. Первый выкат на пустую БД: warm+seed (не `-Wipe` в штампе; Mongo была пустая).
4. Smoke: Deploy complete, Auth OK, Frontend 200, публичный `health/ready`.
5. Баг «не подключает ПК» → корневой фикс роутера + warm redeploy того же VM.
6. Документы точки входа (`README/INSTALL/DEPLOY/RUNBOOK`, `deploy.py` default host, `config.env.example`) переведены на `.52`.

## Desk-check Cursor (2026-09-13, до VERIFY)

| Проверка | Результат |
|----------|-----------|
| `9e1802fe` / `842275a5` ancestors of HEAD | OK |
| `app.config.ts` → `withComponentInputBinding()` | OK |
| `DEPLOY-READY` → INVALID, `deployed 9e1802fe`, host `.52` | OK |
| Живые ops в `deploy/synology/` без `.103` | OK (кроме исторического `AUDIT-CONNECT-2026-08-02.md`) |
| `https://kppdf-crm.ru/api/health/ready` | **200** mongo up |
| `/` публично | **401** (device-гейт) — ожидаемо |
| `/enroll/…` без cookie | **200** — ожидаемо |
| Отдельный журнал «как ставили Ubuntu» | **НЕТ** — только штамп + generic `INSTALL.md` |
| `docs/ops/home-host-access.md` и др. | **STALE** — ещё `.103` |
| `_NOW.md` / STREAM-QUEUE | **STALE** (говорят READY / Deploy GO park) |

## Вердикт desk

Инфра и канон деплоя **выглядят согласованными** с `.52`; публичный health живой; фикс enroll в коде на месте.  
**Не закрыто без живой VERIFY:** бандл-хеши на VM, tunnel unit, E2E enroll, сверка секретов hash, актуальность `_NOW`.  
**Долг доков:** нет session-runbook переустановки; stale `.103` в части `docs/ops/*`.
