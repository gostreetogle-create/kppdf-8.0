# TZ-NX-SHELL: Dev-кнопка «UI Kit» в nx shell

**РОЛЬ:** Executor (Freebuff / Claude)  
**DEP:** F4 kit shell · F3 DONE  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/layout/kit-layout.component.ts`

**PAGES:** `/kit/*` (nav only)  
**PAGE_DOCS:** N/A

## ЧТО ДЕЛАТЬ

1. В `kit-layout.component.ts` (header tools) — кнопка/link **«UI Kit»** → `/kit/overview` (видна всегда в dev).
2. Флаг `environment.showKitNav` (default `true` в development, `false` в production build) — скрывает кнопку на prod без удаления routes.
3. Не менять default redirect `/` → `/kit/overview` (пока нет главной ERP-страницы в nx).
4. RU label, Pi button/link из `@kppdf/ui/*`.

## AC

- [ ] dev: кнопка видна на `/login` и `/kit/*`
- [ ] production config: кнопка скрыта
- [ ] `nx build kppdf-web` PASS
- [ ] legacy `frontend/**` 0 diff
