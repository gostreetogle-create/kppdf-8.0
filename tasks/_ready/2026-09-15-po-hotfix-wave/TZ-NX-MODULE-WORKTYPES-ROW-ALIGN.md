# TZ-NX-MODULE-WORKTYPES-ROW-ALIGN: виды работ — одна плотная строка

> **SIZE:** S · **PAGES:** modules (form dialog) · **PAGE_DOCS:** `docs/pages/modules.page.md` (или module-detail)  
> **CONFLICT KEYS:** `frontend-nx/libs/features/src/lib/registry-forms/ui/module-form-dialog.component.ts`; `module-form-dialog.component.spec.ts`  
> **IMPLICIT CONFLICT:** `nx build kppdf-web` (features → app build)

### Preflight / PO
Скрин формы модуля «Виды работ»: select с лейблом «Вид работы» ниже по вертикали, чем «дней / норма / порядок»; кнопки ↑↓× смещены. Нужна **одна горизонтальная строка** входных данных в блоке-рамке; описание Ганта — **вне** row-блока (уже сверху секции — оставить); лейбл «Вид работы» внутри строки — **убрать** (и так ясно; `aria-label` на select сохранить).

## ЧТО ДЕЛАТЬ

1. Row container: `flex items-center gap-2` (или grid с `items-center`), одна линия высоты.
2. Убрать `<span class="eyebrow">Вид работы</span>`; select с `aria-label` / placeholder «— выберите —».
3. Дней / Норма, ч / Порядок: либо короткие labels **в той же baseline** (единый `items-end` **или** все без верхних labels + `aria-label` + узкие `w-*`), главное — **не** ломать вертикаль (не смешивать eyebrow+field с form-field разной высоты).
4. ↑ ↓ × — `items-center` с инпутами, не «провисают».
5. Hint «Длительность Ганта…» + кнопка «+ Добавить» остаются **над** списком rows, не внутри hairline-карточки строки.
6. Spec: row layout smoke / query — нет текста «Вид работы» как eyebrow в row (если был assert — обновить).

## НЕ
- Менять seed days / facade logic
- Deploy
- Order-workspace TZ

## AC
Визуально одна ровная строка на row; без «Вид работы» eyebrow; hint вне row; build LAST PASS.

### Gates
```bash
cd frontend-nx && pnpm exec nx test features --testPathPattern=module-form-dialog --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
```
