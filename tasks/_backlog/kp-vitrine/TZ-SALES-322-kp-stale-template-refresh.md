# TZ-SALES-322: КП — «шаблон устарел» → Обновить из шаблона (свойства)

PAGES: /proposals/create ; /proposals (карточка/редактирование КП, если уже есть)
PAGE_DOCS: proposals-create.page.md
Канон: `tasks/_backlog/kp-vitrine/NOTE-KP-template-snapshot-lock.md`
Аудит snapshot: поля `templateId` / `templateSnapshot` уже в schema, проводки — later

**STATUS:** ⏳ **PARK** до DONE: (1) SALES-321 fidelity preview, (2) persist Save с `templateSnapshot` (отдельный TZ или слой в этой волне — не начинать 322 без snapshot на сохранённом КП).

РОЛЬ АГЕНТА: fullstack UX — детект расхождения бланка КП с живым DocumentTemplate + кнопка в Параметрах.
ЗАВИСИМОСТИ: TZ-SALES-321; Save КП пишет `templateId` + snapshot (+ желательно `templateRevision` / hash); NOTE snapshot-lock
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; backend/src/modules/quotation/quotation.schema.ts; backend/src/modules/quotation/quotation.service.ts; backend/src/modules/document-template/document-template.schema.ts (только если нужен revision/hash); docs/pages/proposals-create.page.md

Проверено: `quotation.schema` templateId/templateSnapshot; Create studio inspector = Параметры; live `build()` сейчас без snapshot; NOTE lock table.
Dictation: «обновить шаблон» = пересобрать **снимок бланка** из live DocumentTemplate, не менять каталог шаблонов и не трогать чужие КП.

═══════════════════════════════════════════════════════════════
ПРОДУКТ (как сказал PO)
═══════════════════════════════════════════════════════════════

В свойствах (Параметры) Create/Edit КП:

1. Система сравнивает сохранённый бланк КП с **актуальной** версией шаблона (`templateId`).
2. Если отличается → показать понятный RU hint + кнопка **«Обновить»** (не автоматом).
3. По нажатию → подтянуть live шаблон в snapshot КП (после confirm, если есть правки бланка у менеджера — см. ниже).
4. Если статус hard-lock («оплачена» / `converted` — по канону NOTE) → кнопки нет, только текст «бланк зафиксирован».

Это **доп. фича** поверх snapshot: default = старое КП не пляшет; добровольный refresh когда шаблон в конструкторе изменили.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ (на момент написания)
═══════════════════════════════════════════════════════════════

- Snapshot на Save ещё не wired → детект «устарел» не из чего считать.
- Inspector уже есть (`proposal-create-inspector`); place CTA туда (секция «Шаблон» / бланк).
- Не путать с `versions[]` freeze отправки клиенту (SALES-302).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ (когда снимут PARK)
═══════════════════════════════════════════════════════════════

1. **Ревизия шаблона (SoT расхождения)**  
   - На DocumentTemplate: `updatedAt` уже есть **или** явный `contentRevision` (инкремент при save blocks/bg).  
   - На Quotation snapshot: хранить `templateRevision` / `templateUpdatedAt` на момент Save/refresh.  
   - Stale = `quotation.templateRevision !== template.currentRevision` (или сравнение hash HTML/blocks — выбрать один способ в реализации и зафиксировать в Executor report).

2. **UI Параметры**  
   - Если stale и editable: banner/hint «Шаблон в конструкторе изменился» + `PiButton` **«Обновить бланк»**.  
   - Confirm: «Подставить актуальный шаблон? Правки только на бланке этого КП могут сброситься.» (если ещё нет per-KP бланк-правок — короче).  
   - После OK: `build(templateId, sourceIds)` → записать новый `templateSnapshot` + revision; center перерисовать из snapshot (не только live preview).  
   - Не stale → кнопки нет (или disabled «Актуален»).

3. **Gates по статусу**  
   - Hard-lock статусы из NOTE: нет refresh.  
   - Сняли lock-статус → снова можно показать stale+Обновить.

4. **Тесты**  
   - Unit: stale true/false; refresh пишет snapshot; lock status скрывает CTA.  
   - FE tsc + proposal-create (или quotation) tests.

5. **Docs** — proposals-create.page.md + NOTE link; WAVE row DONE.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Авто-обновление всех КП при Save в builder  
- TZ-SALES-321 keys без нужды (если 321 ещё open — DEFER)  
- Print 320, cascade 318  
- deploy

known_limitation:
- Per-block правки бланка внутри КП (не через шаблон) — later  
- Выбор «оплачена» = accepted vs paid — из NOTE, не invent в тихую

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. При расхождении revision — в Параметрах видна «Обновить бланк»; без расхождения — нет навязчивого CTA.
2. Клик + confirm → snapshot = live template; center показывает новый бланк.
3. Hard-lock статус → CTA отсутствует.
4. Правка шаблона в builder **без** нажатия Обновить **не** меняет уже сохранённый КП (регресс snapshot).
5. Gates зоны + checklist + archive после PASS.
6. Deploy: НЕТ.

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

По `GEMINI.md` → `_archive/2026-08/TZ-SALES-322.done.md`.
Пока PARK: не claim; ждать оркестратора / PO «сними PARK».
