# KPPDF 8.0 — учётные данные (ШАБЛОН)

> Скопируй в **`CREDENTIALS.md`** (тот же каталог) и заполни реальными значениями.  
> `CREDENTIALS.md` в `.gitignore` — **не коммитится**.

```powershell
copy deploy\synology\CREDENTIALS.example.md deploy\synology\CREDENTIALS.md
```

---

## SSH (Ubuntu VM на Synology)

| Поле | Значение |
|------|----------|
| VM name | `ubuntu24kppdf_8` |
| LAN IP | **`192.168.1.103`** |
| Docker bridge | `172.17.0.1` (не для SSH) |
| WAN IP | `193.222.62.240` (SSH auth fail с dev-машины) |
| Пользователь | `tiit` |
| Пароль | `<DEPLOY_PASSWORD>` — см. kppdf-3.0 `deploy/synology/config.env` |
| SSH-ключи (Windows) | `%USERPROFILE%\.ssh\id_ed25519`, `kppdf40-vps` |

---

## deploy/synology/config.env

| Переменная | Описание |
|------------|----------|
| `DEPLOY_HOST` | **`192.168.1.103`** (LAN) — основной; WAN `193.222.62.240` не работает |
| `DEPLOY_USER` | `tiit` |
| `DEPLOY_PASSWORD` | SSH-пароль |
| `REMOTE_DIR` | `/opt/kppdf-8.0` |
| `KPPDF_DATA_DIR` | `/var/lib/kppdf80` |
| `JWT_SECRET` | 64 hex, см. kppdf-3.0 или `python -c "import secrets; print(secrets.token_hex(32))"` |
| `JWT_REFRESH_SECRET` | отдельная 64 hex строка |
| `CORS_ORIGIN` | `https://sport-set.ru` |

---

## Приложение KPPDF (web UI)

| Поле | Значение |
|------|----------|
| URL prod | https://sport-set.ru |
| URL LAN | http://192.168.1.103:3000 |
| Admin login | `admin` |
| Admin password (default v8) | `admin-change-me-immediately-in-production` |
| Admin password (legacy v3 deploy) | `admin123` — если на сервере ещё старый seed |

> После первого входа смените пароль admin в production.

---

## Docker на сервере

```bash
sudo docker ps
# kppdf-mongo, kppdf-backend
```

---

## Cloudflare / домен

| | |
|---|---|
| Домен | sport-set.ru |
| Tunnel | cloudflared на Ubuntu VM (см. kppdf-3.0 deploy/synology/tunnel_*.py) |

---

## Legacy (откуда скопированы секреты)

| Проект | Файл |
|--------|------|
| kppdf-3.0 | `WebstormProjects/kppdf-3.0/deploy/synology/config.env` |
| kppdf-4.0 | `WebstormProjects/kppdf-4.0/deploy/config.env` |

---

## Заметки после успешного деплоя

_Заполнить после первого успешного deploy:_

- Дата успешного деплоя: ___
- Рабочий SSH-хост (LAN/WAN): ___
- Версия образа backend: ___
- Примечания: ___
