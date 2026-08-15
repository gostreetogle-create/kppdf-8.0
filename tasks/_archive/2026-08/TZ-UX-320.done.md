# TZ-UX-320 DONE — ← → из края окна в поля у колонки контента

```
ARCHIVE_MARKER
task: TZ-UX-320
outcome: DONE
closed_at: 2026-08-15T09:10:00Z
closed_by: Buffy (kppdf-8.0)
workspace: D:\kppdf-8.0
implementation_sha: 3d5911d143e4428e4a1bcf656216fcfa011bd8b3
source_branch_sha: dc424c4515c6e54e503e78394bac2eed6b597684
landed_via: cherry-pick onto origin/main (feature/land-TZ-UX-320)
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-UX-320.md)
  - frontend tsc: PASS
  - app-layout Jest: PASS (12/12; новый spec позиции 1/1)
  - eslint changed: PASS
  - architecture:check: PASS (937 files; baseline 6)
  - diff-check: PASS
  - browser smoke >=1680 light/dark: PASS (16/16, Chrome 1920x1080; %TEMP%/ux320-1920-theme-a|b.png)
  - checklist: DONE
  - progress.md: UPDATED
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/layout/app-layout.component.ts
  - frontend/src/app/layout/app-layout.component.spec.ts
  - docs/pages/page-chrome.md
  - docs/audits/2026-08-12-nav-return-gutters-canon.md
  - docs/pages/PAGE-TZ-INDEX.md
  - docs/agent-checklists/TZ-UX-320.md
```

## Delivered

- `.app-nav-gutter--back` / `--forward`: `left/right: 14px` → `64px` — кнопки стоят в вертикальных
  полях слева/справа от max-width колонки (`pi-page-frame` 1400px), на линии бокового отступа шапки
  (padding `pi-edge-bleed` на ≥1024px = 64px), не у края окна.
- Порог ≥1680px, disabled / aria / data-test, `AppHistoryStore` — без изменений.
- Spec: class-контракт + source style-контракт (64px, нет 14px, media ≥1680 inline-flex); click/disabled тесты сохранены.
- Docs: page-chrome.md (позиция 64px, поле ≥140px), audit nav-return-gutters-canon (+320), PAGE-TZ-INDEX.
- Browser smoke 1920×1080 light/dark: left=64 / right=64, зазор до колонки 154.5/165.5px, нет пересечения
  с таблицей материалов; на 1200px — скрыты.
- Deploy НЕ.
