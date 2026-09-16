# Audit — /studio list: «Новое КП» + куча «Пустой A4» (2026-09-12)

**Автор:** Cursor Mode A · скрины PO  
**Параллельно:** Claude на WAVE catalog-table-IA — эти TZ в очередь после

### Preflight Check Output
- **Context read:** `studio-list.page.ts` L35–37, `createKp` L189–198; `TZ-NX-DOCSTUDIO-S33-CREATE-KP-PATH.md`; `blank-a4-template.seed.ts`; `ensureBlankA4Sentinel` L247–291; `document-template.controller` findAll (admin null org → all); `document-studio.md` 2004 sentinel; `proposals-list` «Создать в студии»
- **Key Constraints:** Mode A; STREAM mid-wave → TZ only
- **Planned Deliverable:** 2 TZ + stream slot
- **Validation Path:** peer not required — clear PO smell + code evidence

---

## 1. «Новое КП» на списке Документов

| Факт | |
|------|--|
| Откуда | S33 shortcut: один клик → studio doc с `docTypeId` = КП (`proposal`), без диалога типа |
| Зачем заложили | Быстрый путь к КП в студии (quotation/lifecycle), рядом с универсальным «Создать документ» |
| Дубль? | Частично: `/proposals` уже имеет «Создать в студии» с тем же смыслом |
| Вердикт PO | Кнопка на `/studio` **не по логике** универсальных документов → **убрать** |

**Спец-функционал КП** (тип, витрина→quotation, статусы) — не выкидывать из продукта; вход:
- из **Сделки → КП** («Создать в студии»), и/или
- шаблон с именем вроде «КП», сохранённый явно → «Из шаблона».

Не держать отдельную жёлтую/серую кнопку «Новое КП» на журнале Документов.

---

## 2. Куча «Пустой A4» в «Из шаблона»

| Факт | |
|------|--|
| Не автосохранение при close редактора | Save-as-template только явная кнопка в панели «Шаблон» |
| Откуда имя | Системный sentinel `BLANK_A4_TEMPLATE_NAME = «Пустой A4»`, tag `system-sentinel-blank-a4` (TZ-DOC-STUDIO-2004) |
| Зачем | У blank studio doc при finalize/архиве нужен `templateId`; sentinel — скрытая тех. опора, **не** пользовательский шаблон |
| Seed | `BlankA4TemplateSeed` на boot: `ensureBlankA4Sentinel` — find-or-create **1 на org** |
| Почему «много одинаковых» | (A) **admin без org** в JWT → `findAll` без фильтра org → видит sentinel **каждой** организации; (B) гонки create без unique index → дубли внутри org; (C) `findAll` не фильтрует `deletedAt` |

На скрине пользователь **Default Administr…** → гипотеза **A** очень сильная.

**Вердикт:** в picker/журнале Шаблоны показывать только **явно сохранённые** пользователем (без sentinel tag). Sentinel оставить в БД для finalize. Dedup + unique index. Опционально один явный UX «Чистый лист» = create без шаблона (уже есть «Создать документ»), не 9 копий sentinel.

---

## 3. Next TZ

1. `TZ-NX-DOCSTUDIO-LIST-DROP-NEW-KP.md` — убрать кнопку  
2. `TZ-NX-DOCSTUDIO-TEMPLATES-NO-SENTINEL-SPAM.md` — hide/dedup/unique  

Очередь: после WAVE catalog-table-IA.
