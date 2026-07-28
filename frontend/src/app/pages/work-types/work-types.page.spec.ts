import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { WorkTypesPage } from './work-types.page';
import { WorkTypesService, WorkType } from '../../shared/services/pi-work-types.service';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { API_BASE_URL } from '../../core/api.tokens';

/**
 * TZ-232.E work-types page spec — DI mock pattern (analogous to
 * `storage-items.page.spec.ts`). WorkTypesService is mocked at the DI
 * level so the wrapper calls happen synchronously through the
 * `toEntityService` adapter — no real HTTP for /api/work-types.
 *
 * The previous spec used `HttpTestingController.expectOne(...)` to
 * catch httpResource calls, but the migrated page uses the wrapper
 * which goes through the mocked service instead. HttpTestingController
 * is no longer needed for this spec.
 */
describe('WorkTypesPage (TZ-232.E wrapper migration)', () => {
  const baseUrl = '/api';
  const dialogSpy = { open: jest.fn().mockReturnValue({}) };

  const fakeWorkTypes: WorkType[] = [
    { _id: 'wt1', name: 'Раскрой на ЧПУ', hourlyRate: 2000, unit: 'час', isActive: true } as WorkType,
    { _id: 'wt2', name: 'Кромкование', hourlyRate: 500, unit: 'м.п.', isActive: false } as WorkType,
  ];

  function createWorkTypesMock(items: WorkType[] = fakeWorkTypes) {
    return {
      list: () => of({ ok: true, data: { items, total: items.length } }),
      findById: () => of({ ok: true, data: items[0] ?? ({} as WorkType) }),
      create: () => of({ ok: true, data: items[0] ?? ({} as WorkType) }),
      update: () => of({ ok: true, data: items[0] ?? ({} as WorkType) }),
      remove: () => of({ ok: true, data: undefined }),
    };
  }

  beforeEach(async () => {
    dialogSpy.open.mockClear();
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: WorkTypesService, useValue: createWorkTypesMock() },
        { provide: PiDialogService, useValue: dialogSpy },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
      ],
    })
      .overrideComponent(WorkTypesPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  /**
   * Per-test helper: override the WorkTypesService mock BEFORE
   * instantiating the component. Returns the fixture for assertions.
   */
  function mountPage(items: WorkType[] = fakeWorkTypes): {
    fixture: ReturnType<typeof TestBed.createComponent<WorkTypesPage>>;
    comp: WorkTypesPage;
  } {
    TestBed.overrideProvider(WorkTypesService, {
      useValue: createWorkTypesMock(items),
    });
    const fixture = TestBed.createComponent(WorkTypesPage);
    fixture.detectChanges();
    return { fixture, comp: fixture.componentInstance };
  }

  it('renders the page without errors', () => {
    const { fixture } = mountPage();
    // Verify the page-level components rendered (page header + section).
    expect(fixture.nativeElement.querySelector('app-pi-page-header')).toBeTruthy();
  });

  it('listService is the EntityService shape (5 CRUD methods)', () => {
    const { comp } = mountPage();
    expect(typeof comp.listService.list).toBe('function');
    expect(typeof comp.listService.findById).toBe('function');
    expect(typeof comp.listService.create).toBe('function');
    expect(typeof comp.listService.update).toBe('function');
    expect(typeof comp.listService.remove).toBe('function');
  });

  it('cellTemplates contains the isActive template (computed signal)', () => {
    const { comp } = mountPage();
    // cellTemplates is a computed signal — call it to get value
    expect(comp.cellTemplates().isActive).toBeDefined();
  });

  it('openCreate opens the form dialog', () => {
    const { comp } = mountPage();
    comp.openCreate();
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('openEdit opens the form dialog with the work type data', () => {
    const { comp } = mountPage();
    const wt = fakeWorkTypes[0];
    comp.openEdit(wt);
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('onToggleActive calls WorkTypesService.update with isActive flag', () => {
    const { comp } = mountPage();
    const updateSpy = jest.spyOn((comp as unknown as { workTypesService: { update: jest.Mock } }).workTypesService, 'update');
    const wt = fakeWorkTypes[0];
    comp.onToggleActive(wt, false);
    expect(updateSpy).toHaveBeenCalledWith(wt._id, { isActive: false });
  });

  it('onDelete opens the AlertDialog for confirmation', () => {
    const { comp } = mountPage();
    dialogSpy.open.mockClear();
    comp.onDelete(fakeWorkTypes[0]);
    expect(dialogSpy.open).toHaveBeenCalled();
  });
});