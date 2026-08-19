# Аудит ПДн в репозитории kppdf — 2026-08-18

> Сверка с Instagram-рисками и `COMPLIANCE-RULES.md`.  
> Prod SHA на момент аудита: `7cd78b46`. **Не юридическая консультация.**

## Резюме

| Уровень | Количество | Смысл |
|---------|------------|-------|
| 🔴 Высокий (организация + продукт) | 4 | Нет политики ПДн, нет пакета оператора, нет runbook утечки, чувствительные поля без retention |
| 🟡 Средний (продукт/ops) | 5 | Публичный `/enroll` без privacy-link, audit PII, API сетево открыт, passport в schema |
| 🟢 Низкий / OK | 6 | Нет GA, нет рассылок, register OFF, Mongo РФ, Sentry off by default |

**Вывод:** kppdf **не** похож на «лендинг с формой за вечер», но **уже оператор ПДн** как ERP. Instagram-штрафы **применимы частично** (документы, уведомление РКН, утечки, трансгран), **не применимы** там, где у нас нет B2C-маркетинга.

---

## 🔴 Высокий риск

### H1. Нет опубликованной политики обработки ПДн

- **Где:** нет `/legal/privacy`, нет `docs/legal/privacy-policy.md` для публикации.
- **Пост:** «10–60 тыс. за отсутствие политики» — **близко** к ч. 3 ст. 13.11 (уточняет юрист).
- **Решение:** TZ-COMP-401 — статическая страница + ссылки с `/login`, `/enroll`.
- **Кто:** PO + юрист (текст); executor (страница + роут).

### H2. Нет подтверждённого уведомления Роскомнадзора

- **Где:** вне репозитория (организационный процесс).
- **Факт:** система обрабатывает Worker, Person, User, Counterparty, cookies, audit.
- **Пост:** 100–300 тыс. — **соответствует** ч. 10 ст. 13.11 (2025).
- **Решение:** PO подаёт уведомление через [pd.rkn.gov.ru](https://pd.rkn.gov.ru) или с помощью юриста; в репо — чеклист в `docs/compliance/OPERATOR-CHECKLIST.md` (COMP-401).

### H3. Нет процедуры реагирования на утечку (24 ч / 72 ч)

- **Где:** `AuditLog` пишет `userName`, `ipAddress`; нет `docs/ops/INCIDENT-PDN.md`.
- **Пост:** 1–3 млн за неуведомление — **верно** (ч. 11 ст. 13.11).
- **Решение:** ops-док + контакт ответственного (COMP-401 § ops).

### H4. Retention ПДn не зафиксирован

- **Где:** `docs/data-model-audit.md` L706 «Audit log retention — GDPR / 152-ФЗ»; TTL нет в коде.
- **Риск:** бессрочное хранение audit + устаревшие контакты.
- **Решение:** successor TZ-COMP-402 (retention job + политика).

---

## 🟡 Средний риск

### M1. `/enroll` — публичная форма без privacy-notice

```12:16:frontend/src/app/pages/enroll/enroll.page.ts
 * Получатель вводит РОВНО одно значение — имя компьютера. Никаких ФИО /
 * email / логина / пароля / ролей / токенов.
```

- Имя компьютера может косвенно идентифицировать человека («Офис Марии»).
- **Нет** ссылки на политику, **нет** текста оператора/цели.
- **Решение:** COMP-401 footer на enroll.

### M2. `/login` — disclaimer не заменяет политику

```52:60:frontend/src/app/pages/login/login.page.ts
        <aside
          class="text-sm text-muted-foreground border-l-2 border-sunrise-warm pl-3 mb-8"
          data-test="personal-project-notice"
        >
          <h2 class="font-medium text-ink mb-1">Личный проект для обучения и тестирования</h2>
          <p>
            KPPDF — индивидуальный проект ...
```

- Уже отмечено в `docs/ops/home-host-access.md` §1: текст ≠ compliance.
- **Решение:** добавить ссылку «Политика ПДн».

### M3. Публичная регистрация отключена — ✅

```45:50:backend/src/modules/auth/auth.controller.ts
  @Post('register')
  @ApiOperation({ summary: 'Public register disabled (TZ-AUTH-308) - use device invite' })
  register(): never {
```

- Instagram-сценарий «форма регистрации для всех» **закрыт**.

### M4. Sentry — трансгран только если включить

- `deploy/synology/config.env.example`: `SENTRY_DSN=` пустой.
- `frontend/src/main.ts`, `backend/src/main.ts` — init только при DSN.
- **Риск:** stack traces могут содержать PII; DSN → US.
- **Решение:** держать пустым; правило в `COMPLIANCE-RULES.md` §6.

### M5. Паспортные поля в Organization schema

- `backend/src/modules/organization/organization.schema.ts` — passportSeries, passportNumber, …
- **Риск:** повышенная категория ПДn; нужны усиленные меры (доступ, шифрование at-rest — оценка юриста).
- **Решение:** не расширять без COMP-review; UI — только role-gated (проверить ACL в executor audit).

### M6. API `/api/*` сетево достижим без device cookie

- Документировано в `home-host-access.md` §4.1: UI закрыт, API — JWT.
- **Риск:** не 152-FZ напрямую, но повышает вероятность **утечки** (ч. 12–14 13.11).
- **Решение:** ops (rate limit есть); VPN-only — по желанию PO.

---

## 🟢 Низкий риск / соответствует

| Проверка | Статус | Evidence |
|----------|--------|----------|
| Google Analytics / пиксели | **Нет** | grep по FE — пусто |
| Email/SMS маркетинг | **Нет** | нет nodemailer/marketing модулей |
| OAuth Google/VK на login | **Нет** | только device + password |
| Google Sheets в prod | **Отложено** | PO отказ; audit 2026-08-16 |
| Primary DB в РФ | **Да** | `KPPDF_DATA_DIR=/var/lib/kppdf80` на 192.168.1.103 |
| robots noindex | **Да** | `frontend/src/index.html` |
| Согласие «accept all» | **Нет** на публичных формах | enroll — только submit |
| Публикация отзывов клиентов | **Нет** | нет public reviews |

---

## Матрица «пункт Instagram → kppdf»

| Пункт поста | Статус в kppdf |
|-------------|----------------|
| Не уведомили РКН | ⚠️ **Не проверено** — вне репо |
| Обработка не для той цели / SMS-спам | ✅ **Нет** рассылок; не использовать контакты CRM для рекламы |
| Нет политики на сайте | ❌ **Gap** H1 |
| Согласие в пользовательском соглашении | ✅ **Нет** такого UI (но политики тоже нет) |
| Рекламные кабинеты до согласия | ✅ **Нет** трекеров |
| Трансгран (GA, DB EU) | ⚠️ **Sentry** если включат; Mongo **RF** |
| Публикация ФИО/фото без согласия | ⚠️ KP/PDF могут содержать контакты клиентов — **внутренний** документ; публичная публикация — **нет** |
| Рекламная рассылка | ✅ **Нет** |
| Не сообщили об утечке | ⚠️ **Нет runbook** H3 |

---

## Рекомендуемый порядок работ

1. **PO + юрист (вне кода):** уведомление РКН, оператор, основания, договоры с контрагентами/сотрудниками.
2. **TZ-COMP-401 (executor):** `/legal/privacy`, ссылки, `INCIDENT-PDN.md`, `OPERATOR-CHECKLIST.md`.
3. **TZ-COMP-402 (backlog):** retention audit logs, минимизация PII в Sentry если ever enabled.
4. **Любая новая фича** с email/SMS/OAuth/AI → тег `COMPLIANCE` в TZ.

---

## Changelog (для агентов)

При добавлении foreign SaaS или полей ПДn — дописать строку сюда:

| Дата | Изменение | Compliance |
|------|-----------|------------|
| — | — | — |
