═══════════════════════════════════════════════════════════════
TZ-OPS-310: Гигиена серверов (SUID / SSH / порты / Basic Auth) — gate перед деплоем
═══════════════════════════════════════════════════════════════

PAGES: N/A (ops / infra)
PAGE_DOCS: N/A

РОЛЬ АГЕНТА: Ops / sysadmin (SSH jump VM→VPS; docs + evidence; без product UI)
ЗАВИСИМОСТИ: VPN OFF (LAN `192.168.1.103`); Basic Auth на VPS уже включён (2026-08-10)
LAYER: 1
PRIORITY: high перед любым следующим `deploy.ps1` (не блокирует WAVE-KP-COMPLETE / AUTH-301 в коде)
CONFLICT KEYS:
- docs/ops/server-harden-evidence.md
- docs/ops/home-host-access.md
- deploy/synology/README.md
- deploy/synology/RUNBOOK.md
- deploy/synology/preflight.ps1
- docs/agent-checklists/TZ-OPS-310.md
- docs/agent-checklists/_active-map.md
- tasks/_backlog/QUEUE.md
- progress.md

Проверено: `deploy/synology/DEPLOY.md` (VPS `193.222.62.240` nginx + SSH reverse tunnel → VM `192.168.1.103`);
`docs/ops/home-host-access.md` (Basic Auth ON); Instagram-совет про SUID = один слой гигиены, не замена Basic Auth.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Публичный фасад: `https://kppdf-crm.ru` → VPS nginx:443 → tunnel → Docker backend на VM.
2. HTTP Basic Auth на VPS включён (`/etc/nginx/.htpasswd-kppdf`, логин в gitignored `CREDENTIALS.md`).
3. С Windows нет прямого ключа root→VPS; доступ: `tiit@192.168.1.103` → `ssh root@193.222.62.240`.
4. Полноценный harden ещё **не** зафиксирован evidence-файлом → деплой-агенты не знают, «сделано или нет».
5. Цель PO: перед деплоем проверить TZ; если не сделано — сделать, потом деплоить.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Preflight доступа**
   - VPN OFF; `ssh -i %USERPROFILE%\.ssh\kppdf80-vm tiit@192.168.1.103` → OK.
   - С VM: `ssh root@193.222.62.240 'hostname'` → `box-946037`.
   - CLAIM: `tasks/_active/TZ-OPS-310.md` + checklist `docs/agent-checklists/TZ-OPS-310.md`.

2. **Инвентарь SUID/SGID (VPS и VM)** — на каждом хосте:
   ```bash
   find / -xdev -perm -4000 -type f 2>/dev/null | sort
   find / -xdev -perm -2000 -type f 2>/dev/null | sort
   ```
   - Сверь с **allowlist** ниже (типичный Ubuntu).  
   - **Ожидаемые** → в evidence «OK / expected».  
   - **Неожиданные** (не из allowlist, особенно скрипты `*.sh`, world-writable, пути вне `/usr`):  
     снять бит `chmod u-s FILE` (SUID) / `chmod g-s FILE` (SGID) **только** если это не пакетный бинарь из allowlist.  
   - Если сомнение «пакетный, но странный» — **не** ломай вслепую: оставь, пометь `REVIEW` в evidence (1–3 штуки max без паники).

   **Allowlist (ориентир, не копировать слепо имена с другой ОС):**  
   `passwd`, `sudo`, `su`, `newgrp`, `chsh`, `chfn`, `gpasswd`, `mount`, `umount`,  
   `fusermount*`, `pkexec`, `ssh-keysign`, `unix_chkpwd`, `crontab` (если есть),  
   `ping`/`ping6` (иногда), `ntfs-3g` (если есть) — и аналоги из `/usr/lib/**` пакетов openssh/systemd/dbus.

3. **SSH / сеть (проверка, без ломания туннеля)**
   - VPS: `ss -tlnp` — снаружи слушаются в основном `:22`, `:80`, `:443`. Лишнее → описать в evidence; закрывать ufw только если уверен (не режь `:22` себе).  
   - VM: Docker `kppdf-backend` может слушать `:3000` в LAN — **не** пробрасывать `:3000` в интернет.  
   - Проверь `kppdf-tunnel` active на VM; с VPS `curl -sf http://127.0.0.1:4200/api/health/ready`.

4. **Basic Auth жив**
   ```bash
   curl -sI https://kppdf-crm.ru/api/health/ready | head -1   # 401
   curl -sI -u 'LOGIN:PASS' https://kppdf-crm.ru/api/health/ready | head -1  # 200
   ```
   Пароль только из `CREDENTIALS.md` — **не** печатать в git/evidence/чат.

5. **Права htpasswd**
   - `/etc/nginx/.htpasswd-kppdf` → `root:www-data`, mode `640` (уже чинили 2026-08-10; подтвердить).

6. **Evidence в git (без секретов)**
   - Заполни шаблон → `docs/ops/server-harden-evidence.md`:
     дата, кто (agent_id), hostname VPS/VM, списки SUID (пути), что снято / REVIEW, порты, Basic Auth 401/200, tunnel OK.
   - Коротко обнови `docs/ops/home-host-access.md` (§ «Harden» / ссылка на evidence + TZ-OPS-310).

7. **Deploy gate в доках/скрипте** (если ещё не стоит — доведи):
   - `deploy/synology/README.md` + `RUNBOOK.md`: перед `deploy.ps1` обязательна проверка  
     `tasks/_archive/2026-08/TZ-OPS-310.done.md` (или этот evidence + archive).  
   - `preflight.ps1`: если archive OPS-310 отсутствует → **FAIL** с текстом «сначала TZ-OPS-310».

8. Closeout: archive `tasks/_archive/2026-08/TZ-OPS-310.done.md` + lock  
   `.mimocode/locks/TZ-OPS-310-server-harden.lock` → commit+push → Checkpoint  
   `_active-map`: **OPS-310 DONE · deploy gate green**.  
   **Не** запускай `deploy.ps1`, пока PO отдельно не сказал «деплой».

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- На серверах: только chmod u-s/g-s на явно лишних SUID/SGID; права htpasswd; (опционально) ufw rules если безопасно
- В репо: `docs/ops/server-harden-evidence.md`, `home-host-access.md`, deploy README/RUNBOOK/preflight, checklist, `_active-map`, `QUEUE.md`, `progress.md`

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- frontend/** · backend/** (product)
- `deploy.ps1` логику wipe / compose (кроме preflight gate)
- nginx proxy_pass / certbot / autossh unit (кроме подтверждения auth_basic)
- Пароли в git; печать Basic/admin паролей в evidence
- WAVE-KP-COMPLETE / AUTH-301 (чужие ключи) — эта TZ **параллельно-safe** к коду, но требует VPN; не мешай claim’ам FE
- desktop ZIP publish

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] Evidence `docs/ops/server-harden-evidence.md` заполнен (дата, оба хоста, SUID списки, порты, Basic Auth 401/200 без паролей)
- [ ] Неожиданные SUID сняты **или** явно помечены REVIEW с путём
- [ ] Tunnel + LAN health OK; Basic Auth всё ещё требует пароль снаружи
- [ ] `preflight.ps1` падает, если нет `tasks/_archive/2026-08/TZ-OPS-310.done.md` (после archive — проходит этот пункт)
- [ ] README/RUNBOOK содержат gate «OPS-310 before deploy»
- [ ] Archive + lock + push; `_active/` пуст
- [ ] `deploy.ps1` в этой TZ **не** запускался

PARALLEL-SAFE: да vs FE/BE волны; **нет** vs параллельный другой ops на тех же nginx/SSH.
Workspace: `D:\kppdf-8.0`. VPN OFF обязателен.

known_limitation: полный CIS/auditd/fail2ban — вне scope; Tailscale — отдельная инициатива; Instagram «удаляй всё с SUID» — **вредный** совет (passwd/sudo нужны).
