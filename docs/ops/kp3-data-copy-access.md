# Доступ к КП3 по SSH — копирование данных в КП8

> Обновлено: 2026-08-12.  
> Цель: помнить **какой ключ к какому сайту**, как его добавить в панель хостинга и как зайти.  
> Секреты (хост/логин после заполнения) — в gitignored `deploy/kp3-data-copy/CREDENTIALS.md`.

## 1. Что это за ключ

| | |
|--|--|
| Имя | `kppdf8-kp3-data-copy` |
| Тип | ED25519 |
| Принадлежит | проекту **kppdf-8.0** |
| Цель | вход на сервер **КП версии 3**, чтобы потом **перелить данные** в КП8 |
| Не для | деплоя КП8 (там ключ `kppdf80-vm`) |

Файлы:

- Приватный (только на ПК): `%USERPROFILE%\.ssh\kppdf8-kp3-data-copy`
- Публичный (можно светить панели хостинга): рядом `.pub` + копия в `deploy/kp3-data-copy/kppdf8-kp3-data-copy.pub`

**Правило:** приватный ключ и заполненный `CREDENTIALS.md` **никогда** не коммитить.

## 2. Что вставить в панель хостинга («SSH ключи»)

Поля формы (как у тебя на экране):

| Поле | Значение |
|------|----------|
| **Ключ** | вся строка из `.pub` (см. ниже) — формат ED25519 поддерживается |
| **Имя** | `kppdf8-kp3-data-copy` или `Копирование данных КП3→КП8` |
| **Автоматически добавлять на новые сервера** | да, если КП3 живёт на серверах этой панели |

Публичный ключ (одна строка, целиком):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMrBni4KzNldqi6pgDkQoAQd+WqQTYK71lf/lq3w94hT kppdf8-kp3-data-copy@kp8-project
```

После «Сохранить» ключ должен появиться в списке SSH-ключей панели.

## 3. Заполнить реквизиты сервера у себя в репо

```powershell
copy deploy\kp3-data-copy\CREDENTIALS.example.md deploy\kp3-data-copy\CREDENTIALS.md
```

В `CREDENTIALS.md` внеси из панели хостинга:

- хост (IP или hostname для SSH),
- порт (часто 22),
- пользователь SSH,
- домен сайта КП3,
- по возможности путь к приложению / тип БД.

Канон путей: `deploy/kp3-data-copy/README.md`.

## 4. Проверка входа с Windows

```powershell
ssh -i $env:USERPROFILE\.ssh\kppdf8-kp3-data-copy -p 22 USER@HOST
```

Успех = shell без запроса пароля (или только passphrase, если позже поставишь).  
Fingerprint ключа: `SHA256:t1v4jLJxWMuqGo7HLE7PehiR/NfjYsyHVl64Fjzdwzc`.

Опционально `~/.ssh/config`:

```
Host kp3-data-copy
  HostName REPLACE_HOST
  User REPLACE_USER
  Port 22
  IdentityFile ~/.ssh/kppdf8-kp3-data-copy
  IdentitiesOnly yes
```

Потом: `ssh kp3-data-copy`.

## 5. Дальше (не сейчас)

Когда SSH стабильно открывается — отдельная задача/TZ на **перелив данных** (что копируем: Mongo, файлы, шаблоны…).  
Сейчас scope только: ключ + память в документации + вход.

## 6. Связанные файлы

| Файл | Роль |
|------|------|
| `deploy/kp3-data-copy/README.md` | указатель |
| `deploy/kp3-data-copy/CREDENTIALS.example.md` | шаблон |
| `deploy/kp3-data-copy/CREDENTIALS.md` | реальные значения (local only) |
| `deploy/kp3-data-copy/kppdf8-kp3-data-copy.pub` | публичный ключ в репо |
| `deploy/synology/CREDENTIALS.md` | **другой** контур — КП8 Synology/VPS |
