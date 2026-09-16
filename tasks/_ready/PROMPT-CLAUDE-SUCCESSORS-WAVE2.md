# PROMPT — Claude: Successors **волна 2** (4 TZ подряд)

> Отдавать только после WAVE1_DONE. Copy-paste блок ниже.

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace: D:\kppdf-8.0 на main (continuous, НЕ .freebuff/worktrees).

=== UNATTENDED + THOROUGH ===
PO AFK. Не спрашивай «продолжать?» между TZ.
После КАЖДОГО TZ: ACCEPT + archive + commit + push + строка в docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md + Checkpoint.
Секреты не печатать. Скорость ≠ критерий.
=== /UNATTENDED + THOROUGH ===

## Startup

1) how-to-connect-ai → GEMINI.md (agent_id: claude) → PROJECT-MEMORY → PO-CANON → PO-SHARED §2.
2) git fetch && merge origin/main. Ожидай WAVE1 shell tip.
3) WAVE-2026-09-13-SUCCESSORS.md — current_wave=2; Checkpoint WAVE2 started.

## Очередь (строго)

2.1  tasks/_ready/2026-09-13-studio-ops/TZ-NX-MODULE-LIST-POPULATE-PHOTOS.md
     findAll модулей: populate photoIds/mainPhotoId + blankMissingUploadUrls (как product/material после VITRINA-PHOTO).

2.2  tasks/_ready/2026-09-13-studio-ops/TZ-NX-CATEGORY-DUPLICATE-SLUG-409.md
     duplicate type+slug → ConflictException 409, не сырой 500.

2.3  tasks/_ready/2026-09-13-studio-ops/TZ-NX-SORTORDER-EMPTY-MIN.md
     ШАГ 0 Network обязателен. Пустой «Порядок» не шлёт NaN/""; omit или 0; BE Transform ''→undefined на Min DTO.

2.4  tasks/_ready/TZ-NX-SUPPLY-TASK-UNCONFIRM.md
     confirmed→draft (unconfirm) + кнопка «В черновик» + AlertDialog перед «Подтвердить».
     Не откатывать ordered/received.

2.5  tasks/_ready/TZ-NX-DOCSTUDIO-ISSUER-SELECT.md
     Данные→Ещё: select «Исполнитель (наша фирма)» = Organization; PATCH organizationId с ACL;
     починить мёртвый nav «Наши организации» → Реестры/organizations.
     Не путать с Поставщиком (Counterparty). Supersedes ISSUER-HINT.

Между TZ: один Claim; _active чист перед следующим.

## Не брать

SHELL (волна 1) · SSH-REMAINDER · wipe/deploy · ломать always-rails

## Отчёт PO

Таблица 2.1–2.5 | SHA | PASS/FAIL | 1 строка. WAVE2_DONE. Новую волну не предлагай.
```
