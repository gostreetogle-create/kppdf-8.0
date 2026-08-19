# TZ-PARTY-305: Заказчик — контактное лицо (Person) + Person без обязательной фамилии

PAGES: /counterparties ; /people или Person CRUD
DEP: TZ-PARTY-304

## Intent (PO)

Создал ООО-заказчика — нужно **прикрепить человека** из справочника контактов (выпадающий список). Звонить знаю кому. Фамилия необязательна (имя+телефон); **дубли телефона** запретить.

## Проверено

- `Counterparty.contactPersonId` → Person уже в schema
- UI в `counterparty-full-editor` **нет**
- `Person.lastName` required в DTO — ослабить

## Scope

1. FE Counterparty FullEditor: PiOverflowSelect Person по counterparty (list `/persons?search=`).
2. BE: PATCH counterparty `contactPersonId`; populate в list optional.
3. Person: `lastName` optional; unique index phone (sparse, normalized).
4. People/Person create form: фамилия не required.

## НЕ

- Workers `/people` (другая сущность)
