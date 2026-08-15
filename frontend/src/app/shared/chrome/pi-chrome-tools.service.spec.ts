import { TestBed } from '@angular/core/testing';
import { List, Filter } from 'lucide-angular';

import { PiChromeToolsService } from './pi-chrome-tools.service';

describe('PiChromeToolsService (TZ-UX-322)', () => {
  let svc: PiChromeToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PiChromeToolsService] });
    svc = TestBed.inject(PiChromeToolsService);
  });

  it('merges left/right by side and clears by owner', () => {
    svc.setTools('a', [
      {
        id: 'orders',
        side: 'left',
        ariaLabel: 'Заказы',
        title: 'Заказы',
        icon: List,
        onClick: () => undefined,
        order: 2,
      },
      {
        id: 'filters',
        side: 'left',
        ariaLabel: 'Фильтры',
        title: 'Фильтры',
        icon: Filter,
        onClick: () => undefined,
        order: 1,
      },
    ]);
    svc.setTools('b', [
      {
        id: 'card',
        side: 'right',
        ariaLabel: 'Карточка',
        title: 'Карточка',
        icon: List,
        onClick: () => undefined,
      },
    ]);

    expect(svc.leftTools().map((t) => t.id)).toEqual(['filters', 'orders']);
    expect(svc.rightTools().map((t) => t.id)).toEqual(['card']);

    svc.clear('a');
    expect(svc.leftTools()).toEqual([]);
    expect(svc.rightTools().map((t) => t.id)).toEqual(['card']);

    svc.clear('b');
    expect(svc.rightTools()).toEqual([]);
  });

  it('setTools replaces the same owner list', () => {
    svc.setTools('page', [
      {
        id: 'old',
        side: 'left',
        ariaLabel: 'Старое',
        title: 'Старое',
        icon: List,
        onClick: () => undefined,
      },
    ]);
    svc.setTools('page', [
      {
        id: 'new',
        side: 'left',
        ariaLabel: 'Новое',
        title: 'Новое',
        icon: Filter,
        onClick: () => undefined,
      },
    ]);
    expect(svc.leftTools().map((t) => t.id)).toEqual(['new']);
  });
});
