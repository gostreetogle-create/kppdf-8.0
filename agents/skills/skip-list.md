# agents/skills/skip-list.md — DO-NOT-INSTALL skills (~25)

> **Контекст:** стек проекта = **Angular 20 + NestJS 10 + MongoDB + JWT/RBAC + Tailwind v4 + Lucide**.
> Любой skill из Freebuff-каталога, привязанный к чужому стеку, **скипаем** —
> он только зашумит контекст и заставит агента выдавать архитектурно чуждые советы.

## Группа 1: React / Next.js / Vercel (×4) — НЕ Angular

| Skill | Причина скипа | Альтернатива |
|-------|---------------|--------------|
| `vercel-react-best-practices` | React, у нас Angular 20 standalone | `angular-best-practices` (нет — пишем сами) |
| `vercel-composition-patterns` | HOC / render props — React, не Angular | `typescript-advanced-types` (Tier 2) |
| `vercel-react-view-transitions` | React 19 feature, нет в Angular | own implementation |
| `vercel-react-native-skills` | React Native — мобилка, не web | N/A |

## Группа 2: Vercel / Next.js deploy (×2)

| Skill | Причина скипа | Альтернатива |
|-------|---------------|--------------|
| `nextjs-app-router-patterns` | Нет Next.js, деплой через `start.mjs` | own `start.mjs` (TZ-42) |
| `deploy-to-vercel` | Нет Vercel, деплой через Synology (см. `deploy/synology`) | own deploy-scripts |

## Группа 3: Azure / Cloudflare (×6)

| Skill | Причина скипа | Альтернатива |
|-------|---------------|--------------|
| `azure-ai` | Нет Azure AI | own |
| `azure-deploy` | Нет Azure | own Synology deploy |
| `azure-diagnostics` | Нет Azure | own pino + nestjs-pino (TZ-04) |
| `azure-observability` | Нет Azure | own logging |
| `wrangler` | Cloudflare Workers, у нас Node.js | N/A |
| `setup-pre-commit` | Уже есть husky + lint-staged (см. `package.json`) | already configured |

## Группа 4: Tailwind / shadcn / image-to-code (×3)

| Skill | Причина скипа | Альтернатива |
|-------|---------------|--------------|
| `tailwind-design-system` | У нас Tailwind v4 + свой Paper & Ink design system, не «генерик tailwind» | `docs/design-spec.md` |
| `shadcn-ui` | shadcn — React, у нас Angular Material MD3 + Pi-примитивы | `frontend/src/app/shared/ui/` |
| `image-to-code` | У нас нет v0-style gen — Angular генерится вручную | N/A |

## Группа 5: Python / Go / Rust (×5)

| Skill | Причина скипа | Альтернатива |
|-------|---------------|--------------|
| `python-performance-optimization` | Нет Python в backend (только Node.js) | N/A |
| `python-testing-patterns` | Нет Python | N/A |
| `golang-code-style` | Нет Go | N/A |
| `golang-testing` | Нет Go | N/A |
| `rust-async-patterns` | Нет Rust | N/A |

## Группа 6: Postgres / Firebase / Prisma (×4)

| Skill | Причина скипа | Альтернатива |
|-------|---------------|--------------|
| `supabase-postgres-best-practices` | БД — Mongo + Mongoose, не Postgres | `mongoose-best-practices` (own) |
| `neon-postgres` | Postgres, не наш стек | N/A |
| `firebase-security-rules-auditor` | Firebase, не наш стек | own RBAC (TZ-04) |
| `prisma-database-setup` | Prisma, мы используем Mongoose | N/A |

## Группа 7: Auth / Payments (×2)

| Skill | Причина скипа | Альтернатива |
|-------|---------------|--------------|
| `stripe-best-practices` | Нет Stripe, своя биллинг-логика через Currency = RUB | own |
| `better-auth-best-practices` | Свой JWT/RBAC (TZ-91), не внешний SaaS | own |

## Группа 8: Медиа / Дизайн / Office (×6)

| Skill | Причина скипа | Альтернатива |
|-------|---------------|--------------|
| `remotion-best-practices` | Remotion — React-based video | N/A |
| `canvas-design` | Canvas 2D — не наш use-case | N/A |
| `excalidraw-diagram-generator` | Не используем для prod-документов | N/A |
| `pptx` | Нет PPTX генерации | N/A |
| `docx` | Нет DOCX экспорта (только PDF — TZ-236) | own PDF |
| `xlsx` | Нет XLSX экспорта | own |

---

## Сводка

| Группа | Скипнуто |
|--------|----------|
| React/Next/Vercel | 4 |
| Vercel/Next deploy | 2 |
| Azure/Cloudflare | 6 |
| Tailwind/shadcn/image-to-code | 3 |
| Python/Go/Rust | 5 |
| Postgres/Firebase/Prisma | 4 |
| Auth/Payments | 2 |
| Медиа/Дизайн/Office | 6 |
| **Итого** | **32** |

> Если Freebuff-каталог добавит новые skill-ы — re-run TZ-233 (Evidence Table)
> и обновить оба файла. Это **living document**, не одноразовый.
