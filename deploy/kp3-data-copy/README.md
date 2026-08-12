# SSH-доступ к КП3 (legacy) — копирование данных → КП8

> **Зачем:** отдельный ключ, чтобы с машины/агента **kppdf-8.0** заходить на сервер
> **КП версии 3** и потом переливать данные (дампы, файлы, Mongo и т.п.).
> Это **не** ключ деплоя КП8 (тот — `kppdf80-vm`).

| Что | Где |
|-----|-----|
| Как подключиться (канон) | [`docs/ops/kp3-data-copy-access.md`](../../docs/ops/kp3-data-copy-access.md) |
| Шаблон секретов | `CREDENTIALS.example.md` → скопировать в `CREDENTIALS.md` |
| Реальные хост/логин | **только** `CREDENTIALS.md` (gitignore) |
| Публичный ключ (можно в git) | `kppdf8-kp3-data-copy.pub` |
| Приватный ключ | `%USERPROFILE%\.ssh\kppdf8-kp3-data-copy` — **никогда в git** |

```powershell
copy deploy\kp3-data-copy\CREDENTIALS.example.md deploy\kp3-data-copy\CREDENTIALS.md
```
