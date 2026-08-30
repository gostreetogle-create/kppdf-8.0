# PROMPT — Freebuff: TZ-NX-F3 auth platform

Скопируй целиком в новую сессию Freebuff / Claude executor.

---

```
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-NX-F3-data-access.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id=freebuff-nx-f3 + claimed_at ISO + workspace
4) _active-map + чужие _active keys → конфликт = STOP
5) Team Room claim best-effort

Затем:
1. Прочитай docs/AI-AGENT-GUIDE.md (кратко)
2. Прочитай docs/architecture/nx-auth-platform.md + docs/RBAC-CONTRACT.md §5b, §5c, Page ACL
3. Выполни tasks/TZ-NX-F3-data-access.md целиком (F3-BE → F3a → F3b → F3c → F3d → F3-doc)
4. Не трогай legacy frontend/**
5. Gates из TZ AC — все PASS
6. Archive + Integrity slot + Executor report (auto) в checklist

Конфликт-ключи: frontend-nx/libs/data-access/**; frontend-nx/apps/kppdf-web/**; backend auth jwt.strategy + permissions.guard + auth.service
```

---

Одна сессия = один TZ. После archive — `/clear` перед следующим.
