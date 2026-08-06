# Freebuff prompt — TZD-16 CLOSEOUT (docs only / soft waive)

Скопируй агенту desktop #3 целиком.

---

Ты — executor Buffy на `D:\kppdf-8.0` (canonical main, **не** старый worktree если он отстаёт).

## Контекст

TZD-16 **feat уже на `origin/main`**:
- `873a70b` feat download flow
- `3d12fdf` URL deployment semantics
- `103e7f1` checklist formatting

Pairing dialog «Скачать приложение» + `DESKTOP_DOWNLOAD_URL` + Jest 14 PASS + FE/desktop typecheck — **DONE**.

`pnpm tauri build` **blocked** pre-existing: нет `desktop/src-tauri/icons/icon.ico`. Бинарники не созданы — **это soft / known_limitation**, не FAIL фичи кнопки.

Сейчас **не закрыто**:
- `tasks/_active/TZD-16.md` ещё лежит
- нет `tasks/_archive/2026-08/TZD-16.done.md`
- нет `.mimocode/locks/TZD-16-*.lock` (locks gitignored — создай локально по канону)
- нет записи DONE в `progress.md`
- checklist Status ещё CLAIMED / IN PROGRESS

## Задача этой сессии = CLOSEOUT ONLY

**Не** переписывать pairing UI. **Не** трогать production/catalog/warehouse. **Не** `git add .`.

### Шаги

1. `git fetch && git checkout main && git pull --ff-only` → HEAD ≥ `08e7a45` (там же PRODUCTION-303; не конфликтуй).
2. Прочитай `docs/agent-checklists/TZD-16.md` + `_active/TZD-16.md`.
3. Acceptance: отметь tauri build как **SOFT WAIVE** с причиной `missing desktop/src-tauri/icons/icon.ico` (pre-existing). Остальное оставь ✅.
4. Создай archive `tasks/_archive/2026-08/TZD-16.done.md` с `ARCHIVE_MARKER` (DONE), verification gates, `known_limitation: tauri build / installer binary`.
5. Создай lock `.mimocode/locks/TZD-16-pairing-download-installer.lock` (локально; может быть в gitignore — ок).
6. Допиши сверху в `progress.md` запись **TZD-16 DONE** (commits `873a70b` / `3d12fdf` / `103e7f1`, soft waive icon).
7. Checklist → Status **DONE**; удали `tasks/_active/TZD-16.md`.
8. Обнови `docs/agent-checklists/_active-map.md`: TZD-16 DONE.
9. Backlog `tasks/_backlog/desktop/TZD-16-pairing-download-installer.md` → STATUS DONE + ссылка на archive.
10. **Не** чини icon.ico в этом TZ, если PO не просил — successor `TZD-16.1` / `TZD-17` только если нужно реальное `tauri build`. Если чинишь icon за 15 мин и build зелёный — можно упомянуть в archive как bonus, но не блокируй closeout.
11. Scoped commit + push:
    ```text
    docs(desktop): closeout TZD-16 pairing download (soft waive tauri icon)
    ```
    Файлы только: archive, progress, checklist, _active-map, backlog STATUS, удаление `_active/TZD-16.md`.

### Conflict keys (closeout)

```
tasks/_active/TZD-16.md (DELETE)
tasks/_archive/2026-08/TZD-16.done.md
docs/agent-checklists/TZD-16.md
docs/agent-checklists/_active-map.md
tasks/_backlog/desktop/TZD-16-pairing-download-installer.md
progress.md
```

### DoD

- `_active/TZD-16.md` нет
- archive + progress DONE на `origin/main`
- отчёт PO: 5 строк + hash closeout commit

---
