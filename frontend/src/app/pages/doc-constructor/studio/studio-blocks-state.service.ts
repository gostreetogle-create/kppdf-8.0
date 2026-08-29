import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, groupBy, mergeMap, debounceTime, switchMap, tap, timer, of } from 'rxjs';
import { TemplateBlocksService } from '../../../shared/services/pi-template-blocks.service';
import { extractErrorMessage, type SilentResult } from '../../../core/silent-http';
import {
  blockKey,
  BLOCK_TYPE_LABELS,
  type TemplateBlock,
} from '../../../shared/template-block/template-block.types';
import {
  computeLayerOrder,
  defaultBlockLayout,
  normalizeBlockLayout,
} from '../../../shared/template-block/template-block-layout';
import type { TableColumn } from '../../../shared/services/pi-table-templates.service';
import { PiToastService } from '../../../shared/ui/toast';
import { STUDIO_DOCUMENT_REVISION_CONFLICT } from '../../../shared/services/pi-studio-documents.service';

export type StudioSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const STUDIO_DEFAULT_TABLE_COLUMNS: TableColumn[] = [
  { key: 'name', label: 'Наименование', type: 'text', width: 60, align: 'left' },
  { key: 'qty', label: 'Кол-во', type: 'number', width: 20, align: 'right' },
  { key: 'price', label: 'Цена', type: 'currency', width: 20, align: 'right' },
];

const STUDIO_DEFAULT_TABLE_ROWS: unknown[][] = [['', '', '']];

/**
 * TZ-DOC-STUDIO-401 — studio document block state: load, debounced PATCH autosave,
 * layout batch persist. Pattern copied from builder.page.ts save$ pipeline only.
 */
@Injectable()
export class StudioBlocksStateService {
  private readonly blocksSvc = inject(TemplateBlocksService);
  private readonly toast = inject(PiToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly blocks = signal<TemplateBlock[]>([]);
  readonly loading = signal(false);
  readonly saveStatus = signal<StudioSaveStatus>('idle');
  readonly selectedId = signal<string | null>(null);
  readonly activePage = signal(1);
  readonly maxPage = signal(1);

  private studioDocId: string | null = null;
  private expectedRevision = 1;
  private onRevisionConflict: (() => void) | null = null;
  private onRevisionUpdated: ((revision: number) => void) | null = null;
  private readonly save$ = new Subject<{ _id: string; patch: Partial<TemplateBlock> }>();
  private readonly pendingPatches = new Map<string, Partial<TemplateBlock>>();
  private savedTick = 0;

  constructor() {
    this.save$
      .pipe(
        tap(({ _id, patch }) => {
          const prev = this.pendingPatches.get(_id) ?? {};
          this.pendingPatches.set(_id, { ...prev, ...patch });
          this.saveStatus.set('saving');
        }),
        groupBy((p) => p._id),
        mergeMap((group$) =>
          group$.pipe(
            debounceTime(1500),
            switchMap(({ _id }) => {
              const patch = this.pendingPatches.get(_id);
              if (!patch) return of(null);
              return this.blocksSvc.update(_id, patch).pipe(
                tap((res) => {
                  if (res?.ok) this.pendingPatches.delete(_id);
                }),
              );
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (res) this.handleSaveResult(res);
      });
  }

  init(studioDocId: string, manualPageCount = 1, revision = 1): void {
    this.studioDocId = studioDocId;
    this.expectedRevision = revision;
    this.maxPage.set(Math.max(1, manualPageCount));
    this.activePage.set(1);
    this.blocks.set([]);
    this.selectedId.set(null);
    this.pendingPatches.clear();
    this.saveStatus.set('idle');
    this.load();
  }

  setRevision(revision: number): void {
    this.expectedRevision = revision;
  }

  setRevisionConflictHandler(handler: () => void): void {
    this.onRevisionConflict = handler;
  }

  setRevisionUpdatedHandler(handler: (revision: number) => void): void {
    this.onRevisionUpdated = handler;
  }

  load(): void {
    const id = this.studioDocId;
    if (!id) return;
    this.loading.set(true);
    this.blocksSvc.listByStudioDocument(id).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.ok) {
          this.blocks.set(res.data ?? []);
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.toast.error(extractErrorMessage(err));
      },
    });
  }

  selectBlock(block: TemplateBlock): void {
    this.selectedId.set(blockKey(block));
  }

  clearSelection(): void {
    this.selectedId.set(null);
  }

  selectedBlock(): TemplateBlock | null {
    const id = this.selectedId();
    if (!id) return null;
    return this.blocks().find((b) => blockKey(b) === id) ?? null;
  }

  private nextZIndex(): number {
    const zIndices = this.blocks()
      .map((b) => b.layout?.zIndex ?? 0)
      .filter((z) => Number.isFinite(z));
    return (zIndices.length ? Math.max(...zIndices) : 0) + 1;
  }

  setPageContext(activePage: number, manualPageCount: number): void {
    this.activePage.set(Math.max(1, activePage));
    this.maxPage.set(Math.max(1, manualPageCount));
  }

  private layoutForNewBlock(order: number): NonNullable<TemplateBlock['layout']> {
    return normalizeBlockLayout(
      {
        ...defaultBlockLayout(order),
        page: this.activePage(),
        zIndex: this.nextZIndex(),
      },
      { maxPage: this.maxPage() },
    );
  }

  addTextBlock(): void {
    const id = this.studioDocId;
    if (!id) return;
    const order = this.blocks().length;
    const tempId = crypto.randomUUID();
    const layout = this.layoutForNewBlock(order);
    const optimistic: TemplateBlock = {
      tempId,
      templateId: id,
      parentType: 'studio-document',
      parentId: id,
      type: 'text',
      order,
      content: '',
      isActive: true,
      showLine: false,
      dataBinding: null,
      layout,
    };
    this.blocks.update((arr) => [...arr, optimistic]);
    this.selectedId.set(tempId);

    this.blocksSvc
      .addToStudioDocument(id, {
        type: 'text',
        order,
        content: '',
        isActive: true,
        showLine: false,
        layout,
        expectedRevision: this.expectedRevision,
      })
      .subscribe({
        next: (res) => {
          if (res.ok && res.data) {
            this.bumpRevision();
            this.blocks.update((arr) => arr.map((b) => (b.tempId === tempId ? res.data! : b)));
            this.selectedId.set(blockKey(res.data));
            this.saveStatus.set('saved');
            const myTick = ++this.savedTick;
            timer(2000).subscribe(() => {
              if (myTick === this.savedTick) this.saveStatus.set('idle');
            });
          } else if (!res.ok) {
            this.blocks.update((arr) => arr.filter((b) => b.tempId !== tempId));
            this.selectedId.set(null);
            this.handleMutationFailure(res.error);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.blocks.update((arr) => arr.filter((b) => b.tempId !== tempId));
          this.selectedId.set(null);
          this.handleMutationFailure(err);
        },
      });
  }

  addTableBlock(): void {
    const id = this.studioDocId;
    if (!id) return;
    const order = this.blocks().length;
    const tempId = crypto.randomUUID();
    const layout = this.layoutForNewBlock(order);
    const optimistic: TemplateBlock = {
      tempId,
      templateId: id,
      parentType: 'studio-document',
      parentId: id,
      type: 'table',
      order,
      title: 'Таблица',
      content: '',
      isActive: true,
      showLine: false,
      dataBinding: null,
      settings: {
        tableTemplateColumns: STUDIO_DEFAULT_TABLE_COLUMNS,
        tableTemplateSampleRows: STUDIO_DEFAULT_TABLE_ROWS,
      },
      layout,
    };
    this.blocks.update((arr) => [...arr, optimistic]);
    this.selectedId.set(tempId);

    this.blocksSvc
      .addToStudioDocument(id, {
        type: 'table',
        order,
        title: 'Таблица',
        content: '',
        isActive: true,
        showLine: false,
        settings: optimistic.settings,
        layout,
        expectedRevision: this.expectedRevision,
      })
      .subscribe({
        next: (res) => {
          if (res.ok && res.data) {
            this.bumpRevision();
            this.blocks.update((arr) => arr.map((b) => (b.tempId === tempId ? res.data! : b)));
            this.selectedId.set(blockKey(res.data));
            this.saveStatus.set('saved');
            const myTick = ++this.savedTick;
            timer(2000).subscribe(() => {
              if (myTick === this.savedTick) this.saveStatus.set('idle');
            });
          } else if (!res.ok) {
            this.blocks.update((arr) => arr.filter((b) => b.tempId !== tempId));
            this.selectedId.set(null);
            this.handleMutationFailure(res.error);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.blocks.update((arr) => arr.filter((b) => b.tempId !== tempId));
          this.selectedId.set(null);
          this.handleMutationFailure(err);
        },
      });
  }

  addImageBlock(file: File): void {
    const id = this.studioDocId;
    if (!id) return;
    const order = this.blocks().length;
    const tempId = crypto.randomUUID();
    const layout = this.layoutForNewBlock(order);
    const localUrl = URL.createObjectURL(file);
    const optimistic: TemplateBlock = {
      tempId,
      templateId: id,
      parentType: 'studio-document',
      parentId: id,
      type: 'image',
      order,
      title: file.name.replace(/\.[^.]+$/, ''),
      content: '',
      isActive: true,
      showLine: false,
      dataBinding: null,
      layout,
      settings: { imageUrl: localUrl, overlay: true },
    };
    this.blocks.update((arr) => [...arr, optimistic]);
    this.selectedId.set(tempId);

    this.blocksSvc
      .addToStudioDocument(id, {
        type: 'image',
        order,
        title: optimistic.title,
        content: '',
        isActive: true,
        showLine: false,
        layout,
        settings: { overlay: true },
        expectedRevision: this.expectedRevision,
      })
      .subscribe({
        next: (res) => {
          if (res.ok && res.data?._id) {
            this.bumpRevision();
            const persistedId = res.data._id;
            this.blocks.update((arr) =>
              arr.map((b) =>
                b.tempId === tempId
                  ? { ...res.data!, settings: { overlay: true, imageUrl: localUrl } }
                  : b,
              ),
            );
            this.selectedId.set(blockKey(res.data));
            this.blocksSvc.uploadImage(persistedId, file).subscribe({
              next: (uploadRes) => {
                URL.revokeObjectURL(localUrl);
                if (uploadRes.ok) {
                  this.blocks.update((arr) =>
                    arr.map((b) =>
                      b._id === persistedId
                        ? {
                            ...b,
                            settings: {
                              ...(b.settings ?? {}),
                              imageUrl: uploadRes.data.url,
                            },
                          }
                        : b,
                    ),
                  );
                  this.saveStatus.set('saved');
                } else {
                  this.toast.error(extractErrorMessage(uploadRes.error));
                }
              },
              error: (err: HttpErrorResponse) => {
                URL.revokeObjectURL(localUrl);
                this.toast.error(extractErrorMessage(err));
              },
            });
          } else if (!res.ok) {
            URL.revokeObjectURL(localUrl);
            this.blocks.update((arr) => arr.filter((b) => b.tempId !== tempId));
            this.selectedId.set(null);
            this.handleMutationFailure(res.error);
          }
        },
        error: (err: HttpErrorResponse) => {
          URL.revokeObjectURL(localUrl);
          this.blocks.update((arr) => arr.filter((b) => b.tempId !== tempId));
          this.selectedId.set(null);
          this.handleMutationFailure(err);
        },
      });
  }

  toggleLock(_id: string, locked: boolean): void {
    this.patchBlock(_id, { locked });
  }

  /** Send one block to the bottom of the z-order stack. */
  sendToBack(blockId: string): void {
    const id = this.studioDocId;
    if (!id) return;

    const entries = this.blocks()
      .filter((b) => !!b.layout)
      .map((b) => ({ blockId: blockKey(b), zIndex: b.layout!.zIndex ?? 1 }));
    const targetIds = new Set<string>();
    const target = this.blocks().find((b) => b._id === blockId);
    if (target) targetIds.add(blockKey(target));
    if (targetIds.size === 0) return;

    const next = computeLayerOrder(entries, targetIds, 'back');
    const updates = this.blocks()
      .filter((b) => !!b.layout && b._id)
      .map((b) => {
        const zIndex = next.get(blockKey(b)) ?? b.layout!.zIndex ?? 1;
        if ((b.layout!.zIndex ?? 1) === zIndex) return null;
        return {
          blockId: b._id!,
          layout: normalizeBlockLayout({ ...b.layout!, zIndex }),
        };
      })
      .filter(
        (u): u is { blockId: string; layout: NonNullable<TemplateBlock['layout']> } => u !== null,
      );
    if (updates.length === 0) return;

    const previous = this.blocks();
    const nextById = new Map(updates.map((u) => [u.blockId, u.layout]));
    this.blocks.update((arr) =>
      arr.map((b) => {
        const layout = b._id ? nextById.get(b._id) : undefined;
        return layout ? { ...b, layout } : b;
      }),
    );
    this.saveStatus.set('saving');

    this.blocksSvc.updateStudioLayouts(id, updates, this.expectedRevision).subscribe({
      next: (res) => {
        if (res.ok) {
          this.bumpRevision();
          if (res.data) this.blocks.set(res.data);
          this.saveStatus.set('saved');
          const myTick = ++this.savedTick;
          timer(2000).subscribe(() => {
            if (myTick === this.savedTick) this.saveStatus.set('idle');
          });
        } else {
          this.blocks.set(previous);
          this.saveStatus.set('error');
          this.handleMutationFailure(res.error);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.blocks.set(previous);
        this.saveStatus.set('error');
        this.handleMutationFailure(err);
      },
    });
  }

  /** Reassign zIndex after layers-panel drag (top-to-bottom = front-to-back). */
  applyLayerZOrder(blockIdsTopToBottom: string[]): void {
    const id = this.studioDocId;
    if (!id) return;

    const n = blockIdsTopToBottom.length;
    const updates = blockIdsTopToBottom
      .map((blockId, index) => {
        const block = this.blocks().find((b) => b._id === blockId);
        if (!block?.layout || !block._id) return null;
        const zIndex = Math.max(0, n - 1 - index);
        if ((block.layout.zIndex ?? 0) === zIndex) return null;
        return {
          blockId: block._id,
          layout: normalizeBlockLayout({ ...block.layout, zIndex }),
        };
      })
      .filter(
        (u): u is { blockId: string; layout: NonNullable<TemplateBlock['layout']> } => u !== null,
      );
    if (updates.length === 0) return;

    const previous = this.blocks();
    const nextById = new Map(updates.map((u) => [u.blockId, u.layout]));
    this.blocks.update((arr) =>
      arr.map((b) => {
        const layout = b._id ? nextById.get(b._id) : undefined;
        return layout ? { ...b, layout } : b;
      }),
    );
    this.saveStatus.set('saving');

    this.blocksSvc.updateStudioLayouts(id, updates, this.expectedRevision).subscribe({
      next: (res) => {
        if (res.ok) {
          this.bumpRevision();
          if (res.data) this.blocks.set(res.data);
          this.saveStatus.set('saved');
          const myTick = ++this.savedTick;
          timer(2000).subscribe(() => {
            if (myTick === this.savedTick) this.saveStatus.set('idle');
          });
        } else {
          this.blocks.set(previous);
          this.saveStatus.set('error');
          this.handleMutationFailure(res.error);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.blocks.set(previous);
        this.saveStatus.set('error');
        this.handleMutationFailure(err);
      },
    });
  }

  blockTypeLabel(block: TemplateBlock): string {
    return BLOCK_TYPE_LABELS[block.type] ?? block.type;
  }

  patchBlock(_id: string, patch: Partial<TemplateBlock>): void {
    this.blocks.update((arr) => arr.map((b) => (b._id === _id ? { ...b, ...patch } : b)));
    this.save$.next({ _id, patch });
  }

  onLayoutChanges(
    changes: Array<{
      block: TemplateBlock;
      layout: NonNullable<TemplateBlock['layout']>;
    }>,
  ): void {
    const id = this.studioDocId;
    if (!id || changes.length === 0) return;

    const updates = changes
      .map((c) => ({ blockId: c.block._id, layout: c.layout }))
      .filter(
        (u): u is { blockId: string; layout: NonNullable<TemplateBlock['layout']> } => !!u.blockId,
      );
    if (updates.length === 0) return;

    const previous = this.blocks();
    const nextById = new Map(updates.map((u) => [u.blockId, u.layout]));
    this.blocks.update((arr) =>
      arr.map((b) => {
        const layout = b._id ? nextById.get(b._id) : undefined;
        return layout ? { ...b, layout } : b;
      }),
    );
    this.saveStatus.set('saving');

    this.blocksSvc.updateStudioLayouts(id, updates, this.expectedRevision).subscribe({
      next: (res) => {
        if (res.ok) {
          this.bumpRevision();
          if (res.data) this.blocks.set(res.data);
          this.saveStatus.set('saved');
          const myTick = ++this.savedTick;
          timer(2000).subscribe(() => {
            if (myTick === this.savedTick) this.saveStatus.set('idle');
          });
        } else {
          this.blocks.set(previous);
          this.saveStatus.set('error');
          this.handleMutationFailure(res.error);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.blocks.set(previous);
        this.saveStatus.set('error');
        this.handleMutationFailure(err);
      },
    });
  }

  deleteBlock(blockId: string): void {
    const target = this.blocks().find((b) => b._id === blockId);
    if (target?.locked) {
      this.toast.error('Блок заблокирован — разблокируйте в панели «Слои»');
      return;
    }
    const previous = this.blocks();
    this.blocks.update((arr) => arr.filter((b) => b._id !== blockId));
    if (this.selectedId() === blockId) this.selectedId.set(null);

    this.blocksSvc.remove(blockId).subscribe({
      next: (res) => {
        if (!res.ok) {
          this.blocks.set(previous);
          this.toast.error(extractErrorMessage(res.error));
        }
      },
      error: (err: HttpErrorResponse) => {
        this.blocks.set(previous);
        this.toast.error(extractErrorMessage(err));
      },
    });
  }

  private handleSaveResult(res: SilentResult<TemplateBlock>): void {
    if (res.ok) {
      this.saveStatus.set('saved');
      const myTick = ++this.savedTick;
      timer(2000).subscribe(() => {
        if (myTick === this.savedTick) this.saveStatus.set('idle');
      });
      return;
    }
    this.saveStatus.set('error');
    this.handleMutationFailure(res.error);
  }

  private bumpRevision(): void {
    this.expectedRevision += 1;
    this.onRevisionUpdated?.(this.expectedRevision);
  }

  private handleMutationFailure(err: HttpErrorResponse): void {
    if (this.isRevisionConflict(err)) {
      this.onRevisionConflict?.();
      return;
    }
    this.toast.error(extractErrorMessage(err));
  }

  private isRevisionConflict(err: HttpErrorResponse): boolean {
    if (err.status !== 409) return false;
    const body = err.error as { code?: string } | null;
    return body?.code === STUDIO_DOCUMENT_REVISION_CONFLICT;
  }
}
