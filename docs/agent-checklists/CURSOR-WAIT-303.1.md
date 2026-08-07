# Cursor wait protocol — TZ-PRODUCTION-303.1

Пока executor закрывает Gantt hotfix + `?q=`, Cursor **не** трогает CONFLICT KEYS 303.1.

## Сейчас (снимок)

| Check | Expected |
|-------|----------|
| `tasks/_active/TZ-PRODUCTION-303.1-…` | должен появиться при CLAIM |
| checklist Status | RESERVED → CLAIMED |
| product WIP | local dirty production/** — зона executor |
| Deploy | запрещён |

Если PO отдал промпт, а `_active` пуст дольше ~15 мин — напомнить исполнителю сделать CLAIM первым (не писать код «втихаря»).

## Когда PO пишет «executor DONE» / кидает checklist

1. `docs/agent-checklists/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md` → блок `## Executor report (auto)`
2. `git rev-parse <sha>` + `git show --stat` + `git show -- <CONFLICT KEYS>`
3. Verdict ≤200 tokens + next: PO smoke `docs/pages/production-cockpit-smoke-303.1.md`
4. Archive только если gates+scope OK (или попросить executor добить)

## Не делать параллельно

304–307 · 308–310 код · shipping · YouGile import · drag · FE-only deploy.
