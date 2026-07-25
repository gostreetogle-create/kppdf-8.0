# KPPDF 8.0 — Runbook (краткий чеклист)

> **Полная документация:** [`DEPLOY.md`](./DEPLOY.md)
> **Пароли:** [`CREDENTIALS.md`](./CREDENTIALS.md) (gitignore)
> Последнее обновление: 2026-07-25

---

## Архитектура

```
https://kppdf-crm.ru → VPS nginx (443, HTTP/2+SSL) → localhost:4200
                                                          ↑
                        autossh reverse tunnel (VM→VPS)    │
                                                          │
                        VM (192.168.1.103) ← Synology
                          └─ Docker: kppdf-backend:3000
                          └─ Docker: kppdf-mongo (4.4)
```

---

## SSH доступ

| Сервер | Команда | Пароль |
|--------|---------|--------|
| VPS | `ssh root@193.222.62.240` | `serenaubxuekin` |
| VM (LAN) | `ssh tiit@192.168.1.103` | `Tg30121986` |

---

## Быстрая проверка

```bash
# Браузер:
https://kppdf-crm.ru/              # → страница логина ✅
https://kppdf-crm.ru/api/health    # → JSON ✅

# Из LAN (VM):
ssh tiit@192.168.1.103 "curl http://localhost:3000/api/health"

# С VPS:
ssh root@193.222.62.240 "curl -4 -s http://127.0.0.1:4200/api/health"

# Логин: admin / admin-change-me-immediately-in-production
```

---

## Если 502 / сайт не грузится

```bash
# 1. Проверить туннель (с VPS):
ssh root@193.222.62.240 "ss -tlnp | grep :4200"
# → должен показать sshd-session

# 2. Перезапустить туннель (с VM):
ssh tiit@192.168.1.103 "sudo systemctl restart kppdf-tunnel"

# 3. Проверить backend (с VM):
ssh tiit@192.168.1.103 "curl http://localhost:3000/api/health"

# 4. Если backend упал:
ssh tiit@192.168.1.103 "sudo docker restart kppdf-backend"
```

Туннель **автоматически восстанавливается** через 10 сек (systemd RestartSec=10).

---

## Если ERR_CONNECTION_REFUSED (SSL)

```bash
# Проверить сертификат:
ssh root@193.222.62.240 "certbot certificates"

# Обновить:
ssh root@193.222.62.240 "certbot renew --force-renewal && systemctl reload nginx"
```

---

## Деплой обновления

```powershell
# С dev-машины (Windows):
node deploy/synology/deploy-node.cjs
```

---

## Бэкап MongoDB

```bash
ssh tiit@192.168.1.103
cd /opt/kppdf-8.0 && sudo bash backup.sh
# → /var/lib/kppdf80/backups/mongo-YYYY-MM-DD_HHMM/
```

---

## Источники

- **Полная документация:** `deploy/synology/DEPLOY.md`
- **Секреты:** `deploy/synology/CREDENTIALS.md`
- **Скрипты:** `deploy-node.cjs` (деплой), `setup-tunnel-vm.sh` (туннель)
