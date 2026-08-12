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

## Сервер КП3 (заполнить после панели хостинга)

| Поле | Значение |
|------|----------|
| Провайдер / панель | _например Beget / Timeweb / …_ |
| Хост (SSH) | `_hostname или IP_` |
| Порт | `22` (или другой из панели) |
| Пользователь | `_user из панели_` |
| Домен сайта КП3 | `_https://…_` |
| Путь на диске (если известен) | `_/home/.../kppdf-3.0_` |
| БД (тип / имя) | `_Mongo / MySQL / …_` |

---

## Команда проверки

После заполнения хоста/юзера и добавления **публичного** ключа в панель «SSH ключи»:

```powershell
ssh -i $env:USERPROFILE\.ssh\kppdf8-kp3-data-copy -p 22 USER@HOST "uname -a && pwd && ls"
```

Подставь `USER`, `HOST`, порт из таблицы выше.

---

## Заметки

- Дата создания ключа: **2026-08-12**
- Дата успешного первого входа: ___
- Куда складываем дампы на локали: ___
