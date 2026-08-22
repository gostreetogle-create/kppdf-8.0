# TZ-OPS-318 checklist

> Status: **DONE**

## Claim slot

- agent_id: freebuff (closeout)
- claimed_at: 2026-08-22T19:11:51+03:00

## Acceptance

- [x] backup.sh: rotation удаляет копии старше BACKUP_RETENTION_DAYS (default 14)
- [x] Удаление залогировано (echo "removing: ...")
- [x] RUNBOOK.md: готовая cron-строка + пояснение про volume
- [x] README.md: секция «Данные переживают деплой»
- [x] bash -n deploy/synology/backup.sh → PASS

## Gates

- bash -n PASS
- code review: rotation логирует каждую удалённую папку, BACKUP_RETENTION_DAYS=0 отключает ротацию

## Known limitations

- Установка cron на прод-VM — вне scope без SSH/разрешения PO
- Офсайт-копия бэкапов — отдельное решение PO