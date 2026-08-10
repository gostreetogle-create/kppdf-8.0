# Server harden evidence (TZ-OPS-310)

> Заполняет исполнитель при закрытии TZ-OPS-310. **Без паролей и ключей.**  
> Gate деплоя: наличие `tasks/_archive/2026-08/TZ-OPS-310.done.md` + этот файл.

| Поле | Значение |
|------|----------|
| Дата | _YYYY-MM-DD_ |
| Agent | _id_ |
| VPS hostname | _(ожид. box-946037)_ |
| VM hostname | _(ожид. ubuntuserver)_ |
| Basic Auth anon | _401 / fail_ |
| Basic Auth + creds | _200 health (пароль не писать)_ |
| htpasswd perms | _root:www-data 640 / other_ |
| Tunnel `127.0.0.1:4200` health | _ok / fail_ |
| LAN `:3000` health | _ok / fail_ |

## VPS — SUID (`find / -xdev -perm -4000`)

```
(paste paths)
```

## VPS — SGID (`-perm -2000`)

```
(paste paths)
```

## VM — SUID

```
(paste paths)
```

## VM — SGID

```
(paste paths)
```

## Actions

| Path | Action | Note |
|------|--------|------|
| | none / `chmod u-s` / REVIEW | |

## Listening ports (summary)

| Host | Ports (summary) | OK? |
|------|-----------------|-----|
| VPS | 22,80,443, … | |
| VM | 22,3000(LAN), … | |

## Deploy gate

- [ ] Archive TZ-OPS-310.done.md will exist after closeout
- [ ] `deploy/synology/preflight.ps1` checks archive
- [ ] Next warm deploy only after PO «деплой»

## Notes

_
