import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import type { PiPhotoFrame } from './pi-photo-frame-editor.component';
import {
  PiPhotoFrameEditorComponent,
  photoFrameStyle,
} from './pi-photo-frame-editor.component';

describe('photoFrameStyle (TZ-NX-PHOTO-P3)', () => {
  it('defaults to contain/center for missing or partial frames', () => {
    expect(photoFrameStyle(null)).toEqual({
      'object-fit': 'contain',
      'object-position': '50% 50%',
    });
    expect(photoFrameStyle(undefined)).toEqual(photoFrameStyle(null));
    expect(photoFrameStyle({ fit: 'cover' })).toEqual({
      'object-fit': 'cover',
      'object-position': '50% 50%',
    });
    expect(photoFrameStyle({ fit: 'contain', posX: 30 })).toEqual({
      'object-fit': 'contain',
      'object-position': '30% 50%',
    });
  });

  it('applies cover + pan and clamps out-of-range percents', () => {
    expect(photoFrameStyle({ fit: 'cover', posX: 12, posY: 88 })).toEqual({
      'object-fit': 'cover',
      'object-position': '12% 88%',
    });
    expect(photoFrameStyle({ fit: 'cover', posX: -20, posY: 150 })).toEqual({
      'object-fit': 'cover',
      'object-position': '0% 100%',
    });
  });
});

describe('PiPhotoFrameEditorComponent (TZ-NX-PHOTO-P3)', () => {
  // jsdom lacks PointerEvent; the editor uses pointer events for drag-pan.
  class PointerEventShim extends MouseEvent {
    readonly pointerId: number;
    constructor(type: string, init: MouseEventInit & { pointerId?: number } = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
    }
  }
  beforeAll(() => {
    (globalThis as Record<string, unknown>)['PointerEvent'] = PointerEventShim;
  });

  let fixture: ComponentFixture<PiPhotoFrameEditorComponent>;

  async function setup(
  frame: PiPhotoFrame | Partial<PiPhotoFrame> | null,
  ): Promise<PiPhotoFrameEditorComponent> {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    const created = TestBed.createComponent(PiPhotoFrameEditorComponent);
    created.componentRef.setInput('photoUrl', '/uploads/p1.jpg');
    created.componentRef.setInput('frame', frame ?? null);
    fixture = created;
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('renders the viewport with contain default and saves a merged partial on pan', async () => {
    const component = await setup({ fit: 'cover', posX: 50, posY: 50 });
    const save = jest.fn();
    component.save.subscribe(save);

    const viewport = fixture.nativeElement.querySelector(
      '[data-test="photo-frame-viewport"]',
    ) as HTMLElement;
    Object.defineProperty(viewport, 'getBoundingClientRect', {
      value: () => ({ left: 0, top: 0, width: 200, height: 100 }),
    });

    viewport.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }),
    );
    viewport.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        pointerId: 1,
        clientX: 40,
        clientY: 30,
      }),
    );
    viewport.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

    component['onSave']();
    expect(save).toHaveBeenCalledWith({ posX: 30, posY: 20 });
  });

  it('does not pan while in contain mode', async () => {
    const component = await setup(null);
    const save = jest.fn();
    component.save.subscribe(save);

    const viewport = fixture.nativeElement.querySelector(
      '[data-test="photo-frame-viewport"]',
    ) as HTMLElement;
    viewport.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }),
    );
    viewport.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        pointerId: 1,
        clientX: 10,
        clientY: 10,
      }),
    );

    component['onSave']();
    expect(save).toHaveBeenCalledWith({});
  });

  it('toggle switches cover→contain(default) and back', async () => {
    const component = await setup({ fit: 'cover', posX: 20, posY: 80 });
    const toggle = fixture.nativeElement.querySelector(
      '[data-test="photo-frame-fit-toggle"]',
    ) as HTMLInputElement;
    toggle.click();
    fixture.detectChanges();
    expect(component['draft']()).toEqual({ fit: 'contain', posX: 50, posY: 50 });

    component['toggleFit']();
    expect(component['draft']()).toEqual({ fit: 'cover', posX: 50, posY: 50 });
  });
});
