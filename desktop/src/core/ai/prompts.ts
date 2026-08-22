/**
 * Сборка системного промпта для AI-нормализации.
 *
 * Базовый промпт — общий; схема сущности подставляется из реестра
 * (GET /api/registry/data-sources). Полные тексты: ai/system-prompts/.
 */

/** TODO(ai): читать общий промпт из ai/system-prompts/general.md. */
const BASE_SYSTEM_PROMPT = `Ты — AI-помощник заполнения kppdf-8.0.
Ниже дана JSON-схема полей сущности. Верни СТРОГО валидный JSON-массив
объектов по этой схеме. Уточняй, если данные неясны. Ничего не выдумывай:
неизвестные значения оставляй пустыми или null.`;

/**
 * Собирает итоговый системный промпт: базовый + схема сущности.
 * @param entitySchema — описание полей сущности (из registry).
 */
export function buildSystemPrompt(entitySchema: string): string {
  return `${BASE_SYSTEM_PROMPT}\n\nСхема сущности (JSON):\n${entitySchema}`;
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
