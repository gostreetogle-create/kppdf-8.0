import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ProposalCreateTemplatePickerComponent } from './proposal-create-template-picker.component';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';

describe('ProposalCreateTemplatePickerComponent (TZ-UX-316 deep-link edit)', () => {
  let fixture: ComponentFixture<ProposalCreateTemplatePickerComponent>;
  let component: ProposalCreateTemplatePickerComponent;

  const navigate = jest.fn().mockResolvedValue(true);
  const tpl = { _id: 'tpl-1', name: 'КП стандарт' };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ProposalCreateTemplatePickerComponent],
      providers: [
        {
          provide: DocumentTemplatesService,
          useValue: {
            list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [tpl], total: 1 } })),
          },
        },
        { provide: Router, useValue: { navigate, url: '/proposals/create?id=draft-1' } },
      ],
    })
      .overrideComponent(ProposalCreateTemplatePickerComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(ProposalCreateTemplatePickerComponent);
    component = fixture.componentInstance;
  });

  it('TZ-UX-316: «Редактировать шаблон» opens /builder/:id with returnUrl (not the templates list)', async () => {
    fixture.componentRef.setInput('initialId', 'tpl-1');
    fixture.detectChanges();
    TestBed.flushEffects();

    const editBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      '[data-test="kp-tpl-edit"]',
    );
    expect(editBtn).toBeTruthy();
    editBtn.click();

    expect(navigate).toHaveBeenCalledWith(['/doc-constructor/builder', 'tpl-1'], {
      queryParams: { returnUrl: '/proposals/create?id=draft-1' },
    });
    // Старый баг: уход на список templates с templateId query — больше не происходит.
    expect(navigate).not.toHaveBeenCalledWith(
      ['/doc-constructor/templates'],
      expect.objectContaining({ queryParams: expect.objectContaining({ templateId: 'tpl-1' }) }),
    );
  });

  it('TZ-UX-316: openBuilder is a no-op when no template is selected', () => {
    const open = (component as unknown as { openBuilder: () => void }).openBuilder.bind(component);
    expect(() => open()).not.toThrow();
    expect(navigate).not.toHaveBeenCalled();
  });
});
