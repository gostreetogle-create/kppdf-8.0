import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../dialog/dialog.tokens';
import { PiPhotoLightboxComponent, type PhotoLightboxData } from './photo-lightbox.component';

function setup(data: PhotoLightboxData) {
  const ref = { closed: signal<unknown>(undefined), close: jest.fn() };
  return TestBed.configureTestingModule({
    imports: [PiPhotoLightboxComponent],
    providers: [
      { provide: PI_DIALOG_DATA, useValue: data },
      { provide: PI_DIALOG_REF, useValue: ref },
    ],
  })
    .overrideComponent(PiPhotoLightboxComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } })
    .compileComponents()
    .then(() => {
      const fixture = TestBed.createComponent(PiPhotoLightboxComponent);
      fixture.detectChanges();
      return { fixture, ref };
    });
}

describe('PiPhotoLightboxComponent (TZ-UI-344)', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('renders one contain image with the supplied source and accessible alt', async () => {
    const { fixture } = await setup({
      src: '/uploads/front.jpg',
      alt: 'Фасад изделия',
      filename: 'front.jpg',
    });
    const image = fixture.nativeElement.querySelector(
      '[data-test="photo-lightbox-image"]',
    ) as HTMLImageElement;

    expect(image).toBeTruthy();
    expect(image.src).toContain('/uploads/front.jpg');
    expect(image.alt).toBe('Фасад изделия');
    expect(image.className).toContain('object-contain');
    expect(fixture.nativeElement.querySelectorAll('img')).toHaveLength(1);
  });

  it('shows dialog semantics and a descriptive accessible label', async () => {
    const { fixture } = await setup({ src: '/uploads/front.jpg', alt: 'Фасад изделия' });
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;

    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Просмотр фото');
  });

  it('closes through the shared dialog ref from the explicit close button', async () => {
    const { fixture, ref } = await setup({ src: '/uploads/front.jpg', alt: 'Фасад изделия' });
    (
      fixture.nativeElement.querySelector('[data-test="photo-lightbox-close"]') as HTMLElement
    ).click();

    expect(ref.close).toHaveBeenCalledTimes(1);
  });

  it('renders an accessible unavailable state for an empty source', async () => {
    const { fixture } = await setup({ src: '', alt: 'Недоступное фото' });

    expect(fixture.nativeElement.querySelector('[data-test="photo-lightbox-image"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="photo-lightbox-error"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-test="photo-lightbox-close"]')).toBeTruthy();
  });

  it('switches a broken source to the accessible unavailable state', async () => {
    const { fixture } = await setup({ src: '/uploads/missing.jpg', alt: 'Битое фото' });
    const image = fixture.nativeElement.querySelector(
      '[data-test="photo-lightbox-image"]',
    ) as HTMLImageElement;
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test="photo-lightbox-image"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-test="photo-lightbox-error"]')).toBeTruthy();
  });

  it('does not expose zoom, pan, or gallery navigation controls', async () => {
    const { fixture } = await setup({ src: '/uploads/front.jpg', alt: 'Фасад изделия' });
    const text = fixture.nativeElement.textContent ?? '';

    expect(text).not.toContain('Увеличить');
    expect(text).not.toContain('Следующее');
    expect(text).not.toContain('Предыдущее');
    expect(fixture.nativeElement.querySelectorAll('img')).toHaveLength(1);
  });
});
