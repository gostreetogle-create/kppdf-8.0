# TZ-OPS-DOCS-HOST-52-SYNC: live ops-доки `.103` → `.52`

> **SIZE:** S · **PACK:** single  
> **РОЛЬ:** docs-only executor  
> **ЗАВИСИМОСТИ:** после PASS `TZ-VERIFY-2026-09-13-ENROLL-DEPLOY-VM52` (или явный GO PO)

**CONFLICT KEYS:**  
`docs/ops/home-host-access.md; docs/ops/PROMPT-ACCESS-METHOD-DEBATE.md; docs/ops/RUNBOOK-CLEAN-SYNLOGY-KP3-LOAD.md; deploy/synology/CREDENTIALS.example.md`

## ИСХОДНОЕ

Канон host = `192.168.1.52` (`deploy/synology/*`, коммит `842275a5`).  
Живые ops-файлы выше всё ещё ссылаются на `192.168.1.103`.  
`CREDENTIALS.example.md` упоминает legacy cloudflared — заменить примечанием: канон v8 = SSH reverse tunnel (`kppdf-tunnel`), см. `DEPLOY.md`.

Исторические аудиты/`server-harden-evidence.md` / `AUDIT-CONNECT-2026-08-02.md` — **не** трогать.

## ЧТО ДЕЛАТЬ

1. Заменить `.103` → `.52` в CONFLICT KEYS файлах (только актуальные инструкции).
2. В `CREDENTIALS.example.md` убрать/пометить cloudflared как legacy kppdf-3.0.
3. `rg "192\.168\.1\.103" docs/ops deploy/synology/CREDENTIALS.example.md` → 0 в изменённых файлах; исторические evidence могут остаться.

## НЕ ИЗМЕНЯТЬ

Product-код; `deploy/synology/{README,INSTALL,DEPLOY,RUNBOOK}.md` (уже `.52`); секреты; wipe/deploy.

## ACCEPT

- Live ops path указывает только `.52`.
- Commit: `docs(ops): sync host IP 192.168.1.52 after fresh VM rebuild`.
