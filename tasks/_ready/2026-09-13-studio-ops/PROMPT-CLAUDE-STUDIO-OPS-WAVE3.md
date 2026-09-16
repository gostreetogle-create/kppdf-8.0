# PROMPT — Claude continuous: Studio ops **волна 3** (финал pack)

> Copy-paste блок ниже.  
> Доска: `docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md`  
> WAVE1+2 DONE. После 3.3 → pack закрыт (кроме SSH LAN out-of-band).

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace: D:\kppdf-8.0 на main (continuous, НЕ .freebuff/worktrees).

=== UNATTENDED + THOROUGH ===
PO AFK. Не спрашивай «продолжать?» между TZ волны 3.
Скорость ≠ критерий. Полный ACCEPT + evidence + gates + archive + push на каждый TZ.
После КАЖДОГО TZ обновляй docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md (таблица волны 3 + Checkpoint).
Секреты не печатать/не коммитить.
=== /UNATTENDED + THOROUGH ===

## Startup

1) docs/how-to-connect-ai.md → GEMINI.md (agent_id: claude) → docs/PROJECT-MEMORY.md → docs/PO-CANON.md → docs/PO-SHARED-UNDERSTANDING.md §2.
2) git fetch && git merge origin/main; log -1; status --short. Ожидай WAVE2 tip ~222f1825 / a832c73a или новее.
3) Прочитай docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md + tasks/_ready/2026-09-13-studio-ops/README.md.
4) Preflight на каждый TZ.
5) WAVE: current_wave=3; status=IN_WORK_WAVE3; Checkpoint: WAVE3 started + HEAD.

## Очередь волны 3 (строго по порядку)

3.1  tasks/_ready/TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG.md
     Живой баг: 22/23 img в витрине «Товары» = 404/broken icon.
     ШАГ 0 evidence обязателен. Предпочтительно BE disk-check (как table resolver), FE onerror fallback.
     Не массово чистить Mongo orphans без команды PO.

3.2  tasks/_ready/2026-09-13-studio-ops/TZ-NX-CATALOG-CATEGORY-INLINE-CREATE.md
     Select + «+» → CategoryFormDialog lockType; autofill categoryId; silent invalid Save → alert+focus как product.
     Reuse supply nested-create паттерн. Specs на 3 forms + category dialog.

3.3  tasks/_ready/2026-09-13-studio-ops/TZ-OPS-DOCS-HOST-52-SYNC.md
     Docs-only: live ops `.103`→`.52`; CREDENTIALS.example cloudflared→kppdf-tunnel note.
     Не трогать historical evidence audits. rg → 0 в CONFLICT KEYS файлах.

Между TZ: archive + commit + push + WAVE row DONE + Claim следующего только когда _active чист.

## Не брать

- VERIFY-VM52-SSH-REMAINDER (LAN PO only — out of band)
- superseded KIND-IA / SOURCE-FIX / INSERT-APPLY / COL-WIDTH (absorbed WAVE2)
- wipe / deploy / ротация секретов
- Не ломать WAVE1/2: write-queue, Selected jump, canvas photo, necessity IA/SoT/width

## Финальный отчёт PO

Таблица: 3.1/3.2/3.3 | SHA | PASS/FAIL | 1 строка.
WAVE3_DONE + status pack COMPLETE (кроме SSH remainder).
Коротко: что ещё out-of-band (SSH).
Новую волну 4 не предлагай без Cursor.
```
