# KPPDF 8.0 — Установка с нуля

> Пошаговая инструкция для нового развёртывания.
> Краткий чеклист: [`RUNBOOK.md`](./RUNBOOK.md)
> Полная документация: [`DEPLOY.md`](./DEPLOY.md)

---

## 1. Обзор

KPPDF 8.0 работает на 3 серверах:

| Сервер | Роль |
|--------|------|
| **VPS** (193.222.62.240) | nginx (SSL/HTTP/2) + SSH tunnel endpoint |
| **VM** (192.168.1.103, Synology VMM) | Docker: backend + MongoDB |
| **Synology** (10.0.0.47) | Хост для VM |

---

## 2. Подготовка VM (один раз)

### 2.1 Установка Docker

```bash
ssh tiit@192.168.1.103
sudo bash deploy/synology/server-setup-ubuntu.sh
```

Скрипт установит Docker, создаст каталоги, настроит UFW.

### 2.2 Настройка туннеля

```bash
# Скопировать скрипт:
scp deploy/synology/setup-tunnel-vm.sh tiit@192.168.1.103:/tmp/

# Запустить на VM:
ssh tiit@192.168.1.103 "bash /tmp/setup-tunnel-vm.sh"
```

Что делает:
- Генерирует SSH-ключ (если нет)
- Добавляет публичный ключ на VPS
- Устанавливает autossh
- Создаёт systemd-сервис `kppdf-tunnel`

### 2.3 SSL на VPS

```bash
ssh root@193.222.62.240
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d kppdf-crm.ru --non-interactive --agree-tos --email admin@kppdf-crm.ru --redirect
```

Автопродление настроено автоматически через `certbot.timer`.

---

## 3. Первый деплой

### 3.1 Конфиг деплоя

```powershell
copy deploy\synology\config.env.example deploy\synology\config.env
```

Заполнить `deploy/synology/config.env` (уже заполнен — см. `CREDENTIALS.md`).

### 3.2 Деплой

```powershell
# Node.js (рекомендуется):
node deploy/synology/deploy-node.cjs

# Или PowerShell:
.\deploy\synology\deploy.ps1 -Seed

# Или Python:
pip install paramiko
python deploy/synology/deploy.py --host 192.168.1.103 --seed
```

Скрипт:
1. Собирает Angular frontend
2. Создаёт архив
3. Загружает на VM
4. Записывает `.env`
5. Пересобирает и запускает Docker
6. Проверяет health

---

## 4. Проверка

```bash
# 1. Backend (на VM):
curl http://localhost:3000/api/health
# → {"status":"ok","info":{"mongo":{"status":"up"},...}}

# 2. Туннель (с VPS):
curl -4 -s http://127.0.0.1:4200/api/health
# → JSON

# 3. HTTPS (из браузера):
https://kppdf-crm.ru/
https://kppdf-crm.ru/api/health

# 4. Логин:
# admin / admin-change-me-immediately-in-production
```

---

## 5. Что переживает обновление

| Путь | Содержимое | При деплое |
|------|------------|------------|
| `/opt/kppdf-8.0/` | Код | **Перезаписывается** |
| `/var/lib/kppdf80/mongodb/` | База данных | **Сохраняется** |
| `/var/lib/kppdf80/uploads/` | Файлы | **Сохраняется** |
| `/var/lib/kppdf80/backups/` | Бэкапы | **Сохраняется** |

`docker compose down` без `-v` не удаляет bind-mount данные.

---

## 6. Бэкап

```bash
ssh tiit@192.168.1.103
cd /opt/kppdf-8.0 && sudo bash backup.sh
# → /var/lib/kppdf80/backups/mongo-YYYY-MM-DD_HHMM/
```

---

## 7. Обновление

```powershell
# С dev-машины:
node deploy/synology/deploy-node.cjs
# Без --seed — база не перезаписывается.
```
