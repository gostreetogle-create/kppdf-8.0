# Audit: UX-321 rail regression (2026-08-15)

## Вердикт

`TZ-UX-321` закрыта преждевременно: текущий результат не соответствует согласованному визуальному контракту двух прозрачных панелей.

## Что фактически сделано

В `frontend/src/app/layout/app-layout.component.ts` есть только `app-chrome-rail-left`. Обе history-кнопки (`app-nav-back` и `app-nav-forward`) находятся внутри него. Правого rail нет.

Rail объявлен как `position: absolute`, но ближайший `.pi-page-frame` не закреплён как `position: relative`. При этом используется `left: 64px`. В результате браузер может считать координату от viewport/initial containing block, поэтому панель и стрелки оказываются у левого края окна, а не в поле между frame и контентом.

## Почему smoke мог пройти

Проверки closeout подтверждают наличие DOM, ширину и `position: absolute`, но не подтверждают геометрию относительно реального frame. Self-score без `getBoundingClientRect()` не доказывает, что rail стоит на вертикали бренда.

## Канон PO

- `.pi-page-frame` — positioned parent.
- Левый прозрачный rail: `left: 0`, ширина 64px, под header.
- Правый прозрачный rail: `right: 0`, ширина 64px, под header.
- `←` слева, `→` справа.
- У rail нет видимых border/background/shadow.
- `<1680px` оба rail скрыты.
- Фильтр и другие page-tools не смешивать с этим repair; для них отдельный `PiChromeToolsService`/TZ-UX-322.

## Решение

Не переделывать историю и не двигать стрелки новыми пикселями. Исполнить `tasks/TZ-UX-321-fix-rail-anchor-and-right-rail.md`, затем принять только при наличии browser geometry evidence на 1920px и проверки узкого viewport.
