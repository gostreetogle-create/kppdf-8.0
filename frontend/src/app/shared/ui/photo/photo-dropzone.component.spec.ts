import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import type { Photo } from '../../services/photos.service';
import { PiPhotoDropzoneComponent } from './photo-dropzone.component';

describe('PiPhotoDropzoneComponent', () => {
  const photo: Photo = {
    _id: 'p1',
    storageUrl: '/uploads/p1.jpg',
    originalFilename: 'front.jpg',
  };

  async function setup() {
    await TestBed.configureTestingModule({})
      .overrideComponent(PiPhotoDropzoneComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(PiPhotoDropzoneComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => TestBed.resetTestingModule());

  it('is presentational: renders input photos and emits uploadRequest instead of calling the API', async () => {
    const { fixture, component } = await setup();
    const uploadRequest = jest.fn();
    component.uploadRequest.subscribe(uploadRequest);

    fixture.componentRef.setInput('photos', [photo]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="photo-preview-0"]')).not.toBeNull();

    const file = new File(['image'], 'front.jpg', { type: 'image/jpeg' });
    const target = fixture.nativeElement.querySelector(
      '[data-test="photo-drop-target"]',
    ) as HTMLElement;
    target.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }));
    const drop = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', {
      value: { files: [file] },
    });
    target.dispatchEvent(drop);
    fixture.detectChanges();

    expect(uploadRequest).toHaveBeenCalledWith([file]);
  });

  it('emits deleteRequest with the photo id on remove (API stays parent-owned)', async () => {
    const { fixture, component } = await setup();
    const deleteRequest = jest.fn();
    component.deleteRequest.subscribe(deleteRequest);
    fixture.componentRef.setInput('photos', [photo]);
    fixture.detectChanges();

    const removeButton = fixture.nativeElement.querySelector(
      '[data-test="photo-remove"]',
    ) as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    expect(deleteRequest).toHaveBeenCalledWith('p1');
  });

  it('renders uploading status and error message from inputs', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();

    fixture.componentRef.setInput('uploading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain(
      'Загрузка фото',
    );

    fixture.componentRef.setInput('uploading', false);
    fixture.componentRef.setInput('errorMessage', 'Не удалось загрузить: front.jpg');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Не удалось загрузить',
    );
  });
});
