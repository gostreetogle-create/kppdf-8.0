# DEPLOY-READY — живой штамп

> Единственный «светофор» перед деплоем.  
> Пишет подготовка («подготовь к деплою» / NX prep).  
> Читает любой ИИ по `deploy/synology/README.md` → «сделай деплой по документации».
>
> Prod last warm: `a2295b7f` 2026-09-18 (PDF proposals). Prior: `9e1802fe` 2026-09-13 (enroll); historic `4d55d0ea` 2026-08-27.  
> **NX cutover:** канон `docs/ops/DEPLOY-NX-PROD.md`. `TZ-OPS-DEPLOY-NX-STATIC` closed.

```yaml
status: INVALID
why_invalid: deployed a2295b7f 2026-09-18 (tip HEAD 440187fa; warm NX deploy via deploy.ps1; Deploy complete + Auth OK + Frontend 200; health ok on VM + https://kppdf-crm.ru; tunnel active; bundle main-RQG2YNR6.js; root = device-gate 401)
frontend_target: nx
wipe_default: false
wipe_reason: "same Nest API; additive schemas since a2295b7f / 4d55d0ea — keep Mongo/uploads (warm)"
deploy_sha_target: a2295b7f
prepared_at: 2026-09-18T06:20:00+03:00
prepared_by: cursor-architect
evidence: docs/agent-checklists/PRE-DEPLOY-2026-09-18-NX.md
prep_prompt: tasks/PROMPT-DEPLOY-READY.md
debt:
  - "FE nx lint a11y baseline (documented PRE-DEPLOY-2026-09-12; not gate)"
  - "POST /quotations/:id/generated-document archive = Manual (list PDF Verified)"
desktop_zip: accept-stale (v0.5.10 — frontend/browser/downloads present; desktop/package.json 0.5.10; no desktop code this tip)
mixed_commit: no
```

## Для агента деплоя

1. Если `status` **не** `READY` → **STOP**. PO: «штамп не READY — нужна подготовка» (`PROMPT-DEPLOY-READY.md` / `PROMPT-CLAUDE-DEPLOY-PREP-NX.md`).
2. Если `READY` и `frontend_target: nx` → `git fetch` && `git checkout main` && `git pull --ff-only`.
3. `git merge-base --is-ancestor <deploy_sha_target> HEAD` must succeed; deploy from **tip HEAD**.
4. VPN **off**. `config.env` + `CREDENTIALS.md` на машине деплоя (не в git).
5. **Warm only**, без флагов: `.\deploy\synology\deploy.ps1` (**no** `-Wipe`) — `wipe_default: false`; `-Wipe` только после бэкапа и явной фразы PO `да, разрешаю wipe после бэкапа` (`docs/ops/DANGEROUS-OPS.md`).
6. Smoke: `docs/ops/DEPLOY-NX-PROD.md` §4 (health/ready, login, NX shell `/home` или `/orders`, `/registries`, `/studio`, нет TS overlay, desktop download meta опционально) + `deploy/synology/README.md`. Затем `status: INVALID` + `why_invalid: deployed <sha> <date>` + commit.
