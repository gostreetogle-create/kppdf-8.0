# DEPLOY-READY — живой штамп

> Единственный «светофор» перед деплоем.  
> Пишет подготовка («подготовь к деплою»).  
> Читает любой ИИ по `deploy/synology/README.md` → «сделай деплой по документации».
>
> Сейчас: **INVALID** (после инцидента 2026-08-23). Прод на `c8ebdeb6` (2026-08-11).

```yaml
status: INVALID
deploy_sha_target: null
prepared_at: null
prepared_by: null
evidence: null
known_debt: []
desktop_zip: null
mixed_commits: null
why_invalid: >
  Нужны TZ-TEST-421 + «подготовь к деплою». Пока status не READY —
  фраза «сделай деплой по документации» обязана STOP.
```
