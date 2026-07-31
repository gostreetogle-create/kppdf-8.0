import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { API_BASE_URL } from '../../../core/api.tokens';
import { PiToastService } from '../../../shared/ui/toast';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { DocumentTemplatesService } from '../../../shared/services/pi-document-templates.service';
import { TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import { TableTemplatesService } from '../../../shared/services/pi-table-templates.service';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';
import { BuilderStateService } from './builder-state.service';

describe('BuilderStateService positioned geometry', () => {
  const block: TemplateBlock = {
    _id: 'block-1',
    templateId: 'template-1',
    type: 'text',
    order: 0,
    content: 'Text',
    showLine: false,
    isActive: true,
    settings: { width: 100, marginLeft: 0 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([]), withFetch()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        {
          provide: TemplateBlocksService,
          useValue: { update: jest.fn(() => of({ ok: true, data: block })) },
        },
        {
          provide: DocumentTemplatesService,
          useValue: { findById: jest.fn(() => of({ ok: true, data: null })) },
        },
        {
          provide: TextBlocksService,
          useValue: { list: jest.fn(() => of({ ok: true, data: { items: [] } })) },
        },
        { provide: TableTemplatesService, useValue: {} },
        BuilderStateService,
      ],
    });
  });

  it('optimistically persists positioned geometry without losing existing settings', () => {
    const state = TestBed.inject(BuilderStateService);
    state.blocks.set([block]);

    const geometry = { x: 120, y: 240, width: 360, height: 96 };
    state.onPositionedGeometryChange({ block, geometry });

    expect(state.blocks()[0].settings).toEqual({
      width: 100,
      marginLeft: 0,
      layoutMode: 'positioned',
      geometry,
    });
    expect(state.saveEvents$).toBeDefined();
  });

  it('keeps legacy flow blocks unchanged until explicitly positioned', () => {
    const state = TestBed.inject(BuilderStateService);
    state.blocks.set([block]);

    expect(state.blocks()[0].settings).toEqual({ width: 100, marginLeft: 0 });
  });
});
