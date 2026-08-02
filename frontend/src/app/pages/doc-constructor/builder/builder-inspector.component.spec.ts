/**
 * TZ-DOC-311 + TZ-DOC-332 — BuilderInspectorComponent DOM / IA contracts.
 *
 * DOC-311: template panel pageNumbering; removed TOC/header/footer fields.
 * DOC-332: section chrome order per modes A–D; snap/pageNumbering via pi-switch.
 */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BuilderInspectorComponent } from './builder-inspector.component';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { PiToastService } from '../../../shared/ui/toast';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';

describe('BuilderInspectorComponent (TZ-DOC-311 / DOC-332)', () => {
  let fixture: ComponentFixture<BuilderInspectorComponent>;

  const template: DocumentTemplate = {
    _id: 'tpl-1',
    name: 'T',
    organizationId: 'org-1',
    docTypeId: 'dt-1',
    pageSize: 'A4',
    orientation: 'portrait',
    backgroundOpacity: 0.3,
    pageNumbering: false,
    version: 1,
  } as DocumentTemplate;

  const uploadImageMock = jest.fn();
  const toastErrorMock = jest.fn();
  const createObjectURLSpy = jest.fn(() => 'blob:mock-inspector');
  const revokeObjectURLSpy = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    uploadImageMock.mockReturnValue(
      of({ ok: true, data: { url: '/uploads/template-blocks/b1/new.png' } }),
    );
    Object.defineProperty(URL, 'createObjectURL', { writable: true, value: createObjectURLSpy });
    Object.defineProperty(URL, 'revokeObjectURL', { writable: true, value: revokeObjectURLSpy });

    await TestBed.configureTestingModule({
      imports: [BuilderInspectorComponent],
      providers: [
        { provide: TemplateBlocksService, useValue: { uploadImage: uploadImageMock } },
        { provide: PiToastService, useValue: { error: toastErrorMock } },
      ],
    })
      .overrideComponent(BuilderInspectorComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
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

  it('DOC-332 Mode B: template section headers order', () => {
    expect(sectionHeaders()).toEqual(['Контекст', 'Стиль страницы', 'Фон']);
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
});
