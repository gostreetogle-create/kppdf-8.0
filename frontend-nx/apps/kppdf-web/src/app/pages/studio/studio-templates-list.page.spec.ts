import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { computed, signal } from '@angular/core';
import { of } from 'rxjs';
import {
  PiDocumentTemplatesService,
  PiStudioDocumentsService,
  type DocumentTemplate,
} from '@kppdf/data-access';
import { PiDialogService, AlertDialogComponent, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import type { SilentResult } from '@kppdf/util-http';
import { StudioTemplatesListPage } from './studio-templates-list.page';

/** Canonical DialogRef mock (see pi-alert-dialog.component.spec.ts): `closed` stays undefined until close(v). */
function createMockRef(): DialogRef<boolean> {
  const closedSig = signal<boolean | undefined>(undefined);
  const isClosed = signal(false);
  return {
    closed: computed(() => (isClosed() ? (closedSig() as boolean | undefined) : undefined)) as DialogRef<boolean>['closed'],
    close: (v?: boolean) => {
      if (isClosed()) return;
      closedSig.set(v);
      isClosed.set(true);
    },
  } as DialogRef<boolean>;
}

describe('StudioTemplatesListPage — /studio/templates (TZ-NX-DOCSTUDIO-C2-THREE-SECTIONS)', () => {
  let fixture: ComponentFixture<StudioTemplatesListPage>;
  let templatesApi: { list: jest.Mock; remove: jest.Mock };
  let documentsApi: { createFromTemplate: jest.Mock };
  let dialog: { open: jest.Mock };
  let toast: { error: jest.Mock };
  let router: { navigate: jest.Mock };

  const template = (overrides: Partial<DocumentTemplate> = {}): DocumentTemplate => ({
    _id: 'tpl-1',
    name: 'КП базовый',
    orientation: 'portrait',
    pageSize: 'A4',
    isActive: true,
    ...overrides,
  });

  async function setup(templates: readonly DocumentTemplate[] = [], failFirstList = false): Promise<void> {
    templatesApi = {
      list: failFirstList
        ? jest
            .fn()
            .mockReturnValueOnce(of({ ok: false, error: 'boom' } satisfies SilentResult<DocumentTemplate[]>))
            .mockReturnValue(of({ ok: true, data: [template()] } satisfies SilentResult<DocumentTemplate[]>))
        : jest.fn().mockReturnValue(of({ ok: true, data: templates } satisfies SilentResult<DocumentTemplate[]>)),
      remove: jest.fn().mockReturnValue(of({ ok: true, data: undefined } satisfies SilentResult<void>)),
    };
    documentsApi = {
      createFromTemplate: jest.fn().mockReturnValue(
        of({ ok: true, data: { _id: 'doc-9', name: 'КП базовый', status: 'draft', docTypeId: 'dt-1' } }),
      ),
    };
    dialog = { open: jest.fn() };
    toast = { error: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudioTemplatesListPage],
      providers: [
        provideRouter([]),
        { provide: PiDocumentTemplatesService, useValue: templatesApi },
        { provide: PiStudioDocumentsService, useValue: documentsApi },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: toast },
      ],
    }).compileComponents();

    router = { navigate: jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) };
    fixture = TestBed.createComponent(StudioTemplatesListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the journal with chrome crumbs Документы / Шаблоны', async () => {
    await setup([template()]);

    expect(fixture.nativeElement.querySelector('[data-test="studio-templates-list"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="page-crumbs"]')?.textContent).toContain('Документы');
    expect(fixture.nativeElement.querySelector('[data-test="page-crumbs"]')?.textContent).toContain('Шаблоны');
    expect(fixture.nativeElement.querySelector('[data-test="studio-template-row"]')).toBeTruthy();
  });

  it('shows the empty state when no templates exist', async () => {
    await setup([]);

    expect(fixture.nativeElement.textContent).toContain('Шаблонов не найдено.');
    expect(fixture.nativeElement.querySelector('[data-test="studio-template-row"]')).toBeNull();
  });

  it('shows the error banner with retry when the list call fails', async () => {
    await setup([], true);

    expect(fixture.nativeElement.textContent).toContain('boom');
    (fixture.nativeElement.querySelector('app-pi-status-banner button') as HTMLButtonElement)?.click();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="studio-template-row"]')).toBeTruthy();
  });

  it('creates a document from the template and navigates to the editor', async () => {
    await setup([template()]);

    (fixture.nativeElement.querySelector('[data-test="studio-template-create-tpl-1"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(documentsApi.createFromTemplate).toHaveBeenCalledWith('tpl-1');
    expect(router.navigate).toHaveBeenCalledWith(['/studio', 'doc-9']);
  });

  it('toasts instead of navigating when create-from-template fails', async () => {
    await setup([template()]);
    documentsApi.createFromTemplate.mockReturnValue(of({ ok: false, error: 'create failed' }));

    (fixture.nativeElement.querySelector('[data-test="studio-template-create-tpl-1"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('create failed');
  });

  it('deletes a template only after destructive confirm, then reloads', async () => {
    await setup([template()]);
    const ref = createMockRef();

    dialog.open.mockImplementation((component: unknown) => {
      expect(component).toBe(AlertDialogComponent);
      return ref;
    });

    (fixture.nativeElement.querySelector('[data-test="studio-template-delete-tpl-1"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(templatesApi.remove).not.toHaveBeenCalled();

    ref.close(true);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(templatesApi.remove).toHaveBeenCalledWith('tpl-1');
    expect(templatesApi.list).toHaveBeenCalledTimes(2); // initial + reload after delete
  });

  it('does not delete when the confirm dialog is dismissed', async () => {
    await setup([template()]);
    const ref = createMockRef();
    dialog.open.mockReturnValue(ref);

    (fixture.nativeElement.querySelector('[data-test="studio-template-delete-tpl-1"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    ref.close(false);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(templatesApi.remove).not.toHaveBeenCalled();
  });

  it('toasts instead of reloading when the delete call fails', async () => {
    await setup([template()]);
    const ref = createMockRef();
    dialog.open.mockReturnValue(ref);
    templatesApi.remove.mockReturnValue(of({ ok: false, error: 'delete failed' }));

    (fixture.nativeElement.querySelector('[data-test="studio-template-delete-tpl-1"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    ref.close(true);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(toast.error).toHaveBeenCalledWith('delete failed');
  });
});
