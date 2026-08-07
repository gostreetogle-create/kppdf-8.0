═══════════════════════════════════════════════════════════════
TZD-21: Desktop pairing keys — TTL + multi-key + revoke (web+BE)
═══════════════════════════════════════════════════════════════

> READY · LAYER 4 (backend) + LAYER 2 (FE dialog/settings) · **не** параллелить
> с другим TZ на `auth/**` / `pairing-dialog` без DEFER.
>
> Audit trigger (PO 2026-08-08): session JWT ~15m в паринг-пакете; повторный
> клик «Десктоп» копирует **тот же** access-token сессии — нет отдельных ключей,
> нет выбора срока, нельзя держать несколько живых Desktop/MCP без общего TTL.
> Контракт: `desktop/docs/PAIRING.md` уже помечает `POST /api/desktop/pairing`
> как «будущая TZ».
>
> Проверено:
> - `app-layout.component.ts` `onDesktopPairing()` → `apiKey: accessToken()`,
>   `expiresAt` из JWT `exp`
> - `auth.module.ts` / `auth.service.ts` → `jwt.expiresIn` default **`15m`**
> - Отдельной коллекции desktop API keys **нет**

STATUS: READY (выдавать по «делай TZD-21»)

РОЛЬ АГЕНТА: Backend Nest + Frontend (pairing dialog / admin-or-user settings).

ЗАВИСИМОСТИ:
- TZD-05 DONE (pairing dialog + packet format)
- TZD-14/20 DONE (Desktop + mcp.json copy используют `apiKey` из пакета)
- Desktop `parsePairing` остаётся совместимым (те же поля JSON)

LAYER: 4 (самый строгий из BE+FE)

PAGES: pairing dialog (header); опц. страница/секция «Десктоп-ключи» в профиле или Admin
PAGE_DOCS: `desktop/docs/PAIRING.md` (обновить); при UI settings — page doc если есть

CONFLICT KEYS:
backend/src/modules/auth/**;
backend/src/modules/desktop/**;
backend/src/app.module.ts;
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/pages/desktop/**;
frontend/src/app/shared/services/pi-desktop-pairing*.ts;
desktop/docs/PAIRING.md;
desktop/docs/MCP.md;
docs/FEATURE-INTEGRATION-CHECKLIST.md;
docs/agent-checklists/TZD-21.md;

---

## Domain preflight / аудит (кратко)

| Сейчас | Почему больно |
|--------|----------------|
| Паринг = **session access JWT** | TTL ~15m; Desktop и Cursor/LMStudio умирают вместе с сессией веба |
| Повторный «Десктоп» | Не «новый ключ», а снимок текущего access; чужие машины с **старым** токеном живут до `exp`, потом все на этом токене → 401 |
| Нет registry | Нельзя: список ключей, отзыв одного, несколько ПК/агентов с разными сроками |
| «Обновил — у другого вылетел» | Частично миф для *разных* копий одного JWT до exp; реально: **один** короткий JWT на всех, кто его скопировал; refresh веба **не** обновляет Desktop автоматически |

| Нужно (канон этого TZ) | |
|--------------------------|--|
| **Desktop pairing key** | Отдельная сущность (не session access); выдаётся явно |
| **Несколько ключей** | N активных на user (лимит, напр. 10); выпуск нового **не** отзывает старые |
| **TTL** | Пресеты: `1d` / `7d` / `30d` / `90d` / `never` (null exp); default **`30d`** |
| **Revoke** | Отзыв по id → этот ключ сразу 401; остальные живы |
| **Packet format** | Без breaking: `{ apiBaseUrl, apiKey, username, expiresAt }` — `apiKey` уже pairing key |

«Безгранично» (`never`): разрешить, но в UI WARN «отзовите вручную при увольнении / утере ПК». Org-wide запрет `never` — out of scope (successor).

---

## ЧТО ДЕЛАТЬ (7 шагов)

### ШАГ 1 — Модель + модуль backend

NEW `backend/src/modules/desktop/` (или `auth/desktop-pairing`):

Schema `DesktopPairingKey` (имя на усмотрение, смысл фиксирован):

- `userId` (ObjectId, index)
- `organizationId` (если multi-tenant как у User)
- `label` (string, optional, default «Desktop» / имя ПК)
- `tokenHash` (sha256 of secret — **не** хранить plaintext)
- `tokenPrefix` (первые 8 символов для UI `kpp_…`)
- `expiresAt` (Date | null)
- `revokedAt` (Date | null)
- `createdAt` / `lastUsedAt` (optional)
- soft constraints: max **10** active (non-revoked, non-expired) per user

Выдача: сгенерировать cryptographically random secret (или JWT с
`typ: 'desktop_pairing'`, `jti`, `sub`, custom `exp`). Рекомендация канона:

**Opaque bearer** `kppd_<random>` + hash в DB — проще revoke без JWT denylist.
Auth middleware: если Bearer выглядит как pairing key → lookup hash; else JWT.

Альтернатива (если меньше кода): JWT с отдельным `jwt.desktopSecret` + таблица
`jti` allowlist/revocations. Выбрать **один** подход в ИСХОДНОЕ и тесты; opaque
предпочтительнее для multi-revoke.

### ШАГ 2 — API

Все под JWT session пользователя (тот, кто жмёт «Десктоп»); RBAC:

- минимум: любой authenticated user для **своих** ключей
- admin может list/revoke чужие — **не** в этом TZ (только self-service)

| Method | Path | Body / result |
|--------|------|----------------|
| `POST` | `/api/desktop/pairing-keys` | `{ ttl: '1d'\|'7d'\|'30d'\|'90d'\|'never', label? }` → **один раз** `{ id, apiKey, expiresAt, label, … }` + pairing packet fields helper |
| `GET` | `/api/desktop/pairing-keys` | список **без** secret: id, label, prefix, expiresAt, revokedAt, createdAt |
| `POST` | `/api/desktop/pairing-keys/:id/revoke` | revoke |

Также удобный агрегат (опционально в том же POST issue):

`POST /api/desktop/pairing` → `{ pairing: { apiBaseUrl, apiKey, username, expiresAt }, keyMeta }`  
чтобы FE не собирал пакет руками. `apiBaseUrl` — из конфига/запроса FE (как сейчас resolve).

Тесты: issue → auth `/auth/me` или лёгкий probe с Bearer key PASS; revoke → 401;
второй issue не инвалидирует первый; expired → 401.

### ШАГ 3 — Подключить auth pipeline

Где сейчас только JwtStrategy: разрешить Desktop pairing key как Bearer для
тех же guards (или DualAuth guard). Ключ наследует **permissions/role**
владельца `userId` на момент запроса (load User).  
`lastUsedAt` обновлять throttled (не каждый request — раз в N минут).

### ШАГ 4 — FE: диалог паринга

Заменить «скопировать session JWT» на:

1. Открыть dialog → показать форму:
   - TTL select (default 30d) + опция «Без срока» с WARN
   - optional label
   - кнопка **«Выпустить ключ»**
2. После POST — показать JSON пакета + Copy (как сейчас) + срок
3. Список существующих ключей в том же dialog (или ссылка «Управление ключами»):
   prefix, label, expires, **Отозвать**
4. Текст: «Новый ключ не отключает старые. Отозванный — сразу недействителен.»
5. Jest: больше не кладёт raw `accessToken` в packet без API mock.

`app-layout` `onDesktopPairing` — только open dialog (данные грузит dialog).

### ШАГ 5 — Docs

- `PAIRING.md`: session JWT больше не источник `apiKey`; multi-key; TTL; revoke
- `MCP.md`: при 401 — проверить revoke/expiry; перевыпустить + снова mcp.json (TZD-20)
- FEATURE checklist §E / auth note

### ШАГ 6 — Desktop совместимость

- Формат пакета **без** breaking changes
- Desktop не обязан уметь refresh pairing key в этом TZ
- Known: после revoke пользователь вставляет новый JSON вручную (как сейчас при expiry)

### ШАГ 7 — Gates + smoke

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- desktop-pairing   # или путь модуля
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern=pairing --no-coverage
```

Live: issue 30d key → Desktop pair → MCP ping; issue second key → first still works;
revoke first → first 401, second OK.

---

## ИЗМЕНЯТЬ

- `backend/src/modules/desktop/**` (NEW) или эквивалент
- auth strategy / module wiring
- `frontend/.../pairing-dialog*` + `app-layout` open flow
- NEW FE service для pairing-keys API
- docs PAIRING.md, MCP.md, checklist

## НЕ ИЗМЕНЯТЬ

- Удлинять глобальный `jwt.expiresIn` session ради Desktop (антипаттерн)
- Автозапись в Cursor/LM Studio mcp.json (TZD-20 clipboard only)
- Device attestation / MDM
- Admin UI «все ключи org» (successor)
- Менять MCP tool surface (TZD-17/18/19)
- Production Gantt / catalog

---

## КРИТЕРИИ ПРИЁМКИ

1. Кнопка «Десктоп» **не** кладёт session access JWT в `apiKey`.
2. Issue с TTL `30d` → `expiresAt` ≈ now+30d; `never` → `expiresAt` null или far-sentinel **документированный** (предпочтительно null + Desktop `parsePairing` допускает null/`never` ISO — **если** меняете контракт, обновить `desktop/src/core/pairing.ts` + тесты).
3. Два активных ключа одного user работают параллельно.
4. Revoke одного → только он 401.
5. List не возвращает полный secret.
6. Docs обновлены; gates PASS; checklist + archive после Cursor/PO PASS.

---

## known_limitation / successors

| ID / тема | |
|-----------|--|
| Org policy max TTL / forbid never | successor |
| Admin revoke any user key | successor |
| Desktop auto-refresh / silent re-pair | successor |
| Push new key into mcp.json clipboard reminder | UX polish with TZD-20 |

---

## Промпт исполнителю

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZD-21.md + checklist docs/agent-checklists/TZD-21.md по _TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active → конфликт auth/desktop/pairing = STOP
5) Team Room claim best-effort

Затем: прочитай docs/AI-AGENT-GUIDE.md + tasks/_backlog/desktop/TZD-21-desktop-pairing-keys-ttl.md
и выполни TZD-21 (отдельные pairing keys, TTL, multi-key, revoke, FE dialog).
Не удлиняй глобальный jwt.expiresIn сессии. Archive после Cursor/PO PASS.
```
