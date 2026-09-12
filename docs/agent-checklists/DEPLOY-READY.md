# DEPLOY-READY — живой штамп

> Единственный «светофор» перед деплоем.  
> Пишет подготовка («подготовь к деплою» / NX prep).  
> Читает любой ИИ по `deploy/synology/README.md` → «сделай деплой по документации».
>
> Prod last warm: `4d55d0ea` 2026-08-27.  
> **NX cutover:** канон `docs/ops/DEPLOY-NX-PROD.md`. `TZ-OPS-DEPLOY-NX-STATIC` закрыт — деплой разрешён по документации.

```yaml
status: INVALID
why_invalid: deployed 9e1802fe 2026-09-13 on VM 192.168.1.52 (warm redeploy; enroll-fix commit — withComponentInputBinding; Deploy complete + Auth OK + Frontend 200; prod verified: POST /api/device/enroll 200 + redirect /admin/devices via Playwright; owner invite re-issued)
frontend_target: nx
wipe_default: false
wipe_reason: "same Nest API; additive schemas since 4d55d0ea — keep Mongo/uploads (warm)"
deploy_sha_target: 73e335c3
prepared_at: 2026-09-12T18:00:00+03:00
prepared_by: claude-executor
evidence: docs/agent-checklists/PRE-DEPLOY-2026-09-12-NX.md
prep_prompt: tasks/PROMPT-CLAUDE-DEPLOY-PREP-NX.md
debt: []
desktop_zip: accept-stale (v0.5.10, re-verified 2026-09-12 desktop-full-verify — file present in both downloads dirs, matches current desktop/package.json version; no desktop code changed this session so no rebuild triggered; see docs/audits/2026-09-12-desktop-full-verify.md)
mixed_commit: no
```

## Для агента деплоя

1. Если `status` **не** `READY` → **STOP**. PO: «штамп не READY — нужна подготовка» (`PROMPT-CLAUDE-DEPLOY-PREP-NX.md`).
2. Если `READY` и `frontend_target: nx` → `git fetch` && `git checkout main` && `git pull --ff-only`.
3. `git merge-base --is-ancestor <deploy_sha_target> HEAD` must succeed; deploy from **tip HEAD**.
4. VPN **off**. `config.env` + `CREDENTIALS.md` на машине деплоя (не в git).
5. **Warm only**, без флагов: `.\deploy\synology\deploy.ps1` (**no** `-Wipe`) — `wipe_default: false` в штампе выше; `-Wipe` только после бэкапа и явной фразы PO `да, разрешаю wipe после бэкапа` (`docs/ops/DANGEROUS-OPS.md`).
6. Smoke: `docs/ops/DEPLOY-NX-PROD.md` §4 (health/ready, login, NX shell `/desk` или `/orders`, `/registries`, `/studio`, нет TS overlay, desktop download meta опционально) + `deploy/synology/README.md`. Затем `status: INVALID` + `why_invalid: deployed <sha> <date>` + commit.
