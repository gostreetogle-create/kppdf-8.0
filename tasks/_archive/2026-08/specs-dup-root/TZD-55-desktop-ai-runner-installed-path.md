═══════════════════════════════════════════════════════════════
TZD-55: Desktop AI — раннер в установленном билде + папка моделей
═══════════════════════════════════════════════════════════════

> Wave: `tasks/_backlog/desktop/WAVE-DESKTOP-IA-SHELL.md`
> PO smoke: «Не найден каталог desktop: path does not have a parent» при Запустить раннер.
> URLs моделей уже вшиты (Hugging Face) в `model-catalog.ts` — не выдумывать зеркала без нужды.
> **Деплой запрещён**, пока PO не скажет «кати» + VPN off.

РОЛЬ АГЕНТА: Desktop core (`aiRunner.ts`, ai-runner packaging) + тонкий UI на вкладке AI.

ЗАВИСИМОСТИ: **TZD-54 DONE** (вкладка AI уже существует; не параллелить App.svelte).

LAYER: 3

CONFLICT KEYS: `desktop/src/core/aiRunner.ts` ; `desktop/src/ai-runner/**` ; `desktop/src/App.svelte` ; `desktop/src-tauri/**` (если resource/sidecar) ; `desktop/docs/MCP.md` или INSTALL — строка про папку моделей ; `docs/agent-checklists/TZD-55.md`

PAGES: N/A
PAGE_DOCS: N/A

STATUS: READY (после TZD-54)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. `resolveDesktopDir()` ищет `package.json` name=`kppdf-desktop` вверх от `resourceDir`, затем `dirname(resourceDir)`. В **NSIS install** исходников `src/ai-runner` и `node_modules/tsx` рядом нет → `dirname`/join ломается → «path does not have a parent» / «Не найден каталог desktop».
2. Модели качаются в `appDataDir()/models` (`defaultModelDir`) — это правильно; UI **не даёт открыть** эту папку (у Inbox кнопка есть, у модели — нет).
3. Каталог URL уже зашит: Qwen GGUF на `huggingface.co` (`model-catalog.ts` + allowlist `security.ts`). Открытые исходники/зеркала — **не обязательны** в этом TZ; при желании PO позже — отдельный follow-up.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Диагноз + стратегия запуска раннера в release

  1.1. Зафиксировать в checklist: какой путь `resourceDir()` на установленном 0.5.4/0.5.5 (лог или dev note).
  1.2. Выбрать **один** рабочий вариант (предпочтение по простоте для Tauri 2):
       - **A (предпочтительно):** упаковать ai-runner как resource/sidecar рядом с app (как планировали для MCP) и стартовать Node с абсолютным путём к entry + bundled deps; **или**
       - **B:** если в release нельзя тащить tsx — собрать ai-runner в один `ai-runner.cjs` / binary и spawn его.
  1.3. Dev (`tauri dev`) должен продолжать работать через текущий resolveDesktopDir (fallback).
  1.4. RU-ошибка если Node не в PATH: «Установите Node.js — нужен для локальной модели» (как MCP).

ШАГ 2: UX папки моделей

  2.1. Кнопка **«Открыть папку моделей»** на блоке Локальная модель (вкладка AI).
  2.2. `mkdir` models при отсутствии; открыть в Explorer (`shell:open` / тот же паттерн что `openInboxFolder`).
  2.3. Hint: «Сюда кладётся файл .gguf (~2 ГБ). Можно скачать кнопкой или положить вручную с тем же именем, что в списке.»
  2.4. Порядок в UI-тексте оставить: Запустить → Скачать → Перезапустить; плюс открыть папку.

ШАГ 3: Каталог URL (без лишней работы)

  3.1. Не менять Hugging Face URL, если качание с allowlist работает.
  3.2. В docs одна строка: модели — открытые GGUF (Qwen2.5 Instruct), источник HF bartowski.

ШАГ 4: Gates + closeout

  4.1. Unit/smoke: resolve path в mock release layout не бросает «path does not have a parent».
  4.2. tsc + svelte-check PASS.
  4.3. READY FOR REVIEW; **без** deploy. Bump 0.5.6 только если нужен новый installer для проверки PO — иначе оставить 0.5.5 и катить вместе позже.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Import Studio / Form Studio логика
- Требование модели для обычного импорта (её быть не должно)
- Wipe / warm deploy без слова PO
- Новые модели «на будущее» без PO

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] На установленном билде (или симуляции release path) «Запустить» раннер не падает с «path does not have a parent»
- [ ] «Открыть папку моделей» открывает `…/models` (создаёт если нет)
- [ ] Dev-режим не сломан
- [ ] RU hint про ручную укладку .gguf
- [ ] Gates PASS; deploy DEFERRED; Cursor PASS → archive

known_limitation: живой download ~2ГБ в CI не гоняем; PO качает вручную после следующего publish.

HANDOFF: после TZD-54 archive.
