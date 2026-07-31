import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

let observeSpy: jest.Mock;
let disconnectSpy: jest.Mock;
let originalResizeObserver: typeof ResizeObserver | undefined;

import type { TemplateBlock } from '../../../shared/template-block/template-block.types';
import { BlockRendererComponent } from './block-renderer.component';

describe('BlockRendererComponent positioned mode', () => {
  const block: TemplateBlock = {
    _id: 'positioned-1',
    templateId: 'template-1',
    type: 'text',
    order: 0,
    title: 'Text',
    content: 'Positioned text',
    showLine: false,
    isActive: true,
    settings: {
      layoutMode: 'positioned',
      geometry: { x: 100, y: 120, width: 240, height: 80 },
    },
  };

  beforeEach(async () => {
    originalResizeObserver = globalThis.ResizeObserver;
    observeSpy = jest.fn();
    disconnectSpy = jest.fn();
    class MockResizeObserver {
      constructor(_callback: ResizeObserverCallback) {}
      observe = observeSpy;
      disconnect = disconnectSpy;
    }
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      writable: true,
      value: MockResizeObserver,
    });

    await TestBed.configureTestingModule({
      imports: [BlockRendererComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(BlockRendererComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      writable: true,
      value: originalResizeObserver,
    });
  });

  it('renders positioned blocks and forwards the real geometry output', () => {
    const fixture = TestBed.createComponent(BlockRendererComponent);
    fixture.componentRef.setInput('block', block);
    fixture.componentRef.setInput('selected', true);
    fixture.componentRef.setInput('snapEnabled', false);
    fixture.detectChanges();

    const renderer = fixture.nativeElement.querySelector(
      '.block-renderer--positioned',
    ) as HTMLElement | null;
    expect(renderer).not.toBeNull();

    const changes: Array<{ geometry: Record<string, number> }> = [];
    fixture.componentInstance.positionedGeometryChange.subscribe((event) =>
      changes.push(event as never),
    );

    renderer!.dispatchEvent(
      new MouseEvent('mousedown', {
        button: 0,
        buttons: 1,
        clientX: 10,
        clientY: 20,
        bubbles: true,
      }),
    );
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        button: 0,
        buttons: 1,
        clientX: 35,
        clientY: 55,
        bubbles: true,
      }),
    );
    document.dispatchEvent(
      new MouseEvent('mouseup', { button: 0, buttons: 0, clientX: 35, clientY: 55, bubbles: true }),
    );

    expect(changes).toHaveLength(1);
    expect(changes[0].geometry).toEqual({ x: 125, y: 155, width: 240, height: 80 });
  });

  it('forwards positioned resize geometry through the component output', () => {
    const fixture = TestBed.createComponent(BlockRendererComponent);
    fixture.componentRef.setInput('block', block);
    fixture.componentRef.setInput('selected', true);
    fixture.componentRef.setInput('snapEnabled', false);
    fixture.detectChanges();

    const resizeHandle = fixture.nativeElement.querySelector(
      '.block-renderer__positioned-resize',
    ) as HTMLElement | null;
    expect(resizeHandle).not.toBeNull();

    const changes: Array<{ geometry: Record<string, number> }> = [];
    fixture.componentInstance.positionedGeometryChange.subscribe((event) =>
      changes.push(event as never),
    );

    resizeHandle!.dispatchEvent(
      new MouseEvent('mousedown', {
        button: 0,
        buttons: 1,
        clientX: 100,
        clientY: 120,
        bubbles: true,
      }),
    );
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        button: 0,
        buttons: 1,
        clientX: 135,
        clientY: 155,
        bubbles: true,
      }),
    );
    document.dispatchEvent(
      new MouseEvent('mouseup', {
        button: 0,
        buttons: 0,
        clientX: 135,
        clientY: 155,
        bubbles: true,
      }),
    );

    expect(changes).toHaveLength(1);
    expect(changes[0].geometry).toEqual({ x: 100, y: 120, width: 275, height: 115 });
  });

  it('attaches and disconnects the paper ResizeObserver with the component lifecycle', () => {
    const paper = document.createElement('div');
    paper.className = 'pi-canvas-page-paper';
    document.body.appendChild(paper);

    const fixture = TestBed.createComponent(BlockRendererComponent);
    fixture.componentRef.setInput('block', block);
    paper.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    expect(observeSpy).toHaveBeenCalledWith(paper);

    fixture.destroy();
    expect(disconnectSpy).toHaveBeenCalled();
    paper.remove();
  });

  it('falls back to flow rendering when positioned geometry is invalid', () => {
    const fixture = TestBed.createComponent(BlockRendererComponent);
    fixture.componentRef.setInput('block', {
      ...block,
      settings: { layoutMode: 'positioned', geometry: { x: 1, y: 2 } },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.block-renderer--positioned')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.block-renderer:not(.block-renderer--overlay)'),
    ).not.toBeNull();
  });
});
