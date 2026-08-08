═══════════════════════════════════════════════════════════════
TZ-UX-305: Nav — одинаковая ширина по самому длинному тексту
═══════════════════════════════════════════════════════════════

> READY · PO после UX-304: рамки шире, полный текст влезает;
> все пункты **одной ширины** = по самому длинному label.

STATUS: READY

РОЛЬ: Frontend (layout)

ЗАВИСИМОСТИ: TZ-UX-304 DONE

LAYER: 3

CONFLICT KEYS:
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts;
frontend/src/app/layout/app-layout.nav-order.spec.ts;
docs/agent-checklists/TZ-UX-305.md;
docs/agent-checklists/_active-map.md;

---

## ЧТО ДЕЛАТЬ

1. Убрать truncate/shortLabel как основной режим (кроме крайнего overflow <1100px optional).  
2. Показать **полный** RU label под иконкой (`Каталог`, `Проектирование`, `Справочники`, …).  
3. Все nav category buttons + dropdown triggers: **одинаковая ширина** = max intrinsic width longest label (+ padding). Реализация: CSS grid на nav `grid-auto-flow: column; grid-auto-columns: 1fr` с фиксированной шириной колонки от longest, или измерить longest и `style.width`, или `min-w` достаточный единый (напр. под «Проектирование»).  
4. Рамка/hairline чуть просторнее; высота достаточна для icon+2 lines if needed but prefer 1 line full word.  
5. Правый блок (Десктоп/Выйти) не растягивать под эту ширину.  
6. ~1280–1440: без горизонтального скролла header; если не влезает — чуть уменьшить font caption, не shortLabel в первую очередь.

## НЕ

- Менять порядок категорий 304  
- Admin roles  
- Deploy  

## AC

- [ ] Полные подписи читаемы без «Проект.»  
- [ ] Все category buttons одной ширины  
- [ ] jest nav-order + tsc PASS; archive; push  
