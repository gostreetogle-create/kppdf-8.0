# TZ-OPS-CLAUDE-UNATTENDED-HIDDEN-TASK: скрыть окно schtask на Windows

**РОЛЬ АГЕНТА:** Executor (dev-tooling) — claude  
**ЗАВИСИМОСТИ:** нет  
**LAYER:** 4 (scripts/ops) · **SIZE:** S  
**PAGES:** —  
**PAGE_DOCS:** `docs/agents/CLAUDE-UNATTENDED.md` (короткая note)

**CONFLICT KEYS:**  
`scripts/ensure-claude-unattended.mjs` ;  
`docs/agents/CLAUDE-UNATTENDED.md` (1–2 строки про hidden wrapper) ;  
`docs/agent-checklists/_NOW.md`

### Preflight Check Output
- **Context read:** `scripts/ensure-claude-unattended.mjs` (`ensureWindowsSchedule` ~207–223; header GrowthBook/`tengu_quill_harbor`); `docs/agents/CLAUDE-UNATTENDED.md`; PO: мигание console ~каждые 5 мин; ручной фикс через `powershell -WindowStyle Hidden` + `LastTaskResult: 0`
- **Key Constraints:** только Windows ветка `ensureWindowsSchedule`; не трогать GrowthBook/settings выше; без новых helper-файлов в репо; имя задачи `KppdfClaudeUnattended`; `/SC MINUTE /MO 5 /F`; итоговый argv `node … ensure-claude-unattended.mjs --quiet --no-schedule`
- **Planned Deliverable:** `/TR` через hidden PowerShell (или эквивалент), идемпотентный `/F`
- **Validation Path:** на Windows — `Get-ScheduledTask` / `Start-ScheduledTask` / `LastTaskResult`; macOS/Linux — no-op (`isWin`)

**Проверено:** `node.exe` = консольное приложение → Планировщик без Hidden показывает вспышку окна. Не malware.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. `ensureWindowsSchedule()` сейчас:
   ```js
   const tr = `"${node}" "${script}" --quiet --no-schedule`;
   schtasks /Create /TN KppdfClaudeUnattended /TR tr /SC MINUTE /MO 5 /F
   ```
2. Каждый `start.mjs` / ensure с `/F` **перетирает** ручной hidden-фикс PO → мигание возвращается.
3. macOS/Linux: `if (!isWin || noSchedule) return` — ок.

## ЧТО ДЕЛАТЬ

1. В `ensureWindowsSchedule()` собрать `/TR` так, чтобы **исполняемый файл действия** был `powershell.exe` (или `pwsh`, если надёжнее и всегда есть — предпочтительно **`powershell.exe`** как на ручном фиксе PO) с аргументами вида:
   - `-NoLogo -NonInteractive -WindowStyle Hidden -Command`
   - `"& '<node>' '<script>' --quiet --no-schedule"`  
   Экранирование кавычек под `schtasks /TR` — аккуратно (пути с пробелами; `process.execPath` + `ROOT\scripts\…`).
2. Сохранить: `/TN KppdfClaudeUnattended`, `/SC MINUTE`, `/MO 5`, `/F`, флаги скрипта `--quiet --no-schedule`.
3. Не добавлять `.ps1` / `.cmd` / `.vbs` в репозиторий — только inline `-Command`.
4. Лог успеха: одна строка, что task = hidden powershell wrapper (чтобы в будущем не «починить» обратно на прямой node).
5. `docs/agents/CLAUDE-UNATTENDED.md`: в таблице/риске — задача крутит node **через Hidden PowerShell**, иначе мигает console.
6. Claim → правка → на Windows verify AC → archive → commit/push по `GEMINI.md` / `docs/GIT-POLICY.md`.

## НЕ

- `ensureGrowthBookOverrides` / settings / Desktop config
- macOS/Linux ветки
- `start.mjs` (кроме косвенного вызова того же ensure)
- product `frontend-nx/**` / `backend/**`
- смена имени задачи или интервала
- отключение scheduled task

## AC

1. После `node scripts/ensure-claude-unattended.mjs` на Windows:  
   `Get-ScheduledTask -TaskName KppdfClaudeUnattended` → Action = **powershell** (hidden wrapper), **не** прямой `node.exe`.
2. `Start-ScheduledTask -TaskName KppdfClaudeUnattended` → `Get-ScheduledTaskInfo … | % LastTaskResult` = **0**; визуально **нет** окна консоли.
3. Повторный запуск ensure (`/F`) не создаёт дубликатов задач и не ломает GrowthBook override (файл выше по скрипту без регресса).
4. При `isWin === false` поведение ensure не меняется (schedule skip).

## Gates

```text
# синтаксис / smoke (любая ОС):
node --check scripts/ensure-claude-unattended.mjs

# Windows (обязательно для DONE):
node scripts/ensure-claude-unattended.mjs
Get-ScheduledTask -TaskName KppdfClaudeUnattended | Format-List TaskName, State
(Get-ScheduledTask -TaskName KppdfClaudeUnattended).Actions
Start-ScheduledTask -TaskName KppdfClaudeUnattended
Start-Sleep -Seconds 2
(Get-ScheduledTaskInfo -TaskName KppdfClaudeUnattended).LastTaskResult   # expect 0
```

`nx build` / product lint — N/A (scripts only).

## Финализация

Archive → `tasks/_archive/2026-09/TZ-OPS-CLAUDE-UNATTENDED-HIDDEN-TASK.done.md` + checklist + `_NOW` sync.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T09:50:00Z — SHA pending (see docs/agent-checklists/TZ-OPS-CLAUDE-UNATTENDED-HIDDEN-TASK.md)
