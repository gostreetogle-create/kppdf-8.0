import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DocumentsPage } from './documents.page';
import { GeneratedDocumentsService } from '../../../shared/services/pi-generated-documents.service';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../../shared/ui/toast';
import { TableComponent } from '../../../shared/ui/pi-table.component';

describe('DocumentsPage (TZ-UI-TABLE-305)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: GeneratedDocumentsService,
          useValue: {
            list: jest.fn().mockReturnValue(of({ ok: true, data: [] })),
            openHtml: jest.fn(),
            remove: jest.fn(),
          },
        },
        { provide: PiDialogService, useValue: { open: jest.fn() } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    })
      .overrideComponent(DocumentsPage, {
        set: { imports: [TableComponent], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('renders the shared Flat table for a non-empty registry', () => {
    const fixture = TestBed.createComponent(DocumentsPage);
    const page = fixture.componentInstance as unknown as {
      items: { set(value: unknown[]): void };
      loading: { set(value: boolean): void };
    };
    page.items.set([
      {
        _id: 'doc-1',
        number: 'DOC-1',
        name: 'Документ',
        templateId: 'tpl-1',
        status: 'final',
        sourceType: 'manual',
        isActive: true,
      },
    ]);
    page.loading.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-pi-table')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="documents-table"]')).toBeTruthy();
  });
});
