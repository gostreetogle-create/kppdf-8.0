# PROMPT — Desktop: бесплатная модель по API (после чата)

> Делай **после** TZD-62 (чат уже в UI). Если сейчас IN WORK TZD-63/64 — сначала их archive.
> Не четвёртая вкладка. Deploy нет.

**PO:** скопируй блок в чат тому же desktop-агенту (или новому, если 62–64 закрыты).

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0
GEMINI.md + kppdf-executor-loop + tasks/TZD-65-desktop-openai-compat-api.md

Цель: на вкладке AI карточка «Модель по API» (OpenAI-compatible).
Пример: TokenRouter qwen/qwen3.8-max-free, base https://api.tokenrouter.com/v1
НЕ четвёртая дверь. НЕ Ollama. НЕ путать ключ API с pairing apiKey сайта.
НЕ git add ключей. НЕ деплой.

Почини склейку URL: base_url уже с /v1 не должен стать /v1/v1/chat/completions.

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) TZ → tasks/_active/TZD-65.md + checklist
3) Claim slot agent_id + claimed_at ISO
4) Чужой _active на App.svelte / ChatPanel → STOP
Затем код по TZ, gates из TZ, archive 2026-08/TZD-65.done.md + lock + точечный commit/push.

DoD: пресет TokenRouter, три поля, Проверить, чат без GGUF, баннер «текст уходит на сервер», парсер примера. Без деплоя.
```
