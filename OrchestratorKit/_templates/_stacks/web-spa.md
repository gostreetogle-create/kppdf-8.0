# Stack Template: Web SPA

> Используй для **Angular 17+**, **React 18+**, **Vue 3**, **Svelte 5** SPA проектов.

## Stacks

- **Angular 17+** (standalone components, signals, new control flow `@if`/`@for`) — рекомендую
- **React 18+** (Vite, hooks, TypeScript)
- **Vue 3** (Composition API, Pinia, `<script setup>`)
- **Svelte 5** (runes, signals)

## LAYER по умолчанию

| Файл трогает | LAYER |
|---------------|-------|
| `*.css` / `*.scss` (только стили) | **1** — до 2 параллельно |
| `ui/*.{ts,html,css}` (новый компонент) | **2** — до 2 параллельно |
| `pages/admin/*` (god-component декомпозиция) | **3** — СТРОГО 1 |
| `services/*.service.ts` (новый сервис) | **2** — до 2 параллельно |
| `package.json` / `tsconfig.json` | **4** — СТРОГО 1 (ломает build) |

## CONFLICT KEYS — примеры по типу TZ

```
# TZ-01 (только CSS):
src/styles.css
src/theme.css

# TZ-02 (новый UI компонент):
src/ui/button/button.component.ts
src/ui/button/button.component.html
src/ui/button/button.component.css

# TZ-03 (god-component декомпозиция):
src/pages/admin/admin.component.ts
src/pages/admin/admin.component.html
src/pages/admin/tabs/roles-tab/*

# TZ-04 (новый сервис):
src/services/api.service.ts
src/services/auth.service.ts
```

## ШАГ 2: build / typecheck / test команды

```bash
cd frontend
npm run build              # ng build / vite build / vue-tsc
npm run typecheck          # tsc --noEmit (если есть скрипт)
npm test                   # vitest run
npm run lint               # eslint (если есть)
```

## Частые acceptance criteria (ИЗМЕРИМЫЕ)

1. `npm run build` exit 0 (warnings OK).
2. `npm test` X/Y passed.
3. Страница `/admin/roles` рендерится в браузере (визуально проверяется).
4. Lighthouse Accessibility ≥ 90.
5. `bash OrchestratorKit/verify-status.sh` exit 0.

## Импорты (если пустой проект)

Создай заранее через официальный scaffolder:
```bash
# Angular
ng new my-app --standalone --routing --style=css

# React + Vite
npm create vite@latest my-app -- --template react-ts

# Vue 3
npm create vite@latest my-app -- --template vue-ts

# Svelte 5
npm create vite@latest my-app -- --template svelte-ts
```

## Рекомендуемая структура папок

```
src/
├── app/                ← Angular 17+ standalone
│   ├── pages/
│   │   ├── login/
│   │   └── admin/
│   ├── services/
│   ├── guards/
│   ├── interceptors/
│   └── ui/             ← UI kit (TZ-02)
├── assets/
└── styles.css          ← global tokens (TZ-00)
```

## Чеклист перед ШАГ 0

- [ ] `package.json` существует с правильными `scripts.build` / `scripts.test`
- [ ] `tsconfig.json` strict + `noPropertyAccessFromIndexSignature`
- [ ] CSS-токены в `src/styles.css` (light + dark)
- [ ] `.gitignore` исключает `node_modules/`, `dist/`, `.env`
- [ ] `proxy.conf.json` настроен (если SPA + backend)
