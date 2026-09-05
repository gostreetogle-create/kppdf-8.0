═══════════════════════════════════════════════════════════════
TZD-72: NX — порт «Подключить / Скачать Desktop» + RBAC desktop:admin
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: frontend-nx + backend permissions gate. Эталон: legacy pairing-dialog + desktop-download-url.

ЗАВИСИМОСТИ: TZD-71 DONE. Аудит download-port §5–6 (RBAC обязателен).

LAYER: 3
**SIZE:** L
**PACK:** WAVE-DESKTOP-EXCEL-NX-ALIGN

CONFLICT KEYS: `backend/src/common/seed/permissions.constants.ts` ; `backend/src/modules/desktop/desktop-pairing.controller.ts` ; `frontend-nx/libs/data-access/src/lib/capabilities/capabilities.metadata.ts` ; `frontend-nx/apps/kppdf-web/src/app/pages/permission-labels.ru.ts` ; `frontend-nx/libs/data-access/src/lib/**/desktop*` (new) ; `frontend-nx/apps/kppdf-web/src/app/layout/**` ; `frontend-nx/apps/kppdf-web/src/app/pages/desktop/**` (new) ; `docs/FEATURE-INTEGRATION-CHECKLIST.md` ; `docs/DOMAIN-MAP.md` ; `docs/agent-checklists/TZD-72.md`

IMPLICIT CONFLICT: nx build kppdf-web

PAGES: N/A (chrome action)
PAGE_DOCS: N/A ; pointer в `docs/pages` shell / admin-roles если нужно

STATUS: READY

═══════════════════════════════════════════════════════════════
DOMAIN PREFLIGHT
═══════════════════════════════════════════════════════════════

| PO | Канон |
|----|--------|
| Кто видит кнопку | admin **или** permission `desktop:admin` |
| Админ выдаёт роль | Roles matrix `/admin/roles` |
| Скачать Desktop | та же кнопка в pairing dialog |
| Клиент | N/A |

Проверено: legacy кнопка **без** cap (дыра); pairing controller без `@Permissions`; catalog без desktop:*; NX capabilities mirror BE.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

NX: нет download URL, pairing service, dialog, shell button.  
BE: любой authenticated может issue pairing key.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Permission catalog

  1.1. BE `PERMISSIONS`: `{ key: 'desktop:admin', section: 'desktop', action: 'admin', description: 'Download Desktop / issue pairing keys' }`
  1.2. NX `capabilities.metadata.ts` — тот же key (lockstep).
  1.3. RU label в `permission-labels.ru.ts` (NX): «Desktop: скачать и подключить».
  1.4. FIC §B. Seed/boot validator подхватит новый key.
  1.5. Admin role с `*` / full set автоматически видит; кастомные роли — галка в матрице.

ШАГ 2: BE gate

  2.1. `@Permissions('desktop:admin')` на POST/GET/revoke pairing-keys (и alias POST pairing).
  2.2. `GET compat` остаётся `@Public`.
  2.3. Jest: 403 без permission; 200 с desktop:admin / admin wildcard.

ШАГ 3: NX data-access + download URL

  3.1. Port `desktop-download-url.ts` (+ spec) в NX util/app core.
  3.2. `PiDesktopPairingService` (silent HTTP) — issue/list/revoke/compat.
  3.3. Export из data-access index.

ШАГ 4: PairingDialog NX

  4.1. Порт UX legacy: TTL, label, issue, copy JSON, **Скачать Desktop**, compat subtitle, list/revoke.
  4.2. PiDialog / Button / tokens — Paper & Ink NX.
  4.3. Не класть session JWT в packet.

ШАГ 5: Shell entry + RBAC

  5.1. Кнопка «Подключить десктоп» в AppShell рядом с user (как legacy).
  5.2. Рендер **только** если `caps.hasAny(['desktop:admin'])` (admin уже имеет полный набор / wildcard).
  5.3. Тест: без cap — кнопки нет; с cap — есть и открывает dialog.

ШАГ 6: Docs

  6.1. DOMAIN-MAP Desktop/Import NX колонка → available (pairing UI).
  6.2. CAPABILITY-LEDGER note (или TZD-73).
  6.3. admin-roles.page.md — упоминание desktop:admin одной строкой.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Excel Form Studio / registries Excel buttons
- Legacy frontend pairing (можно оставить; NX — SoT для нового фронта)
- Desktop Tauri App.svelte
- Public `/downloads` static serving rules (кроме docs)

═══════════════════════════════════════════════════════════════
СБОИ (≥3)
═══════════════════════════════════════════════════════════════

1. Менеджер без desktop:admin — кнопки нет; прямой API POST → 403.
2. URL установщика пуст — download disabled + hint.
3. Compat fail — «Не удалось проверить версию», download всё ещё по meta URL если есть.
4. Отзыв ключа — сразу недействителен.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] `desktop:admin` в BE+FE catalog; виден в roles matrix
- [ ] Pairing API 403 без права
- [ ] Shell: admin видит; user без права — нет
- [ ] Dialog: issue + copy + download работают при наличии ZIP URL
- [ ] nx build kppdf-web PASS; focused jest PASS; BE pairing tests PASS
- [ ] FIC §B; DOMAIN-MAP updated

known_limitation: legacy shell всё ещё без cap — successor optional harden legacy.

Финализация: archive 2026-09 + lock.
