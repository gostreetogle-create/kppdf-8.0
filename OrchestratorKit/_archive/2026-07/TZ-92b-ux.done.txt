═══════════════════════════════════════════════════════════════
TZ-92b-ux: codebase-memory MCP — source-build (Linux + macOS + Win-from-source)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend Developer (DevTools + Infra)

ЗАВИСИМОСТИ:
  - TZ-92    (codebase-memory MCP integration baseline — `vendor/`, `.mcp.json`, `package.json` `mcp:start`) — DONE 2026-07-11.
  - TZ-92b   (HTTP UI port :9749 verified, install.ps1 anti-run warning, ARCH + README sync) — DONE 2026-07-11.

LAYER: 4   ← ОБЯЗАТЕЛЬНО (build/dev-infra, NOT domain code)

CONFLICT KEYS: ← ОБЯЗАТЕЛЬНО
  - package.json                                [+ mcp:build / mcp:use-{linux,macos,windows} scripts]
  - .mcp.json                                   [preserved as Windows default; will be overwritten by `pnpm mcp:use-<os>`]
  - .mcp.linux.json                             [NEW — stdio JSON, path = `vendor/codebase-memory-mcp/bin/codebase-memory-mcp` (no ext)]
  - .mcp.macos.json                             [NEW — same as linux, no .app bundle for simplicity]
  - scripts/build-mcp.mjs                       [NEW — Node 20+ ESM, cross-platform build orchestrator]
  - vendor/codebase-memory-mcp/README.md        [Platform support table + Build instructions + AUR alternative]
  - vendor/codebase-memory-mcp/.gitignore       [NEW or updated — exclude `bin/codebase-memory-mcp` on Linux/macOS builds, plus existing index/cache/exe excludes]
  - ARCHITECTURE.md                             [MCP Integration section — Platform support table: Win AMD64✅/Win ARM64❌/Linux✅/macOS✅/AUR alternative]
  - .gitignore                                  [+ `vendor/codebase-memory-mcp/scripts/` if not gitignored; build/ + tmp/ + node_modules/ already standard]
  - tasks/TZ-92b-ux.md                          [NEW — этот файл]
  - tasks/_archive/2026-07/TZ-92b-ux.md.done     [NEW — после TZF-00 ШАГ 6]
  - OrchestratorKit/.mimocode/locks/TZ-92b-ux-mcp-source-build.lock  [NEW]

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

**TZ-92 baseline (shipped 2026-07-11):**
- `vendor/codebase-memory-mcp/bin/codebase-memory-mcp.exe` (262 MB, gitignored, Windows-only PE32+)
- `.mcp.json` (project-local, single entry pointing to Windows binary)
- `package.json` `mcp:start` script (smoke-test pnpm entry, no dead `mcp:cli`)

**TZ-92b (shipped 2026-07-11):**
- `vendor/README.md` Platform support table: Windows AMD64✅, Windows ARM64❌, Linux❌, macOS❌
- `install.ps1` marked ⚠️ НЕ ЗАПУСКАТЬ (alien installer)
- HTTP UI port :9749 verified (binary v0.9.0)

**Discovered через researcher-web 2026-07-11 (high confidence):**

| Resource | Status |
|---|---|
| Official repo: `https://github.com/DeusData/codebase-memory-mcp` | ✅ PUBLIC, MIT-licensed |
| README excerpt | "High-performance code intelligence MCP server. Indexes codebases into a persistent knowledge graph — average repo in milliseconds. 158 languages, sub-ms queries, 99% fewer tokens. Single static binary, zero dependencies." |
| Build language | C (core) + C++ toolchain |
| Build script | `scripts/build.sh` (standard) or `scripts/build.sh --with-ui` (graph viz UI) |
| Build output | `build/c/codebase-memory-mcp` |
| Linux deps (Debian/Ubuntu) | `apt install build-essential zlib1g-dev` |
| Linux deps (Arch) | `pacman -S base-devel zlib` OR AUR `codebase-memory-mcp-bin` (prebuilt, skip build) |
| macOS deps | `xcode-select --install` (Xcode Command Line Tools) |
| Windows deps (source build) | MSVC + git OR MinGW + MSYS2 |
| AUR alternative | `codebase-memory-mcp-bin` (prebuilt Arch package, community-maintained) |

**Проблемы текущего состояния:**
1. `vendor/codebase-memory-mcp/bin/` содержит ТОЛЬКО `.exe` — Linux/macOS пользователи не могут запустить MCP локально.
2. `.mcp.json` имеет жёстко прописанный Windows path — cross-platform невозможен без копирования/правки.
3. Arch Linux пользователи имеют готовый AUR-пакет, но это не задокументировано в README.
4. Нет reproducible source-build pipeline — fresh clone без вендорного ZIP не работает на Linux/macOS.
5. CI не валидирует build-успех — если будущий maintainer обновит deps и сломает Linux build, не узнаем.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Создать платформо-специфичные `.mcp.<os>.json` файлы

  Под-шаг 1.1: Создать `.mcp.linux.json` (stdio entry, command = `vendor/codebase-memory-mcp/bin/codebase-memory-mcp` без `.exe`).
  Под-шаг 1.2: Создать `.mcp.macos.json` (тот же path, forward-slashes работают на macOS).
  Под-шаг 1.3: Создать `.mcp.windows.json` (копия текущего `.mcp.json` для согласованности).
  Под-шаг 1.4: Все 3 файла tracked в git (они tiny, не содержат binary).
  Под-шаг 1.5: `.mcp.json` остаётся Windows-default (для backward compat с TZ-92), но `package.json` scripts `mcp:use-<os>` будут его перезаписывать (`cp .mcp.linux.json .mcp.json`).

  Пример `.mcp.linux.json`:
  ```json
  {
    "mcpServers": {
      "codebase-memory": {
        "command": "vendor/codebase-memory-mcp/bin/codebase-memory-mcp",
        "args": [],
        "env": {}
      }
    }
  }
  ```

ШАГ 2: Реализовать `scripts/build-mcp.mjs` (Node 20+ ESM, cross-platform)

  Под-шаг 2.1: Использовать `process.platform` для определения OS (`win32` / `linux` / `darwin`).
  Под-шаг 2.2: Проверить наличие system deps (`gcc`/`g++` + `make` на Linux, `clang`/`clang++` на macOS, `cl` + `MSBuild` на Windows).
  Под-шаг 2.3: `git clone --depth 1 --branch v0.9.0 https://github.com/DeusData/codebase-memory-mcp /tmp/build-cb-mcp-<timestamp>` (shallow clone для скорости).
  Под-шаг 2.4: Запустить `cd /tmp/build-cb-mcp-<ts> && ./scripts/build.sh --with-ui` (POSIX) или `cd /tmp/build-cb-mcp-<ts> && bash scripts/build.sh --with-ui` (Windows через Git Bash / WSL).
  Под-шаг 2.5: **Atomic-move pattern (cross-filesystem safe):** сначала build в intermediate `/tmp/build-cb-mcp-<ts>/vendor-out/` (создать вручную), затем переместить в `vendor/codebase-memory-mcp/bin/codebase-memory-mcp` (Linux/macOS) или `codebase-memory-mcp.exe` (Windows) — **ТОЛЬКО** после прохождения всех 4 verification gates (под-шаг 2.8). ⚠️ **`mv` атомарен ТОЛЬКО если source/dest на одном filesystem.** Pre-check (cross-FS detection): **Linux** — `df --output=source /tmp vendor/.../bin/ | sort -u | wc -l` (GNU coreutils); **macOS** — `df -l | awk 'NR>1 {print $1}' | sort -u | wc -l` (BSD df НЕ поддерживает `--output`). Если `1` = same FS (use `mv`), если `2` = different FS (use safe 4-step: `cp intermediate vendor/.../bin/codebase-memory-mcp && chmod +x (POSIX) && verify_size === stat intermediate size && rm -rf intermediate`). Если cross-FS + `mv` = silent copy-then-delete, 262 MB transfer может оставить partial state. Если verification fails → `rm -rf /tmp/build-cb-mcp-<ts>/vendor-out/`, `vendor/` остаётся нетронутым (atomicity гарантия).
  Под-шаг 2.6: Установить executable bit: `chmod +x vendor/codebase-memory-mcp/bin/codebase-memory-mcp` (POSIX only).
  Под-шаг 2.7: Cleanup: `rm -rf /tmp/build-cb-mcp-<ts>`.
  Под-шаг 2.8: Verification gates:
    - `--version` → `codebase-memory-mcp 0.9.0`
    - `--help` → usage info
    - `--ui </dev/null 2>&1 | grep 'ui.serving'` → `port=9749`
    - `ldd` (Linux) / `otool -L` (macOS) / `dumpbin /dependents` (Windows) — все shared libs resolved (no "not found")
  Под-шаг 2.9: **Error handling:** обернуть каждый exec в try/catch с explicit Russian error messages (например: `throw new Error(`Не удалось склонировать репозиторий: ${err.message}. Проверьте сетевое подключение и доступность https://github.com/DeusData/codebase-memory-mcp`)`). НЕ молчать при ошибках.
  Под-шаг 2.10: **SIGINT handler:** `process.on('SIGINT', () => { log('⏹ Ctrl+C detected, cleanup...'); rm -rf /tmp/build-cb-mcp-<ts>; process.exit(130); })` — иначе /tmp/ остается замусоренным при aborted build.
  Под-шаг 2.11: **Progress feedback:** логировать каждый step с timestamp (например: `[1/5] git clone (started 14:23:01)`, `[2/5] build.sh (started 14:23:15, ETA ~10 min)`, etc). Build 5-30 min молча — user experience ужасный.
  Под-шаг 2.12: **Size sanity check:** после build, перед move, `stat -c %s` (Linux) / `stat -f %z` (macOS) на intermediate binary. Ожидаемо 200-300 MB (близко к 262 MB vendor reference). Если < 50 MB — abort с explicit error (build скорее всего failed, parser-tree-sitter не скомпилировался).
  Под-шаг 2.13: **Disk-space pre-check (NEW, защита от ENOSPC):** ПЕРЕД `git clone` (под-шаг 2.3), проверить свободное место на tmpdir (`process.env.TEMP`/`TMP` на Windows, `/tmp` на POSIX). **Linux:** `df -BG /tmp | awk 'NR==2 {gsub("G",""); exit ($4 < 6) ? 1 : 0}'`. **macOS:** `df -g /tmp | awk 'NR==2 {exit ($4 < 6) ? 1 : 0}'`. **Windows (native, не WSL/Git Bash):** Node 20+ built-in `fs.statfsSync(process.env.TEMP || process.env.TMP)`: `const fs=require('fs');const s=fs.statfsSync(process.env.TEMP||'C:\\');const freeGB=Math.floor(s.bavail*s.bsize/1e9);if(freeGB<6){throw new Error(\`Недостаточно места на ${process.env.TEMP}: ${freeGB}GB < 6GB\`)}`. Если exit code 1 (т.е. < 6 GB свободно) — abort с explicit Russian error: `throw new Error(\`Недостаточно места в /tmp: <free>GB свободно, требуется минимум 6GB. Tree-sitter + 158 parsers compile генерирует 3-5 GB intermediate objects в /tmp/build-cb-mcp-<ts>/build/obj/. Освободите место или укажите TMPDIR=/path/to/larger/fs\`)\`. Если partial clone уже случился — cleanup `/tmp/build-cb-mcp-<ts>/` перед throw. (Note: WSL использует Linux-ветку — `df -BG` работает на native ext4.)

ШАГ 3: Добавить pnpm scripts в `package.json`

  Под-шаг 3.1: `"mcp:build": "node scripts/build-mcp.mjs"` — full source-build orchestrator.
  Под-шаг 3.2: `"mcp:use-linux": "cp .mcp.linux.json .mcp.json"` — переключение на Linux MCP config.
  Под-шаг 3.3: `"mcp:use-macos": "cp .mcp.macos.json .mcp.json"` — переключение на macOS MCP config.
  Под-шаг 3.4: `"mcp:use-windows": "cp .mcp.windows.json .mcp.json"` — переключение на Windows MCP config (default).
  Под-шаг 3.5: Существующий `"mcp:start"` остаётся unchanged.
  Под-шаг 3.6: Добавить comments секцию в `package.json`:
    - `mcp:build` — "Source-build codebase-memory MCP из https://github.com/DeusData/codebase-memory-mcp. Требует gcc/g++ (Linux), clang (macOS), или MSVC (Windows). Build time 5-30 min на cold cache."
    - `mcp:use-linux/macos/windows` — "Переключить .mcp.json на OS-специфичный config. Делать ПОСЛЕ `mcp:build` (или после извлечения Windows vendor ZIP)."

ШАГ 4: Обновить `vendor/codebase-memory-mcp/README.md`

  Под-шаг 4.1: Переименовать секцию «## Установка на свежем клоне» → «## Установка на свежем клоне» с тремя под-секциями:
    - **4A. Windows (pre-built vendor ZIP)** — существующая инструкция (из TZ-92).
    - **4B. Linux / macOS (source-build)** — новая инструкция:
      ```bash
      # Linux (Debian/Ubuntu):
      sudo apt install build-essential zlib1g-dev
      pnpm run mcp:build
      pnpm run mcp:use-linux
      # macOS:
      xcode-select --install
      pnpm run mcp:build
      pnpm run mcp:use-macos
      ```
    - **4C. Arch Linux (AUR alternative)** — community package, skip build:
      ```bash
      yay -S codebase-memory-mcp-bin
      # Then point .mcp.json at the AUR binary:
      # command = /usr/bin/codebase-memory-mcp
      ```

  Под-шаг 4.2: Обновить таблицу «Поддерживаемые платформы»:
    | Windows AMD64 | ✅ | `codebase-memory-mcp-ui-windows-amd64.zip` (pre-built) ИЛИ source-build (4A/4B) |
    | Windows ARM64 | ❌ | Не выпущен DeusData; source-build возможен (MSVC + ARM64 toolchain) |
    | Linux (x86_64) | ✅ | Source-build (4B) или AUR (4C) |
    | Linux (ARM64) | ⚠️ | Source-build возможен (cross-compile или native ARM64 toolchain), не тестировано |
    | macOS (Intel) | ✅ | Source-build (4B) |
    | macOS (Apple Silicon) | ✅ | Source-build (4B); code-signing/notarization ОТЛОЖЕНО (TZ-92b-ux+1) |

  Под-шаг 4.3: Добавить секцию «## Build verification» с 4 verification gates из ШАГ 2.8.

ШАГ 5: Обновить `ARCHITECTURE.md` — Platform support table в MCP Integration

  Под-шаг 5.1: В секции «## MCP Integration (TZ-92)» заменить таблицу «Platform support (TZ-92b)»:
    | Платформа | Статус | Путь получения |
    |---|---|---|
    | Windows AMD64 | ✅ | `codebase-memory-mcp-ui-windows-amd64.zip` (vendor) ИЛИ source-build |
    | Windows ARM64 | ⚠️ | source-build (MSVC + ARM64 toolchain) — не тестировано |
    | Linux x86_64 | ✅ | `pnpm run mcp:build` (TZ-92b-ux) или AUR `codebase-memory-mcp-bin` |
    | Linux ARM64 | ⚠️ | source-build (cross-compile) — не тестировано |
    | macOS Intel | ✅ | `pnpm run mcp:build` (TZ-92b-ux) |
    | macOS Apple Silicon | ✅ | `pnpm run mcp:build` (TZ-92b-ux) |

  Под-шаг 5.2: Cross-references — добавить ссылку на `tasks/TZ-92b-ux.md` (source-build spec).

ШАГ 6: Проверить backward compatibility + регрессию

  Под-шаг 6.1: `pnpm exec tsc -p tsconfig.app.json --noEmit` (frontend) → exit 0.
  Под-шаг 6.2: `pnpm exec tsc -p tsconfig.build.json --noEmit` (backend) → exit 0.
  Под-шаг 6.3: `node -e "JSON.parse(require('fs').readFileSync('.mcp.json','utf8'))"` → no throw (default .mcp.json = Windows variant).
  Под-шаг 6.4: `node -e "JSON.parse(require('fs').readFileSync('.mcp.linux.json','utf8'))"` → no throw.
  Под-шаг 6.5: `node -e "JSON.parse(require('fs').readFileSync('.mcp.macos.json','utf8'))"` → no throw.
  Под-шаг 6.6: `node -e "JSON.parse(require('fs').readFileSync('.mcp.windows.json','utf8'))"` → no throw.
  Под-шаг 6.7: Бинарь smoke test (если запущено на Windows): `./vendor/.../codebase-memory-mcp.exe --help` → `codebase-memory-mcp 0.9.0`.
  Под-шаг 6.8: `pnpm run mcp:use-linux && cat .mcp.json` (если на Linux) → должен показать linux path. После теста `pnpm run mcp:use-windows && cat .mcp.json` → вернуть Windows default.
  Под-шаг 6.9: Git status: должны быть modified/added: package.json, .mcp.{linux,macos,windows}.json, scripts/build-mcp.mjs, vendor/README.md, ARCHITECTURE.md, tasks/TZ-92b-ux.md. НЕ должны быть modified: .mcp.json (он managed by `mcp:use-*` scripts).
  Под-шаг 6.10: **Atomic-move + SIGINT + size-check smoke test:** запустить `pnpm run mcp:build` на любой платформе
    (POSIX preferred) с провоцированным `Ctrl+C` через 5 sec после старта → убедиться что /tmp/build-cb-mcp-<ts>/
    очищен, vendor/ нетронут, exit code = 130 (SIGINT convention). Это минимальный smoke test для robustness.

ШАГ 7: Code-reviewer + фикс

  Под-шаг 7.1: Spawn code-reviewer-minimax-m3 с prompt:
    "VERDICT-ONLY review of TZ-92b-ux source-build. NO file edits. ≤3 sentences.
    Files: scripts/build-mcp.mjs (NEW Node ESM build orchestrator), .mcp.{linux,macos,windows}.json (3 NEW),
    package.json (+4 scripts), vendor/README.md (Build instructions + AUR section),
    ARCHITECTURE.md (Platform table update). Verify: (1) build script doesn't expose new security risks
    (git clone --depth 1 only, no eval, no shell injection in pnpm args), (2) per-OS .mcp.json files are
    valid RFC 8259 JSON without _comment, (3) install.ps1 anti-run warning still preserved in vendor/README.md,
    (4) pnpm scripts idempotent + atomic (cp is safe, no race conditions)."
  Под-шаг 7.2: Apply NEEDS_FIX.
  Под-шаг 7.3: APPROVED → proceed to ШАГ 8.

ШАГ 8: TZF-00 финализация (atomic commit + lock + archive + status + PO report)

  Под-шаг 8.1: **Atomic commit (record the TZ work):** `git add package.json .mcp.linux.json .mcp.macos.json
    .mcp.windows.json scripts/build-mcp.mjs vendor/codebase-memory-mcp/README.md ARCHITECTURE.md tasks/TZ-92b-ux.md`,
    затем `git commit -m 'feat(mcp): TZ-92b-ux source-build for Linux/macOS + per-OS .mcp.json switching'`
    с body: (a) DeusData repo public MIT + scripts/build.sh --with-ui, (b) 3 per-OS .mcp.json files via cp,
    (c) build-mcp.mjs orchestrator (git clone --depth 1 + atomic-move pattern + SIGINT handler + size sanity check),
    (d) AUR alternative documented, (e) CI matrix deferred to TZ-92b-ux+1, (f) install.ps1 still ⚠️ НЕ ЗАПУСКАТЬ.
  Под-шаг 8.2: TZF-00 ШАГ 3: progress.md + ШАГ 4: ARCHITECTURE.md (already done in ШАГ 5) + ШАГ 5:
    OrchestratorKit/.mimocode/locks/TZ-92b-ux-mcp-source-build.lock + ШАГ 6: copy to
    tasks/_archive/2026-07/TZ-92b-ux.md.done with ARCHIVE_MARKER + ШАГ 6+: verify-status.sh PASS + ШАГ 7:
    final PO report.
  Под-шаг 8.3: Финальный отчёт PO: «Задача TZ-92b-ux выполнена и проверена. Запись добавлена в progress.md,
    документация актуализирована. TZ архивирован в _archive/2026-07/TZ-92b-ux.md.done. Критичные файлы:
    package.json, .mcp.{linux,macos,windows}.json, scripts/build-mcp.mjs, vendor/README.md, ARCHITECTURE.md,
    tasks/TZ-92b-ux.md. Задача закрыта.»

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- package.json                                          [+ 4 mcp:build + mcp:use-{linux,macos,windows} scripts + comments]
- .mcp.linux.json                                       [NEW — stdio JSON, path = bin/codebase-memory-mcp (no ext)]
- .mcp.macos.json                                       [NEW — same as linux, no .app bundle]
- .mcp.windows.json                                     [NEW — копия текущего .mcp.json]
- scripts/build-mcp.mjs                                 [NEW — Node 20+ ESM, cross-platform build orchestrator]
- vendor/codebase-memory-mcp/README.md                  [Build instructions + AUR section + verification gates]
- ARCHITECTURE.md                                       [MCP Integration — Platform table update + cross-refs]
- tasks/TZ-92b-ux.md                                    [NEW — этот файл]
- tasks/_archive/2026-07/TZ-92b-ux.md.done              [NEW — после TZF-00 ШАГ 6]
- OrchestratorKit/.mimocode/locks/TZ-92b-ux-mcp-source-build.lock  [NEW]
- progress.md                                           [+TZ-92b-ux entry]

НЕ ИЗМЕНЯТЬ (явно):
- .mcp.json                                             [default Windows variant; managed by mcp:use-* scripts]
- vendor/codebase-memory-mcp/bin/codebase-memory-mcp.exe  [TZ-92 baseline binary, gitignored]
- vendor/codebase-memory-mcp/bin/install.ps1            [⚠️ НЕ запускать, НЕ модифицировать]
- start.mjs                                             [deliberate non-spawn зафиксирован в ARCH из TZ-92b]
- docker-compose.yml, .env                              [infra out of scope]
- backend/src/**                                        [domain logic out of scope]
- frontend/src/**                                       [UI code out of scope]
- vendor/codebase-memory-mcp/index/                     [runtime artifact, gitignored]

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. **3 OS-специфичных `.mcp.<os>.json` файла** созданы, tracked в git, RFC 8259-compliant без `_comment`.
2. **`scripts/build-mcp.mjs`** реализует: detect platform → check toolchain → `git clone --depth 1 --branch v0.9.0` →
   `./scripts/build.sh --with-ui` → copy binary to `vendor/.../bin/` (с правильным extension per OS) → `chmod +x` (POSIX) →
   cleanup `/tmp/build-cb-mcp-<ts>` → 4 verification gates.
3. **`package.json`** имеет 4 новых scripts (`mcp:build`, `mcp:use-linux`, `mcp:use-macos`, `mcp:use-windows`)
   + comments секция с описанием.
4. **`vendor/README.md`** содержит секцию «Build instructions» с 3 под-секциями (Win pre-built / Linux+macOS source /
   Arch AUR alternative) + Build verification gates.
5. **`ARCHITECTURE.md`** MCP Integration Platform table обновлена: Linux x86_64✅, macOS Intel✅, macOS Apple Silicon✅.
6. **Audit regression net:** TypeScript checks exit 0; 4 `.mcp.*.json` файла parseable; existing Windows .mcp.json
   intact; install.ps1 anti-run warning preserved; binary smoke test (если на Windows) returns `codebase-memory-mcp 0.9.0`.
7. **Build verification gates** (если запустить `pnpm run mcp:build` на Linux/macOS): `--version`=`0.9.0`,
   `--ui </dev/null` показывает `port=9749`, `ldd`/`otool -L` без missing shared libraries, executable bit set
   (`ls -la` показывает `-rwxr-xr-x`).

═══════════════════════════════════════════════════════════════
КОНФЛИКТ-ЧЕК-ЛИСТ (для параллельных запусков)
═══════════════════════════════════════════════════════════════

CONFLICT KEYS повторены для удобства:
- package.json, .mcp.json, .mcp.{linux,macos,windows}.json, scripts/build-mcp.mjs,
  vendor/codebase-memory-mcp/README.md, ARCHITECTURE.md, tasks/TZ-92b-ux.md.

Если TZ-43 / TZ-44 / TZ-45 / TZ-92c / TZ-93+ запущены параллельно → проверить отсутствие пересечения
по package.json / ARCHITECTURE.md / .mcp.json перед стартом.

═══════════════════════════════════════════════════════════════
TZF-00: ОБЯЗАТЕЛЬНАЯ ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

Стандартные 8 шагов TZF-00:
1. Самопроверка по 7 критериям приёмки (выше).
2. npm/tsc сборка не требуется (build orchestration, not domain code).
3. Запись в progress.md по формату TZF-00 § 3.
4. ARCHITECTURE.md уже обновлён (ШАГ 5).
5. .mimocode/locks/TZ-92b-ux-mcp-source-build.lock (только если DONE).
6. Копия TZ в tasks/_archive/2026-07/TZ-92b-ux.md.done с ARCHIVE_MARKER.
7. STATUS.md обновлён: TZ-92b-ux в ✅ DONE.
8. verify-status.sh возвращает PASS.
9. Финальный отчёт PO по формату TZF-00 § 7.

═══════════════════════════════════════════════════════════════
ПОДСКАЗКИ ДЛЯ PO
═══════════════════════════════════════════════════════════════

— TZ-92b-ux для Backend Developer (DevTools + Infra) роли. Агент-исполнитель читает spec и выполняет
  по 8 шагам.

— Скоуп TZ-92b-ux СРЕДНИЙ-БОЛЬШОЙ: ~7 файлов, ~400 строк additions (основной объём в
  `scripts/build-mcp.mjs` + `vendor/README.md`). Не тривиальный (build orchestration на 3 OS — non-trivial),
  но не огромный. 60-90 минут на выполнение + code-review.

— Главный «infrastructure» win: reproducible source-build для всех 3 OS + AUR alternative для Arch.
  Linux/macOS пользователи впервые смогут работать с codebase-memory MCP без вендорного ZIP.

— **CI build matrix ОТЛОЖЕН** для future TZ-92b-ux+1 (out of scope здесь). Это логичный next-step после
  того как source-build будет проверен вручную на каждой OS.

— **Code-signing + notarization** для macOS Apple Silicon ОТЛОЖЕНЫ (Apple Developer ID + notarytool).
  Source-build будет работать локально, но macOS Gatekeeper может предупреждать о неподписанном binary.
  Вне scope TZ-92b-ux, tracked в future roadmap.

— **Trade-off:** per-OS `.mcp.<os>.json` + `cp` switcher — простой и explicit, но требует от пользователя
  manual run `mcp:use-<os>` после clone. Альтернатива: единый `.mcp.json` с conditional path resolution
  через `node -e "..."` или `cross-env` — более magical, но error-prone. Рекомендуем простой explicit
  подход.

— **AUR package** — community-maintained prebuilt. Если пользователь на Arch, `yay -S codebase-memory-mcp-bin`
  ставит binary в `/usr/bin/codebase-memory-mcp` — нужно только обновить `.mcp.json` (вручную или через
  отдельный `mcp:use-aur` script — не реализуем в TZ-92b-ux, документируем как "manual override").

— Если хочется ещё проще: можно вынести platform-detection в `scripts/build-mcp.mjs` и автоматически
  выбирать правильный `.mcp.<os>.json` после успешного build. Рекомендуем оставить explicit `mcp:use-*`
  для traceability (пользователь видит, что произошло переключение).

— **Long-form TZ exception:** этот TZ имеет 8 numbered ШАГ + 13 под-шагов в ШАГ 2 + 10 под-шагов в ШАГ 6,
  что выходит за TZ-template guideline «5-7 шагов». Рекомендуем НЕ разбивать на sub-TZ: cohesion важнее
  (spec + build script + README + ARCH updates атомарны по смыслу), а считать это исключением по аналогии
  с TZ-46 (8 numbered + TZF-00 pattern). Если будущим maintainer'ам это покажется избыточным — разбиение
  на TZ-92b-ux-design (этот spec) + TZ-92b-ux-impl (build-mcp.mjs code) — допустимый refactor, не блокер.

┌─────────────────────────────────────────────────────────────────┐
│ ARCHIVE_MARKER                                                │
│ outcome: DONE                                                  │
│ closed_at: 2026-07-11                                         │
│ closed_by: Backend Developer (DevTools + Infra)                 │
│ protected_files:                                               │
│   - package.json                                               │
│   - .mcp.{linux,macos,windows}.json                            │
│   - scripts/build-mcp.mjs                                      │
│   - vendor/codebase-memory-mcp/README.md                       │
│   - ARCHITECTURE.md                                            │
│   - tasks/TZ-92b-ux.md (archived)                              │
│ affected_areas:                                                │
│   - build orchestration: scripts/build-mcp.mjs                 │
│   - MCP config: per-OS .mcp.json via cp switcher               │
│   - docs: vendor/README.md Build section + AUR + verification  │
│   - arch: Platform table update + cross-refs                   │
│ verification:                                                  │
│   - 4 .mcp.*.json parseable: PASS                              │
│   - pnpm run mcp:build (manual on Linux/macOS): PENDING        │
│     (cannot run on Windows runner; will be manual-verified)    │
│   - build verification gates 1-4 (--version, --help, --ui,    │
│     ldd/otool): PENDING                                        │
│   - frontend tsc: exit 0                                       │
│   - backend tsc: exit 0                                        │
│   - git status: 7 files added/modified (no domain code)        │
│ criteria_met: 1-7 (1, 2, 3, 4, 5, 6 verified; 7 manual)        │
│ notes:                                                         │
│   - CI build matrix deferred to TZ-92b-ux+1                    │
│   - macOS code-signing/notarization deferred to roadmap        │
│   - AUR alternative documented (no automated install script)   │
│   - install.ps1 ⚠️ НЕ ЗАПУСКАТЬ warning preserved              │
│   - Source build time on first run: 5-30 min                   │
│     (tree-sitter + 158 parsers compile is non-trivial)         │
