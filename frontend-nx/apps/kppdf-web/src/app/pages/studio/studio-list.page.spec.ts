import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import {
  PiDocTypesService,
  PiDocumentTemplatesService,
  PiStudioDocumentsService,
  type StudioDocument,
} from '@kppdf/data-access';
import { PiToastService } from '@kppdf/ui/toast';
import type { SilentResult } from '@kppdf/util-http';
import { StudioListPage } from './studio-list.page';

describe('StudioListPage — create КП (TZ-NX-DOCSTUDIO-S33-CREATE-KP-PATH)', () => {
  let fixture: ComponentFixture<StudioListPage>;
  let service: { list: jest.Mock; create: jest.Mock };
  let documentTemplates: { list: jest.Mock };
  let docTypesApi: { list: jest.Mock };
  let toast: { error: jest.Mock };
  let router: { navigate: jest.Mock };

  async function setup(): Promise<void> {
    service = {
      list: jest.fn().mockReturnValue(of({ ok: true, data: [] } satisfies SilentResult<StudioDocument[]>)),
      create: jest.fn(),
    };
    documentTemplates = { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) };
    docTypesApi = { list: jest.fn().mockReturnValue(of({ ok: true, data: [{ _id: 'dt-kp', name: 'КП', slug: 'proposal' }] })) };
    toast = { error: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudioListPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: PiStudioDocumentsService, useValue: service },
        { provide: PiDocumentTemplatesService, useValue: documentTemplates },
        { provide: PiDocTypesService, useValue: docTypesApi },
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

  it('creates a document with the КП doc type pre-selected and opens it', async () => {
    await setup();
    service.create.mockReturnValue(
      of({ ok: true, data: { _id: 'doc-1', name: 'КП', status: 'draft', docTypeId: 'dt-kp' } }),
    );

    (fixture.nativeElement.querySelector('[data-test="studio-create-kp"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(docTypesApi.list).toHaveBeenCalled();
    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ docTypeId: 'dt-kp' }));
    expect(router.navigate).toHaveBeenCalledWith(['/studio', 'doc-1']);
  });

  it('leaves docTypeId unset for the generic «Создать документ» button', async () => {
    await setup();
    service.create.mockReturnValue(
      of({ ok: true, data: { _id: 'doc-2', name: 'Документ', status: 'draft' } }),
    );

    (fixture.nativeElement.querySelector('[data-test="studio-create"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ docTypeId: undefined }));
    expect(router.navigate).toHaveBeenCalledWith(['/studio', 'doc-2']);
  });

  it('toasts an error and does not create when the КП doc type is missing', async () => {
    await setup();
    docTypesApi.list.mockReturnValue(of({ ok: true, data: [] }));

    (fixture.nativeElement.querySelector('[data-test="studio-create-kp"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(service.create).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
