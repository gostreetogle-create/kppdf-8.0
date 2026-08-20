# SUPPLY smoke — реальный стендовый smoke/e2e раздела «Снабжение»

> Покрывает оставшиеся 5 баллов аудита 2026-08-20: авторизация + Mongo +
> склад + upload-хранилище. API-часть автоматизирована, браузерная — руками PO.

## Автоматический API smoke (реальный стенд)

Требуется запущенный backend (порт из `.env`, по умолчанию 3000) + Mongo
(локальный `docker compose up mongo` или стенд) + credentials в `.env`.

```bash
node scripts/smoke/supply-smoke.mjs            # localhost:3000, user из .env
node scripts/smoke/supply-smoke.mjs https://kppdf.example.ru  # прод-стенд
```

Скрипт выполняет и удаляет за собой всё созданное:

- **auth** — login (admin), 401 без токена, Bearer-доступ;
- **mongo** — `/api/health` (mongo up) + round-trip реальных ObjectId после
  записи (материал, storage-item, отгрузка);
- **склад** — warehouse inventory, storage-item материала и изделия, список;
- **быстрый заказ** — пустой draft, PATCH с автозаполнением title/артикула из
  материала, «Заказано» → spawn `SupplyTask` в реестре (идемпотентно,
  повторный клик не создаёт дубль);
- **отгрузка** — создание из заказа, фильтр по `orderId`, dispatch → in_transit
  (транзакция Z-001);
- **upload-хранилище** — multipart → файл реально лежит в `backend/uploads`,
  чтение по id, DELETE 204 + файл удалён с диска.

Ожидаемый результат: `23 PASS · 0 FAIL` (флаки-допустимы только WARN по
dispatch, если на стенде нет остатков/резервов).

## Автоматизация (без ручного прогона)

- **CI**: `.github/workflows/supply-smoke.yml` — на push/PR по контуру снабжения
  поднимает docker-стенд (Mongo 7 + replica set), запускает backend и гоняет
  полный smoke + focused Jest. Это гарантированная точка отлова регрессий.
- **Pre-commit**: `.husky/pre-commit` → `scripts/smoke/supply-gate.mjs` — при
  затронутых файлах контура бежит быстрый focused Jest (всегда) и полный smoke
  (если локальный стенд `:3000` поднят); если стенда нет — не блокирует,
  полный прогон остаётся за CI.
- Локально: `pnpm smoke:supply` (полный smoke), `pnpm gate:supply` (гейт,
  `--force` — независимо от diff).

## Браузерный smoke (PO, после deploy/VPN)

- [ ] Логин admin → рабочий стол, без ошибок консоли
- [ ] `/supply` — быстрый заказ открывается; новая строка → выбор материала из
      каталога → цвет из `Material.colors` → «Заказано»
- [ ] F5 — строка сохранилась (Mongo round-trip)
- [ ] `/supply?view=registry` — задача появилась в реестре (status ordered),
      повторное «Заказано» не дублирует
- [ ] `/shipping` — отгрузка из заказа, dispatch, документы
- [ ] Фото материала: загрузка файла, превью, сохранение; отмена модалки
      удаляет незагруженное фото (Q6)
- [ ] Dark/light — обе темы читаемы

## История

- 2026-08-20 (локальный стенд): первый проход — **23/23 PASS**. Скрипт
  нашёл и помог воспроизвести баг storage-item (partial unique index
  `$exists:true` ловил material-позиции в product-индексе; `remove()` был
  no-op) — исправлено в `storage-item.schema.ts`/`storage-item.service.ts`.
- 2026-08-20 (прод `https://kppdf-crm.ru`, креды из `deploy/synology/config.env`):
  прогон выполнен — auth PASS (пароль актуален), health up; склад/заказ/изделие/
  отгрузка (вкл. dispatch → in_transit) и фото-upload на проде работают.
  **14 PASS · 5 FAIL**, все FAIL объяснимы:
  * `/api/supply-requests` → **404**, `Material.colors` → **400** — прод-стенд ещё на
    коде ДО волны снабжения (нет модуля supply-requests и DTO-фикса цветов) → нужен
    warm deploy волны (коммит `252f6106`).
  * фото: дисковая проверка неприменима к удалённому стенду (uploads в volume
    сервера) — в скрипте это теперь WARN; на проде файл подтверждён через API
    (upload 201 + GET 200 + DELETE 204).
  Все созданные скриптом записи удалены; реальные данные не тронуты (склад и
  контрагент переиспользованы); счётчик отгрузок прод сдвинут на 1
  (`SHP-2026-001`).
