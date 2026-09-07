# Dark Control Interface — Design Specification

Используй этот документ как визуальный контракт при создании сайта. Он описывает стиль, композицию, CSS-поверхности, типографику, анимации и JS-интерактив. Сохраняй систему целиком: не заменяй её обычным тёмным SaaS-шаблоном.

## 1. Визуальная идея

Стиль — тёмный цифровой пульт управления с эстетикой инженерной схемы.

Ключевые признаки:

- почти чёрный холодный фон;
- тонкая чертёжная сетка;
- полупрозрачные панели с внутренними бликами;
- ледяные линии данных;
- один насыщенный фиолетовый акцент;
- крупная строгая типографика;
- схемы из узлов, маршрутов, статусов и сигналов;
- спокойная технологичность без кислотного неона;
- движение показывает прохождение данных, смену состояния или получение результата.

Общее ощущение: точность, глубина, контроль, сложная система, собранная в понятный интерфейс.

## 2. Цветовые токены

```css
:root {
  color-scheme: dark;

  --canvas: #05060f;
  --canvas-soft: #090c18;

  --surface: rgba(186, 214, 247, 0.028);
  --surface-strong: rgba(10, 14, 28, 0.96);
  --surface-deep: rgba(5, 6, 15, 0.96);

  --line: rgba(186, 215, 247, 0.14);
  --line-soft: rgba(186, 215, 247, 0.075);
  --line-bright: rgba(199, 221, 255, 0.34);

  --text-strong: #f4f7fc;
  --text: #d5e5f8;
  --text-soft: #c3cde0;
  --muted: #a3aec3;
  --muted-dark: #758097;

  --violet: #7351ff;
  --violet-bright: #8d72ff;
  --violet-soft: rgba(115, 81, 255, 0.18);

  --ice: #a9cfff;
  --ice-soft: rgba(169, 209, 255, 0.14);

  --ok: #7ad99a;
  --ok-soft: rgba(122, 217, 154, 0.13);
  --warn: #e5bc69;
  --warn-soft: rgba(229, 188, 105, 0.12);
  --danger: #f28d9c;
  --danger-soft: rgba(242, 141, 156, 0.12);
}
```

### Правила цвета

- `--canvas` занимает основную площадь страницы.
- `--surface-*` создают глубину, но не выглядят как серые карточки.
- `--violet` используется для главного CTA и текущего выбора.
- `--ice` обозначает данные, маршруты, связи и холодное свечение.
- `--ok`, `--warn`, `--danger` используются только как семантические состояния.
- Не заливать десятки элементов фиолетовым.
- Не использовать чистый белый для всего текста.
- Не добавлять яркий cyan, magenta или кислотный green без функциональной причины.

## 3. Типографика

Основной шрифт — **Onest Variable**, локальные `woff2`, диапазон весов `100–900`.

```css
@font-face {
  font-family: "Onest";
  src: url("./fonts/onest-cyrillic.woff2") format("woff2");
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}

@font-face {
  font-family: "Onest";
  src: url("./fonts/onest-latin.woff2") format("woff2");
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}

:root {
  --font-body: "Onest", "Segoe UI Variable Text", "Segoe UI", Arial, sans-serif;
  --font-display: "Onest", "Segoe UI Variable Text", "Segoe UI", Arial, sans-serif;
  --font-mono: "Onest", "Segoe UI Variable Text", "Segoe UI", Arial, sans-serif;
}
```

Технические метки также набираются Onest. Отдельный моноширинный шрифт не нужен: технический характер создаётся размером, uppercase и увеличенным tracking.

### Иерархия

```css
body {
  color: var(--text-soft);
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.62;
  letter-spacing: -0.012em;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

h1 {
  color: var(--text-strong);
  font-size: clamp(52px, 7.1vw, 92px);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.026em;
  text-wrap: balance;
}

h2 {
  color: var(--text-strong);
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: -0.045em;
  text-wrap: balance;
}

.lead {
  max-width: 840px;
  color: var(--muted);
  font-size: clamp(17px, 1.55vw, 20px);
  line-height: 1.7;
}

.technical-label {
  color: var(--text-soft);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
```

### Типографические правила

- H1 — короткий, крупный, плотный, максимум 2–3 строки.
- H2 — основной ритмический элемент секции.
- Обычный текст — 400, интерфейсные акценты — 500.
- Вес 600–700 использовать только для главных заголовков и ключевых чисел.
- Подзаголовок не должен конкурировать с H1 по контрасту.
- Не делать все карточки, кнопки и статусы жирными.

## 4. Сетка и ритм

```css
:root {
  --shell: 1220px;
  --radius-card: 12px;
  --radius-small: 6px;
  --radius-pill: 999px;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
}

.shell {
  width: min(calc(100% - 48px), var(--shell));
  margin-inline: auto;
}

.section {
  position: relative;
  padding-block: clamp(100px, 10vw, 148px);
}

@media (max-width: 900px) {
  .shell { width: min(calc(100% - 40px), var(--shell)); }
}

@media (max-width: 720px) {
  .shell { width: min(calc(100% - 32px), var(--shell)); }
}
```

### Композиционный ритм секции

1. Маленький uppercase-kicker.
2. Крупный заголовок.
3. Короткий приглушённый lead.
4. Большая визуальная демонстрация или системная схема.
5. Воздух перед следующей секцией.

Не собирать страницу из одинаковых карточек. Чередовать:

- центрированный hero;
- текст слева и визуал справа;
- широкое системное окно;
- асимметричную сетку показателей;
- горизонтальный маршрут;
- экран продукта;
- контрольную панель;
- финальный центрированный CTA.

## 5. Фон

Фон состоит из нескольких слабых слоёв. Ни один слой не должен быть заметен сам по себе.

```css
body {
  background:
    radial-gradient(circle at 50% -20%, rgba(113, 137, 184, 0.18), transparent 36rem),
    var(--canvas);
}

.page-grid {
  position: fixed;
  inset: 0;
  z-index: -1;
  opacity: 0.44;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(186, 215, 247, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(186, 215, 247, 0.035) 1px, transparent 1px);
  background-size: 82px 82px;
  mask-image: linear-gradient(to bottom, #000 0%, rgba(0, 0, 0, 0.75) 38%, transparent 90%);
}

.ambient-glow {
  position: absolute;
  width: 700px;
  aspect-ratio: 1;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
  pointer-events: none;
}
```

Для hero используется дополнительная сетка `28 × 28px`; на мобильном — `22 × 22px`. Сетка должна растворяться через `mask-image`, а не обрываться прямоугольником.

## 6. Поверхности

Поверхность строится из полупрозрачной заливки, внутренней линии, верхнего блика и длинной мягкой тени.

```css
:root {
  --shadow-card:
    inset 0 1px 0 rgba(216, 236, 248, 0.14),
    inset 0 0 0 1px rgba(186, 215, 247, 0.10),
    inset 0 36px 70px rgba(168, 216, 245, 0.028),
    0 28px 56px rgba(0, 0, 0, 0.34);
}

.system-panel {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-card);
  background:
    radial-gradient(circle at 50% 48%, rgba(132, 160, 214, 0.075), transparent 30%),
    linear-gradient(180deg, rgba(186, 214, 247, 0.026), rgba(5, 6, 15, 0.88)),
    #060813;
  box-shadow:
    inset 0 1px 0 rgba(216, 236, 248, 0.15),
    inset 0 0 0 1px rgba(186, 215, 247, 0.11),
    0 32px 74px rgba(0, 0, 0, 0.38);
}
```

Использовать `backdrop-filter` точечно:

- фиксированная шапка после скролла: `blur(18px) saturate(120%)`;
- всплывающая подпись: `blur(12px)`;
- полноэкранный lightbox: `blur(18px)`.

Не применять blur ко всем карточкам: это ухудшает производительность и превращает систему в обычный glassmorphism.

## 7. Кнопки и состояния

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 46px;
  padding: 11px 18px;
  border: 0;
  border-radius: var(--radius-pill);
  color: var(--text-strong);
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 150ms var(--ease-out),
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.button--primary {
  background: var(--violet);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 12px 36px rgba(98, 65, 245, 0.26);
}

.button:active {
  transform: translateY(1px) scale(0.985);
}

:focus-visible {
  outline: 2px solid var(--ice);
  outline-offset: 4px;
}

@media (hover: hover) and (pointer: fine) {
  .button:hover { transform: translateY(-2px); }
}
```

Активный tab или node должен отличаться не только цветом. Использовать одновременно подложку, контур, текст и световой сигнал.

## 8. Системные схемы и маршруты

Главная визуальная конструкция — сеть узлов, соединённых SVG-маршрутами.

### Структура

- центральное ядро;
- 5–8 периферийных узлов;
- базовые линии с низкой контрастностью;
- поверх них — короткие светящиеся импульсы;
- отдельный выход к карточке результата;
- строка события или статуса под схемой.

### SVG-стиль

```css
.route-base {
  fill: none;
  stroke: rgba(167, 193, 231, 0.18);
  stroke-width: 1;
  shape-rendering: geometricPrecision;
}

.route-pulse {
  fill: none;
  stroke: var(--ice);
  stroke-width: 1.2;
  stroke-dasharray: 4 96;
  stroke-linecap: square;
  opacity: 0.8;
  animation: route-pulse 3.9s linear infinite;
}

@keyframes route-pulse {
  to { stroke-dashoffset: -194; }
}
```

Маршруты должны быть ортогональными или собранными в аккуратную шину. Не использовать случайные кривые и декоративные молнии.

### Динамическая геометрия через JS

Координаты SVG не хардкодить, если схема зависит от реального DOM. Измерять центры элементов через `getBoundingClientRect()` и перестраивать paths через `ResizeObserver`.

```js
function centerOf(element, containerRect) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left - containerRect.left + rect.width / 2,
    y: rect.top - containerRect.top + rect.height / 2,
  };
}

function orthogonalPath(from, to) {
  const middleX = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} H ${middleX} V ${to.y} H ${to.x}`;
}

const observer = new ResizeObserver(drawRoutes);
observer.observe(systemContainer);
```

Подготовить отдельную геометрию для desktop, tablet и mobile. Не уменьшать desktop-схему простым `scale()`.

## 9. CSS-анимации

### Reveal секций

```css
.motion-ready .reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 800ms var(--ease-out),
    transform 800ms var(--ease-out);
}

.motion-ready .reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Статусный импульс

```css
@keyframes status-pulse {
  0% {
    opacity: 0.8;
    transform: scale(0.5);
  }
  70%, 100% {
    opacity: 0;
    transform: scale(1.8);
  }
}
```

### Радар

```css
@keyframes radar-sweep {
  to { transform: rotate(360deg); }
}

@keyframes radar-blip {
  0%, 72%, 100% {
    opacity: 0.12;
    transform: scale(0.72);
  }
  78%, 88% {
    opacity: 1;
    transform: scale(1.3);
  }
}
```

### Синхронный результат

Использовать общий цикл около `7.2s`:

1. сигнал проходит по выходному маршруту;
2. индикатор заполняется;
3. результат усиливает зелёное свечение;
4. система выдерживает паузу;
5. цикл мягко сбрасывается.

Не запускать несвязанные анимации с разными случайными длительностями. Внутри одной схемы всё движение должно выглядеть как единое событие.

## 10. Материализация заголовка через Canvas

Hero-заголовок остаётся настоящим HTML-текстом. Canvas расположен поверх него и используется только для временного эффекта сборки.

Алгоритм:

1. Найти текстовые узлы через `TreeWalker`.
2. Получить области строк через `Range.getClientRects()`.
3. Создать 110–230 холодных частиц.
4. Ограничить `devicePixelRatio` значением `1.5`.
5. Запустить движение через `requestAnimationFrame`.
6. Длительность материализации — около `1780ms`.
7. После завершения погасить Canvas за `500ms`.
8. Оставить настоящий заголовок полностью доступным.

Палитра частиц:

```js
const particleColors = [
  "#ddecff",
  "#a9d1ff",
  "#8eabff",
  "#f1f7ff",
];
```

Дополнительно можно провести вертикальный световой луч длительностью `1.8s`, синхронизированный с появлением текста.

## 11. JS-интерактив

Использовать vanilla JavaScript. Внешняя animation-библиотека не нужна.

### Reveal через IntersectionObserver

```js
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const items = [...document.querySelectorAll(".reveal")];

if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  items.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });

  items.forEach((item) => observer.observe(item));
}
```

### Scroll progress

- фиксированная линия высотой 2 px;
- градиент `ice → violet`;
- `transform: scaleX(progress)`;
- `transform-origin: left`;
- scroll-listener с `{ passive: true }`;
- обновление только внутри `requestAnimationFrame`.

### Автоматическая демонстрация узлов

- последовательно активировать узлы схемы;
- одновременно обновлять маршрут, статус и описание события;
- запускать цикл только когда секция видна;
- останавливать автопереключение при pointer/focus-взаимодействии;
- ручной выбор пользователя всегда имеет приоритет;
- синхронизировать `aria-selected` и классы состояния.

### Табы и переключатели экранов

- использовать настоящие `button`;
- роли `tablist` и `tab`;
- поддерживать Arrow Left/Right, Home и End;
- менять не только изображение, но и подпись, метаданные и состояние;
- использовать короткий opacity/transform transition вместо резкого скачка.

### Карусели интерфейсов

- нативный horizontal scroll;
- CSS scroll snap;
- prev/next;
- индикатор текущего слайда;
- клавиатурное управление;
- пересчёт позиций через `ResizeObserver`;
- smooth scroll только при отсутствии reduced motion.

### Lightbox

- нативный `<dialog>`;
- затемнение `rgba(1, 4, 13, 0.92)`;
- `backdrop-filter: blur(18px)`;
- закрытие кнопкой, Escape и кликом по backdrop;
- корректный режим для широких и вертикальных изображений.

## 12. Адаптивная логика

Контрольные ширины:

```text
1100px  — упрощение широких системных композиций
1080px  — перестройка крупных продуктовых блоков
900px   — tablet layout, скрытие полной навигации
720px   — основной mobile layout
640px   — уплотнение сложных карточек
420px   — компактные контролы
390px   — узкие мобильные экраны
359px   — минимальная поддерживаемая ширина
```

### Mobile-принципы

- сохранять боковые поля 16 px;
- hero-кнопки располагать колонкой;
- центрированные заголовки переводить в левое выравнивание там, где так легче читать;
- схемы перерисовывать, а не масштабировать;
- длинный маршрут можно складывать змейкой в две строки;
- скрывать второстепенные пояснения, но не ключевое состояние;
- большие экраны превращать в scroll-карусель;
- интерактивные цели делать не меньше 44 px;
- не допускать горизонтального overflow страницы.

## 13. Доступность движения

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }

  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .route-pulse,
  .moving-signal,
  .hero-particles {
    display: none;
  }

  .result-meter {
    transform: scaleX(1);
  }

  .result-card {
    opacity: 1;
    filter: none;
  }
}
```

Отключение анимации не должно скрывать информацию. Финальный результат, активный шаг и связи между блоками остаются видимыми.

## 14. Обязательные компоненты стиля

При создании страницы использовать несколько, но не обязательно все, из этих конструкций:

- фиксированная прозрачная шапка;
- тонкий scroll progress;
- hero с крупным заголовком и мягкой сеткой;
- основная фиолетовая CTA-кнопка;
- широкая системная панель;
- узлы и SVG-маршруты данных;
- статусные лампы;
- строка события;
- сегментированные tabs;
- карточка результата или показателя;
- реальный экран продукта;
- радар или контрольная схема;
- финальный CTA-блок.

Не нужно использовать все эффекты одновременно. Для одной секции достаточно одного главного визуального механизма.

## 15. Запреты

- Не превращать стиль в типовой glassmorphism.
- Не использовать крупные размытые цветные пятна как основной контент.
- Не делать каждую карточку одинаковой.
- Не использовать толстые рамки.
- Не добавлять случайные 3D-объекты.
- Не использовать декоративный cyberpunk-font.
- Не применять кислотный неон.
- Не делать весь текст белым.
- Не делать весь текст жирным.
- Не использовать фиолетовый для второстепенных элементов.
- Не анимировать элементы без смысловой связи.
- Не хардкодить SVG-маршруты, если layout меняется.
- Не переносить desktop-схему на mobile через простое уменьшение.
- Не скрывать важную информацию при отключённой анимации.
- Не подключать тяжёлую библиотеку ради reveal, tabs, Canvas или SVG-pulse.

## 16. Инструкция для генерации страницы

При реализации нового сайта в этом стиле:

1. Сначала определить один главный тезис hero.
2. Построить страницу как последовательность крупных сцен.
3. Использовать Onest и заданную типографическую иерархию.
4. Применить точные цветовые токены.
5. Создать тёмный фон с едва заметной инженерной сеткой.
6. Использовать панели с inset-линиями и слабой глубиной.
7. Выбрать один главный фиолетовый CTA.
8. Представить процессы через узлы, маршруты и состояния.
9. Реализовать движение средствами CSS, Canvas 2D и vanilla JS.
10. Перестроить сложные схемы отдельно для mobile.
11. Добавить keyboard states, ARIA и reduced motion.
12. Проверить, что без анимации страница остаётся понятной.

## Критерий готовности

Страница соответствует стилю, если она выглядит как спокойная живая система: глубокий тёмный фон, строгая типографика, тонкие поверхности, ледяные маршруты данных, один фиолетовый акцент и синхронная функциональная анимация.

Любой эффект должен объяснять одно из трёх:

- куда движутся данные;
- какое состояние изменилось;
- какой результат получен.

Если эффект ничего из этого не показывает, его нужно убрать.
