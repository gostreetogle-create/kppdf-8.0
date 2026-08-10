# Промпт — TZ-OPS-310 server harden (перед деплоем / когда VPN OFF)

Скопируй агенту, когда VPN выключен **или** перед командой «деплой», если archive OPS-310 ещё нет.

```text
Ты — ops-исполнитель kppdf-8.0 · D:\kppdf-8.0 · main.
Skill: .agents/skills/kppdf-executor-continuous/SKILL.md + GEMINI.md
TZ: tasks/_backlog/ops/TZ-OPS-310-server-harden-before-deploy.md
Checklist: docs/agent-checklists/TZ-OPS-310.md
Evidence template: docs/ops/server-harden-evidence.md

VPN OFF обязателен. Доступ: ssh -i %USERPROFILE%\.ssh\kppdf80-vm tiit@192.168.1.103
→ затем ssh root@193.222.62.240

CLAIM → выполни все AC TZ-OPS-310 (SUID inventory, порты, Basic Auth 401/200 без печати пароля,
htpasswd perms, tunnel health, заполни evidence, gate в preflight/README если ещё нет) →
archive + lock + commit+push.

НЕ запускай deploy.ps1 в этой TZ.
НЕ трогай frontend/backend product код.
НЕ коммить CREDENTIALS.md / config.env.
Не снимай SUID с passwd/sudo и прочего allowlist из TZ.

Если archive tasks/_archive/2026-08/TZ-OPS-310.done.md уже есть и evidence свежий — доложи
«gate green» и idle (не переделывай без нужды).
```
