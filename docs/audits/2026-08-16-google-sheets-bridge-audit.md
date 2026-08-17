# Audit — мост Google Sheets ↔ kppdf

**Дата:** 2026-08-16  
**Скоуп:** интеграция Google Таблиц с ERP (импорт данных, HITL, Desktop/MCP)  
**Метод:** сверка намерения PO с живым контуром Desktop Import Studio + ImportTask + PO-CANON  
**Исполнение кода:** нет (Mode A)

Связано: `docs/PO-CANON.md` (Desktop/MCP = управляемый импорт),  
`docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md`,  
`tasks/_backlog/sales/WAVE-PRODUCT-PASSPORTS.md` (Sheets уже эталон паспортов).

---

## Verdict

> **Update 2026-08-16 (вечер):** PO выбрал вместо Sheets путь **Desktop Excel Forms** (`WAVE-DESKTOP-EXCEL-FORMS`, TZD-50→51). Этот аудит остаётся справочным; исполнение — не Sheets.

**Да, связать можно.** Правильная модель — не «зеркало всех таблиц БД в Google», а **Sheets = черновик/вход**, сайт (Mongo/Nest) = SoT. Кнопка «отправить на сайт» → валидация → хорошие строки в БД, плохие/дубли — отчёт без записи.

Уже есть почти готовый путь: **Desktop Import Studio** (Excel/CSV → маппинг → HITL → propose/confirm). Google Sheets лучше подключать **как ещё один источник строк** в тот же контур, а не строить второй write-path.

MCP Google Sheets в Cursor **сейчас нет** (нет сервера в MCP catalog). Для агента в чате это опциональный helper; для менеджера на работе — не основной канал.

---

## Что PO хочет (структурировано)

| Желание | Оценка |
|---------|--------|
| Таблица Google с листами «как у нас в проекте» | Ок **только для справочников/массового ввода**, не для всех ~90 сущностей |
| Видеть/дополнять данные в Sheets | Ок как **staging**, не как live-копия БД |
| Заполнил → «Отправить на сайт» → в Mongo | Цель правильная |
| Дубли/мусор не едут, хорошие едут + отчёт | Совпадает с HITL / ImportTask |
| Через API или Desktop + ключ | Да; Desktop предпочтительнее секретов на VPS |

---

## Антипаттерн (не делать)

1. **Лист на каждую коллекцию Mongo** (User, Role, StockMovement, MutationJournal…) — шум, утечки, второй SoT, конфликты с веб-формами.
2. **Двусторонняя live-синхронизация** Sheets ↔ БД без HITL — ломает «один write-path» (PO-CANON).
3. **Автопубликация из MCP Cursor** в каталог без подтверждения человека — запрещено каноном.

**Whitelist для листов (старт):** материалы, изделия/каталог, контрагенты, паспорта изделий, опц. категории/склады.  
**Позже / осторожно:** заказы, КП (коммерческий snapshot).  
**Никогда из Sheets:** пароли, device grants, journal, статусы workflow, права.

---

## Варианты (от лучшего к худшему для вашего кейса)

### A. Без Google API — File bridge (уже почти есть)

**Как:** в Sheets «Файл → Скачать → xlsx/csv» → кинуть в Desktop Import Studio → маппинг → проверка → запись.

| | |
|--|--|
| Плюсы | 0 секретов Google; уже Excel/CSV inbox; HITL живой |
| Минусы | Нет кнопки «Отправить»; ручной download |
| От PO | Ничего сверх аккаунта Sheets; шаблоны заголовков можно сделать вручную |
| Рекомендация | **Старт сегодня** для разовых заливок |

### B. Desktop + Google Sheets API (рекомендуемый целевой)

**Как:** в Desktop — OAuth (или ключ service account) + ID таблицы. Кнопка «Загрузить из Google» / «Отправить на сайт» тянет листы через API → тот же Import Studio / ImportTask → дубли в отчёт, good rows → Nest.

| | |
|--|--|
| Плюсы | Секреты на ПК PO, не на VPS; UX «в Desktop»; один write-path с Excel |
| Минусы | Нужен Google Cloud + OAuth consent; первая настройка ~30–60 мин |
| От PO | Google-аккаунт; создать Cloud project; включить Sheets API; OAuth client (Desktop) **или** service account + share таблицы на `…@….iam.gserviceaccount.com`; ID/URL таблицы |
| Рекомендация | **Целевой метод** под «кнопка отправить» |

Технически: `googleapis` / Sheets API v4 `spreadsheets.values.get` → существующие parsers → propose/confirm.

### C. Google Apps Script «кнопка в таблице» → Nest API

**Как:** в таблице кнопка меню → скрипт POST на `/api/import-jobs` (или dedicated bulk endpoint) с JWT/device token / одноразовым import-token.

| | |
|--|--|
| Плюсы | UX прямо в Sheets; без Desktop |
| Минусы | Секрет в Script Properties; CORS/сеть до VPS; сложнее revoke; Apps Script квоты |
| От PO | Тот же Cloud/API; URL API; токен импорта (не пароль админа) |
| Рекомендация | Ок, если часто правят **только** в Sheets без Desktop |

`sourceType: 'api'` в `ImportJobs` уже намекает на такой канал — дожать исполнение, не плодить второй модуль.

### D. Backend сам ходит в Sheets (poll / webhook)

**Как:** Nest cron читает таблицу по service account.

| | |
|--|--|
| Плюсы | Без Desktop |
| Минусы | Секрет на сервере; ops; риск silent sync |
| Рекомендация | **Не сейчас** (только если PO сознательно хочет server-side) |

### E. MCP Google Sheets в Cursor

**Как:** поставить community MCP (`@modelcontextprotocol/server-google-sheets` или аналог) → агент читает колонки/строки для аудита и черновиков TZ.

| | |
|--|--|
| Плюсы | Удобно архитектору: «разбери колонки паспортов» |
| Минусы | Не замена кнопки для менеджера; write из чата опасен без HITL |
| От PO | OAuth/credentials для Cursor MCP |
| Рекомендация | **Опционально** рядом с WAVE-PRODUCT-PASSPORTS; не прод-заливка |

### F. «Шаблон книги со всеми листами» вручную

Один Google Spreadsheet: листы `Материалы`, `Изделия`, `Контрагенты`, `Паспорта`… с **каноническими заголовками** (= поля схем). Заполнение → A или B.

Не требует кода на первом шаге; заголовки можно выгрузить из `domain-schema` / OpenAPI позже скриптом.

---

## Что уже есть в проекте (не с нуля)

| Компонент | Статус |
|-----------|--------|
| Desktop Inbox Excel/CSV | Есть |
| Import Studio + маппинг колонок + HITL | Есть (волна TZD) |
| Propose → confirm / отчёт по строкам | Есть (материалы + часть product/counterparty) |
| `ImportJobs.sourceType` csv \| excel \| **api** | Схема есть; api — дожать |
| MCP tools kppdf_* | Есть; **Google MCP — нет** |
| Паспорта: stub BE + backlog ждёт **ссылку на Sheets** | `WAVE-PRODUCT-PASSPORTS` |

---

## Что потребуется от PO (чеклист)

### Минимум (вариант A — уже можно)

- [ ] Решить **какие 2–4 сущности** первые (рекомендация: паспорта + материалы/изделия + контрагенты)
- [ ] Дать **ссылку** на эталонную Google-таблицу паспортов (блокирует `WAVE-PRODUCT-PASSPORTS`)
- [ ] Сказать: Sheets только **вход** или ещё и «смотреть живые данные с сайта» (второе = отдельная выгрузка, не live mirror)

### Для кнопки / API (вариант B или C)

- [ ] Google Cloud Console: проект → **Google Sheets API** ON
- [ ] Выбрать auth:
  - **Desktop OAuth** (удобнее личному аккаунту), или
  - **Service account** + «Поделиться» таблицей с email сервис-аккаунта (Editor)
- [ ] Скачать JSON credentials **не в git** (только локально / Desktop secure store)
- [ ] ID таблицы (из URL `…/d/<SPREADSHEET_ID>/edit`)
- [ ] Политика дублей: что ключ уникальности (артикул? ИНН? номер паспорта?)

### Не нужно

- Открывать весь Drive на запись агенту
- Зеркалить User/Role/Permissions в Sheets
- Класть client_secret в репозиторий

---

## Рекомендуемая дорожка

| Шаг | Действие | Кто |
|-----|----------|-----|
| 0 | PO: ссылка на таблицу паспортов + whitelist сущностей | PO |
| 1 | Аудит колонок Sheets → канон полей (без кода продукта) | Cursor |
| 2 | Книга-шаблон: 3–4 листа с заголовками | Cursor TZ → local / вручную |
| 3 | Заливка через **A** (скачать xlsx → Desktop) — проверка HITL | PO + Desktop |
| 4 | TZ: Desktop «Google Sheets» source (вариант **B**) | Cursor → executor |
| 5 | Опц.: Apps Script кнопка (**C**) или Cursor Google MCP (**E**) для аудитов | по нужде |

---

## Ответ на «что это даст»

- Массовый ввод без кликов по веб-формам.
- Единый шаблон колонок для цеха/снабжения.
- Контролируемая заливка: дубли не портят БД, отчёт по отклонённым строкам.
- Паспорта и каталог перестают жить «только в Google» — сайт становится SoT, Sheets — удобный редактор входа.

---

## Out of scope сейчас

- Реализация кода (нужна явная TZ-волна после ссылки на таблицу).
- Полный dump Mongo → Sheets.
- Двусторонний realtime sync.
- Заказы/КП bulk до стабильного HITL справочников (как в desktop vision audit).
