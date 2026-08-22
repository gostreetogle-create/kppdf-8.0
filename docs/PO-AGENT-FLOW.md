# Как работать с агентами (шпаргалка PO)

> Для человека, не для модели. Цель: **не быть курьером** между чатами.  
> Обновлено: 2026-08-22.

## Слайд (как работаем сейчас)

Cursor пишет TZ + `tasks/QUEUE-LIVE.md`. Вы **один раз** копируете
[`tasks/PROMPT-FOLLOW-QUEUE.md`](../tasks/PROMPT-FOLLOW-QUEUE.md) в чат исполнителя.
Дальше агент сам берёт следующую TZ из очереди. Сложное Cursor обсуждает с Claude по MCP — копировать не надо.
Статью/сайт Cursor снимает через **Perplexity MCP**, выводы пишет сам.
Кати / деплой — только ваше слово после DONE.

Perplexity в этом чате: ключ `PERPLEXITY_API_KEY` в **User** env Windows (не в git),
потом полный перезапуск Cursor → Settings → Tools & MCP → `perplexity` зелёный.
Шпаргалка Claude CLI: `docs/agents/CLAUDE-CODE.md`.

## Три роли (запомните так)

| Кто | Делает | Не делает |
|-----|--------|-----------|
| **Вы (PO)** | «Старт / освободился / кати»; один раз FOLLOW-QUEUE | Не курьер TZ и не копипаст кода |
| **Cursor · архитектор** (этот тип чата) | TZ, очередь, `PROMPT-*.md`, MCP Claude на сложное | Не кодит продукт |
| **Freebuff ×2 + Claude terminal** | Код по TZ до archive | Не выдумывает фичи вне очереди |

**Исполнитель:** Cursor Agent. Continuous работает в main; explicit Isolated —
в `.worktrees/<TASK-ID>` на task branch. `.freebuff/worktrees` не использовать.

Состояние правды — **в git**, не в чате:  
`docs/agent-checklists/_NOW.md` · `tasks/_active/` · `tasks/_archive/2026-08/`.

---

## Что копировать агенту

### 1) Слот исполнителя (Freebuff / Claude terminal)
Один раз на сессию: [`tasks/PROMPT-FOLLOW-QUEUE.md`](../tasks/PROMPT-FOLLOW-QUEUE.md).  
Очередь TZ: [`tasks/QUEUE-LIVE.md`](../tasks/QUEUE-LIVE.md) — её двигает Cursor.  
Обрыв: [`tasks/PROMPT-RESUME-ANY.md`](../tasks/PROMPT-RESUME-ANY.md).

По-человечески: *«Читай QUEUE-LIVE, не жди новый копипаст.»*

### 2) Только гигиена серверов (параллель, VPN OFF)
Файл: [`tasks/_backlog/ops/PROMPT-OPS-310-HARDEN.md`](../tasks/_backlog/ops/PROMPT-OPS-310-HARDEN.md)

### 3) Деплой сайта
Только когда скажете слово **«деплой»**.  
Агент обязан: сначала OPS-310 (если нет archive), потом **обычное** обновление **без** стирания базы.  
Канон: `deploy/synology/README.md`.  
Опасные вещи (стереть базу / wipe): см. [`docs/ops/DANGEROUS-OPS.md`](./ops/DANGEROUS-OPS.md) — агент обязан спросить **по-русски**.

Архитектор: если очередь пуста или нужен новый кусок бизнеса — попросите «напиши TZ / очередь».

---

## Красная кнопка (важно)

Любой агент, прежде чем **портить данные или ломать доступ**, должен написать вам **по-русски**:

> Осторожно, опасность. Я собираюсь … Могу ли?

Без вашего явного «да, разрешаю …» — не делать.  
Английский Approve в Freebuff ≠ разрешение стереть базу.  
Подробно: [`docs/ops/DANGEROUS-OPS.md`](./ops/DANGEROUS-OPS.md).

**Wipe** = полностью стереть данные сайта и поставить с нуля. Обычный «деплой» этого **не** делает.

---

## Когда агент «застрял»

| Что видите | Что делать |
|------------|------------|
| «maximum number of responses» / лимит шагов | Новый чат + **PROMPT-RESUME-ANY** (не разбор полётов) |
| Просит Admin / `net stop Amnezia…` | Это выключить VPN для LAN. Approve только если VPN сейчас не нужен |
| Пишет длинный отчёт по-английски | Не переводите мне всё. Спросите Cursor: «сверь git и скажи одну фразу / resume» |
| Активный `proposal-create*` | **Не** параллельте второй продукт на тех же conflict keys |
| OPS-310 | Можно параллельно с КП, если VPN OFF |

---

## Чего не делать

- Не таскать куски чата Buffy → Cursor → Buffy «чтобы тот понял».  
- Не просить «выдумай что ещё сделать» mid-wave.  
- Не деплоить без OPS-310.  
- Не включать wipe без фразы вроде **«да, разрешаю wipe после бэкапа»** (см. DANGEROUS-OPS).

---

## Сейчас (ориентир)

Точная правда — `docs/agent-checklists/_NOW.md` + `tasks/_active/` после `git pull`.
