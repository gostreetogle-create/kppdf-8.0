# PROMPT — Freebuff CONTINUOUS: Desktop до «100% вашего сценария»

> **Отдельный чат** от Manager Desk (`PROMPT-FREEBUFF-DESK-WAVE-CONTINUOUS.md`).
> Не мешать desk-волне: другие conflict keys. **Deploy НЕ запускать.**

Скопируй **весь файл** в новый чат Freebuff.

---

## 0. Режим

Прочитай:

- `GEMINI.md`
- `.agents/skills/kppdf-executor-loop/SKILL.md`
- `docs/PO-CANON.md` (Desktop = три двери, HITL, Excel-формы)
- `docs/agent-checklists/_NOW.md` (секция DESKTOP WAVE)
- `docs/audits/2026-08-12-desktop-download-version-naming-canon.md`

**Цикл на каждый TZD:**

1. CLAIM → `tasks/_active/TZD-NN.md`
2. Код по TZ + conflict keys
3. Gates из TZ
4. Archive + lock + commit/push **только своих путей**
5. Обнови `_NOW.md` (DESKTOP WAVE)
6. **Сразу** следующий TZ

**СТОП только если:** conflict keys с чужим `_active/` · gates FAIL ×2 · wipe/deploy/secrets

**НЕ СТОП:** «продолжать?», «PO нет»

**Deploy:** ЗАПРЕЩЁН. PO: «кати» + VPN.

---

## 1. Очередь (строго)

| # | TZ | Файл | Зона |
|---|-----|------|------|
| 1 | **58** | `tasks/TZD-58-desktop-release-installer-integrity.md` | build + publish gate |
| 2 | **49** | `tasks/TZD-49.md` | CAD import + dimensions |
| 3 | **57** | `tasks/_backlog/desktop/TZD-57-pairing-download-button-version.md` | pairing dialog FE |

**Не брать:** `_park/desktop/TZD-23…29` (длинная vision), desk TZ 410–408.

**Параллель:** TZD-57 можно **claim параллельно** с desk-413+ (другой файл). TZD-58 и 49 — **desktop-only**, не параллелить с TZD-49 на `App.svelte`.

---

## 2. Старт (TZD-58)

```powershell
Get-Location; git rev-parse HEAD; git status -sb
cd D:\kppdf-8.0
git pull
```

1. Copy TZ → `tasks/_active/TZD-58-desktop-release-installer-integrity.md`
2. Создай `docs/agent-checklists/TZD-58.md` (CLAIMED)
3. Закоммить WIP gate если есть: `publish-installer.mjs`, `package.json`, README, deploy.py
4. `cd desktop && pnpm run release-installer` (**долго**, ~10–20 мин — дождаться)
5. Verify PE 0.5.6 + archive

---

## 3. Правила зоны desktop

- **HITL:** не автопубликовать каталог; confirm перед SoT write
- **Три двери:** не возвращать старые вкладки MCP|Модель отдельно
- **Installer:** never relabel stale exe (canon audit §8)
- **Tests:** desktop `tsc` + svelte-check + `tsx --test src/core/*.test.ts …`

Эталоны: `desktop/docs/MCP.md`, `desktop/docs/PAIRING.md`, audit 2026-08-16 excel rework

---

## 4. Gates финала волны

```powershell
cd desktop && npx tsc --noEmit
cd desktop && npx svelte-check --threshold error
cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts
cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern="pairing-dialog"
```

Запиши в `_NOW`: размер/mtime `kppdf-desktop-setup-v0.5.6.exe`, PE version.

---

## 5. Отчёт PO

```
DESKTOP WAVE checkpoint
- Done: 58, 49, 57 (+ SHA)
- Installer: v0.5.6 PE verified? да/нет
- CAD xlsx smoke: да/нет/не проверял
- Deploy: НЕ
- PO: переустановить Desktop с локального ZIP после 58; «кати» для прода
```

---

Начинай с **TZD-58** сейчас.
