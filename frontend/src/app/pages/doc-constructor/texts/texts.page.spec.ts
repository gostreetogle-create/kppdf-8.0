import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { convertToParamMap } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';

import { TextsPage } from './texts.page';
import { TextBlocksService, TextBlock } from '../../../shared/services/pi-text-blocks.service';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../../shared/ui/toast';
import { API_BASE_URL } from '../../../core/api.tokens';

describe('TextsPage (post-TZ-232.F.4)', () => {
  const dialogSpy = { open: jest.fn().mockReturnValue({ closed: of(undefined) }) };
  const routerSpy = { navigate: jest.fn().mockResolvedValue(true) };
  const queryParams$ = new BehaviorSubject(convertToParamMap({}));

  const fakeBlocks: TextBlock[] = [
    {
      _id: 'b1',
      name: 'Шапка договора',
      slug: 'contract-header',
      category: 'legal',
      tags: [],
      content: '<p>...</p>',
      isActive: true,
      sortOrder: 1,
    } as TextBlock,
    {
      _id: 'b2',
      name: 'Заключение',
      slug: 'outro',
      category: 'outro',
      tags: [],
      content: '<p>...</p>',
      isActive: false,
      sortOrder: 2,
    } as TextBlock,
  ];

  beforeEach(async () => {
    dialogSpy.open.mockClear();
    queryParams$.next(convertToParamMap({}));
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: TextBlocksService,
          useValue: {
            list: () => of({ ok: true, data: { items: fakeBlocks, total: fakeBlocks.length } }),
            findById: (id: string) =>
              of({
                ok: true,
                data: fakeBlocks.find((b) => b._id === id) ?? ({} as TextBlock),
              }),
            create: () => of({ ok: true, data: {} as TextBlock }),
            update: (id: string, p: Partial<TextBlock>) =>
              of({ ok: true, data: { ...fakeBlocks[0], ...p, _id: id } }),
            remove: () => of({ ok: true, data: undefined }),
          },
        },
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: queryParams$.asObservable() },
        },
      ],
    })
      .overrideComponent(TextsPage, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('mounts cleanly', () => {
    const fixture = TestBed.createComponent(TextsPage);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes a listService adapter with the wrapper-expected shape', () => {
    const fixture = TestBed.createComponent(TextsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      listService: {
        list: (p: { page: number; limit: number }) => {
          subscribe: (fn: (v: unknown) => void) => unknown;
        };
      };
    };
    let captured: unknown = undefined;
    comp.listService?.list({ page: 1, limit: 50 }).subscribe((v) => {
      captured = v;
    });
    expect(captured).toBeDefined();
  });

  it('opens editor for create (creatingNew=true, editingBlock=null)', () => {
    const fixture = TestBed.createComponent(TextsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      openCreate: () => void;
      creatingNew: () => boolean;
      editingBlock: () => TextBlock | null;
      editorOpen: () => boolean;
    };
    comp.openCreate();
    expect(comp.creatingNew()).toBe(true);
    expect(comp.editingBlock()).toBeNull();
    expect(comp.editorOpen()).toBe(true);
  });

  it('opens editor for edit (editingBlock=block, editingId=block._id)', () => {
    const fixture = TestBed.createComponent(TextsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      openEdit: (b: TextBlock) => void;
      editingBlock: () => TextBlock | null;
      editingId: () => string | null;
      creatingNew: () => boolean;
    };
    comp.openEdit(fakeBlocks[0]);
    expect(comp.editingBlock()?._id).toBe('b1');
    expect(comp.editingId()).toBe('b1');
    expect(comp.creatingNew()).toBe(false);
  });

  it('onEditorSaved clears editor state', () => {
    const fixture = TestBed.createComponent(TextsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      openEdit: (b: TextBlock) => void;
      onEditorSaved: () => void;
      editingBlock: () => TextBlock | null;
      editingId: () => string | null;
      creatingNew: () => boolean;
    };
    comp.openEdit(fakeBlocks[0]);
    comp.onEditorSaved();
    expect(comp.editingBlock()).toBeNull();
    expect(comp.editingId()).toBeNull();
    expect(comp.creatingNew()).toBe(false);
  });

  it('onDelete opens destructive AlertDialogComponent', () => {
    const fixture = TestBed.createComponent(TextsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      onDelete: (b: TextBlock) => void;
    };
    comp.onDelete(fakeBlocks[0]);
    expect(dialogSpy.open).toHaveBeenCalled();
    const lastCall = dialogSpy.open.mock.calls[dialogSpy.open.mock.calls.length - 1];
    const opts = lastCall?.[1] as { data?: { variant?: string } } | undefined;
    expect(opts?.data?.variant).toBe('destructive');
  });

  it('columnConfigUpper maps column count to uppercase Russian plural', () => {
    const fixture = TestBed.createComponent(TextsPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      columnConfigUpper: (n: number) => string;
    };
    expect(comp.columnConfigUpper(1)).toBe('КОЛОНКА');
    expect(comp.columnConfigUpper(3)).toBe('КОЛОНКИ');
    expect(comp.columnConfigUpper(5)).toBe('КОЛОНОК');
  });
});
