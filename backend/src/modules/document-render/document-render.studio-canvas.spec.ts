import { DocumentRenderService } from './document-render.service';
import type { DocumentTemplateDocument } from '../document-template/document-template.schema';
import type { TemplateBlockDocument } from '../template-block/template-block.schema';

function template(): DocumentTemplateDocument {
  return {
    name: 'Studio doc',
    pageSize: 'A4',
    orientation: 'portrait',
    backgroundOpacity: 0.3,
    pageNumbering: false,
  } as DocumentTemplateDocument;
}

function block(overrides: Partial<TemplateBlockDocument> = {}): TemplateBlockDocument {
  return {
    type: 'text',
    order: 0,
    showLine: false,
    isActive: true,
    ...overrides,
  } as TemplateBlockDocument;
}

describe('DocumentRenderService studioCanvas (NX preview/PDF parity)', () => {
  const renderService = new DocumentRenderService();

  it('uses zero doc-content padding and preserves fraction layout for positioned text', () => {
    const html = renderService.renderHtml(
      template(),
      [
        block({
          content: '<p>Новый текст</p>',
          layout: { page: 1, x: 0.2, y: 0.3, width: 0.4, height: 0.12, zIndex: 2, rotation: 0 },
        }),
      ],
      {},
      { studioCanvas: true },
    );

    expect(html).toContain('padding: 0');
    expect(html).toContain('left:20%');
    expect(html).toContain('top:30%');
    expect(html).toContain('width:40%');
    expect(html).toContain('block--positioned block--text');
  });

  it('renders overlay passport images as full-page doc-bg layers, not foreground blocks', () => {
    const html = renderService.renderHtml(
      template(),
      [
        block({
          type: 'image',
          settings: { overlay: true, imageUrl: '/uploads/template-blocks/x/bg.png' },
          layout: { page: 1, x: 0, y: 0, width: 1, height: 1, zIndex: 0, rotation: 0 },
        }),
        block({
          content: '<p>Caption</p>',
          layout: { page: 1, x: 0.1, y: 0.1, width: 0.3, height: 0.1, zIndex: 2, rotation: 0 },
        }),
      ],
      {},
      { studioCanvas: true },
    );

    expect(html).toContain('doc-bg--block');
    expect(html).toContain('/uploads/template-blocks/x/bg.png');
    expect(html).toContain('object-fit: contain');
    expect(html).toMatch(/doc-bg--block[\s\S]*bg\.png/);
    expect(html).toMatch(/doc-stage[\s\S]*Caption/);
    expect(html).not.toContain(
      'block--positioned"><img src="/uploads/template-blocks/x/bg.png"',
    );
  });

  it('passes studioCanvas through multipage render', () => {
    const html = renderService.renderHtmlPages(
      template(),
      [
        [
          block({
            content: '<p>P1</p>',
            layout: { page: 1, x: 0.15, y: 0.2, width: 0.5, height: 0.1, zIndex: 1, rotation: 0 },
          }),
        ],
      ],
      {},
      { studioCanvas: true },
    );

    expect(html).toContain('padding: 0');
    expect(html).toContain('left:15%');
    expect(html).toContain('top:20%');
  });
});
