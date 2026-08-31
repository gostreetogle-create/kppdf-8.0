# Multi-agent production workflow (kppdf adaptation)

> Источник: `data/multi-agent-production-workflow-v1/` (публичный шаблон Codex + Claude Code + Zcode).  
> Версия адаптации: `1.0-kppdf` · 2026-08-31.  
> **Не** копировать корневой `AGENTS.md` поверх `GEMINI.md` / `CLAUDE.md`.

## Preflight Check Output

- **Context read:** `data/multi-agent-production-workflow-v1/public-package/README.md`, `…/COLLABORATION_CONTRACT.md`, `docs/agents/SKILLS-MAP.md`, `docs/how-to-connect-ai.md`, `docs/agents/CLAUDE-CODE.md`, `docs/PO-CANON.md`
- **Key Constraints:** Mode A (Cursor = TZ/интегратор-приёмка, не product code) · Claim + conflict keys · один файл — один writer · deploy только по слову PO
- **Planned Deliverable:** этот канон + skills + handoff-шаблоны; SoT остаётся TZ/`_active`/`_NOW`
- **Validation Path:** цикл ниже без параллельной записи на одних conflict keys; evidence = SHA + diff + gates

## Карта ролей (пакет → kppdf)

| Пакет | У нас | Что делает | Чего не делает |
|-------|--------|------------|----------------|
| Владелец продукта | **PO** | бизнес-смысл, wipe/deploy, Да/Нет | не пишет код агентам |
| **Codex** (архитектор + интегратор) | **Cursor** (Mode A) | TZ, conflict keys, handoff, финальная приёмка `Executor report (auto)`, evidence gate | product `frontend/**` / `backend/**/*.ts` |
| Codex как runtime-интегратор commits | continuous **Gemini / Claude CLI** на `main` по Claim | claim → код → gates → archive → commit своих путей | чужой WIP; deploy без PO |
| **Claude Code** reviewer-first | **MCP `claude_code`** + Claude CLI в review | analysis-only / findings с доказательствами | self-review своего commit; grind без Claim |
| Claude Code bounded executor | Claude CLI `agent_id: claude` | одна TZ, exact scope | рутина Freebuff; `--dangerously-skip-permissions` |
| **Zcode** (3-й bounded) | **Freebuff / Buffy** (и 2-й Freebuff) | непересекающийся scope, свой commit-префикс/agent_id | интеграция чужих diff; те же conflict keys |

Слайд PO: до **2 Freebuff + 1 Claude terminal**, разные conflict keys (`PO-CANON`).

## Что берём из пакета

- один главный интегратор приёмки (у нас: Cursor для отчётов; continuous executor — для merge в working tree только своих путей);
- exact baseline + exact `allowed_paths` / conflict keys без glob;
- запрет параллельной записи в один файл / связанный runtime-контур;
- reviewer не пишет проверяемый runtime;
- executor не принимает собственную работу;
- finding = факт + доказательство + риск + min-fix + acceptance;
- production / push policy / destructive — отдельная authority (`docs/GIT-POLICY.md`, слово PO);
- model/effort по цене ошибки, не по длине промпта.

## Что не берём / не копируем в корень

- корневой `AGENTS.md` рядом с `GEMINI.md` (запрет `SKILLS-MAP`);
- параллельный SoT `.project-review/current-task.md` вместо `tasks/_active/<TZ>.md` + checklist;
- слепое включение `.claude/hooks` без учебной ветки;
- имена веток `codex/<task>` как обязательные — у нас: `main` continuous **или** explicit `.worktrees/<TASK-ID>`;
- Zcode как отдельный продукт — у нас слот = Freebuff/Buffy.

Исходник пакета остаётся в `data/multi-agent-production-workflow-v1/` для справки.

## Рабочий цикл (kppdf)

```
PO intent → Cursor TZ (+ MCP Claude analysis-only при развилке)
  → Claim на _active + checklist
  → один executor (или N с непересекающимися conflict keys)
  → один локальный commit своих путей
  → независимый review (MCP Claude / второй агент) по exact SHA+diff
  → Cursor evidence gate (≤200 tok verdict)
  → archive / next from QUEUE-LIVE
  → deploy только по отдельной команде PO
```

### Handoff

Шаблон: `docs/agents/project-review/HANDOFF_TEMPLATE.md`.  
Минимум: Task ID, role, baseline SHA, HEAD, ownership, allowed paths / conflict keys, acceptance, checks, forbidden, stop-condition.

Передача: вручную в чат агента **или** `tasks/PROMPT-*.md`. Не имитировать доставку между Windows-приложениями.

### Ownership файлов (замена `.project-review`)

| Артефакт | Владелец |
|----------|----------|
| `tasks/_active/<TZ>.md` + Claim slot | назначенный executor; Cursor пишет TZ |
| `docs/agent-checklists/<TZ>.md` | executor (report) / Cursor (verdict) |
| `recommendations` / review findings | независимый reviewer (файл в checklist или `docs/audits/…`) |
| runtime product files | **один** agent_id в момент времени |
| `docs/GIT-POLICY` / deploy | PO |

Одновременно — одна активная волна на набор conflict keys. Новая находка после CLOSE → новый TZ, не бесконечный хвост.

## Effort routing (цена ошибки)

Полный skill: `.agents/skills/adaptive-effort-routing/SKILL.md`.

| Риск | Маршрут у нас |
|------|----------------|
| поиск / статус / мех. docs | дешёвая модель / Luna / Flash |
| UI presentation-only, рутина CRUD | **Freebuff** |
| обычный FE+BE сценарий | Freebuff или Claude Sonnet |
| auth, RBAC, IDOR, DB write, concurrency | Claude Sonnet+ / Gemini Pro; Cursor + MCP Claude до TZ |
| деньги, склад, historical, shared guard | Opus / max; Cursor Mode A + peer Claude **до** кода |
| неделимая архитектура | Cursor + MCP Claude analysis-only → TZ, не три executor’а |

Повышение при росте scope / hidden DML / production. Authority моделью не расширяется.

## Safety (кратко)

Skill: `.agents/skills/multi-agent-production-safety/SKILL.md`.  
Канон пакета: `data/.../docs/SAFETY_MODEL.md`.

Stop, если: пересеклись файлы; нет baseline; тесты лгут; нужен merge/rebase/push/wipe без authority; recommendation без evidence.

**Локалка ≠ приёмка.** Локальный прогон отвечает «есть ли ошибка» (упало там → в бою тоже). Он **не** доказывает «всё хорошо в бою»: другой объём/грязь данных, чужие статусы, люди с тремя вкладками, env. Агент в prod не ходит. Приёмка = человек выкатывает + заранее названные проверки + известный откат.

**STOP и спросить PO/интегратора**, если: молча меняется бизнес-правило; трогаются деньги / формулы / отчёты / остатки; удаление или переименование сущности; diff неожиданно разросся за conflict keys.

**Finding (review)** = готовая работа: путь + строки + доказательство + риск + min-fix / «как должно быть». Замечание без этого — не finding.

## Claude hooks (опционально, Phase 2)

Пакет предлагает fail-closed write guard. У нас `.claude/` сейчас нет.

Перед включением:

1. скопировать hooks в учебную ветку из `data/.../public-package/.claude/`;
2. заменить пути Python / allowlists под Nest+Angular (не `./src/**` как в примере);
3. marker = Claim slot + conflict keys TZ, не отдельный `agent-task.md` как SoT;
4. прогнать: reviewer пишет только findings; executor — только declared paths; dangerous Bash deny.

Без этого прогона hooks **не** активировать.

## Первый безопасный прогон

1. Маленькая обратимая TZ без БД/deploy.
2. Cursor пишет TZ + handoff.
3. Один Freebuff (Zcode-слот) реализует.
4. MCP Claude — review SHA (analysis-only).
5. Cursor — evidence gate.
6. Archive. Deploy — нет.

## Ссылки

- Пакет: `data/multi-agent-production-workflow-v1/public-package/`
- Контракт пакета: `…/.project-review/COLLABORATION_CONTRACT.md`
- Executor: `GEMINI.md` · Claude: `CLAUDE.md` · шпаргалка: `docs/agents/CLAUDE-CODE.md`
- Worktree: `docs/how-to-connect-ai.md`
- Skills map: `docs/agents/SKILLS-MAP.md`
