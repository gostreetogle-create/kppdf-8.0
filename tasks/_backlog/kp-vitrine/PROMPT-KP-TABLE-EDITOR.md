# PROMPT — WAVE-KP-TABLE-EDITOR (исполнитель continuous)

> **УСТАРЕЛ для текущего состояния репо.**  
> PO отсутствует / дожать до прода →  
> **`PROMPT-KP-TABLE-EDITOR-UNATTENDED.md`** + `WAVE-KP-TABLE-EDITOR-FINISH.md`  
> (land с worktree → 364 chrome → 365 DnD → warm deploy; гигиена контекста).

Скопируй блок ниже только если осознанно гоняешь старую очередь 0→359→361 без finish/deploy.  
Один непрерывный прогон: **сначала коммит WIP студии**, потом **359 → 360 → 361**.  
Deploy — **только** если PO явно скажет «деплой».

---

## Промпт (копировать отсюда)

Ты — исполнитель kppdf-8.0. Читай и следуй:

1. `GEMINI.md`
2. `.agents/skills/kppdf-project/SKILL.md`
3. `.agents/skills/kppdf-executor-continuous/SKILL.md` (или `kppdf-executor-loop`)
4. `OrchestratorKit/AGENTS.md` — claim / heartbeat / archive / отчёт
5. `docs/PO-DIARY.md` §1–§4
6. **Канон волны:** `docs/audits/2026-08-12-kp-table-editor-unified-canon.md`
7. **Спека волны:** `tasks/_backlog/kp-vitrine/WAVE-KP-TABLE-EDITOR.md`

Язык UI и отчётов — русский. Не останавливайся на «ок / поехали».  
`pnpm` only. Не трогай Desktop WIP (`desktop/**`), `ruvector.db`, чужие dirty файлы вне CONFLICT KEYS.

### Цель

Сделать **один** правый инструмент **«Редактор таблицы»** вместо двух панелей «Состав» + «Таблица этого КП», строго по канону. A4 = только превью. Shared `TableTemplate` не патчить.

### Очередь (строгий порядок)

#### ШАГ 0 — закрыть WIP студии (пре-условие 359)

В рабочем дереве уже лежат незакоммиченные правки WAVE-KP-TABLE-STUDIO (356–358) + persist `photoUrl` на items КП.

1. `git status` — stage **только** KP/FE/BE файлы этой студии (не Desktop, не `ruvector.db`, не случайный мусор).
2. Типичный набор (проверь фактический diff):
   - `frontend/.../proposal-create-composition.component.ts`
   - `frontend/.../proposal-create-table-studio.component.ts` (новый)
   - `frontend/.../proposal-create.page.ts` + `.spec.ts`
   - `frontend/.../proposal-create-inspector.component.ts` (типы layout/chrome)
   - `frontend/.../pi-document-templates.service.ts`, `pi-proposals.service.ts`
   - `backend/.../build-document.dto.ts`, `document-template.service.ts`
   - `backend/.../table-template.service.ts` + `.spec.ts`
   - `backend/.../quotation.schema.ts`, `create-quotation.dto.ts`, `quotation.service.ts` + `.spec.ts`
   - docs, если ещё не в `main`: page / PROMPT-KP-TABLE-STUDIO / vision (канон 359 уже в git — не дублируй)
3. Gates перед коммитом: FE `tsc` + `proposal-create.page.spec.ts`; BE `tsc` + `table-template.service.spec.ts` + `quotation.service.spec.ts` (то, что трогал).
4. Commit conventional, например:  
   `feat(kp): Table Studio + photoUrl snapshot for A4 line items`  
   Push на текущую ветку (`main` / tracked).
5. При необходимости короткий archive/lock по правилам kit для 356–358 (если ещё не архивированы). Без этого **не начинай 359**.

#### ШАГ 1 — TZ-SALES-359 (merge UI)

По `WAVE-KP-TABLE-EDITOR.md` §359 + канон §2–§4, §6 п.1–4,7,8.

- Один компонент `proposal-create-table-editor.component.ts` (`data-test="kp-table-editor"`).
- Удалить отдельный Состав и старый table-studio (rename/delete).
- Рейл справа: **Параметры · Редактор таблицы · Условия** (три кнопки; «Состав» нет в DOM).
- Один write-path строк: `ProposalCompositionLineChange` → `onCompositionLineChange`.
- Не изобретать новый вид — перенести toolbar chrome из студии.
- `duplicate` строки не возвращать.

Gates: FE tsc + `proposal-create.page.spec.ts`. Claim → archive 359 → commit/push → next.

#### ШАГ 2 — TZ-SALES-360 (полировка)

По волне §360 + канон §6 п.5,6,9–13.

- Настройка колонки **в её шапке** (Левее / Правее / Ширина % / Скрыть); chips-стрип удалить.
- Полоса `Скрыто: … ×`; `Колонки ▾`; `⋯ Ещё`.
- Нормализация ширин ≈ 100 %; зоны «на бланке» / «только в КП»; empty + skeleton; read-only; light/dark.
- **Правило «Сумма» (зафиксировано PO):**  
  - если колонка `sum`/`Сумма` есть в видимой раскладке бланка → правка суммы в печатной зоне;  
  - если нет → редактируемая сумма всегда в зоне «только в КП» (обратный пересчёт `unitPrice`); на A4 сумму «из воздуха» не рисовать.

Gates: FE tsc + spec. Archive 360 → commit/push → next.

#### ШАГ 3 — TZ-SALES-361 (фото на бланке, хвост)

По волне §361.

- «Фото» = обычная колонка раскладки; миниатюра из `photoUrl` в редакторе.
- Build/preview: img / пустая рамка без битой картинки; ряд ~30 мм.
- Менять фото только через `✎` каталога.

Gates: FE + BE tsc + `table-template.service.spec.ts`. Archive 361 → commit/push.

#### ШАГ 4 — финал волны

- Обновить `docs/pages/proposals-create.page.md` и checkpoint в `docs/agent-checklists/_active-map.md`.
- Отчёт PO: что сделано, критичные файлы, gates PASS.
- **Не** запускать `deploy.ps1`. Написать: «готово предложить деплой» и ждать явной команды.

### Жёсткие запреты

- Правка внутри iframe A4.
- PATCH shared `TableTemplate`.
- Полный конструктор колонок Документов в КП.
- Второй write-path строк / qty-редактор в «Товарах».
- DnD строк в этой волне.
- Коммит Desktop / секретов / `ruvector.db`.
- Остановка mid-queue без блокера.

### Team Room

Перед работой: `node OrchestratorKit/team-room/cli.mjs join` и `inbox`; claim текущего TZ; heartbeat на долгой работе; evidence перед complete.

### CONFLICT KEYS

См. `WAVE-KP-TABLE-EDITOR.md` по каждому TZ. Перед стартом — `_active/` на пересечения. Конфликт → DEFERRED + сообщи PO.

Начинай с **ШАГ 0** (git status + коммит WIP студии). Поехали.

## Промпт (конец)

---

## Ссылки

| Артефакт | Путь |
|----------|------|
| Канон | `docs/audits/2026-08-12-kp-table-editor-unified-canon.md` |
| Волна TZ | `tasks/_backlog/kp-vitrine/WAVE-KP-TABLE-EDITOR.md` |
| Дизайн-промпт (spent) | `PROMPT-KP-TABLE-EDITOR-UNIFIED.md` |
| Очередь | `docs/agent-checklists/_active-map.md` |
