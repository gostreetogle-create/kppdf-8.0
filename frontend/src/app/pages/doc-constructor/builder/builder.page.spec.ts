import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { BuilderPage } from './builder.page';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { API_BASE_URL } from '../../../core/api.tokens';

describe('BuilderPage', () => {
  const baseUrl = '/api';
  const fakeActivatedRoute = {
    paramMap: of({ get: () => null }),
    queryParamMap: of({ get: () => null }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: TemplateBlocksService,
          useValue: {
            listByTemplate: () => of({ ok: true, data: [] }),
            add: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
            reorder: () => of({ ok: true, data: undefined }),
          },
        },
        {
          provide: DocumentTemplatesService,
          useValue: {
            list: () => of({ ok: true, data: { items: [], total: 0 } }),
            findById: () => of({ ok: true, data: null }),
            create: () => of({ ok: true, data: {} as never }),
            update: () => of({ ok: true, data: {} as never }),
            remove: () => of({ ok: true, data: undefined }),
            uploadBackground: () => of({ ok: true, data: { url: '', backgroundImage: [] } }),
            removeBackground: () => of({ ok: true, data: undefined }),
            setDefaultBackground: () => of({ ok: true, data: undefined }),
            setOrientation: () => of({ ok: true, data: undefined }),
          },
        },
        { provide: PiToastService, useValue: { success: () => {}, error: () => {} } },
        { provide: PiDialogService, useValue: { open: () => ({}) as never } },
      ],
    })
      .overrideComponent(BuilderPage, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('creates successfully', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('starts with null templateId (shows template picker)', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    const comp = fixture.componentInstance as unknown as { templateId: () => string | null };
    expect(comp.templateId()).toBeNull();
  });

  it('starts with empty blocks', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    const comp = fixture.componentInstance as unknown as { blocks: () => unknown[] };
    expect(comp.blocks().length).toBe(0);
  });

  it('starts with idle save status', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    const comp = fixture.componentInstance as unknown as {
      saveStatus: () => 'idle' | 'saving' | 'saved' | 'error';
    };
    expect(comp.saveStatus()).toBe('idle');
  });

  it('selectedBlock is null when nothing selected', () => {
    const fixture = TestBed.createComponent(BuilderPage);
    const comp = fixture.componentInstance as unknown as {
      selectedBlock: () => { _id: string } | null;
    };
    expect(comp.selectedBlock()).toBeNull();
  });
});
