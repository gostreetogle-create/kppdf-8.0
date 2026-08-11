import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TextBlockCategoriesService } from '../../../shared/services/pi-text-block-categories.service';
import { TextBlocksService, type TextBlock } from '../../../shared/services/pi-text-blocks.service';
import { ProposalCreateTermsComponent, type ProposalTerm } from './proposal-create-terms.component';

describe('ProposalCreateTermsComponent', () => {
  let fixture: ComponentFixture<ProposalCreateTermsComponent>;
  let changes: ProposalTerm[][];
  const block: TextBlock = {
    _id: 'text-1',
    name: 'Оплата по факту',
    slug: 'payment',
    tags: [],
    content: '<p>Оплата после поставки.</p>',
    isActive: true,
    sortOrder: 1,
  };

  beforeEach(async () => {
    changes = [];
    await TestBed.configureTestingModule({
      imports: [ProposalCreateTermsComponent],
      providers: [
        {
          provide: TextBlocksService,
          useValue: { list: jest.fn(() => of({ ok: true, data: { items: [block], total: 1 } })) },
        },
        {
          provide: TextBlockCategoriesService,
          useValue: { list: jest.fn(() => of({ ok: true, data: [] })) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalCreateTermsComponent);
    fixture.componentRef.setInput('terms', []);
    fixture.componentInstance.termsChange.subscribe((value) => changes.push(value));
    fixture.detectChanges();
  });

  it('shows the Russian empty state and an explicit add-condition CTA', () => {
    expect(
      fixture.nativeElement.querySelector('[data-test="kp-terms-empty"]')?.textContent,
    ).toContain('Добавьте первое условие');
    const addButton = fixture.nativeElement.querySelector(
      '[data-test="kp-terms-add"] button',
    ) as HTMLButtonElement | null;
    expect(addButton).toBeTruthy();
    expect(addButton?.textContent).toContain('Добавить условие');
    expect(addButton?.getAttribute('aria-label')).toBe('Добавить условие');
  });

  it('adds, reorders, and removes conditions through one output', () => {
    const component = fixture.componentInstance as unknown as {
      add: (text?: string) => void;
      move: (index: number, direction: -1 | 1) => void;
      remove: (index: number) => void;
    };

    component.add('Первое');
    fixture.componentRef.setInput('terms', changes.at(-1));
    fixture.detectChanges();
    component.add('Второе');
    fixture.componentRef.setInput('terms', changes.at(-1));
    fixture.detectChanges();
    component.move(1, -1);
    fixture.componentRef.setInput('terms', changes.at(-1));
    fixture.detectChanges();
    component.remove(0);

    expect(changes.at(-1)).toEqual([{ text: 'Первое', sortOrder: 0 }]);
  });

  it('adds a library block as plain text and keeps the picker open', () => {
    const component = fixture.componentInstance as unknown as {
      addFromLibrary: (value: TextBlock) => void;
      libraryOpen: () => boolean;
    };

    component.addFromLibrary(block);

    expect(changes.at(-1)).toEqual([{ text: 'Оплата после поставки.', sortOrder: 0 }]);
    expect(component.libraryOpen()).toBe(true);
  });

  it('inserts a supported variable at the end of the active condition', () => {
    fixture.componentRef.setInput('terms', [{ text: 'Сумма: ', sortOrder: 0 }]);
    const component = fixture.componentInstance as unknown as {
      insertVariable: (index: number, token: string) => void;
    };

    component.insertVariable(0, '{{total_price}}');

    expect(changes.at(-1)).toEqual([{ text: 'Сумма: {{total_price}}', sortOrder: 0 }]);
  });
});
