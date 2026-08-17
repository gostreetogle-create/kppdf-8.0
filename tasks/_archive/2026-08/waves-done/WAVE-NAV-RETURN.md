# WAVE-NAV-RETURN — deep-link edit + возврат + системные ←→

**Канон:** `docs/audits/2026-08-12-nav-return-gutters-canon.md`  
**Порядок: 316 → 317.** Deploy только по PO.

---

## TZ-UX-316 — «Редактировать шаблон» → builder + возврат в Create КП

**LAYER:** 2–3  
**CONFLICT KEYS:**

```text
frontend/src/app/pages/commercial/proposals/proposal-create-template-picker.component.ts
frontend/src/app/pages/commercial/proposals/proposal-create.page.ts
frontend/src/app/pages/doc-constructor/builder/builder.page.ts
frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts
frontend/src/app/shared/navigation/catalog-return.util.ts
docs/pages/proposals-create.page.md
docs/pages/builder.page.md
docs/pages/page-chrome.md
```

**ЧТО ДЕЛАТЬ**

1. `openBuilder()` (и любой аналог из Create):  
   `navigate(['/doc-constructor/builder', id], { queryParams: { returnUrl: '/proposals/create' } })`  
   (или encode текущего url create с query id). **Не** `/templates?templateId=`.
2. Builder кнопка «← …»:  
   - если есть `returnUrl` (same-origin path) → туда;  
   - иначе `CatalogReturnStore.navigateBackOr('/doc-constructor/templates')`;  
   - label: «← К созданию КП» / «← Назад» / «← Шаблоны» по контексту.
3. После успешного save в builder **не** обязателен auto-redirect (можно остаться править); возврат — явной кнопкой назад. Опционально: если пришли с `returnUrl` и PO позже попросит auto — не в этой TZ.
4. Jest: picker navigate на builder/:id + returnUrl; builder back чтит returnUrl.
5. Обновить page.md / page-chrome: глобальный history — в 317; этот TZ только deep-link+return.

**AC:** из Create «Редактировать шаблон» открывает canvas этого id; «назад» возвращает в Create; список templates не мелькает.

---

## TZ-UX-317 — системные ← → в полях app shell

**LAYER:** 3 (layout)  
**CONFLICT KEYS:**

```text
frontend/src/app/layout/app-layout.component.ts
frontend/src/app/layout/app-layout.component.spec.ts (создать/дополнить)
frontend/src/app/shared/navigation/catalog-return.util.ts
frontend/src/app/shared/navigation/app-history.store.ts (new, или расширение CatalogReturnStore)
docs/pages/page-chrome.md
docs/audits/2026-08-12-nav-return-gutters-canon.md
```

**ЧТО ДЕЛАТЬ**

1. Store истории SPA: stack или previous/next на базе Router events (не ломать CatalogReturnStore API — расширить или обернуть).
2. В `app-layout`: фиксированные кнопки **←** / **→** в **левом** (и при необходимости правом) gutter вне max-width контента — Paper & Ink, micro chrome ≥11px, `data-test="app-nav-back"|"app-nav-forward"`.
3. ← = history back если можно, иначе disabled (не прыгать на чужой fallback молча с глобальной кнопки).  
   → = history forward если браузер/стек позволяет, иначе disabled.
4. Не перекрывать Create КП studio rails и builder palette — z-index/position в gutter; на `<md` аккуратно (можно только ← или спрятать).
5. Убрать из page-chrome запрет «глобальных ←→ нет» — заменить каноном gutters.
6. Spec + visual: кнопки видны на `/doc-constructor/templates` в полях как на скрине PO.

**AC:** на широком экране ←→ в полях; back после ухода Create→builder работает; forward после back; Create studio A4 не сдвинут.

**НЕ:** куча контекстных кнопок в gutter v1; менять TOC/chips; deploy.

---

## Out of scope волны

Авто-redirect после каждого save · browser native только без UI · mobile redesign · 320 print family.
