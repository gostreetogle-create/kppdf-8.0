# KPPDF 8.0 — деплой на Synology / Ubuntu VM

> **Source of truth** для будущих деплоев v8.  
> Секреты (SSH, JWT, пароли): [`CREDENTIALS.md`](./CREDENTIALS.md) — **локальный файл, не в git** (шаблон: [`CREDENTIALS.example.md`](./CREDENTIALS.example.md)).

---

## Статус последнего деплоя

| Дата | Результат | Примечание |
|------|-----------|------------|
| 2026-07-13 | ⏳ В процессе | SSH OK на **`192.168.1.103`** (`ubuntu24kppdf_8`). Архив ~97 MB собран. `docker build` на VM — до 15 мин. WAN `193.222.62.240` — auth fail. `sport-set.ru` → Cloudflare 530 |

**После успешного деплоя:** обновите эту таблицу и секцию «Verify» ниже.

---

## Инфраструктура

```
Интернет
   │
   ├─ 193.222.62.240 (WAN, Keenetic/Synology) — SSH auth не работает с dev-машины
   │       └─ проброс → LAN
   │
   └─ https://sport-set.ru (Cloudflare Tunnel → nginx → :3000)

Ubuntu VM `ubuntu24kppdf_8` (Synology VMM, хост `nastiit`)
   IP: 192.168.1.103  (+ 172.17.0.1 docker0)
   SSH: tiit@192.168.1.103  (из домашней LAN, без VPN)
   /opt/kppdf-8.0/          ← код (перезаписывается deploy.py)
   /var/lib/kppdf80/        ← данные (сохраняются)
      mongodb/
      uploads/
      backups/
```

| Компонент | Значение |
|-----------|----------|
| Стек | Docker Compose `docker-compose.prod.yml` |
| MongoDB | 7.x, replica set `rs0`, контейнер `kppdf-mongo` |
| Backend | NestJS, контейнер `kppdf-backend`, порт **3000** |
| Frontend | Angular build → `frontend/browser/` → `FRONTEND_PATH` в backend |
| Prod URL | https://sport-set.ru |
| Health | `GET /api/health` |

---

## Предварительные требования (dev-машина)

- Node.js 20+, npm
- Python 3 + `pip install -r deploy/synology/requirements.txt`
- Файл `deploy/synology/config.env` (см. CREDENTIALS.md)
- SSH-доступ к серверу (LAN или WAN)

---

## Быстрый деплой (обновление)

```powershell
cd D:\kppdf-8.0

# 1. Проверки
.\deploy\synology\preflight.ps1

# 2. Бэкап на сервере (рекомендуется)
ssh tiit@192.168.1.103 "cd /opt/kppdf-8.0 && bash backup.sh"

# 3. Деплой (без seed — данные Mongo сохраняются)
python deploy/synology/deploy.py

# Явно указать хост (предпочтительно LAN):
python deploy/synology/deploy.py --host 192.168.1.103
```

**Первый деплoy на чистом сервере:**

```powershell
python deploy/synology/deploy.py --host 192.168.1.103 --seed
```

---

## Что делает `deploy.py`

1. `npm run build` в `frontend/` → копия в `frontend/browser/`
2. Архив: `backend/`, `frontend/browser/`, `docker-compose.prod.yml`
3. SSH upload → `/opt/kppdf-8.0/`
4. Запись `.env` (JWT, `KPPDF_DATA_DIR`, CORS)
5. `docker compose -f docker-compose.prod.yml build --no-cache backend && up -d`
6. Health check `/api/health`
7. (опционально `--seed`) restart backend — Nest seeds на старте

---

## Сколько ждать

| Этап | Время |
|------|-------|
| Angular build (локально) | ~1 мин |
| Upload архива ~97 MB | 1–3 мин |
| **`docker build backend` на VM** | **10–15 мин** (самый долгий) |
| Health check | до 90 с |

> Вывод `deploy.py` может «молчать» несколько минут — идёт сборка Docker на VM.

**На сервере:**

```bash
ssh tiit@192.168.1.103
sudo docker ps
curl -s http://127.0.0.1:3000/api/health
curl -sI http://127.0.0.1:3000/ | head -5
sudo docker compose -f /opt/kppdf-8.0/docker-compose.prod.yml logs -f backend --tail=50
```

**Снаружи:**

```bash
curl -sI https://sport-set.ru/
curl -s https://sport-set.ru/api/health
```

**Логин в приложение:** см. `CREDENTIALS.md` → «Приложение KPPDF».

---

## Первичная установка сервера (один раз)

Если Ubuntu VM ещё не настроена — см. [`INSTALL.md`](./INSTALL.md) (из kppdf-3.0, шаги актуальны):

```powershell
scp deploy/synology/server-setup-ubuntu.sh tiit@192.168.1.103:/tmp/
ssh tiit@192.168.1.103 "sudo bash /tmp/server-setup-ubuntu.sh"
```

---

## Cloudflare Tunnel / nginx

Если `sport-set.ru` отдаёт **530** — origin недоступен:

```bash
# на Ubuntu VM
sudo systemctl status cloudflared
sudo systemctl status nginx
curl -sI -H 'Host: sport-set.ru' http://127.0.0.1:3000/
```

Документация tunnel из kppdf-3.0:  
`WebstormProjects/kppdf-3.0/deploy/synology/tunnel_*.py`, `nginx.conf`

---

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| `Auth failed` SSH WAN | Деплоить из LAN: **`192.168.1.103`**, не `193.222.62.240` |
| `JWT_SECRET is required` | Заполнить JWT в `config.env` |
| Mongo permission denied | `sudo chown -R 999:999 /var/lib/kppdf80/mongodb` |
| Backend unhealthy | `docker logs kppdf-backend`, проверить `MONGO_URI` |
| Frontend 404 | Проверить `frontend/browser/index.html` на сервере, `FRONTEND_PATH=/app/frontend` |
| Старый kppdf-3.0 на :3000 | Остановить: `docker stop kppdf-backend kppdf-mongodb` или сменить порт в compose |

---

## Файлы деплоя

```
deploy/synology/
  DEPLOY.md              ← этот документ
  RUNBOOK.md             ← краткий чеклист
  CREDENTIALS.md         ← секреты (gitignore, создать из example)
  CREDENTIALS.example.md
  config.env             ← для deploy.py (gitignore)
  config.env.example
  deploy.py
  preflight.ps1
  backup.sh
  server-setup-ubuntu.sh
  INSTALL.md
docker-compose.prod.yml  ← prod stack
```

---

## Отличия от kppdf-3.0

| | kppdf-3.0 | kppdf-8.0 |
|---|-----------|-----------|
| API prefix | `/api/v1/` | `/api/` |
| Health | `/api/v1/health` | `/api/health` |
| Frontend dist | `dist/kppdf-3.0/browser` | `frontend/dist/kppdf-frontend/browser` |
| Data dir | `/var/lib/kppdf` | `/var/lib/kppdf80` |
| Remote dir | `/opt/kppdf-3.0` | `/opt/kppdf-8.0` |
| Mongo container | `kppdf-mongodb` | `kppdf-mongo` |
| Seed | `node dist/.../seed.js` | автоматически при старте Nest |

---

## История документации

- **2026-07-13** — VM `ubuntu24kppdf_8` @ `192.168.1.103`, SSH verified. Deploy pending (docker build).
