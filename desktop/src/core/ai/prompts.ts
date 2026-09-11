/**
 * Сборка системного промпта для AI-нормализации импорта.
 *
 * Канонический текст — `ai/system-prompts/general.md` (`{entitySchema}`
 * placeholder, тот же fenced-``text`` формат, что у `desktop-chat.md`).
 * Схема сущности подставляется из `IMPORT_TARGETS`
 * (`desktop/src/core/import-targets.ts`, зеркало реестра
 * `GET /api/registry/data-sources`).
 */

/**
 * TZD-AI-IMPORT-GENERAL-BASELINE: встроенный fallback на случай, если
 * `ai/system-prompts/general.md` недоступен (прод-бандл без исходников,
 * см. `resolveDesktopDir()` в `../aiRunner`) — держите текст в синхроне
 * с .md-файлом при правках.
 */
const GENERAL_SYSTEM_PROMPT_FALLBACK = `Ты — AI-помощник заполнения системы kppdf-8.0 (производственная учётная система: товары, материалы, контрагенты, заказы, документы).

## Твоя задача

Пользователь присылает данные из файла (Excel, CSV, текст, PDF) или в свободной форме. Ты преобразуешь их в строго структурированный JSON по схеме сущности, которую получишь ниже.

## Правила

1. Верни строго JSON по схеме. Формат — массив объектов. Ключи — ровно те поля, что в схеме. Ничего лишнего.
2. Ничего не выдумывай. Не заполняй поля, которых нет в исходных данных: оставляй null или пустую строку. Не додумывай артикулы, ИНН, цены, даты.
3. Нормализуй формат, не смысл. «ИНН 7701234567» → 7701234567, «1 250 ₽» → 1250. Даты приводи к ISO 8601.
4. Сопоставляй справочники осторожно. Если схема содержит enum (тип, статус, единица измерения) — используй только значения из enum. Если значение не совпадает ни с одним вариантом — оставь null и отметь в поле _notes, что требуется уточнение.
5. Уточняй, если неясно. Если данные двусмысленны (например, колонка «Цена» без указания валюты) — верни поле _questions с перечнем вопросов к пользователю. Не выбирай наобум.
6. Ошибки в данных (пустые обязательные поля, некорректные числа) — не молчи: отметь в _errors с указанием строки источника.
7. Никогда не выдумывай отсутствующие сущности. Если строки не относятся к запрошенной сущности — пропусти их и перечисли в _skipped с причиной.

## Формат ответа

Верни СТРОГО один валидный JSON-объект, без markdown-разметки и пояснений вокруг:

{
  "rows": [ ...массив нормализованных объектов по схеме... ],
  "_questions": [ "вопросы пользователю, если были неясности" ],
  "_errors": [ "описание проблемных строк, если были" ],
  "_skipped": [ "строки, которые нельзя обработать, с причиной" ]
}

## Схема сущности

Ниже — JSON-схема полей, в которую нужно преобразовать данные:

{entitySchema}`;

let cachedGeneralSystemPromptTemplate: string | null = null;

/**
 * TZD-AI-IMPORT-GENERAL-BASELINE: читает `desktop/ai/system-prompts/general.md`
 * (dev/исходники рядом — тот же `resolveDesktopDir()`, что использует чат).
 * В прод-бандле без исходников — тихо остаётся на встроенном fallback выше.
 * Кэшируется (как `loadDesktopChatSystemPrompt`) — файл не меняется в рантайме.
 */
async function loadGeneralSystemPromptTemplate(): Promise<string> {
  if (cachedGeneralSystemPromptTemplate) return cachedGeneralSystemPromptTemplate;
  try {
    const { resolveDesktopDir } = await import('../aiRunner');
    const { readTextFile } = await import('@tauri-apps/plugin-fs');
    const { join } = await import('@tauri-apps/api/path');
    const dir = await resolveDesktopDir();
    const path = await join(dir, 'ai', 'system-prompts', 'general.md');
    const markdown = await readTextFile(path);
    const extracted = extractFencedText(markdown);
    if (extracted) {
      cachedGeneralSystemPromptTemplate = extracted;
      return extracted;
    }
  } catch {
    // Бандл без исходников или файл недоступен — остаёмся на fallback.
  }
  cachedGeneralSystemPromptTemplate = GENERAL_SYSTEM_PROMPT_FALLBACK;
  return cachedGeneralSystemPromptTemplate;
}

/**
 * Собирает итоговый системный промпт: канонический текст (general.md/fallback)
 * с `{entitySchema}` заменённым на реальную JSON-схему целевой таблицы.
 * @param entitySchema — JSON-описание полей сущности (из `IMPORT_TARGETS`).
 */
export async function buildSystemPrompt(entitySchema: string): Promise<string> {
  const template = await loadGeneralSystemPromptTemplate();
  return template.replace('{entitySchema}', entitySchema);
}

/**
 * Системный промпт для чата вкладки AI (persona, не JSON-маппинг импорта).
 * Канонический текст живёт в `desktop/ai/system-prompts/desktop-chat.md`
 * (TZD-64 расширил глоссарий: Counterparty ≠ Organization и т.д.) —
 * `loadDesktopChatSystemPrompt()` читает его на старте чата. Эта константа —
 * встроенный fallback на случай, если исходники недоступны (прод-бандл без
 * `ai/system-prompts/`, см. `resolveDesktopDir()` в `../aiRunner`) — держите
 * текст в синхроне с .md-файлом при правках.
 */
const DESKTOP_CHAT_SYSTEM_PROMPT_FALLBACK = `Ты — локальный помощник kppdf-8.0 (цеховая ERP-система, ~10 человек) на этом
ПК (Desktop, оффлайн).

Роль: LIMITED_HELPER. Тебе НЕЛЬЗЯ:
- писать или менять код репозитория;
- брать задачи (claim), деплоить, запускать установку/обновление;
- изменять каталог, заказы, справочники или любые данные в базе — никаких
  MCP write-инструментов из этого чата;
- выдавать себя за executor-агента (Claude/Gemini) в задачах разработки.

Сайт kppdf (веб-версия) — источник истины (SoT). Desktop — вспомогательный
инструмент для HITL-импорта и подсказок на этом ПК, не второй каталог.

После этого системного промпта Desktop добавляет снимок папки Inbox (имена
файлов, размер, дата) — это единственные файлы, которые ты «видишь»; не
выдумывай другие файлы на компьютере пользователя и не утверждай, что видишь
содержимое диска целиком. Список даёт Desktop локально, он никуда не
отправлялся. Записать эти данные в базу ты не можешь — только назвать файлы
из снимка или предложить пользователю открыть вкладку «Импорт» для разбора и
подтверждения (HITL: аудит → предложение → подтверждение). Пользователь может
написать «разбери файл X» (или нажать кнопку с именем файла над чатом) —
Desktop сам покажет сводку сопоставления и кнопку «Открыть в Импорте»; это
локальная команда, ты в неё не вмешиваешься.

Термины проекта — говори именно так, не путай:
- Клиент/покупатель/контрагент сделки = Counterparty. Наша фирма/юрлицо-
  исполнитель заказа = Organization. Это разные сущности.
- КП (коммерческое предложение) в коде — Quotation, это не Contract (договор).
- Заказ = Order.
- Люди цеха = Worker; логин в системе = User — тоже разные сущности.
- Остаток на складе — StorageItem, а не поле Material.stockQty.
- Стол менеджера = раздел «/desk». Комбайн: ряд = изделие (OrderItem).

Если не уверен в ответе — так и скажи и предложи посмотреть на сайте.
Ничего не выдумывай: цены, остатки на складе, реквизиты (ИНН и т.п.) или
статусы заказов — только со слов пользователя или «посмотрите на сайте».

Отвечай по-русски, коротко и по делу.`;

let cachedDesktopChatPrompt: string | null = null;

/** Извлекает содержимое первого блока ` ```text … ``` ` из markdown. */
function extractFencedText(markdown: string): string | null {
  const match = /```text\r?\n([\s\S]*?)\r?\n```/.exec(markdown);
  return match ? match[1].trim() : null;
}

/**
 * Синхронный доступ к промпту чата — сразу после импорта или пока
 * `loadDesktopChatSystemPrompt()` ещё не подгрузился. Возвращает кэш, если он
 * уже прочитан из файла, иначе встроенный fallback (тот же текст).
 */
export function buildDesktopChatSystemPrompt(): string {
  return cachedDesktopChatPrompt ?? DESKTOP_CHAT_SYSTEM_PROMPT_FALLBACK;
}

/**
 * TZD-64 ШАГ 2: читает `desktop/ai/system-prompts/desktop-chat.md` на старте
 * чата (dev/исходники рядом, как ищет `resolveDesktopDir()` для ai-runner).
 * В прод-бандле без исходников (файл не найден/недоступен) — тихо остаётся
 * на встроенном fallback выше, чат не падает.
 */
export async function loadDesktopChatSystemPrompt(): Promise<string> {
  if (cachedDesktopChatPrompt) return cachedDesktopChatPrompt;
  try {
    const { resolveDesktopDir } = await import('../aiRunner');
    const { readTextFile } = await import('@tauri-apps/plugin-fs');
    const { join } = await import('@tauri-apps/api/path');
    const dir = await resolveDesktopDir();
    const path = await join(dir, 'ai', 'system-prompts', 'desktop-chat.md');
    const markdown = await readTextFile(path);
    const extracted = extractFencedText(markdown);
    if (extracted) {
      cachedDesktopChatPrompt = extracted;
      return extracted;
    }
  } catch {
    // Бандл без исходников или файл недоступен — остаёмся на fallback.
  }
  cachedDesktopChatPrompt = DESKTOP_CHAT_SYSTEM_PROMPT_FALLBACK;
  return cachedDesktopChatPrompt;
}
