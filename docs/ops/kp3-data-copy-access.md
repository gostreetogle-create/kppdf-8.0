# Доступ к КП3 по SSH — копирование данных в КП8

> Обновлено: 2026-08-12.  
> Цель: помнить **какой ключ к какому сайту**, как его добавить в панель хостинга и как зайти.  
> Секреты (расширенные заметки) — в gitignored `deploy/kp3-data-copy/CREDENTIALS.md`.  
> **Статус:** вход с Windows по ключу `kppdf8-kp3-data-copy` на `root@130.49.129.240` — **OK** (2026-08-12).

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

### 2.1. Важно: «не добавлен» ≠ доступ есть

В списке колонка **Автодобавление = «не добавлен»** и пустая колонка **Сервера** значит:

- ключ лежит **только в библиотеке панели**;
- на уже существующий VPS с КП3 он **ещё не установлен**;
- `ssh` с твоего ПК **не заработает**, пока ключ не повесят на сервер.

Что сделать (Timeweb Cloud / похожая панель):

1. Меню слева → **Серверы** (не «SSH ключи»).
2. Открыть VPS, где крутится **КП3** (не путать с VPS `193.222.62.240` для КП8).
3. Раздел вроде **Доступ / SSH / Авторизация** → **Добавить SSH-ключ** → выбрать `kppdf8-kp3-data-copy`.
4. В списке ключей у строки `kppdf8-kp3-data-copy` колонка **Сервера** должна показать имя/IP этого VPS.

Галочка «автодобавление на новые» нужна только для *будущих* серверов; для текущего КП3 — ручная привязка выше.

Альтернатива, если уже есть вход по паролю на тот же VPS:

```powershell
type $env:USERPROFILE\.ssh\kppdf8-kp3-data-copy.pub | ssh USER@HOST "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

## 3. Локальная запись реквизитов

```powershell
copy deploy\kp3-data-copy\CREDENTIALS.example.md deploy\kp3-data-copy\CREDENTIALS.md
```

Заполненный эталон уже есть локально (gitignore). Канон доступа: этот файл + `deploy/kp3-data-copy/README.md`.

## 4. Проверка входа с Windows (канон)

```powershell
ssh -i $env:USERPROFILE\.ssh\kppdf8-kp3-data-copy -o IdentitiesOnly=yes root@130.49.129.240
```

| | |
|--|--|
| Хост | `130.49.129.240` (`go.tiit`) |
| User | `root` |
| Порт | `22` |
| Приложение | `/opt/kppdf` |
| Mongo | `127.0.0.1:27017` |
| Fingerprint ключа | `SHA256:t1v4jLJxWMuqGo7HLE7PehiR/NfjYsyHVl64Fjzdwzc` |

Опционально `~/.ssh/config`:

```
Host kp3-data-copy
  HostName 130.49.129.240
  User root
  Port 22
  IdentityFile ~/.ssh/kppdf8-kp3-data-copy
  IdentitiesOnly yes
```

Потом: `ssh kp3-data-copy`.

## 5. Дальше

SSH готов. Следующий шаг по желанию PO — TZ на **перелив данных** из `/opt/kppdf` + Mongo → КП8 (что именно копируем: коллекции, media, шаблоны…).

## 6. Связанные файлы

| Файл | Роль |
|------|------|
| `deploy/kp3-data-copy/README.md` | указатель |
| `deploy/kp3-data-copy/CREDENTIALS.example.md` | шаблон |
| `deploy/kp3-data-copy/CREDENTIALS.md` | реальные значения (local only) |
| `deploy/kp3-data-copy/kppdf8-kp3-data-copy.pub` | публичный ключ в репо |
| `deploy/synology/CREDENTIALS.md` | **другой** контур — КП8 Synology/VPS |
