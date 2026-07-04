# STATUS — <название проекта>

> 📊 **Одна страница = вся правда** о состоянии тех-заданий в этом проекте.
> Откройте этот файл **первым делом** — он сразу показывает картину.

---

## 🛠️ КТО И КОГДА ОБНОВЛЯЕТ ЭТОТ ФАЙЛ

| Событие | Кто | Что делает в STATUS.md |
|---------|-----|------------------------|
| Создал `TZ-NN.txt` в корне OrchestratorKit | PO (или агент-оркестратор) | +строка в ⏳ READY |
| Начал работу (ШАГ 0 TZF-00): TZ-NN → `_active/` | Агент | строка ⏳ READY → 🔥 IN WORK + дата старта |
| Закончил работу (ШАГ 6 TZF-00): TZ-NN → `_archive/` | Агент | строка 🔥 IN WORK → ✅ DONE (или ❌ FAILED) + дата + путь |
| Пере-выпуск проваленного TZ | PO | строка ❌ FAILED → ⏳ READY, новый номер если правило требует |

> Если этот файл повредился — его можно **полностью восстановить**, просканировав
> файловую систему (см. секцию «🔧 ВОССТАНОВЛЕНИЕ» внизу).

---

## 🔥 IN WORK (агенты работают прямо сейчас, файл в `_active/`)

*Пусто — никаких TZ в работе.*

---

## ⏳ READY (готовы к выдаче агенту; файл лежит в `OrchestratorKit/TZ-NN.txt`)

*Пусто — никаких TZ в очереди. Создайте первый TZ:*
```bash
bash OrchestratorKit/make-tz.sh "My first feature"
```

| № | Название | Conflict Keys | Зависит от |
|---|----------|---------------|------------|

---

## ✅ DONE (в `_archive/<YYYY-MM>/TZ-NN.done.txt`)

| № | Дата | Название | Файл архива |
|---|------|----------|-------------|
| TZ-41 | 2026-07-05 | Health Check Panel + Log TUI Mode | tasks/_archive/2026-07/TZ-41.md.done |
| TZ-06 | 2026-07-04 | Organizations & Contacts | _archive/2026-07/TZ-06.done.txt |
| TZ-07 | Catalog Core | 2026-07-04 | DONE |
| TZ-08 | EAV & Product Meta | 2026-07-04 | DONE |
| TZ-09 | Production Dictionaries | 2026-07-04 | DONE |
| TZ-10 | Production Execution | 2026-07-04 | DONE |
| TZ-11 | Warehouse Engine | 2026-07-04 | DONE |
| TZ-05 | 2026-07-04 | System & Workflow | _archive/2026-07/TZ-05.done.txt |
| TZ-04 | 2026-07-04 | Auth & Identity | _archive/2026-07/TZ-04.done.txt |
| TZ-03 | 2026-07-04 | Mongoose & Base Config | _archive/2026-07/TZ-03.done.txt |
| TZ-02 | 2026-07-04 | NestJS Foundation | _archive/2026-07/TZ-02.done.txt |

---

## ❌ FAILED (нужен пере-выпуск; файл в `_archive/<YYYY-MM>/TZ-NN.failed.txt`)

*Пусто — никаких TZ проваленных.*

| № | Дата | Название | Причина провала | Файл архива |
|---|------|----------|-----------------|-------------|

---

## 📊 ГРАФ ЗАВИСИМОСТЕЙ

```
(будет заполнен по мере добавления TZ)
```

---

## 🔧 ВОССТАНОВЛЕНИЕ STATUS.md ИЗ ФАЙЛОВОЙ СИСТЕМЫ

STATUS.md — это **производное от файловой системы**. Если он повредился, восстановите
так:

| Секция | Команда |
|--------|---------|
| ⏳ READY | `ls OrchestratorKit/TZ-*.txt` |
| 🔥 IN WORK | `ls OrchestratorKit/_active/*.txt` |
| ✅ DONE | `find OrchestratorKit/_archive -name '*.done.txt'` |
| ❌ FAILED | `find OrchestratorKit/_archive -name '*.failed.txt'` |

> **Шпаргалка:** запустите `bash OrchestratorKit/verify-status.sh` — он сравнит
> статус с файловой системой и покажет конкретные расхождения. Если что-то
> совсем плохо — `bash OrchestratorKit/kit-doctor.sh` даст человеко-понятные
> советы по каждой проблеме.

---

_Этот файл — single source of truth. Любые обновления — только через TZF-00
(для агента) или `bash OrchestratorKit/auto-archive.sh` (для финализации)._
