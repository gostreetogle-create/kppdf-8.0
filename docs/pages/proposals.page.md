# /proposals — Все КП

**Route:** `/proposals`
**TZ:** SALES-301 list · SALES-302 versions · SALES-303 family API · **SALES-313 DONE** family UI (supersedes 304) · SALES-310 chrome

## Chrome

Тёмный TOC **КП | Договоры | Заказы**; chip **КП** ведёт в `/proposals/create`; жёлтые **Создать КП | Все КП** (активен Все КП на этом журнале).

## Список

- Плоский `GET /quotations`; клиентский поиск/сортировка/page size 10.
- Строки **solo/master** только — `familyRole === 'variant'` скрыты (варианты живут в expand).
- Колонка **Версии** (freeze / история) и отдельная колонка **Семья** (не смешивать).
- «Создать» открывает студию `/proposals/create`; «Редактировать» открывает ту же студию с `?id=<quotationId>`, без form-диалога.
- «Удалить КП» использует soft-delete: после успешного удаления тост «КП удалено», а удалённая строка исключается из списка и обычного GET.
- **S37 — «В заказ»:** на строке со статусом `accepted` кнопка `В заказ` (`proposal-convert-order`) → `POST /quotations/:id/convert-to-order` (`PiQuotationsService.convertToOrder`) → ответ `{ orderId }` → переход на `/orders/:orderId`. draft/sent/converted — кнопки нет; при 400 — тост, остаёмся в списке. Не создаёт stub-proposal и не трогает family API.
- **NX S42 — семья в плоском списке:** NX-список (`frontend-nx` `/proposals`) скрывает строки `familyRole === 'variant'` (варианты живут в expand «Семья», канон 313); на строке `master` — badge `Семья` (`proposal-family-badge`), solo — без badge.
- **NX S43 — раскрытие семьи:** на любой строке списка кнопка `Семья` (`proposal-family-expand`) → `GET /quotations/:id/family` (`PiQuotationsService.getFamily`); панель показывает варианты: имя организации (lazy `PiOrganizationsService.list({limit:100})`, кэш на компонент), номер КП, `orgMarkupPercent` % и статус; solo без вариантов — «Нет вариантов фирм». Loading/error (banner c «Повторить») состояния; stale-ignore если панель закрыли во время запроса; семья кэшируется по строке (reopen без повторного GET).
- **NX S44 — «Несколько фирм» → варианты:** на строке solo/master кнопка «Несколько фирм» (`proposal-attach-orgs`) → dialog `ProposalAttachOrgsDialogComponent` (multi-select Организации из `PiOrganizationsService.list({limit:100})` с исключением org уже добавленных вариантов; confirm disabled при 0 выбранных) → `POST /quotations/:id/family/attach-organizations` (`PiQuotationsService.attachOrganizations`) c `items[{ organizationId, orgMarkupPercent? }]`; успех → кэш семьи обновляется ответом + тост «Варианты добавлены»; 400/404 → тост «Не удалось добавить фирмы», список не меняется; закрытие dialog без выбора — не POST.
- **NX S45 — синхронизация состава с мастером:** в раскрытой семье master-КП (при наличии вариантов) ссылка «Синхронизировать состав с мастером» (`proposal-family-sync`) → `AlertDialogComponent` confirm (RU copy: состав вариантов перезапишется) → `POST /quotations/:id/family/sync-from-master` (`PiQuotationsService.syncFromMaster`); успех → кэш семьи обновляется ответом + тост «Состав синхронизирован»; cancel → не POST; ошибка → тост «Не удалось синхронизировать состав», кэш не меняется. Для solo/без вариантов CTA нет.
- **NX S46 — вариант в студии:** в раскрытой семье на каждой строке variant кнопка «В студии» (`proposal-member-open-studio`) → открывает студию для варианта: если есть студийный документ, привязанный к варианту (`studioDocumentId`/`linkedQuotationId`/`context.quotationId`) — `/studio/:docId`; иначе `/studio?quotationId=<variantId>` (именно id варианта, не master). Роутинг через общий helper `openQuotationInStudio`, общий для строк списка и вариантов.
- **NX S47 — «В заказ» только master/solo:** convert CTA рендерится при `status === 'accepted'` и `familyRole !== 'variant'` (плюс early-return в `convertToOrder`); UI-пути конвертации варианта нет — варианты скрыты из плоского списка (S42), в панели семьи convert CTA отсутствует.
- Статусы в UI совпадают со студией Create КП: `draft` — «Черновик», `sent` — «Отправлено», `accepted` — «Принято», `rejected` — «Отклонено», `converted` — «В заказе», `cancelled` — «Отменено» (TZ-SALES-350).
- Пустой журнал говорит «В журнале пока нет КП» и даёт явную кнопку «Создать КП», ведущую в `/proposals/create`; при поиске без результатов показывается «По вашему запросу КП не найдено».
- «Копировать» вызывает duplicate API и открывает новый draft в студии Создать КП.

## Семья (313 + NX S40–S48)

Канон: один состав (master) раскатывается на наши `Organization`. BE: SALES-303. NX UI: WAVE-NX-KP-FAMILY.

| Действие | Где | API |
|----------|-----|-----|
| Список без вариантов | плоский журнал | variants скрыты (`familyRole === 'variant'`) |
| Expand | CTA «Семья» | `GET /quotations/:id/family` |
| Несколько фирм | solo/master | `POST …/family/attach-organizations` |
| Синхронизировать | master + есть variants, confirm | `POST …/family/sync-from-master` |
| Вариант в студии | строка variant | `studioDocumentId` или `?quotationId=<variantId>` |
| В заказ | только accepted master/solo | `POST …/convert-to-order`; variant → нет CTA (BE 400) |

Organization ≠ Counterparty. Markup % — поле UI, не живой пересчёт totals на FE.

## Не здесь

Печать (320), schema rewrite / convert variant, экран Создать КП (312+), ModuleMaterials, deploy.
