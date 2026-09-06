# Аудит: порт «Скачать Desktop / паринг» на NX

date: 2026-09-05  
author: Cursor (Mode A)  
trigger: PO — в NX забыли модуль скачивания Desktop; сначала проверка/доделки, потом UI

### Preflight Check Output
- **Context read:** `frontend/src/app/core/desktop-download-url.ts`, `pairing-dialog.component.ts`, `pi-desktop-pairing.service.ts`, `app-layout.component.ts` (`onDesktopPairing`); `frontend/src/index.html` meta; grep NX — **0** hits; `DOMAIN-MAP.md` Desktop = gap; CAPABILITY-LEDGER Desktop app + order import
- **Key Constraints:** Mode A; порт после fix gaps; не Excel в registries; TZD-71→72
- **Planned Deliverable:** TZD-71 (gaps) → TZD-72 (NX port) → TZD-73 smoke
- **Validation Path:** `nx build kppdf-web` + jest pairing; HEAD `/downloads/...` после deploy

---

## 1. Для PO

На **старом** сайте: кнопка «Подключить десктоп» → диалог: выпустить ключ, скопировать пакет, **Скачать Desktop**, подсказка версии.  
На **NX** этого **нет** — скачать установщик с нового фронта нельзя.

---

## 2. Эталон legacy (переносить)

| Кусок | Путь | Роль |
|-------|------|------|
| URL resolver | `frontend/.../desktop-download-url.ts` | meta `kppdf-desktop-download-url` → alias `/downloads/kppdf-desktop-setup.zip` |
| Meta | `frontend/src/index.html` | пустой meta; deploy inject `DESKTOP_DOWNLOAD_URL` |
| Service | `pi-desktop-pairing.service.ts` | `POST/GET/revoke pairing-keys`, `GET /desktop/compat` |
| Dialog | `pairing-dialog.component.ts` | TTL, copy JSON, download button, compat subtitle |
| Entry | `app-layout` user/chrome | `onDesktopPairing()` |

Канон имени артефакта: `kppdf-desktop-setup-v{semver}.zip` + unversioned alias (TZD-46).

---

## 3. Gap NX

| Пункт | NX |
|-------|-----|
| `desktop-download-url` / InjectionToken | нет |
| meta в `index.html` | нет (найти apps/kppdf-web index — добавить) |
| data-access pairing service | нет |
| PairingDialog (Pi-*) | нет |
| Кнопка в AppShell | нет |
| DOMAIN-MAP | gap — обновить после TZD-72 |

---

## 4. Доделки до порта (TZD-71 checklist)

Исполнитель/Cursor при TZD-71 проверяет evidence и чинит только найденное:

1. Deploy path для NX static: inject meta / `DESKTOP_DOWNLOAD_URL` не только в legacy `frontend/`
2. Compat semver ↔ ZIP name ↔ `desktop/package.json`
3. `/downloads/*` доступ для enrolled device (не ложный 401)
4. Alias unversioned = те же байты, что versioned
5. Пустой URL → кнопка disabled + «Установщик скоро будет…» (как legacy)
6. Pairing packet **без** session JWT

Если всё уже ок на prod для legacy — TZD-71 = короткий PASS-отчёт + note «NX index meta + deploy hook» как минимальный prep для TZD-72.

---

## 5. RBAC (обязательно — требование PO)

**Сейчас (legacy):** кнопка видна **любому** залогиненному — дыра.  
**Нужно на NX:** видеть кнопку и выпускать ключ / скачивать установщик могут только:

1. `systemRoles: ['admin']` (админ сайта), **или**
2. роль с явным permission **`desktop:admin`** (админ выдаёт в `/admin/roles`).

Контур:

| Слой | Что |
|------|-----|
| Catalog | Добавить `desktop:admin` в `permissions.constants.ts` + NX `capabilities.metadata.ts` + RU label |
| BE | `@Permissions('desktop:admin')` на `POST/GET/revoke pairing-keys` (compat остаётся `@Public`) |
| FE | Кнопка shell: `caps.hasAny(['desktop:admin'])` \|\| role admin; без права — не рендерить |
| Roles UI | Новая строка матрицы — админ может включить роль менеджеру и т.п. |
| FIC | §B permission + page N/A (chrome action, не route) |

Скачивание ZIP по URL (`/downloads/...`) само по себе может оставаться за device-auth сайта; **UI-кнопка и API pairing** — только с `desktop:admin`.

---

## 6. TZD-72 scope (после 71)

- Port token + reader в `frontend-nx`
- `PiDesktopPairingService` в `@kppdf/data-access`
- `PairingDialog` на NX PiDialog / Button
- Кнопка в AppShell **с RBAC** (`desktop:admin`)
- BE gate на pairing endpoints
- Тесты: URL resolve; кнопка hidden без cap; dialog issue/download
- `IMPLICIT CONFLICT: nx build kppdf-web`

НЕ: Excel Form Studio на вебе; не менять Desktop Tauri pairing flow.

---

## 7. NOT-IN-SCOPE

- Кнопки Excel в registries
- Переписывать Desktop App.svelte pairing
- Мёртвый `/people` в nav (опционально позже)
- Открывать pairing всем authenticated (как сейчас в legacy) — **запрещено** на NX
