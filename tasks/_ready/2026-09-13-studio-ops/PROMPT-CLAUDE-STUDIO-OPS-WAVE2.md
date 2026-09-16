# PROMPT — Claude continuous: Studio ops **волна 2** (NECESSITY A→B→C)

> Copy-paste блок ниже.  
> Доска: `docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md`  
> Волна 1 DONE (`8d2d722d` / `b8b14801` / `76cb9d00`). Волну 3 не стартовать.

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace: D:\kppdf-8.0 на main (continuous, НЕ .freebuff/worktrees).

=== UNATTENDED + THOROUGH ===
PO AFK. Не спрашивай «продолжать?» между этапами A/B/C.
Скорость ≠ критерий. Necessity mindset (PO-CANON / PO-SHARED §2): не smoke «контрол кликается»; KEEP/MERGE/DELETE по аудиту.
После КАЖДОГО этапа A/B/C обновляй docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md (таблица волны 2 + Checkpoint append).
Секреты не печатать/не коммитить.
=== /UNATTENDED + THOROUGH ===

## Startup

1) docs/how-to-connect-ai.md → GEMINI.md (agent_id: claude) → docs/PROJECT-MEMORY.md → docs/PO-CANON.md → docs/PO-SHARED-UNDERSTANDING.md §2.
2) git fetch && git merge origin/main; log -1; status --short (чужой WIP не stage). Ожидай WAVE1 tip ~76cb9d00 или новее.
3) Прочитай:
   - docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md
   - docs/audits/2026-09-13-docstudio-table-necessity-wave.md  (SoT matrix)
   - docs/audits/2026-09-13-studio-table-kind-vs-source.md
   - docs/audits/2026-09-13-studio-table-source-select.md
   - tasks/_ready/2026-09-13-studio-ops/TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP.md
   - tasks/_ready/2026-09-13-studio-ops/TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY.md  (этап C — absorb)
4) Preflight skill → артефакт в checklist.
5) WAVE: current_wave=2; status=IN_WORK_WAVE2; Checkpoint: WAVE2 started + HEAD.

## Единая задача волны 2

Один Claim на master TZ:
  tasks/_ready/2026-09-13-studio-ops/TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP.md

Внутри — три этапа с отдельным Checkpoint-статусом (можно один commit на этап или один в конце — но Checkpoint после каждого этапа обязателен; предпочтительно commit+push после каждого этапа A/B/C чтобы PO видел прогресс).

### Этап A — IA (UX дубли)
По TZ §A + audit matrix: catalog-таблица → статус строк + Обновить + Сменить…(confirm); «Вид»→«Макет колонок»; page.md схема happy path.
Не оставлять голый enum «Источник строк» как дубль Insert.

### Этап B — SoT + round-trip
Insert/setBlockCatalogSource → TableTemplate из реестра по dataSource (не STUDIO_DEFAULT 3 кол. если template есть).
Persist dataSource; liveRows null на manual; canvas не держит [] поверх sample; пустое Выбрано → честный toast.
Specs A+B.

### Этап C — мёртвые controls
COL-WIDTH: либо apply % (следовать TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY.md целиком — helper + BE render + canvas), либо убрать поле из UI. Нельзя оставить цифры без эффекта.
Assert ≤1 active template на канон catalog-products (тест/docs check).

После C: archive NECESSITY master TZ; COL-WIDTH sibling — пометить absorbed/superseded в pack README или archive note (не оставлять как отдельный GO).

## Не брать

- Волна 3: CATEGORY-INLINE, OPS-DOCS-HOST-52
- VITRINA-PHOTO-BROKEN-IMG (successor волны 1 — другая волна/слот; не смешивать)
- SSH-REMAINDER (LAN)
- superseded KIND-IA / SOURCE-FIX / INSERT-APPLY-KIND как отдельные TZ
- wipe / deploy

## Качество / regression

Не ломать волну 1: documentWriteChain / addPage; Selected «Изменить» jump; canvas photo onerror.
Gates: scoped specs + nx build kppdf-web; BE jest если трогал resolver (width).
Живой прогон happy path (если стенд доступен): Выбрано → Insert → колонки из реестра → смена источника с confirm → width виден ИЛИ поле убрано.

## Финальный отчёт PO

Таблица: этап A/B/C | SHA | PASS/FAIL | 1 строка outcome.
WAVE checklist WAVE2_DONE.
Список удалённых/слитых UI-контролов (коротко).
Волну 3 не предлагай — жди Cursor.
```
