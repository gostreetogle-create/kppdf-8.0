# Деплой KPPDF 8.0 — краткий runbook

> **Полная документация:** [`DEPLOY.md`](./DEPLOY.md)  
> **Пароли и SSH:** [`CREDENTIALS.md`](./CREDENTIALS.md) (локально, не в git)

## VM

| | |
|---|---|
| Имя | `ubuntu24kppdf_8` |
| LAN IP | **`192.168.1.103`** |
| SSH | `tiit@192.168.1.103` (домашняя сеть, без VPN) |
| WAN | `193.222.62.240` — SSH auth не работает |

## Обновление

```powershell
cd D:\kppdf-8.0
.\deploy\synology\preflight.ps1
python deploy/synology/deploy.py --host 192.168.1.103
```

Первый деплoy: добавить `--seed`. Ожидать **10–15 мин** на `docker build`.

## Verify

```bash
curl http://192.168.1.103:3000/api/health
curl -I https://sport-set.ru/
```

Секреты → `CREDENTIALS.md` + `config.env` (gitignore).
