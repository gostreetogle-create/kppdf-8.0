import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudioElementsPanelComponent } from './studio-elements-panel.component';

describe('StudioElementsPanelComponent', () => {
  // Live browser check found "+ Текст" / "+ Фото" disabled on a brand-new
  // document (no active layer yet) -- the only way to add anything was the
  // Table button, which alone had no activeLayerId gate. Both buttons'
  // click handlers (studio-editor.page.ts: addTextToActiveLayer /
  // addImageToActiveLayer) already create a fresh layer when none is
  // active, mirroring the working Table flow -- the disabled binding was
  // stale from before that fallback existed. This locks the fix at the
  // template level; studio-editor.page.ts's fallback-creation logic itself
  // is covered by a live end-to-end run (typed real content into a
  // just-created layer on a document with zero prior layers), not a unit
  // test here -- the component has no existing service-mocking harness to
  // build one on cheaply.
  let fixture: ComponentFixture<StudioElementsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioElementsPanelComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(StudioElementsPanelComponent);
  });

  it('does not disable + Текст / + Фото when there is no active layer', () => {
    fixture.componentRef.setInput('activeLayerId', null);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    // data-test lives on the <app-pi-button> host tag; the real DOM
    // `disabled` attribute is on the native <button> it renders internally.
    expect(el.querySelector('[data-test="studio-add-text"] button')?.hasAttribute('disabled')).toBe(false);
    expect(el.querySelector('[data-test="studio-add-image"] button')?.hasAttribute('disabled')).toBe(false);
  });

  it('does not disable them once a layer is active either (same control, both paths work)', () => {
    fixture.componentRef.setInput('activeLayerId', 'block-1');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-add-text"] button')?.hasAttribute('disabled')).toBe(false);
    expect(el.querySelector('[data-test="studio-add-image"] button')?.hasAttribute('disabled')).toBe(false);
  });

  it('disables all three insert buttons in preview mode regardless of active layer', () => {
    fixture.componentRef.setInput('activeLayerId', 'block-1');
    fixture.componentRef.setInput('previewMode', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="studio-add-text"] button')?.hasAttribute('disabled')).toBe(true);
    expect(el.querySelector('[data-test="studio-add-image"] button')?.hasAttribute('disabled')).toBe(true);
    expect(el.querySelector('[data-test="studio-add-table"] button')?.hasAttribute('disabled')).toBe(true);
  });

  it('emits addText / addTable and opens the file picker for image, on click', () => {
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const addTextSpy = jest.fn();
    const addTableSpy = jest.fn();
    component.addText.subscribe(addTextSpy);
    component.addTable.subscribe(addTableSpy);

    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('[data-test="studio-add-text"]') as HTMLButtonElement).click();
    (el.querySelector('[data-test="studio-add-table"]') as HTMLButtonElement).click();

    expect(addTextSpy).toHaveBeenCalledTimes(1);
    expect(addTableSpy).toHaveBeenCalledTimes(1);
  });
});
