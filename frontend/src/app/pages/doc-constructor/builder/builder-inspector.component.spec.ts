/**
 * TZ-DOC-311 + TZ-DOC-332 — BuilderInspectorComponent DOM / IA contracts.
 *
 * DOC-311: template panel pageNumbering; removed TOC/header/footer fields.
 * DOC-332: section chrome order per modes A–D; snap/pageNumbering via pi-switch.
 */
import { NO_ERRORS_SCHEMA, computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BuilderInspectorComponent } from './builder-inspector.component';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';
import { DocumentTemplateCategoriesService } from '../../../shared/services/pi-document-template-categories.service';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService, type DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { PiSelectAddRowComponent } from '../../../shared/ui/select-add-row';
import { DocumentTemplateCategoryFormDialogComponent } from '../../../shared/ui/dialog/document-template-category-form-dialog.component';
import { type DocumentTemplateCategory } from '../../../shared/services/pi-document-template-categories.service';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';

function makeDialogRef<T>(): DialogRef<T> {
  const closedValue = signal<T | undefined>(undefined);
  const isClosed = signal(false);
  return {
    closed: computed(() => (isClosed() ? closedValue() : undefined)),
    close: (value?: T) => {
      if (isClosed()) return;
      closedValue.set(value);
      isClosed.set(true);
    },
  };
}

async function flushDialogClose(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe('BuilderInspectorComponent (TZ-DOC-311 / DOC-332 / DOC-343)', () => {
  let fixture: ComponentFixture<BuilderInspectorComponent>;

  const template: DocumentTemplate = {
    _id: 'tpl-1',
    name: 'T',
    organizationId: 'org-1',
    docTypeId: 'dt-1',
    categoryId: 'cat-1',
    pageSize: 'A4',
    orientation: 'portrait',
    backgroundOpacity: 0.3,
    pageNumbering: false,
    version: 1,
  } as DocumentTemplate;

  const uploadImageMock = jest.fn();
  const toastErrorMock = jest.fn();
  const categoriesListMock = jest.fn();
  const dialogOpenMock = jest.fn();
  let categoryDialogRef: DialogRef<DocumentTemplateCategory>;
  const createObjectURLSpy = jest.fn(() => 'blob:mock-inspector');
  const revokeObjectURLSpy = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    uploadImageMock.mockReturnValue(
      of({ ok: true, data: { url: '/uploads/template-blocks/b1/new.png' } }),
    );
    categoryDialogRef = makeDialogRef<DocumentTemplateCategory>();
    dialogOpenMock.mockReturnValue(categoryDialogRef);
    categoriesListMock.mockReturnValue(
      of({
        ok: true,
        data: [
          {
            _id: 'cat-1',
            name: 'КП',
            slug: 'kp',
            isActive: true,
            isSystem: true,
            isDefault: true,
            sortOrder: 0,
          },
          {
            _id: 'cat-2',
            name: 'Договор',
            slug: 'contract',
            isActive: true,
            isSystem: true,
            isDefault: false,
            sortOrder: 1,
          },
        ],
      }),
    );
    Object.defineProperty(URL, 'createObjectURL', { writable: true, value: createObjectURLSpy });
    Object.defineProperty(URL, 'revokeObjectURL', { writable: true, value: revokeObjectURLSpy });

    await TestBed.configureTestingModule({
      imports: [BuilderInspectorComponent],
      providers: [
        { provide: TemplateBlocksService, useValue: { uploadImage: uploadImageMock } },
        { provide: PiToastService, useValue: { error: toastErrorMock } },
        { provide: PiDialogService, useValue: { open: dialogOpenMock } },
        {
          provide: DocumentTemplateCategoriesService,
          useValue: { list: categoriesListMock },
        },
      ],
    })
      .overrideComponent(BuilderInspectorComponent, {
        set: { imports: [PiSelectAddRowComponent], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(BuilderInspectorComponent);
    fixture.componentRef.setInput('templateSelected', true);
    fixture.componentRef.setInput('template', template);
    fixture.componentRef.setInput('allBlocks', []);
    fixture.detectChanges();
  });

  function textContent(el: HTMLElement = fixture.nativeElement): string {
    return el.textContent ?? '';
  }

  function sectionHeaders(el: HTMLElement = fixture.nativeElement): string[] {
    return Array.from(el.querySelectorAll('[data-test="insp-section-header"]')).map((n) =>
      (n.textContent ?? '').trim(),
    );
  }

  it('renders the «Нумерация страниц» toggle for the selected template', () => {
    expect(textContent()).toContain('Нумерация страниц');
  });

  it('does NOT render native checkbox for pageNumbering (DOC-332 pi-switch)', () => {
    const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(0);
    expect(fixture.nativeElement.querySelector('app-pi-switch')).toBeTruthy();
  });

  it('does NOT render the removed «Оглавление» control (TZ-DOC-311 cleanup)', () => {
    expect(textContent()).not.toContain('Оглавление');
  });

  it('does NOT render the removed «Шапка Документа» / «Подвал Документа» fields', () => {
    expect(textContent()).not.toContain('Шапка Документа');
    expect(textContent()).not.toContain('Подвал Документа');
  });

  it('emits templateUpdate with pageNumbering when the switch is flipped', () => {
    const updates: Partial<DocumentTemplate>[] = [];
    fixture.componentInstance.templateUpdate.subscribe((p) => updates.push(p));
    (
      fixture.componentInstance as unknown as {
        onTemplateSettingChange: (k: string, v: boolean) => void;
      }
    ).onTemplateSettingChange('pageNumbering', true);
    expect(updates.some((p) => p.pageNumbering === true)).toBe(true);
  });

  it('renders editable template name field (TZ-DOC-343)', () => {
    const input = fixture.nativeElement.querySelector(
      '[data-test="insp-template-name"]',
    ) as HTMLInputElement | null;
    expect(input).toBeTruthy();
    expect(input?.getAttribute('aria-label')).toBe('Название шаблона');
    expect(input?.value).toBe('T');
  });

  it('emits templateUpdate with name on commitTemplateName', () => {
    const updates: Partial<DocumentTemplate>[] = [];
    fixture.componentInstance.templateUpdate.subscribe((p) => updates.push(p));
    const cmp = fixture.componentInstance as unknown as {
      nameDraft: { set: (v: string) => void };
      commitTemplateName: () => void;
    };
    cmp.nameDraft.set('Новое имя');
    cmp.commitTemplateName();
    expect(updates).toEqual([{ name: 'Новое имя' }]);
  });

  it('rejects empty template name and restores previous (TZ-DOC-343)', () => {
    const updates: Partial<DocumentTemplate>[] = [];
    fixture.componentInstance.templateUpdate.subscribe((p) => updates.push(p));
    const cmp = fixture.componentInstance as unknown as {
      nameDraft: { set: (v: string) => void; (): string };
      commitTemplateName: () => void;
    };
    cmp.nameDraft.set('   ');
    cmp.commitTemplateName();
    expect(updates).toEqual([]);
    expect(toastErrorMock).toHaveBeenCalledWith('Название обязательно');
    expect(cmp.nameDraft()).toBe('T');
  });

  it('DOC-343 Mode B: section headers Basics / Page / Background', () => {
    expect(sectionHeaders()).toEqual(['Основные', 'Страница', 'Фон']);
  });

  it('emits templateUpdate with categoryId / pageSize / orientation', () => {
    const updates: Partial<DocumentTemplate>[] = [];
    fixture.componentInstance.templateUpdate.subscribe((p) => updates.push(p));
    const cmp = fixture.componentInstance as unknown as {
      onCategoryChange: (e: Event) => void;
      onPageSizeChange: (s: 'A3' | 'A4' | 'A5') => void;
      onOrientationChange: (o: 'portrait' | 'landscape') => void;
    };
    cmp.onCategoryChange({ target: { value: 'cat-2' } } as unknown as Event);
    cmp.onPageSizeChange('A5');
    cmp.onOrientationChange('landscape');
    expect(updates).toEqual([
      { categoryId: 'cat-2' },
      { pageSize: 'A5' },
      { orientation: 'landscape' },
    ]);
  });

  it('opens category creation inline and selects the created organization category', async () => {
    const updates: Partial<DocumentTemplate>[] = [];
    fixture.componentInstance.templateUpdate.subscribe((p) => updates.push(p));

    const addButton = fixture.nativeElement.querySelector(
      '[data-test="insp-template-category-add"]',
    ) as HTMLButtonElement | null;
    expect(addButton).toBeTruthy();
    addButton!.click();

    expect(dialogOpenMock).toHaveBeenCalledWith(
      DocumentTemplateCategoryFormDialogComponent,
      expect.objectContaining({ data: null, width: 'md', parentDestroyRef: expect.anything() }),
    );

    const created: DocumentTemplateCategory = {
      _id: 'cat-created',
      name: 'Моя категория',
      slug: 'my-category',
      isActive: true,
      isSystem: false,
      isDefault: false,
      sortOrder: 10,
      organizationId: 'org-1',
    };
    categoryDialogRef.close(created);
    await flushDialogClose();
    fixture.detectChanges();

    expect(
      (
        fixture.nativeElement.querySelector(
          '[data-test="insp-template-category"]',
        ) as HTMLSelectElement
      ).value,
    ).toBe('cat-created');
    expect(updates).toEqual([{ categoryId: 'cat-created' }]);
  });

  it('TZ-KP-443: orientation chips carry Lucide icons and emit on click', () => {
    const portrait = fixture.nativeElement.querySelector(
      '[data-test="insp-orientation-portrait"]',
    ) as HTMLButtonElement;
    const landscape = fixture.nativeElement.querySelector(
      '[data-test="insp-orientation-landscape"]',
    ) as HTMLButtonElement;
    expect(portrait).toBeTruthy();
    expect(landscape).toBeTruthy();
    expect(portrait.textContent).toContain('Книжная');
    expect(landscape.textContent).toContain('Альбомная');
    // Lucide icon markup (NO_ERRORS_SCHEMA keeps <lucide-icon> in the DOM).
    expect(portrait.querySelector('lucide-icon')).toBeTruthy();
    expect(landscape.querySelector('lucide-icon')).toBeTruthy();

    const updates: Partial<DocumentTemplate>[] = [];
    fixture.componentInstance.templateUpdate.subscribe((p) => updates.push(p));
    landscape.click();
    expect(updates).toEqual([{ orientation: 'landscape' }]);
  });

  it('DOC-332 Mode A: document context + snap (no hero «Ничего не выбрано»)', () => {
    const f = TestBed.createComponent(BuilderInspectorComponent);
    f.componentRef.setInput('templateSelected', false);
    f.componentRef.setInput('template', null);
    f.componentRef.setInput('block', null);
    f.componentRef.setInput('selectedCount', 0);
    f.componentRef.setInput('allBlocks', [
      {
        _id: 'a',
        templateId: 't',
        type: 'text',
        order: 0,
        showLine: false,
        isActive: true,
      } as TemplateBlock,
    ]);
    f.detectChanges();
    const text = textContent(f.nativeElement);
    expect(text).toContain('Документ');
    expect(text).not.toMatch(/Ничего не выбрано/);
    expect(sectionHeaders(f.nativeElement)).toEqual(['Контекст', 'Привязка к сетке']);
    expect(f.nativeElement.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it('DOC-332 Mode C: multi section headers order', () => {
    const f = TestBed.createComponent(BuilderInspectorComponent);
    const blocks = [
      {
        _id: 'a',
        templateId: 't',
        type: 'text',
        order: 0,
        showLine: false,
        isActive: true,
        layout: { x: 0.1, y: 0.1, width: 0.4, height: 0.1, zIndex: 1 },
      } as TemplateBlock,
      {
        _id: 'b',
        templateId: 't',
        type: 'text',
        order: 1,
        showLine: false,
        isActive: true,
        layout: { x: 0.1, y: 0.3, width: 0.4, height: 0.1, zIndex: 2 },
      } as TemplateBlock,
    ];
    f.componentRef.setInput('templateSelected', false);
    f.componentRef.setInput('block', null);
    f.componentRef.setInput('selectedCount', 2);
    f.componentRef.setInput('selectedBlocks', blocks);
    f.componentRef.setInput('allBlocks', blocks);
    f.componentRef.setInput('grouped', false);
    f.detectChanges();
    expect(sectionHeaders(f.nativeElement)).toEqual([
      'Контекст',
      'Геометрия',
      'Группа',
      'Слой',
      'Опасная зона',
    ]);
  });

  it('DOC-332 Mode D: single geometry before content; Edit separate from Delete', () => {
    const f = TestBed.createComponent(BuilderInspectorComponent);
    const block = {
      _id: 'b1',
      templateId: 'tpl-1',
      type: 'text',
      order: 0,
      showLine: false,
      isActive: true,
      title: 'Hello',
      content: 'Body',
      layout: { x: 0.1, y: 0.1, width: 0.5, height: 0.1, zIndex: 1 },
    } as TemplateBlock;
    f.componentRef.setInput('templateSelected', false);
    f.componentRef.setInput('block', block);
    f.componentRef.setInput('allBlocks', [block]);
    f.detectChanges();
    expect(sectionHeaders(f.nativeElement)).toEqual([
      'Контекст',
      'Геометрия',
      'Содержимое',
      'Стиль',
      'Слой',
      'Опасная зона',
    ]);
    const content = f.nativeElement.querySelector('[data-test="insp-section-content"]');
    const danger = f.nativeElement.querySelector('[data-test="insp-section-danger"]');
    expect(content?.textContent).toContain('Редактировать');
    expect(danger?.textContent).toContain('Удалить');
    expect(danger?.textContent).not.toContain('Редактировать');
  });

  it('geometry section exposes lock toggle; click emits locked patch', () => {
    const f = TestBed.createComponent(BuilderInspectorComponent);
    const block = {
      _id: 'b1',
      templateId: 'tpl-1',
      type: 'text',
      order: 0,
      showLine: false,
      isActive: true,
      locked: false,
      layout: { x: 0.1, y: 0.1, width: 0.5, height: 0.1, zIndex: 1 },
    } as TemplateBlock;
    f.componentRef.setInput('block', block);
    f.detectChanges();

    const btn = f.nativeElement.querySelector(
      '[data-test="insp-lock-toggle"]',
    ) as HTMLButtonElement | null;
    expect(btn).toBeTruthy();
    expect(btn!.textContent).toContain('Заблокировать');

    const updates: Array<Partial<TemplateBlock> & { _id: string }> = [];
    f.componentInstance.update.subscribe((p) => updates.push(p));
    btn!.click();
    expect(updates).toEqual([{ _id: 'b1', locked: true }]);
  });

  it('TZ-DOC-333: onImageUpload uploads via service and patches settings with the server URL', () => {
    const block = {
      _id: 'b1',
      templateId: 'tpl-1',
      type: 'image',
      order: 0,
      showLine: false,
      isActive: true,
      settings: { imageUrl: '/uploads/template-blocks/b1/old.png', overlay: true },
    } as TemplateBlock;
    fixture.componentRef.setInput('templateSelected', false);
    fixture.componentRef.setInput('block', block);
    fixture.detectChanges();

    const updates: Array<Partial<TemplateBlock> & { _id: string }> = [];
    fixture.componentInstance.update.subscribe((p) => updates.push(p));

    const file = new File(['x'], 'new.png', { type: 'image/png' });
    const evt = { target: { files: [file], value: '' } } as unknown as Event;
    (fixture.componentInstance as unknown as { onImageUpload: (e: Event) => void }).onImageUpload(
      evt,
    );

    expect(uploadImageMock).toHaveBeenCalledWith('b1', file);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-inspector');
    const imageUrl = updates.find((p) => p.settings?.['imageUrl'] !== undefined)?.settings?.[
      'imageUrl'
    ];
    expect(imageUrl).toBe('/uploads/template-blocks/b1/new.png');
  });

  it('TZ-DOC-333: onImageUpload without persisted _id shows an error and never patches', () => {
    const block = {
      tempId: 't1',
      templateId: 'tpl-1',
      type: 'image',
      order: 0,
      showLine: false,
      isActive: true,
    } as TemplateBlock;
    fixture.componentRef.setInput('templateSelected', false);
    fixture.componentRef.setInput('block', block);
    fixture.detectChanges();

    const updates: Array<Partial<TemplateBlock> & { _id: string }> = [];
    fixture.componentInstance.update.subscribe((p) => updates.push(p));

    const file = new File(['x'], 'new.png', { type: 'image/png' });
    const evt = { target: { files: [file], value: '' } } as unknown as Event;
    (fixture.componentInstance as unknown as { onImageUpload: (e: Event) => void }).onImageUpload(
      evt,
    );

    expect(uploadImageMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalled();
    expect(updates).toHaveLength(0);
  });

  it('TZ-DOC-344: effectiveDefaultBgIndex falls back to 0 when index invalid', () => {
    const comp = fixture.componentInstance as unknown as {
      effectiveDefaultBgIndex: (t: {
        backgroundImage?: string[];
        defaultBackgroundIndex?: number;
      }) => number;
    };
    expect(
      comp.effectiveDefaultBgIndex({
        backgroundImage: ['/a.png', '/b.png'],
        defaultBackgroundIndex: -1,
      }),
    ).toBe(0);
    expect(
      comp.effectiveDefaultBgIndex({
        backgroundImage: ['/a.png', '/b.png'],
        defaultBackgroundIndex: 1,
      }),
    ).toBe(1);
    expect(comp.effectiveDefaultBgIndex({ backgroundImage: [] })).toBe(-1);
  });

  it('TZ-DOC-344: default star button has is-active when first bg is default', () => {
    fixture.componentRef.setInput('templateSelected', true);
    fixture.componentRef.setInput('block', null);
    fixture.componentRef.setInput('template', {
      ...template,
      backgroundImage: ['/uploads/a.png', '/uploads/b.png'],
      defaultBackgroundIndex: 0,
    });
    fixture.detectChanges();

    const active = fixture.nativeElement.querySelector(
      '.bg-grid__action-btn.is-active',
    ) as HTMLButtonElement | null;
    expect(active).toBeTruthy();
    expect(active?.getAttribute('aria-pressed')).toBe('true');

    const activeStar = fixture.nativeElement.querySelector(
      '.bg-grid__star--on',
    ) as HTMLElement | null;
    expect(activeStar?.getAttribute('data-star-fill')).toBe('gold');
  });
});
