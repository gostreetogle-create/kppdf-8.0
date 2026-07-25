# KPPDF 8.0 — Документация деплоя

> **Source of truth** для деплоя v8.
> Секреты: [`CREDENTIALS.md`](./CREDENTIALS.md) (gitignore).
> Краткий чеклист: [`RUNBOOK.md`](./RUNBOOK.md)
> Последнее обновление: 2026-07-25

---

## 1. Архитектура

```
┌──────────────────────────────────────────────────────────────┐
│                        ИНТЕРНЕТ                               │
│                                                              │
│   Пользователь → https://kppdf-crm.ru/                       │
└──────────────────────┬───────────────────────────────────────┘
                       │ DNS → 193.222.62.240
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  VPS (box-946037) — 193.222.62.240                           │
│  Ubuntu 26.04 LTS                                            │
│                                                              │
│  ┌───────────────┐     ┌──────────────────┐                  │
│  │ nginx:443     │────→│ localhost:4200   │←──── SSH tunnel   │
│  │ (HTTP/2+SSL)  │     │ (reverse tunnel) │     (autossh)    │
│  │ Let's Encrypt │     └──────────────────┘                  │
│  └───────────────┘                                           │
│                                                              │
│  SSL: /etc/letsencrypt/live/kppdf-crm.ru/                    │
│  Автопродление: certbot timer (ежедневно)                    │
└──────────────────────────────┬───────────────────────────────┘
                               │
          ╔════ SSH reverse tunnel ════╗
          ║  VM → VPS: -R 4200:3000   ║
          ╚════════════════════════════╝
                               │
┌──────────────────────────────────────────────────────────────┐
│  Synology NAS (10.0.0.47)                                    │
│  VMM: Ubuntu VM "ubuntu24kppdf_8"                            │
│                                                              │
│  ┌─────────────────────────────────────────┐                 │
│  │  VM — 192.168.1.103                     │                 │
│  │                                         │                 │
│  │  ┌────────────────┐  ┌───────────────┐  │                 │
│  │  │ kppdf-backend  │  │ kppdf-mongo   │  │                 │
│  │  │ :3000 (Docker) │  │ :27017 (Docker)│ │                 │
│  │  └────────────────┘  └───────────────┘  │                 │
│  │  /opt/kppdf-8.0/                        │                 │
│  │  /var/lib/kppdf80/                      │                 │
│  └─────────────────────────────────────────┘                 │
└──────────────────────────────────────────────────────────────┘
```

### Цепочка запроса

```
1. Браузер → https://kppdf-crm.ru/ (DNS: 193.222.62.240)
2. VPS nginx:443 (HTTP/2 + SSL) → proxy_pass http://localhost:4200
3. localhost:4200 → SSH reverse tunnel (autossh systemd)
4. SSH tunnel → VM localhost:3000 → Docker kppdf-backend
5. Backend → MongoDB (kppdf-mongo, replica set rs0)
```

### Почему туннель

VPS (193.222.62.240) и VM (192.168.1.103) в разных сетях. Synology NAS (10.0.0.47) — хост VM, но не маршрутизируется до VPS. Единственный способ связать их — SSH reverse tunnel, который VM сама устанавливает к VPS.

---

## 2. Текущий статус

| Компонент | Статус | Детали |
|-----------|--------|--------|
| Домен kppdf-crm.ru | ✅ | DNS → 193.222.62.240 |
| SSL сертификат | ✅ | Let's Encrypt,到期 2026-10-23, автопродление |
| nginx на VPS | ✅ | HTTP/2, SSL, gzip, кеширование статики |
| SSH tunnel | ✅ | autossh + systemd, автоперезапуск 10 сек |
| Backend на VM | ✅ | Docker kppdf-backend, healthy |
| MongoDB на VM | ✅ | Docker kppdf-mongo 4.4, replica set rs0, healthy |
| CORS | ✅ | http + https kppdf-crm.ru |

---

## 3. Серверы

| Сервер | IP | Роль |
|--------|-----|------|
| **VPS** | `193.222.62.240` | nginx (SSL termination) + SSH tunnel endpoint |
| **VM** | `192.168.1.103` (LAN) | Docker: backend + MongoDB |
| **Synology** | `10.0.0.47` (LAN) | VMM: Ubuntu VM |

---

## 4. SSH доступ

| Сервер | Команда | Пароль | Доступ |
|--------|---------|--------|--------|
| VPS | `ssh root@193.222.62.240` | `serenaubxuekin` | Из интернета |
| VM | `ssh tiit@192.168.1.103` | `Tg30121986` | Только из LAN |

**SSH-ключ (VM → VPS):** ed25519, уже в `authorized_keys` на VPS.

---

## 5. Nginx конфиг (VPS)

Файл: `/etc/nginx/sites-available/kppdf-proxy`

```nginx
server {
    server_name kppdf-crm.ru 193.222.62.240 _;
    client_max_body_size 10M;
    http2 on;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Статика — кеширование 30 дней
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|woff|ttf|eot)$ {
        proxy_pass http://127.0.0.1:4200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location = /robots.txt {
        alias /var/www/html/robots.txt;
        access_log off;
        log_not_found off;
    }

    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }

    location / {
        proxy_pass http://127.0.0.1:4200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }

    listen [::]:443 ssl ipv6only=on;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/kppdf-crm.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kppdf-crm.ru/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = kppdf-crm.ru) {
        return 301 https://$host$request_uri;
    }
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name kppdf-crm.ru 193.222.62.240 _;
    return 404;
}
```

---

## 6. SSH Reverse Tunnel (autossh)

Туннель инициируется **с VM** к VPS. Systemd сервис `kppdf-tunnel`.

```bash
# На VM:
sudo systemctl status kppdf-tunnel    # статус
sudo systemctl restart kppdf-tunnel   # перезапуск
sudo journalctl -u kppdf-tunnel -n 50 --no-pager  # логи

# Проверка (с VPS):
curl -4 -s http://127.0.0.1:4200/api/health
ss -tlnp | grep :4200
```

---

## 7. Docker (на VM)

| Контейнер | Образ | Порт | Описание |
|-----------|-------|------|----------|
| `kppdf-backend` | kppdf-80-backend | `0.0.0.0:3000` | NestJS API |
| `kppdf-mongo` | mongo:4.4 | `127.0.0.1:27017` | MongoDB RS |

```bash
docker ps                                          # статус
docker logs kppdf-backend --tail=50                # логи
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 8. Конфигурация (.env на VM)

Файл: `/opt/kppdf-8.0/.env`

```
JWT_SECRET=014fd3108b0a0142b212f4385464fa4cf29f041461cf04c9608c9fcfb4db0578
JWT_REFRESH_SECRET=ceb70bc50ef132a421e536ff9bda8582387e073ca3f96dbfff3c4272a5298bba
CORS_ORIGIN=https://sport-set.ru,http://kppdf-crm.ru,https://kppdf-crm.ru,http://193.222.62.240
KPPDF_DATA_DIR=/var/lib/kppdf80
ADMIN_PASSWORD=admin-change-me-immediately-in-production
```

**Важно:** После изменения `.env` нужно **пересоздать** контейнер (не просто restart):
```bash
cd /opt/kppdf-8.0 && sudo docker compose -f docker-compose.prod.yml up -d --force-recreate --no-deps backend
```

---

## 9. Деплой

### 9.1 Первичная настройка (один раз)

```bash
# На VM: установка Docker, каталогов, firewall
sudo bash deploy/synology/server-setup-ubuntu.sh

# На VM: настройка туннеля (SSH ключ, autossh, systemd)
scp deploy/synology/setup-tunnel-vm.sh tiit@192.168.1.103:/tmp/
ssh tiit@192.168.1.103 "bash /tmp/setup-tunnel-vm.sh"

# На VPS: SSL сертификат
certbot --nginx -d kppdf-crm.ru --non-interactive --agree-tos --email admin@kppdf-crm.ru --redirect
```

### 9.2 Обновление приложения

**Node.js (рекомендуется):**
```powershell
node deploy/synology/deploy-node.cjs
```

**PowerShell:**
```powershell
.\deploy\synology\deploy.ps1 -Seed
```

**Python (legacy):**
```powershell
python deploy/synology/deploy.py --host 192.168.1.103 --seed
```

### 9.3 Что делает деплой

1. Angular build → `frontend/browser/`
2. Архив: `backend/`, `frontend/`, `docker-compose.prod.yml`
3. SSH upload на VM → `/opt/kppdf-8.0/`
4. Запись `.env`
5. `docker compose build --no-cache backend && up -d`
6. Health check
7. Копирование frontend

---

## 10. Верификация

```bash
# 1. Backend (на VM):
curl http://localhost:3000/api/health
# → {"status":"ok","info":{"mongo":{"status":"up"},...}}

# 2. Туннель (с VPS):
curl -4 -s http://127.0.0.1:4200/api/health
# → JSON

# 3. HTTPS (из браузера):
https://kppdf-crm.ru/              # → страница логина
https://kppdf-crm.ru/api/health    # → JSON

# 4. HTTP → HTTPS редирект:
http://kppdf-crm.ru/               # → 301 → https://kppdf-crm.ru/

# 5. robots.txt:
https://kppdf-crm.ru/robots.txt    # → User-agent: *
```

**Логин:** `admin` / `admin-change-me-immediately-in-production`

---

## 11. SSL сертификат (Let's Encrypt)

```bash
# Установка certbot (на VPS):
apt-get install -y certbot python3-certbot-nginx

# Получение сертификата:
certbot --nginx -d kppdf-crm.ru --non-interactive --agree-tos --email admin@kppdf-crm.ru --redirect

# Автопродление (настроено автоматически):
systemctl status certbot.timer

# Ручное обновление:
certbot renew --dry-run
```

Сертификат: `/etc/letsencrypt/live/kppdf-crm.ru/`
- `fullchain.pem` — цепочка сертификатов
- `privkey.pem` — приватный ключ

---

## 12. Troubleshooting

| # | Проблема | Причина | Решение |
|---|----------|---------|---------|
| 1 | **502 Bad Gateway** | Туннель упал | `ssh tiit@192.168.1.103 "sudo systemctl restart kppdf-tunnel"` |
| 2 | **502 Bad Gateway** | Backend упал | `ssh tiit@192.168.1.103 "sudo docker restart kppdf-backend"` |
| 3 | **ERR_CONNECTION_REFUSED** (порт 443) | SSL не настроен | `certbot --nginx -d kppdf-crm.ru --redirect` |
| 4 | **CORS error** | URL нет в CORS_ORIGIN | Добавить в `.env` на VM + `--force-recreate backend` |
| 5 | MongoDB AVX error | CPU Synology без AVX | `mongo:4.4` (уже используется) |
| 6 | `no replset config` | RS не инициализирован | `docker exec kppdf-mongo mongo --eval "rs.initiate(...)"` |
| 7 | Frontend пуст | `browser/` пуст | `cp -r frontend/dist/kppdf-frontend/browser/* frontend/browser/` |
| 8 | Сертификат истёк | certbot не обновился | `certbot renew --force-renewal` |
| 9 | Туннель не переподключается | autossh завис | `sudo systemctl restart kppdf-tunnel` на VM |

---

## 13. Пути на VM

| Путь | Назначение |
|------|------------|
| `/opt/kppdf-8.0/` | Код приложения (перезаписывается при деплое) |
| `/opt/kppdf-8.0/.env` | JWT + CORS конфиг |
| `/opt/kppdf-8.0/docker-compose.prod.yml` | Docker Compose production |
| `/var/lib/kppdf80/mongodb/` | MongoDB data (сохраняется) |
| `/var/lib/kppdf80/uploads/` | Загруженные файлы |
| `/var/lib/kppdf80/backups/` | Ручные бэкапы |

---

## 14. Отличия от kppdf-3.0

| | kppdf-3.0 | kppdf-8.0 |
|---|-----------|-----------|
| API prefix | `/api/v1/` | `/api/` |
| Health | `/api/v1/health` | `/api/health` |
| Frontend dist | `dist/kppdf-3.0/browser` | `frontend/dist/kppdf-frontend/browser` |
| Data dir | `/var/lib/kppdf` | `/var/lib/kppdf80` |
| Remote dir | `/opt/kppdf-3.0` | `/opt/kppdf-8.0` |
| Mongo | 7.x (AVX required) | **4.4** (AVX-free) |
| SSL | Нет | **Let's Encrypt + HTTP/2** |
| Туннель | Нет | **autossh + systemd** |
| Деплой | deploy.py | deploy-node.cjs |
| Домен | sport-set.ru | **kppdf-crm.ru** |

---

## 15. История

| Дата | Событие |
|------|---------|
| 2026-07-25 | **v5** — HTTPS (Let's Encrypt), HTTP/2, gzip, кеширование статики, robots.txt |
| 2026-07-25 | **v4** — Туннель создан, CORS исправлен, всё работает |
| 2026-07-25 | **v3** — VPS подготовлен, setup-tunnel-vm.sh создан |
| 2026-07-25 | v2 — Диагностика VPS, nginx настроен |
| 2026-07-25 | v1 — Первый деплой v8 |
| 2026-07-13 | VM `ubuntu24kppdf_8` создана |
