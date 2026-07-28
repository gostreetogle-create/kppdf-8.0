import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { OrganizationsPage } from './organizations.page';
import {
  OrganizationsService,
  Organization,
} from '../../shared/services/organizations.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';

/**
 * TZ-232.E warmup #2 spec — OrganizationsPage migrated to
 * <pi-entity-list>. Spec rewritten under DI mock pattern (replaces
 * HttpTestingController.expectOne pattern that tested the previous
 * `httpResource` implementation; wrapper now drives fetches via the
 * injected OrganizationsService through toEntityService adapter).
 *
 * What we cover:
 *  1. Initial list fetch on mount (wrapper ngOnInit triggers
 *     service.list()).
 *  2. Loading → loaded state transition.
 *  3. Empty list → total=0, rows=[].
 *  4. Error response → wrapper.error() populated, rows=[].
 *  5. Create button → dialog opened.
 */
describe('OrganizationsPage', () => {
  const dialogSpy = { open: jest.fn().mockReturnValue({}) };
  let listSpy: jest.Mock;

  const fakeOrgs: Organization[] = [
    { _id: 'org1', name: 'Acme Corp', inn: '1234567890' } as Organization,
    { _id: 'org2', name: 'Beta LLC', inn: '0987654321' } as Organization,
  ];

  async function mountPage(listResponse: { items: Organization[]; total: number }): Promise<{
    fixture: import('@angular/core/testing').ComponentFixture<OrganizationsPage>;
    listSpy: jest.Mock;
  }> {
    listSpy = jest.fn().mockReturnValue(of({ ok: true, data: listResponse }));

    TestBed.overrideProvider(OrganizationsService, {
      useValue: {
        list: listSpy,
        findById: () => of({ ok: true, data: {} as never }),
        create: () => of({ ok: true, data: {} as never }),
        update: () => of({ ok: true, data: {} as never }),
        remove: () => of({ ok: true, data: undefined }),
      },
    });

    await TestBed.configureTestingModule({
      imports: [OrganizationsPage],
      providers: [
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    })
      .overrideComponent(OrganizationsPage, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(OrganizationsPage);
    fixture.detectChanges();
    // Let wrapper's switchMap projection resolve synchronously.
    await Promise.resolve();

    return { fixture, listSpy };
  }

  beforeEach(() => {
    dialogSpy.open.mockClear();
  });

  it('fires an initial list() call on creation', async () => {
    const { listSpy } = await mountPage({ items: fakeOrgs, total: 2 });
    expect(listSpy).toHaveBeenCalledTimes(1);
  });

  it('renders rows + total after initial fetch', async () => {
    const { fixture } = await mountPage({ items: fakeOrgs, total: 2 });
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      listRef: () => { rows: () => Organization[]; total: () => number } | undefined;
    };

    const ref = comp.listRef();
    expect(ref).toBeDefined();
    expect(ref?.rows().length).toBe(2);
    expect(ref?.total()).toBe(2);
  });

  it('shows empty state when list returns no items', async () => {
    const { fixture } = await mountPage({ items: [], total: 0 });
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      listRef: () => { rows: () => Organization[]; total: () => number } | undefined;
    };

    expect(comp.listRef()?.rows().length).toBe(0);
    expect(comp.listRef()?.total()).toBe(0);
  });

  it('handles error response gracefully', async () => {
    listSpy = jest.fn().mockReturnValue(
      of({ ok: false, error: new Error('boom') as never }),
    );

    TestBed.overrideProvider(OrganizationsService, {
      useValue: {
        list: listSpy,
        findById: () => of({ ok: true, data: {} as never }),
        create: () => of({ ok: true, data: {} as never }),
        update: () => of({ ok: true, data: {} as never }),
        remove: () => of({ ok: true, data: undefined }),
      },
    });

    await TestBed.configureTestingModule({
      imports: [OrganizationsPage],
      providers: [
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    })
      .overrideComponent(OrganizationsPage, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(OrganizationsPage);
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
    const { fixture } = await mountPage({ items: [], total: 0 });
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      openCreate: () => void;
    };
    comp.openCreate();
    expect(dialogSpy.open).toHaveBeenCalled();
  });
});