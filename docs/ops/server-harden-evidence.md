# Server harden evidence (TZ-OPS-310)

> Заполняет исполнитель при закрытии TZ-OPS-310. **Без паролей и ключей.**  
> Gate деплоя: наличие `tasks/_archive/2026-08/TZ-OPS-310.done.md` + этот файл.

| Поле | Значение |
|------|----------|
| Дата | 2026-08-11 |
| Agent | cursor-architect-ops |
| VPS hostname | box-946037 (`193.222.62.240`) |
| VM hostname | ubuntuserver (`192.168.1.103`) |
| Basic Auth anon | **401** Unauthorized |
| Basic Auth + creds | **200** on `/api/health/ready` (пароль не писать) |
| htpasswd perms | `root:www-data` mode **640** (`-rw-r-----`) |
| Tunnel `127.0.0.1:4200` health | **ok** (HTTP 200) |
| LAN `:3000` health | **ok** (HTTP 200, mongo up) |

## VPS — SUID (`find / -xdev -perm -4000`)

```
/usr/bin/chfn
/usr/bin/chsh
/usr/bin/fusermount3
/usr/bin/gpasswd
/usr/bin/mount
/usr/bin/newgrp
/usr/bin/ntfs-3g
/usr/bin/passwd
/usr/bin/su
/usr/bin/sudo.ws
/usr/bin/umount
/usr/lib/cargo/bin/su
/usr/lib/cargo/bin/sudo
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
```

## VPS — SGID (`-perm -2000`)

```
/usr/bin/chage
/usr/bin/crontab
/usr/bin/expiry
/usr/bin/ssh-agent
/usr/sbin/pam_extrausers_chkpwd
/usr/sbin/unix_chkpwd
```

## VM — SUID

```
/usr/bin/chfn
/usr/bin/chsh
/usr/bin/fusermount3
/usr/bin/gpasswd
/usr/bin/mount
/usr/bin/newgrp
/usr/bin/passwd
/usr/bin/su
/usr/bin/sudo
/usr/bin/umount
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
/usr/lib/polkit-1/polkit-agent-helper-1
```

## VM — SGID

```
/usr/bin/chage
/usr/bin/crontab
/usr/bin/expiry
/usr/bin/ssh-agent
/usr/lib/x86_64-linux-gnu/utempter/utempter
/usr/sbin/pam_extrausers_chkpwd
/usr/sbin/unix_chkpwd
```

## Actions

| Path | Action | Note |
|------|--------|------|
| (none stripped) | none | All match allowlist / distro packages |
| `/usr/bin/sudo.ws` + `/usr/lib/cargo/bin/{su,sudo}` | OK / expected | Ubuntu `sudo` alternatives + `sudo-rs` package (`dpkg -S`) |
| VPS `:4200` on `0.0.0.0` | REVIEW (no change) | Tunnel listen is public-bind, but **UFW allows only 22/80/443** — external probe from Windows to `:4200` did not get through. Do not open 4200 in UFW. Prefer later bind to `127.0.0.1` if autossh unit is retouched. |

## Listening ports (summary)

| Host | Ports (summary) | OK? |
|------|-----------------|-----|
| VPS | 22, 80, 443 public; 4200 listen + UFW deny; DNS localhost | yes |
| VM | 22, 3000 (LAN/`0.0.0.0` — not internet-facing); mongo/loopback | yes (`:3000` not on VPS public) |

## Deploy gate

- [x] Archive TZ-OPS-310.done.md will exist after closeout
- [x] `deploy/synology/preflight.ps1` checks archive (already in repo)
- [x] Next warm deploy only after PO «деплой»

## Notes

- `kppdf-tunnel` on VM: **active**; health via tunnel and LAN OK.
- Basic Auth on nginx still required before app login.
- No SUID bits removed (nothing unexpected outside allowlist/packages).
- deploy.ps1 **not** run in this TZ.
