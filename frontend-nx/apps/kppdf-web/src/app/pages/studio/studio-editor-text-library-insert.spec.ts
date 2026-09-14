import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import {
  PiCounterpartiesService,
  PiDocTypesService,
  PiOrdersService,
  PiOrganizationsService,
  PiQuotationsService,
  PiStudioBlocksService,
  PiStudioDocumentsService,
  type StudioBlock,
  type StudioDocument,
} from '@kppdf/data-access';
import { PiDialogService, type DialogRef } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { API_BASE_URL } from '@kppdf/util-http';
import { StudioEditorPage } from './studio-editor.page';
import { StudioTextLibraryPickerDialogComponent, type StudioTextLibraryPickResult } from './studio-text-library-picker-dialog.component';

/**
 * TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD — «+ Текст» in Элементы now
 * opens a category/subcategory/list picker (StudioTextLibraryPickerDialogComponent)
 * instead of always creating a bare empty layer (audit: the feature already
 * existed in Свойства, discoverability was the gap). This spec drives
 * addTextToActiveLayer end-to-end through the dialog-close callback:
 *  - «Пустой текст» -> same create as before (AC #2, no regression).
 *  - a library pick -> new layer with that content/title.
 *  - a library pick while the active layer is an EMPTY text block -> fills
 *    it in place (same anti-clobber the old code already had for a
 *    non-empty one).
 */
describe('StudioEditorPage — «+ Текст» library picker (TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD)', () => {
  const BASE_DOC: StudioDocument = {
    _id: 'doc-1',
    name: 'Text-library-insert doc',
    status: 'draft',
    orientation: 'portrait',
    pageSize: 'A4',
    revision: 1,
    manualPageCount: 1,
    context: {},
  };

  let dialogOpen: jest.Mock;
  let create: jest.Mock;
  let getById: jest.Mock;

  function configure(opts: { blocks?: StudioBlock[] } = {}): void {
    dialogOpen = jest.fn();
    create = jest.fn().mockReturnValue(
      of({ ok: true, data: { _id: 'blk-new', type: 'text', order: 0, title: 'Слой 1', content: 'Новый текст' } }),
    );
    getById = jest.fn().mockReturnValue(of({ ok: true, data: BASE_DOC }));

    TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: PiStudioDocumentsService, useValue: { getById } },
        {
          provide: PiStudioBlocksService,
          useValue: {
            list: jest.fn().mockReturnValue(of({ ok: true, data: opts.blocks ?? [] })),
            create,
            update: jest.fn((id: string, patch: Record<string, unknown>) =>
              of({ ok: true, data: { ...(opts.blocks?.[0] ?? {}), _id: id, ...patch } }),
            ),
          },
        },
        { provide: PiCounterpartiesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiQuotationsService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrdersService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiOrganizationsService, useValue: { getById: jest.fn().mockReturnValue(of({ ok: true, data: { name: 'Org' } })), list: jest.fn().mockReturnValue(of({ ok: true, data: { items: [] } })) } },
        { provide: PiDocTypesService, useValue: { list: jest.fn().mockReturnValue(of({ ok: true, data: [] })) } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: PiDialogService, useValue: { open: dialogOpen } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'doc-1' }, queryParamMap: { get: () => null } } },
        },
      ],
    }).compileComponents();
  }

  let fixture: ComponentFixture<StudioEditorPage>;

  afterEach(() => {
    fixture?.destroy();
  });

  async function flush(): Promise<void> {
    for (let i = 0; i < 12; i++) await Promise.resolve();
  }

  function fakeDialogRef(): { ref: DialogRef<StudioTextLibraryPickResult | undefined>; close: (v: StudioTextLibraryPickResult | undefined) => void } {
    const closedSignal = signal<StudioTextLibraryPickResult | undefined>(undefined);
    const ref = { closed: closedSignal } as unknown as DialogRef<StudioTextLibraryPickResult | undefined>;
    return { ref, close: (v) => closedSignal.set(v) };
  }

  interface Testable {
    addTextToActiveLayer: () => void;
    insertTextContent: (content: string, title?: string) => void;
    activeLayerId: { set: (id: string | null) => void };
  }

  it('«+ Текст» opens the library picker dialog', async () => {
    configure();
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();
    dialogOpen.mockReturnValue(fakeDialogRef().ref);

    (fixture.componentInstance as unknown as Testable).addTextToActiveLayer();

    expect(dialogOpen).toHaveBeenCalledWith(
      StudioTextLibraryPickerDialogComponent,
      expect.objectContaining({}),
    );
  });

  it('picking «Пустой текст» creates a layer with the same default content as before (no regression)', async () => {
    configure();
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();
    const { ref, close } = fakeDialogRef();
    dialogOpen.mockReturnValue(ref);

    (fixture.componentInstance as unknown as Testable).addTextToActiveLayer();
    close({ kind: 'empty' });
    TestBed.flushEffects();
    await flush();

    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]![1]).toEqual(
      expect.objectContaining({ content: 'Новый текст', title: 'Слой 1' }),
    );
  });

  it('picking a library text creates a new layer with that content and title', async () => {
    configure();
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();
    const { ref, close } = fakeDialogRef();
    dialogOpen.mockReturnValue(ref);

    (fixture.componentInstance as unknown as Testable).addTextToActiveLayer();
    close({
      kind: 'library',
      textBlock: { _id: 'tb-1', name: 'Приветствие', slug: 'privet', tags: [], content: '<p>Здравствуйте</p>', sortOrder: 0 },
    });
    TestBed.flushEffects();
    await flush();

    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]![1]).toEqual(
      expect.objectContaining({ content: '<p>Здравствуйте</p>', title: 'Приветствие' }),
    );
  });

  it('picking a library text while the active layer is an EMPTY text block fills it in place (no new layer)', async () => {
    const emptyTextBlock: StudioBlock = {
      _id: 'blk-empty',
      type: 'text',
      order: 0,
      title: 'Слой 1',
      content: '',
      layout: { page: 1, x: 0.1, y: 0.1, width: 0.4, height: 0.1, zIndex: 1, rotation: 0 },
    } as unknown as StudioBlock;
    configure({ blocks: [emptyTextBlock] });
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();
    const component = fixture.componentInstance as unknown as Testable & { activeLayerId: { set: (id: string) => void } };
    component.activeLayerId.set('blk-empty');

    const { ref, close } = fakeDialogRef();
    dialogOpen.mockReturnValue(ref);
    component.addTextToActiveLayer();
    close({
      kind: 'library',
      textBlock: { _id: 'tb-1', name: 'Приветствие', slug: 'privet', tags: [], content: '<p>Здравствуйте</p>', sortOrder: 0 },
    });
    TestBed.flushEffects();
    await flush();

    expect(create).not.toHaveBeenCalled();
  });

  it('cancelling the picker (undefined) does nothing', async () => {
    configure();
    fixture = TestBed.createComponent(StudioEditorPage);
    await flush();
    const { ref, close } = fakeDialogRef();
    dialogOpen.mockReturnValue(ref);

    (fixture.componentInstance as unknown as Testable).addTextToActiveLayer();
    close(undefined);
    TestBed.flushEffects();
    await flush();

    expect(create).not.toHaveBeenCalled();
  });
});
