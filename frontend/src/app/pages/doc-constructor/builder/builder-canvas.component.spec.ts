import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { BuilderCanvasComponent } from './builder-canvas.component';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';

describe('BuilderCanvasComponent layout partitioning', () => {
  const base = (overrides: Partial<TemplateBlock>): TemplateBlock => ({
    _id: overrides._id ?? 'block',
    templateId: 'template-1',
    type: 'text',
    order: 0,
    content: 'Text',
    showLine: false,
    isActive: true,
    ...overrides,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuilderCanvasComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(BuilderCanvasComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('keeps legacy flow and image overlay blocks backward compatible', () => {
    const fixture = TestBed.createComponent(BuilderCanvasComponent);
    fixture.componentRef.setInput('blocks', [
      base({ _id: 'flow' }),
      base({ _id: 'image-overlay', type: 'image', settings: { overlay: true } }),
      base({
        _id: 'positioned',
        settings: { layoutMode: 'positioned', geometry: { x: 1, y: 2, width: 100, height: 50 } },
      }),
      base({
        _id: 'table-positioned',
        type: 'table',
        settings: { layoutMode: 'positioned', geometry: { x: 1, y: 2, width: 100, height: 50 } },
      }),
    ]);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      flowBlocks: () => TemplateBlock[];
      overlayBlocks: () => TemplateBlock[];
      positionedBlocks: () => TemplateBlock[];
    };

    expect(component.flowBlocks().map((b) => b._id)).toEqual(['flow', 'table-positioned']);
    expect(component.overlayBlocks().map((b) => b._id)).toEqual(['image-overlay']);
    expect(component.positionedBlocks().map((b) => b._id)).toEqual(['positioned']);
  });

  it('forwards configured page size to the canvas contract', () => {
    const fixture = TestBed.createComponent(BuilderCanvasComponent);
    fixture.componentRef.setInput('blocks', []);
    fixture.componentRef.setInput('pageSize', 'Letter');
    fixture.componentRef.setInput('orientation', 'landscape');
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      pageSize: () => string;
      orientation: () => string;
      maxWidthPx: () => number;
    };

    expect(component.pageSize()).toBe('Letter');
    expect(component.orientation()).toBe('landscape');
    expect(component.maxWidthPx()).toBe(900);
  });
});
