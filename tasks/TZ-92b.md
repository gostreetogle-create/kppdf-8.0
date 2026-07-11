═══════════════════════════════════════════════════════════════
TZ-92b: codebase-memory MCP — HTTP UI port doc + Linux/macOS plan + ARCH sync
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend Developer (DevTools + Docs)

ЗАВИСИМОСТИ:
  - TZ-92 (codebase-memory MCP integration baseline — `vendor/`, `.mcp.json`,
    `package.json` `mcp:start` script, README, .gitignore) — DONE в текущей
    сессии 2026-07-11.

LAYER: 4   ← ОБЯЗАТЕЛЬНО (cross-cutting docs + scripts, NOT domain code)

CONFLICT KEYS: ← ОБЯЗАТЕЛЬНО
  - ARCHITECTURE.md                                      [новая секция "## MCP Integration (TZ-92)"]
  - vendor/codebase-memory-mcp/README.md                 [Troubleshooting table row + Linux/macOS section + UI port]
  - tasks/TZ-92b.md                                      [NEW — этот файл]
  - tasks/_archive/2026-07/TZ-92b.md.done                [NEW — после TZF-00 ШАГ 6]
  - progress.md                                          [+TZ-92b entry]
  - STATUS.md                                            [TZ-92b в ✅ DONE + atomic commit reference]
  - OrchestratorKit/.mimocode/locks/TZ-92b-mcp-docs.lock [NEW]

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

**TZ-92 baseline (shipped 2026-07-11):**
- `vendor/codebase-memory-mcp/bin/codebase-memory-mcp.exe` (262 MB, gitignored, PE32+ Windows console executable)
- `vendor/codebase-memory-mcp/bin/install.ps1` (⚠️ alien installer — marked ⚠️ НЕ ЗАПУСКАТЬ)
- `vendor/codebase-memory-mcp/doc/LICENSE` (MIT), `doc/THIRD_PARTY_NOTICES.md` (Tree-sitter + 159 parsers)
- `vendor/codebase-memory-mcp/README.md` (install/run/troubleshooting на русском, ~150 строк)
- `.mcp.json` (project-local, RFC 8259-compliant без `_comment`)
- `package.json` `mcp:start` script (no dead `mcp:cli`)
- `.gitignore`: `vendor/codebase-memory-mcp/bin/*.exe`, `index/`, `cache/`, `.codebase-memory/`

**Discovered через эмпирический probe (`./codebase-memory-mcp.exe --ui </dev/null 2>&1`):**

```
level=info msg=mem.init budget_mb=32523 total_ram_mb=65047
level=info msg=server.start version=0.9.0
level=info msg=watcher.start interval_ms=multi-sec
level=info msg=ui.serving url=http://127.0.0.1:9749 port=9749
level=info msg=server.shutdown
level=info msg=watcher.stop
```

✅ **HTTP UI port: 9749** (verified, не suggestion — exact log line `ui.serving url=http://127.0.0.1:9749 port=9749`).
✅ **Бинарь auto-starts HTTP UI при любом запуске** (default mode + `--ui` оба ведут к `ui.serving` log line).
✅ **Override port НЕ предусмотрен** в binary v0.9.0 (no flag observed в --help output).
❌ **Linux/macOS НЕ предоставлен** исходный бинарь (`*-windows-amd64.zip` only).
⚠️ **Tmux недоступен** на Windows runner → interactive probing не сработал; использован
   stdin redirected execution + log scrape (достаточно для discovery).

**Известные ограничения текущей docs:**
1. `vendor/README.md` troubleshooting row содержал «HTTP UI не открывается → TZ-92b candidate» →
   правильно ассертил что port unknown, но не предлагал concrete next-step.
2. `ARCHITECTURE.md` НЕ имел упоминания MCP Integration. Dev tooling section заканчивался
   на TZ-46 console polish, перед Database Layer.
3. `install.ps1` analysis показал installer использует GitHub releases download (HTTPS-only),
   с `$Repo` variable — НЕ содержит hardcoded UI port (installer's job — install бинарь,
   а не запускать его). Структурно different from installer pattern that launches UI после install.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Подтвердить UI port 9749 через 2 стратегии (defense-in-depth)

  Под-шаг 1.1: Empirically verified (TZ-92 probe).
  Под-шаг 1.2: Cross-check via binary log scrape на 2+ запусках (cold + warm):
              ```
              ./vendor/codebase-memory-mcp/bin/codebase-memory-mcp.exe </dev/null 2>&1 | grep ui.serving
              ```
              Должно быть стабильно `port=9749` (no race condition, no random port binding).
  Под-шаг 1.3: Если port отличается — запишите deviation и не утверждайте 9749.

ШАГ 2: Обновить `vendor/codebase-memory-mcp/README.md` — comprehensive section

  Под-шаг 2.1: Добавить секцию «## Поддерживаемые платформы» с таблицей (Windows AMD64✅,
              Windows ARM64❌, Linux❌, macOS❌) + UI port 9749 + transport notes.
  Под-шаг 2.2: Заменить строку «Только Windows. Для macOS/Linux — отдельный TZ-92» в
              секции «Установка на свежем клоне» на ссылку на «Поддерживаемые платформы».
  Под-шаг 2.3: Обновить troubleshooting table row с concrete UI port (:9749) и
              success-path command (`open http://127.0.0.1:9749` после `pnpm run mcp:start`).
  Под-шаг 2.4: Добавить sentence: «HTTP UI port не overridable в binary v0.9.0. Если :9749 занят —
              user responsibility проверить port-bind или подождать release с --ui-port flag».

ШАГ 3: Синхронизировать `ARCHITECTURE.md` с MCP Integration

  Под-шаг 3.1: Добавить row в таблицу «Зоны ответственности агентов» (Section 3):
              | MCP integration | `.mcp.json`, `vendor/codebase-memory-mcp/`, `package.json` (`mcp:start`) | Project-local MCP server (codebase-memory v0.9.0) via stdio transport |
  Под-шаг 3.2: Вставить НОВУЮ секцию «## MCP Integration (TZ-92)» сразу после
              «## Dev Tooling — Local Starter (TZ-41)» и перед «## Database Layer (TZ-03)».
  Под-шаг 3.3: Секция должна содержать: Why MCP, Architecture pattern (vendor/ + .mcp.json +
              gitignore matrix), start.mjs deliberate non-spawn rationale, pnpm `mcp:start`
              script, HTTP UI port `:9749` (verified), Platform support table, Cross-references
              (TZ-91B.2 / TZ-86 / TZ-83 / TZ-92b).
  Под-шаг 3.4: Formatting matching sibling sections (TZ-41 / TZ-46 / TZ-86: bullet-style with
              leading bold topic + nested dashes).

ШАГ 4: Создать TZ-92b follow-up spec для Linux/macOS source-build

  Под-шаг 4.1: В рамках текущего TZ-92b — НЕ реализуем source-build (out of scope, требует
              исследование DeusData repo + toolchain).
  Под-шаг 4.2: Документировать как «open research question» в ARCHITECTURE.md (TZ-92b row in
              «Открытые вопросы» table).
  Под-шаг 4.3: Рекомендация для future TZ-92b-ux: spawn researcher-web для поиска DeusData
              GitHub URL + инструкций build для Linux (gcc + cmake?) + macOS (clang + xcode sdk?).

ШАГ 5: Проверить что NO regression в TZ-92 baseline

  Под-шаг 5.1: `pnpm exec tsc -p tsconfig.app.json --noEmit` (frontend) → exit 0.
  Под-шаг 5.2: `pnpm exec tsc -p tsconfig.build.json --noEmit` (backend) → exit 0.
  Под-шаг 5.3: `node -e "JSON.parse(require('fs').readFileSync('.mcp.json','utf8'))"` → no throw
              (валидирует .mcp.json всё ещё parseable).
  Под-шаг 5.4: `./vendor/codebase-memory-mcp/bin/codebase-memory-mcp.exe --help </dev/null 2>&1 |
              head -2` → `codebase-memory-mcp 0.9.0` (binary smoke test).
  Под-шаг 5.5: Git status — должны быть modified: ARCHITECTURE.md, vendor/codebase-memory-mcp/README.md,
              tasks/TZ-92b.md (new); nothing else.

ШАГ 6: Code-reviewer review + фикс любых NEEDS_FIX

  Под-шаг 6.1: Spawn code-reviewer-minimax-m3 subagent с prompt:
              «VERDICT-ONLY review of TZ-92b documentation sync. NO file edits. ≤3 sentences.
              Files changed: ARCHITECTURE.md (new "## MCP Integration (TZ-92)" section),
              vendor/codebase-memory-mcp/README.md (new "## Поддерживаемые платформы" + UI port),
              tasks/TZ-92b.md (NEW). Verify: (1) port 9749 matches binary v0.9.0 log output,
              (2) install.ps1 anti-run warning still present, (3) MCP Integration section
              placement between TZ-41 and TZ-03, (4) TZ-92b spec follows TZ-template.txt format
              with 8 steps + 6 acceptance criteria + TZF-00 finalization block».
  Под-шаг 6.2: Apply any NEEDS_FIX from reviewer.
  Под-шаг 6.3: Если APPROVED — proceed to ШАГ 7.

ШАГ 7: Atomic commit + tracking фиксация

  Под-шаг 7.1: `git add ARCHITECTURE.md vendor/codebase-memory-mcp/README.md tasks/TZ-92b.md`.
  Под-шаг 7.2: `git commit -m 'docs(arch, mcp): TZ-92b baseline sync — UI port :9749 + Linux/macOS constraint + MCP Integration section'`
              с body описывающим: port discovery empyrical + install.ps1 analysis negative +
              transport stdio vs HTTP UI separation + причина non-spawn в start.mjs + ARCH
              placement после TZ-41.
  Под-шаг 7.3: Verify commit: `git log --oneline -3` → должен содержать TZ-92b commit.

ШАГ 8: TZF-00 финализация

  Под-шаг 8.1: progress.md — добавить запись по формату TZF-00 § 3 (TZ-92b, дата, scope, files).
  Под-шаг 8.2: STATUS.md (root) — TZ-92b в «✅ DONE 2026-07-11 + commit hash».
  Под-шаг 8.3: OrchestratorKit/.mimocode/locks/TZ-92b-mcp-docs.lock — создать с protected_files:
              ARCHITECTURE.md, vendor/codebase-memory-mcp/README.md, tasks/TZ-92b.md.
  Под-шаг 8.4: tasks/_archive/2026-07/TZ-92b.md.done — коопия tasks/TZ-92b.md + ARCHIVE_MARKER
              (outcome: DONE, closed_at: 2026-07-11, closed_by: Backend Developer (DevTools + Docs),
              protected_files, verification, criteria_met, notes).
  Под-шаг 8.5: tasks/TZ-92b.md — DELETE (после копирования в _archive).
  Под-шаг 8.6: Финальный отчёт PO: «Задача TZ-92b выполнена и проверена. Запись добавлена
              в progress.md, документация актуализирована. TZ архивирован в
              _archive/2026-07/TZ-92b.md.done. Критичные файлы: ARCHITECTURE.md,
              vendor/codebase-memory-mcp/README.md, tasks/TZ-92b.md, _archive/.../TZ-92b.md.done.
              Задача закрыта.»

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- ARCHITECTURE.md                                          [+Section "## MCP Integration (TZ-92)" + Zone table row]
- vendor/codebase-memory-mcp/README.md                     [+Section "## Поддерживаемые платформы" + Troubleshooting table row update]
- tasks/TZ-92b.md                                          [NEW — этот файл]
- tasks/_archive/2026-07/TZ-92b.md.done                    [NEW — после TZF-00 ШАГ 6]
- progress.md                                              [+TZ-92b entry]
- STATUS.md                                                [TZ-92b status line]
- OrchestratorKit/.mimocode/locks/TZ-92b-mcp-docs.lock     [NEW]

НЕ ИЗМЕНЯТЬ (явно):
- vendor/codebase-memory-mcp/bin/codebase-memory-mcp.exe   [binary, gitignored anyway]
- vendor/codebase-memory-mcp/bin/install.ps1              [⚠️ НЕ запускать, НЕ модифицировать]
- .mcp.json                                                [TZ-92 baseline — уже валиден]
- package.json                                             [TZ-92 baseline — уже корректен]
- .gitignore                                               [TZ-92 baseline — уже excludes .exe + index/ + cache/]
- backend/src/**                                           [domain logic out of scope]
- frontend/src/**                                          [UI code out of scope]
- start.mjs                                                [orchestrator out of scope — deliberate non-spawn зафиксирован в ARCH]
- docker-compose.yml                                       [Mongo infra out of scope]

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. **`vendor/codebase-memory-mcp/README.md`** содержит секцию «## Поддерживаемые платформы»
   с table (Windows AMD64✅, ARM64❌, Linux❌, macOS❌) + HTTP UI port = 9749 (verified).
2. **`ARCHITECTURE.md`** содержит НОВУЮ секцию «## MCP Integration (TZ-92)» размещённую
   строго между «## Dev Tooling — Local Starter (TZ-41)» и «## Database Layer (TZ-03)».
3. **HTTP UI port :9749** подтверждён через 2+ лог-скрейпа бинаря
   (`./.../codebase-memory-mcp.exe </dev/null 2>&1 | grep ui.serving` → `port=9749`).
4. **`tasks/TZ-92b.md`** следует формату TZ-template.txt (РОЛЬ, ЗАВИСИМОСТИ, LAYER,
   CONFLICT KEYS, 8 ШАГОВ, ФАЙЛЫ, 6+ КРИТЕРИЕВ, TZF-00 финализация).
5. **`install.ps1` НЕ запускался и НЕ модифицировался** (verified via git diff + 🌶 warning
   в README сохранён).
6. **Audit regression net:** TypeScript checks в обеих зонах exit 0; `.mcp.json` parseable;
   binary smoke test (`--help`) returns `codebase-memory-mcp 0.9.0`; git status показывает
   ТОЛЬКО ARCHITECTURE.md + vendor/README.md + tasks/TZ-92b.md (new) как modified/untracked.

═══════════════════════════════════════════════════════════════
КОНФЛИКТ-ЧЕК-ЛИСТ (для параллельных запусков)
═══════════════════════════════════════════════════════════════

Этот TZ трогает (CONFLICT KEYS повторены для удобства):
- ARCHITECTURE.md                  (общая инфра-документация — может конфликтовать с TZ-43+)
- vendor/codebase-memory-mcp/README.md  (новая doc — мало кто ещё пишет)
- tasks/TZ-92b.md                  (single owner)
- tasks/_archive/2026-07/TZ-92b.md.done  (single owner)
- progress.md                      (общий append-only log — может конфликтовать с любым TZ)
- STATUS.md                        (общий status — может конфликтовать с любым TZ)
- OrchestratorKit/.mimocode/locks/TZ-92b-mcp-docs.lock  (single owner)

Если TZ-43 / TZ-44 / TZ-45 / TZ-92c / TZ-93+ запущены параллельно → проверить отсутствие
пересечения по ARCHITECTURE.md / progress.md / STATUS.md перед стартом.

═══════════════════════════════════════════════════════════════
TZF-00: ОБЯЗАТЕЛЬНАЯ ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

Стандартные 8 шагов TZF-00:
1. Самопроверка по 6 критериям приёмки (выше).
2. npm/tsc сборка не требуется (только docs, no domain code).
3. Запись в progress.md по формату TZF-00 § 3.
4. ARCHITECTURE.md уже обновлён (ШАГ 3).
5. .mimocode/locks/TZ-92b-mcp-docs.lock (только если DONE).
6. Копия TZ в tasks/_archive/2026-07/TZ-92b.md.done с ARCHIVE_MARKER.
7. STATUS.md обновлён: TZ-92b в ✅ DONE.
8. verify-status.sh возвращает PASS.
9. Финальный отчёт PO по формату TZF-00 § 7.

═══════════════════════════════════════════════════════════════
ПОДСКАЗКИ ДЛЯ PO
═══════════════════════════════════════════════════════════════

— Это TZ для Backend Developer роли (DevTools + Docs). Агент-исполнитель читает spec
  и выполняет по шагам.

— Скоуп TZ-92b УЗКИЙ: ~3 файла, ~300 строк additions (в основном ARCHITECTURE.md section).
  Не тривиальный (research по port discovery нужен), но и не огромный. 30-45 минут на
  выполнение + code-review.

— Главный «технический» win: HTTP UI port 9749 теперь verified эмпирически через binary
  log scrape (не из marketing docs DeusData, которых нет). Это первый concrete, reproducible
  fact о бинаре, который можно процитировать в README.

— НЕ реализуем в этом TZ: source-build для Linux/macOS. Это future TZ-92b-ux, требует
  spawn researcher-web для GitHub URL DeusData + toolchain analysis. Документировано как
  open question в ARCHITECTURE.md.

— Trade-off: TZ-92b МОЖНО склеить с baseline TZ-92 — но task isolation лучше:
  каждый TZ = atomic commit. TZ-92 commit уже shipped; TZ-92b commit будет отдельным
  с другим scope.

┌─────────────────────────────────────────────────────────────────┐
│ ARCHIVE_MARKER                                                │
│ outcome: DONE                                                  │
│ closed_at: 2026-07-11                                         │
│ closed_by: Backend Developer (DevTools + Docs)                  │
│ protected_files:                                               │
│   - ARCHITECTURE.md                                            │
│   - vendor/codebase-memory-mcp/README.md                       │
│   - tasks/TZ-92b.md (archived)                                 │
│ affected_areas:                                                │
│   - docs/architecture + vendor docs                            │
│ verification:                                                  │
│   - HTTP UI port 9749: VERIFIED (binary log scrape, 2+ retries)│
│   - node -e JSON.parse(.mcp.json): PASS                        │
│   - binary --help: codebase-memory-mcp 0.9.0                   │
│   - frontend tsc: exit 0                                       │
│   - backend tsc: exit 0                                        │
│   - git status: ONLY ARCHITECTURE.md + vendor/README.md +      │
│     tasks/TZ-92b.md modified/untracked                         │
│ criteria_met: 1-6 (all 6)                                      │
│ notes:                                                         │
│   - Тmux unavailable на Windows runner → использован           │
│     stdin redirected exec + log scrape strategy                │
│   - install.ps1 analysis negative for port literal (installer  │
│     doesn't launch server, only downloads to %TEMP%)           │
│   - start.mjs НЕ модифицирован (deliberate non-spawn is        │
│     documented, not enforced)                                  │
│   - Linux/macOS deferred to TZ-92b-ux (out of scope here)      │
