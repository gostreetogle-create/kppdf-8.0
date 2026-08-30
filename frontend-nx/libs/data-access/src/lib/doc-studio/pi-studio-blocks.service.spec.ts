import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL, type SilentResult } from '@kppdf/util-http';
import { PiStudioBlocksService } from './pi-studio-blocks.service';
import type { StudioBlock } from './studio-block.types';

describe('PiStudioBlocksService', () => {
  let service: PiStudioBlocksService;
  let http: HttpTestingController;
  const block: StudioBlock = { _id: 'b1', type: 'text', order: 0 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), PiStudioBlocksService, { provide: API_BASE_URL, useValue: '/api' }],
    });
    service = TestBed.inject(PiStudioBlocksService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists blocks for a studio document', () => {
    service.list('doc1').subscribe();
    expect(http.expectOne('/api/studio-documents/doc1/blocks').request.method).toBe('GET');
  });

  it('creates a block with expected revision', () => {
    const payload = { expectedRevision: 2, type: 'text' as const, order: 0 };
    service.create('doc1', payload).subscribe();
    const request = http.expectOne('/api/studio-documents/doc1/blocks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(block);
  });

  it('updates and removes a template block', () => {
    service.update('b1', { content: 'Hello' }).subscribe();
    expect(http.expectOne('/api/template-blocks/b1').request.method).toBe('PATCH');
    service.remove('b1').subscribe();
    expect(http.expectOne('/api/template-blocks/b1').request.method).toBe('DELETE');
  });

  it('batch-updates layouts with expected revision', () => {
    const payload = { expectedRevision: 3, updates: [{ blockId: 'b1', layout: { page: 1, x: 0, y: 0, width: 1, zIndex: 1, rotation: 0 } }] };
    service.updateLayouts('doc1', payload).subscribe();
    const request = http.expectOne('/api/studio-documents/doc1/blocks/layouts');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    request.flush({} as SilentResult<StudioBlock[]>);
  });
});
