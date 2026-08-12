import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';

import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';
import { ProposalCreateTemplateCenterComponent } from './proposal-create-template-center.component';

describe('ProposalCreateTemplateCenterComponent (TZ-SALES-366 print path)', () => {
  let fixture: ComponentFixture<ProposalCreateTemplateCenterComponent>;
  let component: ProposalCreateTemplateCenterComponent;
  let sanitizer: DomSanitizer;

  const selectedTemplate = { _id: 'tpl-1', name: 'КП стандарт' } as DocumentTemplate;

  const setReadyPreview = (html: string, pages: string[] = []): void => {
    fixture.componentRef.setInput('selected', selectedTemplate);
    fixture.componentRef.setInput('previewHtml', sanitizer.bypassSecurityTrustHtml(html));
    fixture.componentRef.setInput(
      'previewPages',
      pages.map((page) => sanitizer.bypassSecurityTrustHtml(page)),
    );
    fixture.componentRef.setInput('previewStatus', 'ready');
    fixture.detectChanges();
  };

  const fullBuildHtml = (): string =>
    [
      '<!DOCTYPE html><html><head><style>.doc-page{width:210mm;height:297mm;page-break-after:always}</style></head><body>',
      '<section class="doc-page">Лист 1</section>',
      '<section class="doc-page">Лист 2</section>',
      '</body></html>',
    ].join('');

  const pageDoc = (content: string): string =>
    `<!DOCTYPE html><html><head></head><body><section class="doc-page">${content}</section></body></html>`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposalCreateTemplateCenterComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ProposalCreateTemplateCenterComponent);
    component = fixture.componentInstance;
    sanitizer = TestBed.inject(DomSanitizer);
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body
      .querySelectorAll('[data-test="kp-temp-print-frame"]')
      .forEach((node) => node.remove());
    jest.restoreAllMocks();
  });

  it('renders the preview iframe sandboxed without scripts (allow-same-origin only)', () => {
    setReadyPreview(fullBuildHtml());

    const frame = fixture.debugElement.query(By.css('[data-test="kp-tpl-html-preview"]'));
    expect(frame).toBeTruthy();
    const sandbox = frame.nativeElement.getAttribute('sandbox') ?? '';
    expect(sandbox).toBe('allow-same-origin');
    expect(sandbox).not.toContain('allow-scripts');
    expect(sandbox).not.toContain('allow-modals');
  });

  it('keeps every multi-page preview frame sandboxed without scripts', () => {
    setReadyPreview(fullBuildHtml(), [pageDoc('Лист 1'), pageDoc('Лист 2')]);

    const frames = fixture.debugElement.queryAll(By.css('[data-test="kp-tpl-html-preview"]'));
    expect(frames.length).toBe(2);
    for (const frame of frames) {
      const sandbox = frame.nativeElement.getAttribute('sandbox') ?? '';
      expect(sandbox).toBe('allow-same-origin');
      expect(sandbox).not.toContain('allow-scripts');
    }
  });

  it('prints all preview pages via a temp parent-owned iframe, not the sandboxed preview', () => {
    setReadyPreview(fullBuildHtml());

    const printMock = jest.fn();
    const focusMock = jest.fn();
    const afterprint: Array<() => void> = [];
    const fakeFrame = document.createElement('iframe');
    Object.defineProperty(fakeFrame, 'contentWindow', {
      configurable: true,
      value: {
        location: { href: 'about:srcdoc' },
        print: printMock,
        focus: focusMock,
        addEventListener: (_type: string, handler: () => void) => afterprint.push(handler),
      },
    });
    const createSpy = jest.spyOn(document, 'createElement').mockReturnValueOnce(fakeFrame);

    component.printPreview();
    createSpy.mockRestore();

    // Временный кадр печати существует, не sandboxed (модалки разрешены).
    expect(fakeFrame.isConnected).toBe(true);
    expect(fakeFrame.hasAttribute('sandbox')).toBe(false);
    expect(fakeFrame.getAttribute('data-test')).toBe('kp-temp-print-frame');

    // Внутри — тот же build HTML всех листов + печатный CSS.
    const srcdoc = fakeFrame.getAttribute('srcdoc') ?? '';
    expect(srcdoc).toContain('Лист 1');
    expect(srcdoc).toContain('Лист 2');
    expect(srcdoc).toContain('@media print');
    expect(srcdoc).toContain('print-color-adjust:exact');
    expect(srcdoc).toContain('page-break-after:always');

    // Печать идёт во временном кадре, после закрытия диалога кадр убирается.
    fakeFrame.dispatchEvent(new Event('load'));
    expect(focusMock).toHaveBeenCalledTimes(1);
    expect(printMock).toHaveBeenCalledTimes(1);
    afterprint.forEach((handler) => handler());
    expect(fakeFrame.isConnected).toBe(false);
  });

  it('does not open a print dialog / temp frame when the preview is empty', () => {
    const createSpy = jest.spyOn(document, 'createElement');
    expect(() => component.printPreview()).not.toThrow();
    expect(createSpy).not.toHaveBeenCalled();
    expect(document.querySelector('[data-test="kp-temp-print-frame"]')).toBeNull();
  });

  it('collects the full multi-page build HTML with print CSS (print path exists)', () => {
    fixture.componentRef.setInput(
      'previewHtml',
      sanitizer.bypassSecurityTrustHtml(fullBuildHtml()),
    );
    fixture.detectChanges();

    const html = (
      component as ProposalCreateTemplateCenterComponent & {
        collectPrintHtml: () => string | null;
      }
    ).collectPrintHtml();

    expect(html).toContain('Лист 1');
    expect(html).toContain('Лист 2');
    expect(html).toContain('@media print');
    expect(html).toContain('print-color-adjust:exact');
  });
});
