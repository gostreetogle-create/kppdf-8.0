# PROMPT — TZ-MIG-301 (КП3 extract + mapping)

Скопируй блок агенту (Buffy / Gemini / local). **Сначала только 301.** MIG-302 не начинать без PASS mapping и OK PO по gaps.

---

По-человечески: агент по SSH заберёт с КП3 Mongo+фото, сложит в `data/from-kp3/`, сравнит поля с КП8 и напишет аудит. В SoT ничего не пишет.

```text
CLAIM первым (до любой работы):
1) Get-Location + git rev-parse --show-toplevel → D:\kppdf-8.0
2) tasks/_active/TZ-MIG-301.md + checklist docs/agent-checklists/TZ-MIG-301.md по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace D:\kppdf-8.0
4) docs/agent-checklists/_active-map.md + чужие tasks/_active → конфликт CONFLICT KEYS = STOP
5) Team Room claim best-effort

Затем прочитай:
- docs/AI-AGENT-GUIDE.md
- docs/TZ-AUTHORING.md §1 (Counterparty ≠ Organization; КП = Quotation)
- docs/ops/kp3-data-copy-access.md
- tasks/_backlog/migrate-kp3/WAVE-KP3-DATA-MIGRATE.md
- tasks/_backlog/migrate-kp3/TZ-MIG-301-kp3-extract-and-map.md

Выполни TZ-MIG-301 целиком:
- SSH: ssh -i $env:USERPROFILE\.ssh\kppdf8-kp3-data-copy -o IdentitiesOnly=yes root@130.49.129.240
- Mongo DB kp-app → data/from-kp3/raw/{products,counterparties,kps}.json
- media → data/from-kp3/media + photos-index.json
- Аудит: docs/audits/2026-08-12-kp3-to-kp8-field-map.md (map/rename-synonym/drop-ok/gap-block)
- id-map.template.json
- НЕ писать в Mongo/API КП8; НЕ deploy; НЕ менять backend/frontend schema
- Дампы/media НЕ коммитить (gitignore); в git — audit + checklist + archive

Gates из TZ. В конце ## Executor report (auto) в checklist, archive tasks/_archive/2026-08/TZ-MIG-301.done.md
После PASS — короткий Ask PO: список gap-block и «можно ли MIG-302».
```

Доска: `_active-map`. Волна: `tasks/_backlog/migrate-kp3/`.
