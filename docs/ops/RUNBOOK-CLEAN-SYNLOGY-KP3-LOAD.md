# Runbook — чистый Synology + залив КП3 через MCP

> 2026-08-12 · План PO: стереть **тестовые** данные на Synology, задеплоить актуальный код (вкл. TZD-46 versioned Desktop ZIP), скачать Desktop, подключить MCP к **prod**, затем MIG-302 (scoped КП3).  
> Канон опасности: [`DANGEROUS-OPS.md`](./DANGEROUS-OPS.md).

## Порядок (строго)

```
0. VPN OFF (иначе LAN 192.168.1.103 недоступен)
1. Бэкап Mongo на VM (backup.sh) → путь PO
2. Явная фраза PO: «да, разрешаю wipe после бэкапа …»
3. Wipe + Seed deploy (код main + Desktop publish)
4. Smoke: health/ready, login admin, /downloads/…-v{semver}.zip
5. PO скачивает Desktop ZIP (имя с v0.5.1), ставит, pair к https://kppdf-crm.ru
6. MCP ping OK к prod
7. MIG-302 scoped load (Categories→CP→Products→Quotations; без фото/email/бренд)
8. Отчёт load-report; фото = TZD-47→MIG-303 later
```

## Почему не «сразу wipe»

DANGEROUS-OPS: wipe = красная кнопка. Нужны:

1. Бэкап на VM.  
2. Точная фраза: **`да, разрешаю wipe после бэкапа`**.  
«Ок» / «приступай» / «удаляем тестовые» **без** этой формулы — агент **не** жмёт wipe.

## Шаг 3 — деплой (когда разрешено)

На build-ПК (VPN off, `main` = origin):

```powershell
cd D:\kppdf-8.0
git pull --ff-only
# Desktop artifact (TZD-46):
cd desktop
pnpm tauri build
pnpm run publish-installer
cd ..
# В config.env на время этого прогона:
#   SEED=true
#   (wipe через флаг, не оставлять WIPE=true навсегда)
.\deploy\synology\deploy.ps1 -Wipe -Seed
```

После успеха сразу вернуть в `config.env`: `WIPE=false` (или не задавать).

`config.env` / inject:

- `DESKTOP_DOWNLOAD_URL=/downloads/kppdf-desktop-setup-v0.5.1.zip` (или актуальный semver)
- `DESKTOP_MIN_VERSION=0.5.1`
- `DESKTOP_RECOMMENDED_VERSION=0.5.1`
- `CORS_ORIGIN=https://kppdf-crm.ru`

См. `deploy/synology/README.md` § Desktop + TZD-46.

## Шаг 5–7 — данные

| | |
|--|--|
| Источник | `data/from-kp3/` (уже локально, MIG-301) |
| Mapping | `docs/audits/2026-08-12-kp3-to-kp8-field-map.md` §6 PO scoped YES |
| Load TZ | `tasks/_backlog/migrate-kp3/TZ-MIG-302-kp3-mcp-load.md` |
| Prompt | `tasks/_backlog/migrate-kp3/PROMPT-KP3-MIG-302.md` |
| Target SoT | **prod** `kppdf-crm.ru` через Desktop MCP (после pair) — PO явно хочет чистый сайт |

MIG-302 **не** грузит: photoIds, CP.email, branding. Successors: TZD-47 → MIG-303; MIG-304; MIG-305 PARK.

## Что PO пишет агенту

| Когда | Фраза |
|-------|--------|
| VPN можно трогать | `VPN off` / `да, выключи VPN` |
| После бэкапа | `да, разрешаю wipe после бэкапа` |
| Обычный деплой без wipe | `деплой` (сюда **не** подходит) |
| После Desktop+MCP | `лей MIG-302 на prod` |

## Статус готовности кода

| Кусок | Статус |
|-------|--------|
| TZD-46 versioned ZIP | DONE `8e2db314` / lock `0f7a4db8` |
| MIG-301 dump+map | DONE `e264ff4c` |
| MIG-302 scoped | READY (ждёт wipe+MCP prod) |
| Фото | НЕ в этом прогоне |
