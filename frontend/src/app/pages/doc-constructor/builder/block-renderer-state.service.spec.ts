import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { TemplateBlock } from '../../../shared/template-block/template-block.types';
import { BlockRendererStateService } from './block-renderer-state.service';

describe('BlockRendererStateService positioned interactions', () => {
  let scrollHost: HTMLDivElement;
  let paper: HTMLDivElement;
  let host: HTMLDivElement;
  let state: BlockRendererStateService;

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

  beforeEach(() => {
    scrollHost = document.createElement('div');
    scrollHost.className = 'pi-canvas-page-host';
    scrollHost.style.overflow = 'auto';
    paper = document.createElement('div');
    paper.className = 'pi-canvas-page-paper';
    host = document.createElement('div');
    host.className = 'block-renderer block-renderer--positioned';
    paper.append(host);
    scrollHost.append(paper);
    document.body.append(scrollHost);

    TestBed.configureTestingModule({
      providers: [
        BlockRendererStateService,
        { provide: ElementRef, useValue: new ElementRef(host) },
      ],
    });
    state = TestBed.inject(BlockRendererStateService);
    state.setBlock(block);
    state.setPageSettings('A4', 'portrait');
    state.setSnapSettings(false, 20, 0);
  });

  afterEach(() => {
    scrollHost.remove();
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  function mouse(type: string, x: number, y: number, buttons = 1): MouseEvent {
    return new MouseEvent(type, { button: 0, buttons, clientX: x, clientY: y, bubbles: true });
  }

  it('emits one document-space geometry snapshot after a drag', () => {
    const changes: Array<{ geometry: { x: number; y: number } }> = [];
    state.positionedGeometryChange$.subscribe((event) => changes.push(event as never));

    state.onPositionedDragStart(mouse('mousedown', 10, 20));
    document.dispatchEvent(mouse('mousemove', 35, 55));
    document.dispatchEvent(mouse('mouseup', 35, 55, 0));

    expect(changes).toHaveLength(1);
    expect(changes[0].geometry).toMatchObject({ x: 125, y: 155, width: 240, height: 80 });
    expect(state.positionedDragActive()).toBe(false);
  });

  it('keeps persisted geometry in document space when scale and viewport shift during drag', () => {
    jest.spyOn(paper, 'getBoundingClientRect').mockImplementation(
      () =>
        ({
          left: 100 - scrollHost.scrollLeft,
          top: 80 - scrollHost.scrollTop,
          width: 397,
        }) as DOMRect,
    );
    state.refreshCanvasScale(paper);

    const changes: Array<{ geometry: { x: number; y: number } }> = [];
    state.positionedGeometryChange$.subscribe((event) => changes.push(event as never));

    state.onPositionedDragStart(mouse('mousedown', 150, 140));
    scrollHost.scrollLeft = 20;
    scrollHost.scrollTop = 30;
    document.dispatchEvent(mouse('mousemove', 160, 150));
    document.dispatchEvent(mouse('mouseup', 160, 150, 0));

    expect(changes).toHaveLength(1);
    expect(changes[0].geometry).toMatchObject({ x: 160, y: 200 });
  });

  it('emits resized document-space geometry after a resize gesture', () => {
    const changes: Array<{ geometry: { width: number; height: number } }> = [];
    state.positionedGeometryChange$.subscribe((event) => changes.push(event as never));
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'block-renderer__positioned-resize';
    host.append(resizeHandle);

    const start = mouse('mousedown', 100, 120);
    Object.defineProperty(start, 'target', { value: resizeHandle });
    state.onPositionedResizeStart(start);
    document.dispatchEvent(mouse('mousemove', 135, 155));
    document.dispatchEvent(mouse('mouseup', 135, 155, 0));

    expect(changes).toHaveLength(1);
    expect(changes[0].geometry).toMatchObject({ x: 100, y: 120, width: 275, height: 115 });
    expect(state.positionedResizeActive()).toBe(false);
  });

  it('cancels an unfinished drag without emitting or changing persisted geometry', () => {
    const changes: unknown[] = [];
    state.positionedGeometryChange$.subscribe((event) => changes.push(event));

    state.onPositionedDragStart(mouse('mousedown', 10, 20));
    document.dispatchEvent(mouse('mousemove', 35, 55));
    document.dispatchEvent(new MouseEvent('mouseleave', { buttons: 1 }));

    expect(changes).toHaveLength(0);
    expect(state.positionedDragActive()).toBe(false);
    expect(state.positionedGeometry()).toEqual({ x: 100, y: 120, width: 240, height: 80 });
  });

  it('clamps a drag to the configured boundary padding', () => {
    const changes: Array<{ geometry: { x: number; y: number } }> = [];
    state.positionedGeometryChange$.subscribe((event) => changes.push(event as never));
    state.setSnapSettings(false, 20, 24);

    state.onPositionedDragStart(mouse('mousedown', 100, 120));
    document.dispatchEvent(mouse('mousemove', -1000, -1000));
    document.dispatchEvent(mouse('mouseup', -1000, -1000, 0));

    expect(changes[0].geometry).toMatchObject({ x: 24, y: 24 });
  });
});
