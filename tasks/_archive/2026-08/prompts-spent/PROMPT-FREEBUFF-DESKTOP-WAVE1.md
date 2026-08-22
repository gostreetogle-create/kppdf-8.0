# PROMPT — Freebuff: Desktop волна 1 (v?, install-ошибки, AI/MCP-путаница)

> Три TZ, не пересекающихся по CONFLICT KEYS. Deploy / wipe / prod Synology —
> ЗАПРЕЩЕНЫ без явного слова PO в чате. Не расширять scope сверх того, что
> написано в каждом TZ.

Скопируй **весь блок ниже** в новый чат Freebuff и начни немедленно.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0
Прочитай: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + этот файл.

Deploy / wipe / prod Synology — ЗАПРЕЩЕНЫ без явного слова PO в чате.
Push — можно (GitHub только хранилище).

═══ ЦИКЛ (на каждый TZ) ═══
1. CLAIM: tasks/TZD-5N-*.md → tasks/_active/, checklist по _TEMPLATE.md,
   Claim slot (agent_id, claimed_at).
2. Код строго по acceptance criteria TZ. НЕ трогать файлы вне списка "Файлы для
   изменения" каждого TZ.
3. Гейты из TZ — все PASS перед archive.
4. Archive → tasks/_archive/2026-08/<ID>.done.md + lock + commit + push
   (только свои пути, не git add -A).
5. Обнови docs/agent-checklists/_NOW.md одной строкой.
6. Сразу следующий TZ по очереди ниже — не жди PO.

═══ ОЧЕРЕДЬ ═══
1. tasks/TZD-59-desktop-compat-version-failsafe.md — сначала (кнопка «v?» на сайте).
2. tasks/TZD-61-desktop-onboarding-clarity.md — после (copy/docs-only, не пересекается с #1).
3. tasks/TZD-60-desktop-installer-errors-hardening.md — последней: требует реальной
   установки на Windows-машине (ШАГ 1 внутри TZ) — если машина недоступна в этом чате,
   не гадать по коду вслепую: заскипать с явной причиной в _NOW.md, не архивировать
   как DONE без живого лога установки.

Файлов TZ ещё нет в tasks/ — скопируй текст ниже в
tasks/TZD-59-desktop-compat-version-failsafe.md,
tasks/TZD-61-desktop-onboarding-clarity.md,
tasks/TZD-60-desktop-installer-errors-hardening.md
перед claim (по одному, не разом).

═══ СТОП ═══
- Conflict keys пересеклись с чужим _active → DEFER, запись в _NOW, следующий TZ.
- Gates FAIL после 2 попыток → archive .failed.md, запись в _NOW, не деплоить.
- Хочется тронуть файл вне scope TZ → не делай, зафиксируй находку в отчёте.
- TZD-60 ШАГ 1 невозможен (нет живой Windows-установки) → не выдумывай фикс по гипотезе;
  archive как .deferred.md с причиной, остальные два TZ это не блокирует.

═══ DoD волны ═══
Для каждого TZ — таблица: ID | outcome | archive path | SHA | gates.
Не писать "волна закрыта" — только per-TZ archive + verify.

═══ ВНЕ ЭТОЙ ВОЛНЫ (для PO, не для Freebuff) ═══
1. `deploy/synology/config.env` сейчас указывает
   DESKTOP_DOWNLOAD_URL=/downloads/kppdf-desktop-setup-v0.5.4.zip,
   DESKTOP_RECOMMENDED_VERSION=0.5.4 — а desktop/package.json уже 0.5.6 (TZD-56).
   Последний warm deploy — 2026-08-16 (SHA 61dd144e), до TZD-56/TZD-47/MIG-30x.
   Нужно: cd desktop && pnpm run release-installer, обновить config.env на 0.5.6,
   затем warm deploy — только по явному слову PO, не Freebuff-волной.
2. TZD-60 нашёл, что NSIS-инсталлятор не подписан сертификатом (нет
   signCommand/certificateThumbprint в tauri.conf.json) — вероятный источник
   SmartScreen-предупреждения при установке. Покупка/подключение code-signing
   сертификата — решение PO (деньги + процесс), TZD-60 сам это не решает.
```

---

**Текст TZD-59** — см. приложенный файл `TZD-59-desktop-compat-version-failsafe.md`.
**Текст TZD-60** — см. приложенный файл `TZD-60-desktop-installer-errors-hardening.md`.
**Текст TZD-61** — см. приложенный файл `TZD-61-desktop-onboarding-clarity.md`.

**Как пользоваться:** один чат Freebuff на все три TZ подряд, в указанном порядке.
Перед запуском — просмотри сами TZ (PO/Cursor review), это черновик от аудита, не
подтверждённый Cursor Mode A.
