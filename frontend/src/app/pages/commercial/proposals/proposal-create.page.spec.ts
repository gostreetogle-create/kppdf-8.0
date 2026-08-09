import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { signal } from '@angular/core';

import { ProposalCreatePage } from './proposal-create.page';
import { AuthService } from '../../../core/auth.service';
import { API_BASE_URL } from '../../../core/api.tokens';
import { ProductsService } from '../../../shared/services/products.service';
import { OrganizationsService } from '../../../shared/services/organizations.service';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { ProposalDraftLine } from './proposal-product-rail.component';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';

describe('ProposalCreatePage (TZ-SALES-317 shell + TZ-SALES-319 build preview)', () => {
  let fixture: ComponentFixture<ProposalCreatePage>;
  const buildMock = jest.fn();

  beforeEach(async () => {
    buildMock.mockReset();
    buildMock.mockReturnValue(
      of({
        ok: true,
        data: '<html><head></head><body><div class="doc-bg" data-test="DATA_TEST_BUILD_OK"><img src="/uploads/bg.png" alt=""></div></body></html>',
      }),
    );

    await TestBed.configureTestingModule({
      imports: [ProposalCreatePage],
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: '/api' },
        {
          provide: AuthService,
          useValue: {
            user: signal({ pages: ['proposals', 'contracts', 'orders'] }),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: {
                  items: [
                    {
                      _id: 'prod-1',
                      name: 'Стенд',
                      sku: 'ST-1',
                      kind: 'product',
                      unit: 'шт',
                      listPrice: 5000,
                    },
                  ],
                  total: 1,
                },
              }),
          },
        },
        {
          provide: OrganizationsService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: { items: [{ _id: 'org-1', name: 'ООО Альфа' }], total: 1 },
              }),
          },
        },
        {
          provide: DocumentTemplatesService,
          useValue: {
            list: () =>
              of({
                ok: true,
                data: {
                  items: [
                    {
                      _id: 'tpl-1',
                      name: 'КП стандарт',
                      description: 'Базовый бланк',
                      tags: [],
                      organizationId: 'org-1',
                      docTypeId: 'dt-1',
                      isDefault: true,
                      isActive: true,
                      pageSize: 'A4',
                      backgroundImage: [],
                      defaultBackgroundIndex: 0,
                      backgroundOpacity: 1,
                      orientation: 'portrait',
                      version: 1,
                    },
                  ],
                  total: 1,
                },
              }),
            build: buildMock,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalCreatePage);
    fixture.detectChanges();
  });

  it('keeps fixed rails with two left tools (template + products)', () => {
    expect(
      fixture.debugElement.query(By.css('[data-test="kp-create-toggle-template"]')),
    ).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-toggle-left"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-toggle-right"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-left"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-products"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-right"]'))).toBeNull();
  });

  it('does not use docked multi-column body modifiers', () => {
    const body = fixture.debugElement.query(By.css('[data-test="kp-create-body"]'));
    expect(body.classes['kp-create-studio__body--left-open']).toBeFalsy();
    expect(body.classes['kp-create-studio__body--right-open']).toBeFalsy();
  });

  it('opens template overlay from center CTA without cascade L1/L2', () => {
    fixture.debugElement.query(By.css('[data-test="kp-tpl-add"]')).triggerEventHandler('click');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-test="kp-create-left"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-picker"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-cascade-l1"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-products"]'))).toBeNull();
  });

  it('opens products overlay from its own rail button', () => {
    fixture.debugElement
      .query(By.css('[data-test="kp-create-toggle-left"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-test="kp-create-products"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-product-rail"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-left"]'))).toBeNull();
  });

  it('closes overlay on Escape', () => {
    fixture.debugElement
      .query(By.css('[data-test="kp-create-toggle-left"]'))
      .triggerEventHandler('click');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-products"]'))).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-test="kp-create-products"]'))).toBeNull();
  });

  it('TZ-SALES-319: pick calls build and shows iframe without stub chrome', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      openTemplateTool: () => void;
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      leftTool: () => string | null;
      selectedTemplate: () => DocumentTemplate | null;
      previewStatus: () => string;
    };

    page.openTemplateTool();
    fixture.detectChanges();
    expect(page.leftTool()).toBe('template');

    page.onTemplateChange({
      _id: 'tpl-1',
      name: 'КП стандарт',
    } as DocumentTemplate);
    fixture.detectChanges();

    expect(page.selectedTemplate()?.name).toBe('КП стандарт');
    expect(page.leftTool()).toBeNull();

    tick(250);
    fixture.detectChanges();

    expect(buildMock).toHaveBeenCalledWith('tpl-1', {});
    expect(page.previewStatus()).toBe('ready');
    const frame = fixture.debugElement.query(By.css('[data-test="kp-tpl-html-preview"]'));
    expect(frame).toBeTruthy();
    expect(frame.nativeElement.getAttribute('sandbox')).toBe('allow-same-origin');
    expect(frame.nativeElement.getAttribute('srcdoc')).toContain(
      `${window.location.origin}/uploads/bg.png`,
    );
    expect(frame.styles['transform']).toContain('scale(');
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-name"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-draft-lines"]'))).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('упрощённое');
  }));

  it('TZ-SALES-319: org change rebuilds with organizationId', fakeAsync(() => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onTemplateChange: (tpl: DocumentTemplate | null) => void;
      onInspectorState: (s: { organizationId: string; orgMarkupPercent: number }) => void;
    };

    page.onTemplateChange({ _id: 'tpl-1', name: 'КП' } as DocumentTemplate);
    tick(250);
    fixture.detectChanges();
    expect(buildMock).toHaveBeenCalledWith('tpl-1', {});

    buildMock.mockClear();
    page.onInspectorState({ organizationId: 'org-1', orgMarkupPercent: 0 });
    tick(250);
    fixture.detectChanges();

    expect(buildMock).toHaveBeenCalledWith('tpl-1', { organizationId: 'org-1' });
  }));

  it('keeps draftLines add path (not painted on sheet)', () => {
    const page = fixture.componentInstance as ProposalCreatePage & {
      onProductAdd: (line: ProposalDraftLine) => void;
      draftLines: () => ProposalDraftLine[];
    };

    page.onProductAdd({
      productId: 'prod-1',
      productName: 'Стенд',
      quantity: 1,
      unitPrice: 5000,
    });
    fixture.detectChanges();

    expect(page.draftLines().length).toBe(1);
    expect(fixture.debugElement.query(By.css('[data-test="kp-tpl-draft-lines"]'))).toBeNull();
  });
});
