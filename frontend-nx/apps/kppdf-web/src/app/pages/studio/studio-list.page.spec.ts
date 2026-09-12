import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import {
  PiDocTypesService,
  PiDocumentTemplatesService,
  PiStudioDocumentsService,
  type StudioDocument,
} from '@kppdf/data-access';
import { PiDialogService, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import type { SilentResult } from '@kppdf/util-http';
import { StudioListPage } from './studio-list.page';
import { StudioCreateDoctypeDialogComponent, type StudioCreateDoctypeResult } from './studio-create-doctype-dialog.component';

describe('StudioListPage — create document CTAs', () => {
  let fixture: ComponentFixture<StudioListPage>;
  let service: { list: jest.Mock; create: jest.Mock };
  let documentTemplates: { list: jest.Mock };
  let docTypesApi: { list: jest.Mock };
  let dialog: { open: jest.Mock };
  let toast: { error: jest.Mock };
  let router: { navigate: jest.Mock };

  async function setup(documents: readonly StudioDocument[] = []): Promise<void> {
    service = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: documents } satisfies SilentResult<StudioDocument[]>)),
      create: jest.fn(),
    };
    documentTemplates = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    docTypesApi = {
      list: jest.fn().mockReturnValue(
        of({
          ok: true,
          data: [
            { _id: 'dt-kp', name: 'КП', slug: 'proposal' },
            { _id: 'dt-contract', name: 'Договор', slug: 'contract' },
          ],
        }),
      ),
    };
    dialog = { open: jest.fn() };
    toast = { error: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudioListPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: PiStudioDocumentsService, useValue: service },
        { provide: PiDocumentTemplatesService, useValue: documentTemplates },
        { provide: PiDocTypesService, useValue: docTypesApi },
        { provide: PiDialogService, useValue: dialog },
        { provide: PiToastService, useValue: toast },
      ],
    }).compileComponents();

    router = { navigate: jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) };
    fixture = TestBed.createComponent(StudioListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('keeps the landing on the documents list when drafts exist', async () => {
    await setup([
      {
        _id: 'draft-1',
        name: 'Сохранённый черновик',
        status: 'draft',
        orientation: 'portrait',
        pageSize: 'A4',
        updatedAt: '2026-09-06T10:00:00.000Z',
      },
    ]);

    expect(fixture.nativeElement.querySelector('[data-test="studio-list"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="studio-row"]')).toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('shows the Russian status label instead of the raw status value', async () => {
    await setup([
      {
        _id: 'doc-frozen',
        name: 'Замороженный документ',
        status: 'frozen',
        orientation: 'portrait',
        pageSize: 'A4',
        updatedAt: '2026-09-06T10:00:00.000Z',
      },
    ]);

    const row = fixture.nativeElement.querySelector('[data-test="studio-row"]');
    expect(row?.textContent).toContain('Заморожен');
    expect(row?.textContent).not.toContain('frozen');
  });

  it('TZ-NX-DOCSTUDIO-LIST-DROP-NEW-KP: no «Новое КП» button — only Шаблоны / Из шаблона / Создать документ remain', async () => {
    await setup();

    expect(fixture.nativeElement.querySelector('[data-test="studio-create-kp"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="studio-templates-link"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="studio-create-from-template"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="studio-create"]')).toBeTruthy();
  });

  it('TZ-NX-DOCSTUDIO-TEMPLATES-NO-SENTINEL-SPAM: «Из шаблона» with no saved templates toasts an honest empty message, no dialog', async () => {
    await setup();
    documentTemplates.list.mockReturnValue(of({ ok: true, data: [] }));

    (fixture.nativeElement.querySelector('[data-test="studio-create-from-template"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Нет сохранённых шаблонов'),
    );
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('requires an explicit doc type from the create-doctype dialog for «Создать документ»', async () => {
    await setup();
    service.create.mockReturnValue(
      of({ ok: true, data: { _id: 'doc-2', name: 'Договор', status: 'draft', docTypeId: 'dt-contract' } }),
    );
    const closedSignal = signal<StudioCreateDoctypeResult | undefined>(undefined);
    const ref = { closed: closedSignal, close: (v?: StudioCreateDoctypeResult) => closedSignal.set(v) } as unknown as DialogRef<StudioCreateDoctypeResult>;
    dialog.open.mockReturnValue(ref);

    (fixture.nativeElement.querySelector('[data-test="studio-create"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(docTypesApi.list).toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalledWith(
      StudioCreateDoctypeDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          docTypes: [
            { _id: 'dt-kp', name: 'КП', slug: 'proposal' },
            { _id: 'dt-contract', name: 'Договор', slug: 'contract' },
          ],
        }),
      }),
    );
    expect(service.create).not.toHaveBeenCalled();

    ref.close({ name: 'Договор', docTypeId: 'dt-contract' });
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Договор', docTypeId: 'dt-contract' }));
    expect(router.navigate).toHaveBeenCalledWith(['/studio', 'doc-2']);
  });

  it('toasts an error and does not open the dialog when no doc types exist', async () => {
    await setup();
    docTypesApi.list.mockReturnValue(of({ ok: true, data: [] }));

    (fixture.nativeElement.querySelector('[data-test="studio-create"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(dialog.open).not.toHaveBeenCalled();
    expect(service.create).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
