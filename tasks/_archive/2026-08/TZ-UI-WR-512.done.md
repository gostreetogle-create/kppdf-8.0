# TZ-UI-WR-512 DONE — hotfix: canRetry binding сломал сборку frontend

```
ARCHIVE_MARKER
task_id: TZ-UI-WR-512
outcome: DONE
closed_at: 2026-08-23T11:25:00+03:00
agent_id: freebuff-roi-523 (Buffy)
workspace: D:\kppdf-8.0
branch: main
```

## Что сделано

Стык волн WR-507 ↔ WR-505/506: WR-507 завёл `[canRetry]="true"` как отдельный
binding, но `ErrorBannerComponent.error` принимает `string | {message, canRetry?} | null`
(расширено WR-505/506) — `NG8002: Can't bind to 'canRetry'` падал сборку в 3 местах.

В каждом из трёх файлов:

```html
- [error]="error()"
- [canRetry]="true"
+ [error]="error() ? { message: error()!, canRetry: true } : null"
```

`(retry)="reload()"` не тронут; `ErrorBannerComponent` API не менялся — только usage.
Правка была внесена на диск (до этого агента/курсором), цикл (build → commit → push →
archive) добит здесь.

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS (0)
- `pnpm exec ng build --configuration=development` PASS — 0 ошибок (template typecheck;
  NG8002 ушёл; 1 warning NG8113 в чужом `pi-nav-dropdown.component.ts`, не связан)
- `pnpm exec eslint` на 3 своих файлах PASS — 0 errors (3 pre-existing warnings OnInit в pages)
- pre-push hook (BE+FE tsc) PASS

## Proof of adoption

- consumer: `/materials`, `/modules`, `/products` — `app-error-banner` на 3 страницах
  (routed production), retry-кнопка по-прежнему видна (`canRetry: true` в объекте)
- test: N/A (usage-only fix; поведение `toBannerError` уже покрыто
  `error-banner.component.spec.ts` WR-505)
- docs: N/A (без изменения поведения, PAGE_DOCS: n/a per TZ)
- migration note: `[canRetry]` как отдельный input НЕ существует — retry включается
  через `{ message, canRetry }` объект в `[error]`; не возвращаться к split-binding
- legacy leftover: нет (3/3 сайта исправлены; других мест с `[canRetry]` нет — grep)
