# TZD-57: диалог «Подключить десктоп» — кнопка скачивания и версия

PAGES: (диалог из шапки)  
PAGE_DOCS: —

**РОЛЬ:** frontend Freebuff (можно параллельно desk-волне — другой файл)  
**ЗАВИСИМОСТИ:** TZD-40/46 compat + download URL уже есть  
**CONFLICT KEYS:** `frontend/src/app/pages/desktop/pairing-dialog.component.ts`; `pairing-dialog.component.spec.ts`

---

## PO (простыми словами)

1. **«Скачать приложение»** — нормальная **кнопка**, не мелкая ссылка внизу.
2. На кнопке или рядом — **версия**, которую качаешь: `v0.5.6` (и по возможности дата сборки).
3. Кнопку **поднять вверх** — в одну строку с «Выпустить ключ»: ключи **слева**, скачать **справа**.
4. Внизу диалога — только «Закрыть» (или пустой footer).

---

## ИСХОДНОЕ

Файл: `pairing-dialog.component.ts`  
Сейчас: «Выпустить ключ» в body; «Скачать» + версия мелким текстом в **footer** слева.

Данные версии: `GET /desktop/compat` → `recommendedDesktopVersion`, `downloadUrl` (часто `…-v0.5.6.zip`).

---

## ЧТО ДЕЛАТЬ

1. **Toolbar под формой TTL** (одна строка `flex justify-between`):
   - Слева: «Выпустить ключ» + «Скопировать» (как сейчас).
   - Справа: `app-pi-button` **«Скачать Desktop v{version}»** — version из compat.recommended или parse из downloadUrl filename.

2. **Подпись версии:** второй строкой мелко: `Актуальная сборка · мин. v{X}` или `от {дата}` если есть:
   - Prefer: parse `vSemver` из `downloadUrl`;
   - Дата: опционально `compat.serverBuildId` если похоже на дату, иначе только semver (не выдумывать дату).

3. **Footer:** убрать дубль download; оставить «Закрыть» (outline ok).

4. **Disabled:** если нет downloadUrl — кнопка disabled + RU «Установщик скоро будет на сервере».

5. **Tests:** обновить spec — download button в верхней панели, label содержит `v0.5.1` (mock compat).

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] Кнопка скачивания **напротив** «Выпустить ключ», не внизу
- [ ] На кнопке виден номер версии (`v0.5.x`)
- [ ] `app-pi-button`, не голый `pi-btn-outline` в footer
- [ ] jest pairing-dialog PASS; tsc PASS

**Не блокирует** desk wave. Можно взять отдельным Freebuff-чатом.
