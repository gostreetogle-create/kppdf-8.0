import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import type { PiPhotoItem } from './pi-photo-dropzone.component';
import { PiPhotoDropzoneComponent } from './pi-photo-dropzone.component';

describe('PiPhotoDropzoneComponent (TZ-NX-PHOTO-P0)', () => {
  const photo: PiPhotoItem = {
    _id: 'p1',
    storageUrl: '/uploads/p1.jpg',
    originalFilename: 'front.jpg',
  };
  const second: PiPhotoItem = { _id: 'p2', storageUrl: '/uploads/p2.jpg' };

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

  function dropTarget(fixture: { nativeElement: Element }): HTMLElement {
    return fixture.nativeElement.querySelector('[data-test="photo-drop-target"]') as HTMLElement;
  }

  function pasteEvent(file: File | null): Event {
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', {
      value: file
        ? { items: [{ kind: 'file', type: file.type, getAsFile: () => file }], files: [] }
        : { items: [], files: [] },
    });
    return paste;
  }

  beforeEach(() => TestBed.resetTestingModule());

  it('renders the RU hint for all three input methods', async () => {
    const { fixture } = await setup();
    expect(
      fixture.nativeElement.querySelector('[data-test="photo-drop-hint"]')?.textContent,
    ).toContain('Файл · перетащить · Ctrl+V');
  });

  it('emits pasted image files when the zone is hovered or focused', async () => {
    const { fixture, component } = await setup();
    const filesSelected = jest.fn();
    component.filesSelected.subscribe(filesSelected);
    const file = new File(['image'], 'pasted.png', { type: 'image/png' });

    dropTarget(fixture).dispatchEvent(new Event('mouseenter', { bubbles: true }));
    const paste = pasteEvent(file);
    dropTarget(fixture).dispatchEvent(paste);
    fixture.detectChanges();

    expect(filesSelected).toHaveBeenCalledWith([file]);
    expect(paste.defaultPrevented).toBe(true);
  });

  it('ignores pasted text and non-image clipboard items', async () => {
    const { fixture, component } = await setup();
    const filesSelected = jest.fn();
    component.filesSelected.subscribe(filesSelected);
    const textPaste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(textPaste, 'clipboardData', {
      value: { items: [{ kind: 'string', type: 'text/plain', getAsFile: () => null }], files: [] },
    });
    dropTarget(fixture).dispatchEvent(new Event('focusin', { bubbles: true }));
    dropTarget(fixture).dispatchEvent(textPaste);

    expect(filesSelected).not.toHaveBeenCalled();
    expect(textPaste.defaultPrevented).toBe(false);
  });

  it('accepts dropped image files and rejects non-images (invalidFileType)', async () => {
    const { fixture, component } = await setup();
    const filesSelected = jest.fn();
    const invalidFileType = jest.fn();
    component.filesSelected.subscribe(filesSelected);
    component.invalidFileType.subscribe(invalidFileType);
    const file = new File(['image'], 'front.jpg', { type: 'image/jpeg' });
    const pdf = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });

    const good = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(good, 'dataTransfer', { value: { files: [file] } });
    dropTarget(fixture).dispatchEvent(good);
    fixture.detectChanges();
    expect(filesSelected).toHaveBeenCalledWith([file]);

    const bad = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(bad, 'dataTransfer', { value: { files: [pdf] } });
    dropTarget(fixture).dispatchEvent(bad);
    fixture.detectChanges();
    expect(invalidFileType).toHaveBeenCalled();
  });

  it('renders previews with remove and main-toggle controls', async () => {
    const { fixture, component } = await setup();
    const removePhoto = jest.fn();
    const mainChanged = jest.fn();
    component.removePhoto.subscribe(removePhoto);
    component.mainChanged.subscribe(mainChanged);
    fixture.componentRef.setInput('photos', [photo, second]);
    fixture.componentRef.setInput('mainPhotoId', 'p2');
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-test="photo-preview-0"]'),
    ).not.toBeNull();
    const mainButtons = fixture.nativeElement.querySelectorAll(
      '[data-test="photo-main-toggle"]',
    );
    expect(mainButtons.length).toBe(2);

    (mainButtons[0] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(mainChanged).toHaveBeenCalledWith('p1');

    // Toggle the current main off → null.
    fixture.componentRef.setInput('mainPhotoId', 'p1');
    fixture.detectChanges();
    const first = fixture.nativeElement.querySelector(
      '[data-test="photo-preview-0"] [data-test="photo-main-toggle"]',
    ) as HTMLButtonElement;
    first.click();
    fixture.detectChanges();
    expect(mainChanged).toHaveBeenLastCalledWith(null);

    const removeButtons = fixture.nativeElement.querySelectorAll(
      '[data-test="photo-remove"]',
    );
    (removeButtons[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(removePhoto).toHaveBeenCalledWith('p2');
  });

  it('blocks picker/drop/paste/main/remove while uploading', async () => {
    const { fixture, component } = await setup();
    const filesSelected = jest.fn();
    const mainChanged = jest.fn();
    const removePhoto = jest.fn();
    component.filesSelected.subscribe(filesSelected);
    component.mainChanged.subscribe(mainChanged);
    component.removePhoto.subscribe(removePhoto);
    fixture.componentRef.setInput('photos', [photo]);
    fixture.componentRef.setInput('uploading', true);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-test="photo-upload-progress"]'),
    ).not.toBeNull();

    const target = dropTarget(fixture);
    target.click();
    const file = new File(['image'], 'front.jpg', { type: 'image/jpeg' });
    const drop = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', { value: { files: [file] } });
    target.dispatchEvent(drop);
    target.dispatchEvent(new Event('focusin', { bubbles: true }));
    target.dispatchEvent(pasteEvent(file));
    fixture.detectChanges();

    const mainButton = fixture.nativeElement.querySelector(
      '[data-test="photo-main-toggle"]',
    ) as HTMLButtonElement;
    mainButton.click();
    const removeButton = fixture.nativeElement.querySelector(
      '[data-test="photo-remove"]',
    ) as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    expect(filesSelected).not.toHaveBeenCalled();
    expect(mainChanged).not.toHaveBeenCalled();
    expect(removePhoto).not.toHaveBeenCalled();
  });

  it('does not listen for paste when the zone is not hovered/focused', async () => {
    const { fixture, component } = await setup();
    const filesSelected = jest.fn();
    component.filesSelected.subscribe(filesSelected);
    const file = new File(['image'], 'idle.png', { type: 'image/png' });
    const paste = pasteEvent(file);
    dropTarget(fixture).dispatchEvent(paste);

    expect(filesSelected).not.toHaveBeenCalled();
    expect(paste.defaultPrevented).toBe(false);
  });

  it('emits invalidFileType when the picker receives only non-image files', async () => {
    const { fixture, component } = await setup();
    const filesSelected = jest.fn();
    const invalidFileType = jest.fn();
    component.filesSelected.subscribe(filesSelected);
    component.invalidFileType.subscribe(invalidFileType);

    const input = fixture.nativeElement.querySelector(
      '[data-test="photo-file-input"]',
    ) as HTMLInputElement;
    const pdf = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [pdf] });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(filesSelected).not.toHaveBeenCalled();
    expect(invalidFileType).toHaveBeenCalled();
  });
});
