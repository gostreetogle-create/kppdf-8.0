# Angular component integrity — design

## Решение

Не выполнять «модернизацию всего Angular» одним diff. Зафиксировать канон
Angular 20 и пройти frontend двумя этапами:

1. два параллельных read-only inventory lane (pages и platform/shared);
2. canonical merge/dedupe findings с назначением непересекающихся batches;
3. максимум два параллельных remediation lane с маленькими пакетами по
   одной странице/домену и characterization
   tests, focused gates и отдельным коммитом.

Новые зависимости, Angular upgrade, zoneless и Signal Forms не входят в работу.

## Граница компонентов

Термины «умный/глупый» заменяем на **container/presentational**:

- page/container связывает route, API-services, permissions и orchestration;
- presentational component получает данные через `input()`, сообщает события через
  `output()`/`model()` и не знает про HTTP, Router или product store;
- shared UI является domain-neutral и никогда не импортирует `pages/**`.

Разбиение не механическое. Размер файла — сигнал для review, но не причина сам по
себе. Extract нужен, когда есть отдельная ответственность, независимое состояние,
повторное использование или отдельный тестируемый interaction. Wrapper без своей
семантики и длинная цепочка forwarding inputs запрещены.

## Канон версии

Проект закреплён на Angular 20.3 / RxJS 7.8 / TypeScript 5.9:

- standalone по умолчанию; `standalone: true` не добавлять;
- `ChangeDetectionStrategy.OnPush` указывать явно (default OnPush относится к
  Angular 22, не к текущему проекту);
- local synchronous UI state — Signals; async composition — RxJS;
- Reactive Forms остаются каноном. Signal Forms не добавлять в Angular 20;
- новые API `input()` / `output()` / `model()` применять в новом/затронутом коде,
  без массовой замены стабильных decorators ради стиля.

## Safety model

- Сначала baseline tests текущего поведения.
- Не смешивать business change и refactor.
- Пакет: одна page boundary или максимум 8 тесно связанных файлов.
- Две lanes допустимы только при exact non-overlapping conflict keys; shared hot
  files и canonical audit имеют одного owner.
- После пакета: tsc, focused Jest, changed-file ESLint, architecture check,
  diff-check; для UI — light/dark/keyboard/browser smoke.
- Любая неоднозначность состояния, формы или autosave → characterization test,
  не догадка.
- Failed gate → исправить пакет или откатить только собственный пакет; следующий
  домен не начинать.

## Deliverables

- `docs/ANGULAR-GUIDE.md` — source of truth.
- `.cursor/rules/angular-frontend.mdc` — короткий file-scoped entrypoint.
- `TZ-FRONTEND-301` — inventory/audit без product changes.
- `TZ-FRONTEND-302` — staged remediation только по подтверждённому inventory.
- Continuous prompt, который останавливается перед deploy.
