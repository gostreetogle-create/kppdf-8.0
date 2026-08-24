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

  it('ignores non-image files on drop and emits invalidFileType', async () => {
    const { fixture, component } = await setup();
    const uploadRequest = jest.fn();
    const invalidFileType = jest.fn();
    component.uploadRequest.subscribe(uploadRequest);
    component.invalidFileType.subscribe(invalidFileType);

    const pdf = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
    const target = fixture.nativeElement.querySelector(
      '[data-test="photo-drop-target"]',
    ) as HTMLElement;
    const drop = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', {
      value: { files: [pdf] },
    });
    target.dispatchEvent(drop);
    fixture.detectChanges();

    expect(uploadRequest).not.toHaveBeenCalled();
    expect(invalidFileType).toHaveBeenCalled();
  });

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

  it('renders the RU hint for all three upload methods', async () => {
    const { fixture } = await setup();
    expect(
      fixture.nativeElement.querySelector('[data-test="photo-drop-hint"]')?.textContent,
    ).toContain('Файл с диска · перетащить · Ctrl+V');
  });

  it('emits pasted image files when the zone is hovered or focused', async () => {
    const { fixture, component } = await setup();
    const uploadRequest = jest.fn();
    component.uploadRequest.subscribe(uploadRequest);
    const file = new File(['image'], 'pasted.png', { type: 'image/png' });
    const target = fixture.nativeElement.querySelector(
      '[data-test="photo-drop-target"]',
    ) as HTMLElement;
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', {
      value: {
        items: [
          {
            kind: 'file',
            type: 'image/png',
            getAsFile: () => file,
          },
        ],
        files: [],
      },
    });

    target.dispatchEvent(new Event('mouseenter', { bubbles: true }));
    target.dispatchEvent(paste);
    fixture.detectChanges();

    expect(uploadRequest).toHaveBeenCalledWith([file]);
    expect(paste.defaultPrevented).toBe(true);
  });

  it('ignores pasted text and non-image clipboard files', async () => {
    const { fixture, component } = await setup();
    const uploadRequest = jest.fn();
    component.uploadRequest.subscribe(uploadRequest);
    const textPaste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(textPaste, 'clipboardData', {
      value: {
        items: [{ kind: 'string', type: 'text/plain', getAsFile: () => null }],
        files: [],
      },
    });
    const target = fixture.nativeElement.querySelector(
      '[data-test="photo-drop-target"]',
    ) as HTMLElement;
    target.dispatchEvent(new Event('focusin', { bubbles: true }));
    target.dispatchEvent(textPaste);

    expect(uploadRequest).not.toHaveBeenCalled();
    expect(textPaste.defaultPrevented).toBe(false);
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
    expect(fixture.nativeElement.querySelector('[data-test="photo-upload-progress"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-test="photo-drop-hint"]')?.textContent,
    ).toContain('Файл с диска · перетащить · Ctrl+V');

    fixture.componentRef.setInput('uploading', true);
    fixture.detectChanges();
    const progress = fixture.nativeElement.querySelector(
      '[data-test="photo-upload-progress"]',
    ) as HTMLElement;
    expect(progress).not.toBeNull();
    expect(progress.querySelector('[role="status"]')?.textContent).toContain('Загрузка фото');
    expect(progress.querySelector('[role="progressbar"]')).not.toBeNull();
    expect(
      fixture.nativeElement
        .querySelector('[data-test="photo-drop-target"]')
        ?.getAttribute('aria-busy'),
    ).toBe('true');

    fixture.componentRef.setInput('progressPercent', 42);
    fixture.detectChanges();
    expect(progress.querySelector('[role="status"]')?.textContent).toContain('42%');
    expect(progress.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe(
      '42',
    );

    fixture.componentRef.setInput('uploading', false);
    fixture.componentRef.setInput('errorMessage', 'Не удалось загрузить: front.jpg');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="photo-upload-progress"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Не удалось загрузить',
    );
  });

  it('does not open the file picker while uploading', async () => {
    const { fixture, component } = await setup();
    const uploadRequest = jest.fn();
    component.uploadRequest.subscribe(uploadRequest);
    fixture.componentRef.setInput('uploading', true);
    fixture.detectChanges();

    const target = fixture.nativeElement.querySelector(
      '[data-test="photo-drop-target"]',
    ) as HTMLElement;
    target.click();
    const file = new File(['image'], 'front.jpg', { type: 'image/jpeg' });
    const drop = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', { value: { files: [file] } });
    target.dispatchEvent(drop);
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    const pastedFile = new File(['image'], 'pasted.jpg', { type: 'image/jpeg' });
    Object.defineProperty(paste, 'clipboardData', {
      value: {
        items: [{ kind: 'file', type: 'image/jpeg', getAsFile: () => pastedFile }],
        files: [],
      },
    });
    target.dispatchEvent(new Event('focusin', { bubbles: true }));
    target.dispatchEvent(paste);
    fixture.detectChanges();

    expect(uploadRequest).not.toHaveBeenCalled();
  });
});
