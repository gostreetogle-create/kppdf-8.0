# KP Workspace — dummy layout (DEPRECATED — Wave 0.1)

> **STATUS 2026-08-23 (TZ-KP-WS-409):** Wave 0 DONE; живой SoT —
> `ProposalWorkspaceShellComponent` (TZ-401) и страница
> [`/proposals/workspace`](../../docs/pages/kp-workspace.page.md).
> Dummy остаётся **только как geometry reference** (CSS-снапшот shell).
> Правки геометрии — в компонент, не сюда.

Статичный каркас Single Workspace (Inventor-style). **Paper & Ink + Lucide.** Без API/store.



## Как открыть



**Основной просмотр:** [`/proposals/demo-workspace`](http://localhost:4200/proposals/demo-workspace) — `frontend/.../demo/proposal-workspace-demo.page.*`

**Offline:** [`preview.html`](preview.html)



Проверьте:

- **Книжная:** слева компактная серая полоса 48px (`app-chrome-rail`), статичная; A4 — центр viewport, max-height без скролла страницы

- ribbon ~32px; переключатель ориентации — сегмент с Lucide-иконками

- **Альбомная:** левый dock скрыт; под ribbon — горизонтальный icon-rail; панель инструментов — одна строка; A4 на всю ширину stage

- Все кнопки — `kp-ws-ribbon-btn` / `kp-ws-rail-btn` (mono uppercase, focus-ring), не browser default



## AI-контракт



Перед Wave 1 (Angular): [`docs/AI-UI-CONTRACT.md`](../../docs/AI-UI-CONTRACT.md).



## Файлы



| Файл | Назначение |

|------|------------|

| `preview.html` | Standalone просмотр с fake AppLayout |

| `kp-workspace-shell.css` | **Reference only** — снапшот стилей из `ProposalWorkspaceShellComponent` (TZ-KP-WS-401). Правки геометрии — в компонент, не сюда |

| `kp-workspace-shell.html` | Разметка shell (фрагмент, reference only) |

| `lucide-icons.svg` | SVG-sprite для фрагмента вне preview |

| `proposal-workspace-shell.dummy.component.ts` | Angular stub (superseded by `workspace/proposal-workspace-shell.component.ts`, TZ-401) |



## Roadmap



Wave 0.1 — layout polish (**DONE** 2026-08-23) · **Wave 1+** → `tasks/WAVE-KP-SINGLE-WORKSPACE.md` (10 TZ: 400–409) · промпт `tasks/PROMPT-FREEBUFF-KP-WORKSPACE-WAVE.md`

**Цель:** одно место для КП — каталог, шаблон, таблицы, тексты, вывод без обязательного ухода в «Документы». См. `docs/audits/2026-08-23-kp-single-workspace-program.md`.


