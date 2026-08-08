import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { PiToastService } from '../toast';
import { PhotosService, type Photo } from '../../services/photos.service';
import { PiPhotoDropzoneComponent } from './photo-dropzone.component';

describe('PiPhotoDropzoneComponent', () => {
  const photo: Photo = {
    _id: 'p1',
    storageUrl: '/uploads/p1.jpg',
    originalFilename: 'front.jpg',
  };

  let upload: jest.Mock;
  let remove: jest.Mock;

  async function setup() {
    upload = jest.fn().mockReturnValue(of({ ok: true, data: photo }));
    remove = jest.fn().mockReturnValue(of({ ok: true, data: undefined }));

    await TestBed.configureTestingModule({
      providers: [
        { provide: PhotosService, useValue: { upload, remove } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
      ],
    })
      .overrideComponent(PiPhotoDropzoneComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(PiPhotoDropzoneComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  beforeEach(() => TestBed.resetTestingModule());

  it('uploads dropped files, emits previews, and reports upload state', async () => {
    const { fixture, component } = await setup();
    const photosChange = jest.fn();
    const uploadStateChange = jest.fn();
    component.photosChange.subscribe(photosChange);
    component.uploadStateChange.subscribe(uploadStateChange);

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

    expect(upload).toHaveBeenCalledWith(file);
    expect(photosChange).toHaveBeenCalledWith([photo]);
    expect(uploadStateChange).toHaveBeenNthCalledWith(1, true);
    expect(uploadStateChange).toHaveBeenLastCalledWith(false);
    expect(fixture.nativeElement.querySelector('[data-test="photo-preview-0"]')).not.toBeNull();
  });

  it('removes a preview and calls the shared photo delete service', async () => {
    const { fixture } = await setup();
    fixture.componentRef.setInput('initialPhotos', [photo]);
    fixture.detectChanges();

    const removeButton = fixture.nativeElement.querySelector(
      '[data-test="photo-remove"]',
    ) as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    expect(remove).toHaveBeenCalledWith('p1');
    expect(fixture.nativeElement.querySelector('[data-test="photo-preview-0"]')).toBeNull();
  });
});
