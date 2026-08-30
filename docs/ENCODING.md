# Кодировка исходников (UTF-8)

Все текстовые файлы репозитория — **UTF-8 без BOM** (см. `frontend-nx/.editorconfig`: `charset = utf-8`).

## Запрещено

- Сохранять `.ts` / `.html` / `.md` через PowerShell `>` / `Out-File` без явного UTF-8 — получится UTF-16 или CP1251 и **mojibake** в UI (`РЎС‚СЂР°РЅРёС†` вместо «Страниц»).
- Вставлять «исправленный» кириллический текст из чата/диффа, если в буфере уже битая перекодировка — сначала проверить файл в редакторе.
- Коммитить строки с типичным mojibake-паттерном (`Р` + кириллица, `вЂ¦` вместо `…`).

## Как писать и править

- Cursor / VS Code / Write tool — UTF-8 по умолчанию.
- Node-скрипты: `fs.readFileSync(path, 'utf8')` + `writeFileSync(..., 'utf8')`.
- Windows one-liner: `[IO.File]::WriteAllText($path, $content, [Text.UTF8Encoding]::new($false))`.

## Быстрая проверка перед PR

```bash
# mojibake в frontend-nx (должно быть пусто)
rg "Р[А-Яа-я]{2,}|вЂ" frontend-nx/apps frontend-nx/libs --glob "*.ts"
```

## Исторические кейсы

- Seed CP1251 → UTF-8: `docs/agent-checklists/TZ-DOC-321.md`
- Builder preview flush (аналог): `frontend/src/app/pages/doc-constructor/builder/builder.page.ts` — TZ-QA-445C

Если русский UI-текст в коде выглядит как «иероглифы» — это **не data bug**, а битый литерал в `.ts`; чинить источник, не CSS.
