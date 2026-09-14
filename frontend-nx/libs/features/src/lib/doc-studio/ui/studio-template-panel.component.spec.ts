import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudioTemplatePanelComponent } from './studio-template-panel.component';

describe('StudioTemplatePanelComponent', () => {
  let fixture: ComponentFixture<StudioTemplatePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioTemplatePanelComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(StudioTemplatePanelComponent);
    fixture.componentRef.setInput('docTypes', [{ _id: 'dt1', name: 'Invoice' }]);
    fixture.detectChanges();
  });

  it('renders template panel root, doc type select and CTA', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-template-panel"]')).toBeTruthy();
    expect(el.querySelector('[data-test="studio-template-doc-type"]')).toBeTruthy();
    expect(el.querySelector('[data-test="studio-template-save-cta"]')).toBeTruthy();
  });

  it('disables save CTA until docTypeId is set', () => {
    const el = fixture.nativeElement as HTMLElement;
    const ctaHost = el.querySelector('[data-test="studio-template-save-cta"]') as HTMLElement;
    const ctaButton = ctaHost.querySelector('button') as HTMLButtonElement;
    expect(ctaButton.disabled).toBe(true);
    fixture.componentRef.setInput('docTypeId', 'dt1');
    fixture.detectChanges();
    expect(ctaButton.disabled).toBe(false);
  });
});
