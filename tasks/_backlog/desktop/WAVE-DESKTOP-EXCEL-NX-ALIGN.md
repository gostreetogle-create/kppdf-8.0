# WAVE — Desktop Excel NX-align + NX Desktop download port

> **Статус:** 68–70 DONE (Claude, desktop-only) · 71–73 READY для Freebuff (`frontend-nx/**` shell)  
> **Дата:** 2026-09-05  
> **Аудиты:** `docs/audits/2026-09-05-desktop-excel-nx-align-audit.md`, `docs/audits/2026-09-05-nx-desktop-download-port-audit.md`  
> **Нумерация:** TZD-**68…73** (60–67 заняты; TZD-60 DEFERRED NSIS)

## Цель

1. Допилить Desktop Form Studio: **export с данными**, align полей с NX (вкл. **Люди**), UX «можно лить».  
2. Затем: проверить/доделать download+compat, **перенести** «Подключить / Скачать Desktop» на NX shell.  
3. **RBAC:** кнопка и pairing API только у **admin** и ролей с permission `desktop:admin` (админ выдаёт в Roles).  
4. **Не** добавлять Excel-кнопки в `/registries`. Units Excel — OUT.

## Цепочка

| SIZE | ID | Путь | Conflict (кратко) |
|------|-----|------|-------------------|
| L | TZD-68 | `tasks/_archive/2026-09/TZD-68.done.md` | **DONE** — export-with-data (material+workType pilot) |
| L | TZD-69 | `tasks/_archive/2026-09/TZD-69.done.md` | **DONE** — worker target + workType align |
| S | TZD-70 | `tasks/_archive/2026-09/TZD-70.done.md` | **DONE** — green send-ready UX |
| S | TZD-71 | `tasks/_ready/desktop/TZD-71-desktop-download-preflight.md` | deploy/meta/docs (+ minimal NX index prep) |
| L | TZD-72 | `tasks/_ready/desktop/TZD-72-nx-pairing-download-port.md` | `frontend-nx/**` shell + data-access |
| S | TZD-73 | `tasks/_ready/desktop/TZD-73-smoke-ledger.md` | docs + CAPABILITY-LEDGER |

Порядок: **68 → 69 → 70** (serial, общий App.svelte) → **71 → 72 → 73**.

## DoD волны

- [ ] TZD-68…73 archived + locks  
- [ ] Smoke: шаблон / export-with-data / дубль отклонён / worker create / NX download+pairing  
- [ ] Ledger: строка Form Studio + NX pairing available  
- [ ] `registries.page.md`: pointer «массовый Excel = Desktop»  
- [ ] DOMAIN-MAP Desktop gap закрыт после 72  

## Промпты

- Excel 68–70: `tasks/PROMPT-CLAUDE-DESKTOP-EXCEL-NX.md`  
- NX 71–73: `tasks/PROMPT-FREEBUFF-NX-DESKTOP-PAIRING.md` (старт только после 70 DONE + `_active` empty)

## Параллель с W1-SHELL

Сейчас `_active`: warehouse W1. Keys не пересекаются с Desktop Excel, но PO-CANON 0c = `_active` пуст.  
**Исключение только по слову PO.** До этого — IDLE executor / только docs.
