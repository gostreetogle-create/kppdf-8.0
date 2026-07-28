# ПРОМПТ ДЛЯ ИИ: Исправление деплоя KPPDF 8.0 на Synology

## Контекст

ERP-система kppdf-8.0 (NestJS + Angular 20 + MongoDB 4.4) задеплоена на Ubuntu VM внутри Synology NAS. Деплой через Docker Compose. Проблема: внешний IP 193.222.62.240 показывает старый сайт вместо нового.

## Архитектура (КЛЮЧЕВОЕ для понимания)

```
Интернет → 193.222.62.240 (внешний сервер-мост, без белого IP)
    ↓ проброс портов
Synology NAS (хост nastiit)
    ↓ VMM
Ubuntu VM "ubuntu24kppdf_8" (192.168.1.103)
    ↓ Docker
kppdf-8.0 (backend:3000 + mongo:27017)
```

Внешний сервер 193.222.62.240 — это **мост/прокси**, который транслирует трафик на Synology. На Synology работает Ubuntu VM с Docker.

## Текущее состояние (ПОСЛЕ наших действий)

### Что работает (на VM 192.168.1.103):
- ✅ Docker: kppdf-backend (healthy) + kppdf-mongo (healthy, replica set rs0)
- ✅ API: `curl http://localhost:3000/api/health` → `{"status":"ok"}`
- ✅ API login: `POST /api/auth/login` → JWT токен
- ✅ Frontend: Angular SPA отдаётся на localhost:3000
- ✅ Порт 3000 слушает на `0.0.0.0:3000`

### Что НЕ работает:
- ❌ `http://193.222.62.240/` → 502 (мост не может достучаться)
- ❌ Причина: мы убили старый kppdf-3.0 (PID 284957, `/home/tiit/kppdf/backend/dist/main.js`), который работал на порту 3000. Мост был настроен на него.

### Что мы убили (старый сайт):
- `node /home/tiit/kppdf/backend/dist/main.js` — kppdf-3.0, работал на :3000
- `pm2` (PID 223744) — process manager, работал на :4200

## Что нужно сделать (ПРИОРИТЕТ)

### 1. Разобраться с мостом 193.222.62.240

Мост проксирует трафик с 193.222.62.240 на Synology/VM. Нужно понять:
- На какой порт/IP мост проксирует?
- Был ли проброс на :3000 (старый kppdf-3.0) или на другой порт?
- Нужно ли обновить конфигурацию моста?

Проверить из VM:
```bash
# Какой IP/порт моста видит VM?
curl -s http://193.222.62.240/api/health
# Проверить что мост проксирует на VM
ssh tiit@192.168.1.103 "ss -tlnp | grep :3000"
```

### 2. Убедиться что Docker контейнер доступен

На VM:
```bash
# Проверить что backend работает
curl -sf http://localhost:3000/api/health

# Проверить порт
ss -tlnp | grep :3000

# Проверить Docker
docker ps
docker logs kppdf-backend --tail=20
```

### 3. Настроить мост на правильный порт

Если мост проксирует на :3000 — Docker контейнер уже на :3000, должно работать.
Если мост проксирует на другой порт — нужно либо:
- Настроить мост на :3000
- Или пробросить порт: `sudo iptables -t nat -A PREROUTING -p tcp --dport <PORT> -j REDIRECT --to-port 3000`

### 4. Проверить CORS

Backend настроен на `CORS_ORIGIN=https://sport-set.ru`. Если фронтенд доступен по другому URL — нужно добавить его в CORS.

Изменить на VM:
```bash
# Добавить WAN IP в CORS
echo 'CORS_ORIGIN=https://sport-set.ru,http://193.222.62.240' > /opt/kppdf-8.0/.env
# Перезапустить backend
docker compose -f /opt/kppdf-8.0/docker-compose.prod.yml restart backend
```

## SSH доступ

```
Host: 192.168.1.103 (LAN) или 193.222.62.240 (WAN, может не работать)
User: tiit
Password: Tg30121986
```

## Docker контейнеры

```
kppdf-backend  — NestJS API, порт 3000
kppdf-mongo    — MongoDB 4.4, порт 27017 (localhost only)
```

## Конфигурация

Файл `/opt/kppdf-8.0/.env`:
```
JWT_SECRET=014fd3108b0a0142b212f4385464fa4cf29f041461cf04c9608c9fcfb4db0578
JWT_REFRESH_SECRET=ceb70bc50ef132a421e536ff9bda8582387e073ca3f96dbfff3c4272a5298bba
CORS_ORIGIN=https://sport-set.ru
KPPDF_DATA_DIR=/var/lib/kppdf80
ADMIN_PASSWORD=admin-change-me-immediately-in-production
```

Дocker Compose: `/opt/kppdf-8.0/docker-compose.prod.yml`

## Что НЕ делать

- Не менять Dockerfile (уже исправлен: `CMD ["node", "dist/src/main.js"]`)
- Не менять docker-compose.prod.yml (уже исправлен: mongo:4.4, ADMIN_PASSWORD)
- Не пересобирать Docker образ (уже собран и работает)
- Не трогать MongoDB replica set (уже инициализирован)

## Что УЖЕ исправлено (НЕ повторять)

1. Dockerfile: `CMD ["node", "dist/src/main.js"]` (было `dist/main.js`)
2. docker-compose.prod.yml: `mongo:4.4` (было `mongo:7`, требовал AVX)
3. docker-compose.prod.yml: добавлен `ADMIN_PASSWORD` в environment
4. pnpm lockfile: пересобран с pnpm 9.15.0
5. MongoDB replica set: инициализирован
6. Frontend: скопирован из `dist/` в `browser/`
7. Старый kppdf-3.0: убит (PID 284957)
8. PM2: убит (PID 223744)

## Полезные команды

```bash
# SSH на сервер
ssh tiit@192.168.1.103

# Проверить здоровье
curl -sf http://localhost:3000/api/health

# Логи backend
docker logs kppdf-backend --tail=50

# Перезапустить backend
docker compose -f /opt/kppdf-8.0/docker-compose.prod.yml restart backend

# Проверить порты
ss -tlnp | grep :3000

# Проверить процессы
ps aux | grep node

# Убить процесс на порту
sudo fuser -k 3000/tcp
```
