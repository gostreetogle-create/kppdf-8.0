# PROMPT — Freebuff: слить живую очередь `tasks/` до тонкого backlog

Скопируй **весь блок ниже** в Freebuff / continuous executor.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0
Прочитай: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
+ docs/audits/2026-08-16-tasks-hygiene-drain-audit.md
+ этот файл: tasks/PROMPT-FREEBUFF-TASKS-DRAIN.md

ЦЕЛЬ: довести живой backlog до минимума. Не изобретать новые TZ.
Deploy / wipe / prod Synology — ЗАПРЕЩЕНЫ без явного русского слова PO в чате.
_park/** — НЕ ТРОГАТЬ (в т.ч. TZ-AUTH-307, SALES-377, DATA-UTF8, passports).

═══ ПРАВИЛА ЦИКЛА ═══
1. Всегда 0–1 claim в tasks/_active/. Закончил → archive → commit+push → только потом следующий.
2. Перед стартом ID: если уже есть tasks/_archive/**/<ID>.done.md — НЕ кодить; перенеси orphan-spec в specs-dup-root и иди дальше.
3. Conflict keys пересеклись с чужим _active → SKIP / DEFER, не войнуй.
4. После каждой DONE: обнови docs/agent-checklists/_NOW.md одной строкой.
5. В конце сессии: список что DONE / SKIP / BLOCKED + SHA.

═══ ФАЗА 0 — гигиена (если снова грязно) ═══
Сверь корень tasks/ и _backlog/**/TZ*.md с _archive/**/*.done.md.
Дубли DONE → tasks/_archive/2026-08/specs-dup-root/
Spent PROMPT/WAVE → prompts-spent/ или waves-done/
Корень должен остаться: README + PROMPT-RESUME-ANY + PROMPT-UNIVERSAL-CONTINUOUS + только LIVE TZ.

═══ ФАЗА 1 — тонкие FE (по одной) ═══
A) ~~TZ-COMBINE-410~~ **DONE** `bae3cbbc` — skip; next:
B) tasks/_backlog/kp-vitrine/TZ-SALES-369-kp-pdf-filename.md
   Тонкий grep download filename → КП-{number}.pdf; не трогать builder.
C) tasks/_backlog/desktop/TZD-39-desktop-basic-auth-coexist.md
   Если код уже на main — только closeout archive+lock+_NOW. Если дырка — fix по AC, без deploy.

═══ ФАЗА 2 — Desktop (по одной) ═══
D) tasks/_backlog/desktop/TZD-56-desktop-ai-runner-nsis-sidecar.md
   Sidecar/bundle ai-runner для NSIS. Deploy installer только если PO сказал «кати».
E) tasks/_backlog/desktop/TZD-47-mcp-photo-upload.md
   MCP photo upload tool. STOP если Desktop/MCP offline → напиши PO «подключи MCP».

═══ ФАЗА 3 — KP3 migrate (строго по порядку) ═══
F) tasks/_backlog/migrate-kp3/TZ-MIG-302-kp3-mcp-load.md
   Scope LOCK: categories→CP→products→quotations БЕЗ photo/email/brand. MCP must ping.
G) TZ-MIG-306 (category filter) — если независима от фото, можно после 302.
H) TZ-MIG-304 (email→Person) — после 302.
I) TZ-MIG-303 (photos) — только после TZD-47 DONE + 302 DONE.
После закрытия всех MIG-* живых: WAVE-KP3-DATA-MIGRATE → waves-done; spent prompts → prompts-spent.

═══ ФАЗА 4 — Combine wave close ═══
J) Когда 410 DONE: WAVE-COMBINE-PRODUCT-ROWS → waves-done; корень без COMBINE TZ.

═══ СТОП / НЕ БРАТЬ ═══
- _park/** (AUTH-307, SALES-377, UTF8, passports, production-3xx, z-series, TZD-49…)
- Deploy / wipe / «кати» без слова PO
- Параллель двух Layer-3 на proposal-create* / dashboard.page / desktop god-files
- Новые WAVE «заодно»

═══ DoD сессии ═══
- tasks/ корень: только канон-промпты + 0 LIVE TZ (идеал) или 1 in-flight
- _backlog: только то, что BLOCKED (MCP/PO) или ещё не дошли
- Каждая сделанная → .done.md + lock + push
- Отчёт: таблица ID | outcome | archive path | SHA
```

---

**Как пользоваться:** один чат Freebuff на весь промпт; при обрыве — `PROMPT-RESUME-ANY.md` + «продолжи drain с последней незакрытой фазы».
