# КП3 → КП8 — учётные данные SSH (ШАБЛОН)

> Скопируй в **`CREDENTIALS.md`** (тот же каталог) и заполни.  
> `CREDENTIALS.md` в `.gitignore` — **не коммитится**.  
> Приватный ключ лежит в Windows `~\.ssh\`, не в этом репо.

```powershell
copy deploy\kp3-data-copy\CREDENTIALS.example.md deploy\kp3-data-copy\CREDENTIALS.md
```

---

## Назначение ключа

| | |
|--|--|
| **Имя в панели хостинга** | `kppdf8-kp3-data-copy` (или «Копирование данных КП3→КП8») |
| **Сайт / приложение** | **КП версии 3** (legacy kppdf-3.x) |
| **Кто владеет ключом** | Проект **kppdf-8.0** (этот репозиторий) |
| **Зачем** | SSH на сервер КП3 → выгрузка/копирование данных в КП8 |
| **Не путать с** | `kppdf80-vm` — деплой КП8 на Synology VM |

---

## Файлы ключа (локально на Windows)

| Файл | Путь |
|------|------|
| Приватный | `%USERPROFILE%\.ssh\kppdf8-kp3-data-copy` |
| Публичный | `%USERPROFILE%\.ssh\kppdf8-kp3-data-copy.pub` |
| Копия .pub в репо | `deploy/kp3-data-copy/kppdf8-kp3-data-copy.pub` |
| Fingerprint (SHA256) | `SHA256:t1v4jLJxWMuqGo7HLE7PehiR/NfjYsyHVl64Fjzdwzc` |
| Comment в ключе | `kppdf8-kp3-data-copy@kp8-project` |

---

## Сервер КП3 (после успешного входа — скопировать в CREDENTIALS.md)

| Поле | Значение (эталон, проверено 2026-08-12) |
|------|----------|
| Провайдер / панель | Timeweb Cloud |
| Хост (SSH) | `130.49.129.240` |
| Hostname | `go.tiit` |
| Порт | `22` |
| Пользователь | `root` |
| Путь на диске | `/opt/kppdf` |
| БД | MongoDB `127.0.0.1:27017` |
| App | Node `*:3000`, nginx `80`/`443` |

> Реальные пароли БД / домен / URL — только в gitignored `CREDENTIALS.md`, если появятся.

---

## Команда проверки

```powershell
ssh -i $env:USERPROFILE\.ssh\kppdf8-kp3-data-copy -o IdentitiesOnly=yes -o BatchMode=yes root@130.49.129.240 "uname -a && ls /opt/kppdf"
```

---

## Заметки

- Дата создания ключа: **2026-08-12**
- Дата успешного первого входа: ___
- Куда складываем дампы на локали: ___
