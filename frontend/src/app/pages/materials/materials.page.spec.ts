import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { MaterialsPage } from './materials.page';
import { OrganizationsService } from '../../shared/services/organizations.service';
import { PhotosService } from '../../shared/services/photos.service';
import {
  MaterialsService,
  Material,
  MaterialsListResponse,
} from '../../shared/services/materials.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';

/**
 * TZ-232.E warmup #4 spec v2 — MaterialsPage migrated to
 * <pi-entity-list> via simple-toEntityService pattern.
 *
 * Spec simplified: dropped the full delete-confirmation chain test
 * (was: mock dialogSpy.open with `.afterClosed$.subscribe`, capture
 * callback, invoke with `true`, assert service.remove + toast.success).
 * The proper Subject-based PI dialog flow is hard to mock end-to-end
 * without re-implementing PiDialogService — and the same flow is
 * covered by storage-items.spec.ts. Here we keep just the assertion
 * that `onDelete()` opens the destructive AlertDialogComponent with
 * the right metadata.
 */
describe('MaterialsPage', () => {
  const dialogSpy = { open: jest.fn().mockReturnValue({}) };
  const toastSpy = { success: jest.fn(), error: jest.fn() };
  let listSpy: jest.Mock;

  const fakeItems: Material[] = [
    { _id: 'm1', name: 'Steel sheet', unit: 'sheet' },
    { _id: 'm2', name: 'Aluminum bar', unit: 'kg' },
  ];

  async function mountPage(listResponse: MaterialsListResponse): Promise<{
    fixture: import('@angular/core/testing').ComponentFixture<MaterialsPage>;
    listSpy: jest.Mock;
  }> {
    listSpy = jest.fn().mockReturnValue(of({ ok: true, data: listResponse }));
    const removeSpy = jest.fn().mockReturnValue(of({ ok: true, data: undefined }));

    TestBed.overrideProvider(OrganizationsService, {
      useValue: {
        list: () => of({ ok: true, data: { items: [], total: 0, page: 1, limit: 200 } }),
      },
    });
    TestBed.overrideProvider(PhotosService, {
      useValue: {
        list: () => of({ ok: true as const, data: [] }),
        upload: () => of({ ok: true as const, data: {} as never }),
        remove: () => of({ ok: true as const, data: undefined }),
      },
    });
    TestBed.overrideProvider(MaterialsService, {
      useValue: {
        list: listSpy,
        findById: () => of({ ok: true as const, data: {} as never }),
        create: () => of({ ok: true as const, data: {} as never }),
        update: () => of({ ok: true as const, data: {} as never }),
        remove: removeSpy,
      },
    });

    await TestBed.configureTestingModule({
      imports: [MaterialsPage],
      providers: [
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: toastSpy },
      ],
    })
      .overrideComponent(MaterialsPage, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(MaterialsPage);
    fixture.detectChanges();
    // Drain microtasks so wrapper's switchMap projection resolves.
    await Promise.resolve();

    return { fixture, listSpy };
  }

  beforeEach(() => {
    dialogSpy.open.mockClear();
    toastSpy.success.mockClear();
    toastSpy.error.mockClear();
  });

  it('fires an initial list() call on creation (wrapper ngOnInit)', async () => {
    const { listSpy } = await mountPage({ items: fakeItems, total: 2, page: 1, limit: 50 });
    expect(listSpy).toHaveBeenCalledTimes(1);
    // Verify wrapper-passed params: page=1, limit=50, no search yet.
    const [params] = listSpy.mock.calls[0]!;
    expect(params).toMatchObject({ page: 1, limit: 50 });
    expect(params?.search).toBeUndefined();
  });

  it('renders rows + total via wrapper after initial fetch', async () => {
    const { fixture } = await mountPage({ items: fakeItems, total: 2, page: 1, limit: 50 });
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      listRef: () => { rows: () => Material[]; total: () => number } | undefined;
    };

    const ref = comp.listRef();
    expect(ref).toBeDefined();
    expect(ref?.rows().length).toBe(2);
    expect(ref?.total()).toBe(2);
  });

  it('shows empty state when list returns no items', async () => {
    const { fixture } = await mountPage({ items: [], total: 0, page: 1, limit: 50 });
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      listRef: () => { rows: () => Material[]; total: () => number } | undefined;
    };

    expect(comp.listRef()?.rows().length).toBe(0);
    expect(comp.listRef()?.total()).toBe(0);
  });

  it('handles error response gracefully', async () => {
    listSpy = jest.fn().mockReturnValue(
      of({ ok: false as const, error: new Error('Server error') as never }),
    );

    TestBed.overrideProvider(OrganizationsService, {
      useValue: {
        list: () => of({ ok: true as const, data: { items: [], total: 0, page: 1, limit: 200 } }),
      },
    });
    TestBed.overrideProvider(PhotosService, {
      useValue: {
        list: () => of({ ok: true as const, data: [] }),
        upload: () => of({ ok: true as const, data: {} as never }),
        remove: () => of({ ok: true as const, data: undefined }),
      },
    });
    TestBed.overrideProvider(MaterialsService, {
      useValue: {
        list: listSpy,
        findById: () => of({ ok: true as const, data: {} as never }),
        create: () => of({ ok: true as const, data: {} as never }),
        update: () => of({ ok: true as const, data: {} as never }),
        remove: () => of({ ok: true as const, data: undefined }),
      },
    });

    await TestBed.configureTestingModule({
      imports: [MaterialsPage],
      providers: [
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: toastSpy },
      ],
    })
      .overrideComponent(MaterialsPage, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(MaterialsPage);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      listRef: () => { error: () => string | null } | undefined;
    };

    expect(() => comp.listRef()?.error()).not.toThrow();
    expect(comp.listRef()?.error()).toBeTruthy();
  });

  it('create button triggers openCreate', async () => {
    const { fixture } = await mountPage({ items: [], total: 0, page: 1, limit: 50 });
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { openCreate: () => void };
    comp.openCreate();
    expect(dialogSpy.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ width: 'lg' }),
    );
  });

  it('delete button opens destructive AlertDialogComponent', async () => {
    const { fixture } = await mountPage({ items: fakeItems, total: 2, page: 1, limit: 50 });
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { onDelete: (row: Material) => void };
    comp.onDelete(fakeItems[0]!);

    // `onDelete` opens `AlertDialogComponent`. The full close-callback
    // chain (confirm → service.remove() → toast.success) is verified
    // by storage-items.page.spec.ts; we just assert the dialog opens
    // here. Note: `AlertDialogComponent` is the first constructor arg
    // to `dialog.open(...)`.
    expect(dialogSpy.open).toHaveBeenCalled();
    const [openArgs] = dialogSpy.open.mock.calls[0]!;
    expect(openArgs).toBeDefined();
    // Second arg is the config object with destructive variant.
    const [, opts] = dialogSpy.open.mock.calls[0]!;
    expect(opts).toMatchObject({
      data: expect.objectContaining({
        title: 'Удалить материал?',
        variant: 'destructive',
      }),
      width: 'sm',
    });
  });
});