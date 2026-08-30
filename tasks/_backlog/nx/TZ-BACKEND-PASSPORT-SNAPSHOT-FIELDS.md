# TZ-BACKEND-PASSPORT-SNAPSHOT-FIELDS (draft — blocked by discovery)

> **Не брать в работу** до закрытия `TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION`.
> Поля ниже есть в `data/Pasports.xlsx`, но **отсутствуют на live `Product`**.
> Снимок `ProductPassport` существует, но NX preview в этой волне его не читает (no new endpoints).

## Blockers from XLSX → backend

| XLSX (pasports) | Текущий backend | Нужно для live preview |
|-----------------|-----------------|------------------------|
| Паспорт№ | `ProductPassport.passportNumber` | Опционально: `GET /products/:id/passport` read или denorm flag |
| Дата | `ProductPassport.date` | то же |
| Гарантийный Талон | `ProductPassport.warrantyCode` | то же |
| Номер Изделия | `ProductPassport.productCode` | то же |
| Поставщик | `ProductPassport.supplier` | то же |
| Объект (полный адрес) | `ProductPassport.installationSite` vs `Product.installation` | Уточнить канон: одно поле или два |
| Фото (URL превью) | `Product.photoIds` + Photo | Populate URL в product detail или отдельный read |
| Цвет RAL (человекочитаемый) | `Product.ralCode` slug | `GET /color-references` lookup в data-access |

## Не добавлять без PO

- Отдельное поле «изготовленная из» на Product — сегодня **derived** из состава в NX preview.
- Импорт XLSX, print/export, immutable snapshot write UI.

## Acceptance (когда стартует)

- Read API для связки Product ↔ ProductPassport без изменения write-path каталога.
- Populate category name, color label, photo preview URL на `GET /products/:id` **или** documented companion endpoints.
- No schema invention beyond existing `ProductPassport` fields.
