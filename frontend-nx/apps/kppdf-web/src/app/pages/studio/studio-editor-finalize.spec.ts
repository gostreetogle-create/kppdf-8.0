import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import {
  PiCounterpartiesService,
  PiDocTypesService,
  PiOrdersService,
  PiOrganizationsService,
  PiQuotationsService,
  PiStudioBlocksService,
  PiStudioDocumentsService,
  type StudioDocument,
} from '@kppdf/data-access';
import { PiDialogService, AlertDialogComponent } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';
import { StudioEditorPage } from './studio-editor.page';

/**
 * TZ-NX-NO-NATIVE-CONFIRM — focused regression: `onFinalize()` must open
 * the Pi `AlertDialogComponent` (destructive confirm) instead of calling
 * the native browser confirm dialog synchronously, and must not call the
 * finalize API before the dialog resolves.
 *
 * StudioEditorPage has 15 injected services and a heavy child-component
 * template (each panel pulls in its own catalog/HTTP services). This spec
 * deliberately never renders it (no `detectChanges()` / `flushEffects()` —
 * both force a full `ApplicationRef.tick()` that would try to instantiate
 * every nested panel and its services) and drives `onFinalize()` directly
 * against the public `document` signal instead — the "spy on dialog.open"
 * fallback this TZ documents for a page this size. The confirm/cancel →
 * finalize continuation itself (driven by `onDialogCloseOnce`'s effect) is
 * covered in isolation by `../on-dialog-close-once.spec.ts`, since that is
 * the exact same gate `onFinalize` delegates to here.
 */
const draftDoc = (): StudioDocument =>
  ({
    _id: 'doc-1',
    name: 'КП тест',
    status: 'draft',
    context: {},
  }) as unknown as StudioDocument;

describe('StudioEditorPage.onFinalize — no native confirm', () => {
  let fixture: ComponentFixture<StudioEditorPage>;
  let dialog: { open: jest.Mock };
  let documentsApi: { finalize: jest.Mock };

  beforeEach(async () => {
    dialog = { open: jest.fn() };
    documentsApi = {
      finalize: jest.fn().mockReturnValue(
        of({ ok: true, data: { studioDocument: draftDoc(), generatedDocument: { name: 'КП тест' } } }),
      ),
    };
    const emptyList = (data: unknown = []) => jest.fn().mockReturnValue(of({ ok: true, data }));

    await TestBed.configureTestingModule({
      imports: [StudioEditorPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } },
          },
        },
        { provide: PiStudioDocumentsService, useValue: documentsApi },
        { provide: PiStudioBlocksService, useValue: { updateLayouts: jest.fn() } },
        { provide: PiCounterpartiesService, useValue: { list: emptyList({ items: [] }) } },
        { provide: PiQuotationsService, useValue: { list: emptyList([]) } },
        { provide: PiOrdersService, useValue: { list: emptyList([]) } },
        { provide: PiOrganizationsService, useValue: {} },
        { provide: PiDocTypesService, useValue: { list: emptyList([]) } },
        { provide: PiToastService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: PiDialogService, useValue: dialog },
        { provide: ShellToolRailService, useValue: { setTools: jest.fn(), clear: jest.fn() } },
      ],
    }).compileComponents();

    // Deliberately no fixture.detectChanges() / TestBed.flushEffects() — see file-level comment.
    fixture = TestBed.createComponent(StudioEditorPage);
    fixture.componentInstance.document.set(draftDoc());
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('opens the Pi AlertDialog (destructive) instead of a native browser confirm', () => {
    fixture.componentInstance.onFinalize();

    expect(dialog.open).toHaveBeenCalledTimes(1);
    const [component, config] = dialog.open.mock.calls[0] as [unknown, { data: Record<string, unknown> }];
    expect(component).toBe(AlertDialogComponent);
    expect(config.data).toMatchObject({
      title: 'Отправить документ в архив?',
      confirmLabel: 'В архив',
      cancelLabel: 'Отмена',
      variant: 'destructive',
    });
  });

  it('does not call finalize before the dialog resolves', () => {
    fixture.componentInstance.onFinalize();
    expect(documentsApi.finalize).not.toHaveBeenCalled();
  });

  it('does nothing when the document is not in draft status (already archived)', () => {
    fixture.componentInstance.document.set({ ...draftDoc(), status: 'final' } as StudioDocument);
    fixture.componentInstance.onFinalize();
    expect(dialog.open).not.toHaveBeenCalled();
  });
});
