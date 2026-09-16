# PROMPT — Claude continuous: Studio ops **волна 1** (3 TZ подряд)

> Copy-paste блок ниже агенту.  
> Доска прогресса: `docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md`  
> Следующие волны **не** стартовать из этого промпта — только отчёт PO → Cursor даст волну 2.

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace: D:\kppdf-8.0 на main (continuous, НЕ .freebuff/worktrees).

=== UNATTENDED + THOROUGH ===
PO AFK. Не спрашивай «продолжать?» между TZ волны 1.
Скорость ≠ критерий. Критерий = полный ACCEPT каждого TZ + evidence + gates + archive + push.
После КАЖДОГО TZ обновляй docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md (таблица волны 1 + append в §Checkpoint).
Секреты/пароли/токены не печатать и не коммитить.
=== /UNATTENDED + THOROUGH ===

## Startup (обязательно, по порядку)

1) docs/how-to-connect-ai.md → GEMINI.md (контракт; agent_id: claude) → docs/PROJECT-MEMORY.md → docs/PO-CANON.md → docs/PO-SHARED-UNDERSTANDING.md §2 и §5.
2) git fetch && git merge origin/main; git log -1; git status --short (чужой WIP не stage).
3) Прочитай целиком:
   - docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md
   - tasks/_ready/2026-09-13-studio-ops/README.md
4) Preflight skill: .agents/skills/kppdf-context-preflight/SKILL.md — артефакт с конкретными путями в checklist задачи.
5) В WAVE checklist: status=IN_WORK_WAVE1; current_tz=1.1; Checkpoint: started + HEAD sha.

## Очередь волны 1 (строго по порядку, один TZ в _active)

1.1  tasks/_ready/2026-09-13-studio-ops/TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.md
     Audit/evidence: шаг 0 обязателен (Network src+status, Mongo, disk). Не гадать nginx.
1.2  tasks/_ready/2026-09-13-studio-ops/TZ-NX-DOCSTUDIO-ADD-PAGE-WRITE-SERIAL.md
     Audit: docs/audits/2026-09-13-docstudio-add-page-dead.md
1.3  tasks/_ready/2026-09-13-studio-ops/TZ-NX-DOCSTUDIO-SELECTED-REPLACE-JUMP.md
     Audit: docs/audits/2026-09-13-docstudio-selected-replace.md

Между 1.1→1.2→1.3:
- Закрой текущий: ACCEPT + Integrity slot + archive в tasks/_archive/2026-09/ + commit + push.
- Обнови строку WAVE (Status=DONE, SHA).
- /clear контекста задачи в голове; Claim СЛЕДУЮЩЕГО только когда _active пуст от предыдущего.
- Conflict check: не стартуй, если чужой claim на тех же keys.

## Не брать в этой волне

- TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP (волна 2)
- TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY (внутри волны 2 / этап C)
- TZ-NX-CATALOG-CATEGORY-INLINE-CREATE (волна 3)
- TZ-OPS-DOCS-HOST-52-SYNC (волна 3)
- TZ-VERIFY-VM52-SSH-REMAINDER (только LAN PO — out of band)
- superseded: TABLE-KIND-IA / SOURCE-FIX / INSERT-APPLY-KIND

## Качество

- Necessity mindset (PO-CANON / SHARED §2): не smoke «кнопка кликается»; чини root cause.
- PHOTO: orphan → «Нет фото»; canvas onerror; UPLOAD_DIR единый root.
- ADD-PAGE: одна document write queue; не silent conflict; убрать слепой revision+1 на затронутых путях.
- SELECTED: «Изменить» = jump в Данные TOC, без второго modal пикера.
- Gates по зоне TZ + nx build kppdf-web где в ACCEPT; BE jest если трогал resolver.

## Запрещено

wipe · deploy.ps1 · ротация секретов · правки PO-CANON/PO-SHARED без нужды · commit чужого WIP · старт волны 2 из этого промпта.

## Финальный отчёт PO (после 1.3 DONE или BLOCKED)

Одна таблица: TZ | SHA | PASS/FAIL | 1 строка root cause / outcome.
Путь WAVE checklist + где остановился (если BLOCKED — next_steps).
Не предлагай волну 2 сам — Cursor выдаст после сверки.
```
