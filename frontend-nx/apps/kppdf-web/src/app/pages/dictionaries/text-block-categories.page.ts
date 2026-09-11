import { ChangeDetectionStrategy, Component, DestroyRef, Injector, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PiTextBlockCategoriesService, type TextBlockCategory } from '@kppdf/data-access';
import { PiPageChromeComponent } from '@kppdf/ui/page';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogService, AlertDialogComponent } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { extractErrorMessage } from '@kppdf/util-http';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import {
  TextBlockCategoryFormDialogComponent,
  type TextBlockCategoryFormDialogData,
} from './text-block-category-form-dialog.component';

/**
 * TZ-NX-TEXT-CAT-NX-CRUD — `/dictionaries/text-block-categories`.
 *
 * Fixes the dead NX nav link (`nav-categories.ts` already pointed here;
 * no route existed). Master-detail, not a generic flat registry: roots
 * on top, subcategories of the SELECTED root below. "Создать
 * подкатегорию" only ever appears under a selected ROOT — the UI
 * structurally cannot create depth > 1 (BE `assertValidParent` is the
 * server-side backstop, TZ-NX-TEXT-CAT-PARENT).
 */
@Component({
  selector: 'pi-text-block-categories-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageChromeComponent, ButtonComponent, PiStatusBannerComponent],
  template: `
    <main class="px-panel-inset py-6 space-y-6" data-test="text-block-categories-page">
      <app-pi-page-chrome [crumbs]="[{ label: 'Справочники' }, { label: 'Категории текстов' }]">
        <div actions>
          <app-pi-button variant="default" size="sm" (click)="onCreateRoot()" data-test="tbc-create-root">
            Создать категорию
          </app-pi-button>
        </div>
      </app-pi-page-chrome>

      @if (status() === 'loading') { <div class="text-sm text-muted-foreground">Загрузка…</div> }
      @if (status() === 'error') {
        <app-pi-status-banner tone="destructive" [message]="error()" actionLabel="Повторить" (action)="loadRoots()" />
      }

      @if (status() === 'success') {
        @if (roots().length === 0) {
          <div class="pi-dashed-panel p-8 text-center" data-test="tbc-roots-empty">Категорий пока нет.</div>
        } @else {
          <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised" data-test="tbc-roots">
            @for (root of roots(); track root._id) {
              <div
                class="flex items-center justify-between gap-4 px-4 py-3 hairline-bottom cursor-pointer pi-focus-ring"
                [class.bg-paper-2]="selectedRoot()?._id === root._id"
                role="button"
                tabindex="0"
                [attr.data-test]="'tbc-root-' + root._id"
                (click)="selectRoot(root)"
                (keydown.enter)="selectRoot(root)"
              >
                <div class="min-w-0">
                  <div class="font-medium flex items-center gap-2 flex-wrap">
                    <span>{{ root.name }}</span>
                    @if (root.isSystem) { <span class="text-xs text-muted-foreground">системная</span> }
                    @if (root.isDefault) { <span class="text-xs text-muted-foreground">по умолчанию</span> }
                    @if (!root.isActive) { <span class="text-xs text-destructive">неактивна</span> }
                  </div>
                  @if (root.description) {
                    <div class="text-xs text-muted-foreground">{{ root.description }}</div>
                  }
                </div>
                @if (!root.isSystem) {
                  <div class="flex items-center gap-2 shrink-0">
                    <button class="pi-icon-btn pi-focus-ring" type="button" aria-label="Редактировать" title="Редактировать" [attr.data-test]="'tbc-edit-' + root._id" (click)="$event.stopPropagation(); onEdit(root)">✎</button>
                    <button class="pi-icon-btn pi-icon-btn-danger pi-focus-ring" type="button" aria-label="Удалить" title="Удалить" [attr.data-test]="'tbc-delete-' + root._id" (click)="$event.stopPropagation(); onDelete(root)">×</button>
                  </div>
                }
              </div>
            }
          </div>
        }

        <div class="flex items-center justify-between gap-4">
          <h2 class="text-sm font-medium text-muted-foreground" data-test="tbc-subs-title">
            @if (selectedRoot(); as sel) {
              Подкатегории «{{ sel.name }}»
            } @else {
              Выберите категорию, чтобы увидеть подкатегории
            }
          </h2>
          @if (selectedRoot()) {
            <app-pi-button variant="secondary" size="sm" (click)="onCreateSub()" data-test="tbc-create-sub">
              Создать подкатегорию
            </app-pi-button>
          }
        </div>

        @if (selectedRoot()) {
          @if (subLoading()) { <div class="text-sm text-muted-foreground">Загрузка…</div> }
          @if (!subLoading() && subs().length === 0) {
            <div class="pi-dashed-panel p-8 text-center" data-test="tbc-subs-empty">Подкатегорий пока нет.</div>
          }
          @if (!subLoading() && subs().length > 0) {
            <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised" data-test="tbc-subs">
              @for (sub of subs(); track sub._id) {
                <div class="flex items-center justify-between gap-4 px-4 py-3 hairline-bottom" [attr.data-test]="'tbc-sub-' + sub._id">
                  <div class="min-w-0">
                    <div class="font-medium flex items-center gap-2 flex-wrap">
                      <span>{{ sub.name }}</span>
                      @if (!sub.isActive) { <span class="text-xs text-destructive">неактивна</span> }
                    </div>
                    @if (sub.description) {
                      <div class="text-xs text-muted-foreground">{{ sub.description }}</div>
                    }
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <button class="pi-icon-btn pi-focus-ring" type="button" aria-label="Редактировать" title="Редактировать" [attr.data-test]="'tbc-edit-' + sub._id" (click)="onEdit(sub)">✎</button>
                    <button class="pi-icon-btn pi-icon-btn-danger pi-focus-ring" type="button" aria-label="Удалить" title="Удалить" [attr.data-test]="'tbc-delete-' + sub._id" (click)="onDelete(sub)">×</button>
                  </div>
                </div>
              }
            </div>
          }
        }
      }
    </main>
  `,
})
export class TextBlockCategoriesPage implements OnInit {
  private readonly service = inject(PiTextBlockCategoriesService);
  private readonly dialog = inject(PiDialogService);
  private readonly toast = inject(PiToastService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить категории.');
  readonly roots = signal<readonly TextBlockCategory[]>([]);
  readonly selectedRoot = signal<TextBlockCategory | null>(null);
  readonly subs = signal<readonly TextBlockCategory[]>([]);
  readonly subLoading = signal(false);

  ngOnInit(): void {
    this.loadRoots();
  }

  loadRoots(): void {
    this.status.set('loading');
    void firstValueFrom(this.service.list({ rootsOnly: true })).then((result) => {
      if (!result.ok) {
        this.error.set(extractErrorMessage(result.error));
        this.status.set('error');
        return;
      }
      this.roots.set(result.data);
      this.status.set('success');
      const selected = this.selectedRoot();
      if (selected) {
        const stillThere = result.data.find((r) => r._id === selected._id);
        this.selectedRoot.set(stillThere ?? null);
        if (!stillThere) this.subs.set([]);
      }
    });
  }

  selectRoot(root: TextBlockCategory): void {
    if (this.selectedRoot()?._id === root._id) return;
    this.selectedRoot.set(root);
    this.loadSubs(root._id);
  }

  private loadSubs(parentId: string): void {
    this.subLoading.set(true);
    void firstValueFrom(this.service.list({ parentId })).then((result) => {
      this.subLoading.set(false);
      if (result.ok) {
        this.subs.set(result.data);
      } else {
        this.toast.error(extractErrorMessage(result.error));
      }
    });
  }

  onCreateRoot(): void {
    this.openForm({ mode: 'create' }, () => this.loadRoots());
  }

  onCreateSub(): void {
    const root = this.selectedRoot();
    if (!root) return;
    this.openForm({ mode: 'create', parentId: root._id, parentName: root.name }, () => this.loadSubs(root._id));
  }

  onEdit(category: TextBlockCategory): void {
    const parentId = category.parentId;
    const reload = parentId ? () => this.loadSubs(parentId) : () => this.loadRoots();
    this.openForm({ mode: 'edit', category }, reload);
  }

  private openForm(data: TextBlockCategoryFormDialogData, onSaved: () => void): void {
    const ref = this.dialog.open<TextBlockCategory | undefined>(TextBlockCategoryFormDialogComponent, {
      data,
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (result) => {
      if (!result) return;
      this.toast.success(data.mode === 'edit' ? 'Категория обновлена' : 'Категория создана');
      onSaved();
    });
  }

  onDelete(category: TextBlockCategory): void {
    const ref = this.dialog.open<boolean>(AlertDialogComponent, {
      data: {
        title: `Удалить «${category.name}»?`,
        confirmLabel: 'Удалить',
        cancelLabel: 'Отмена',
        variant: 'destructive',
      },
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (ok) => {
      if (ok !== true) return;
      void firstValueFrom(this.service.remove(category._id)).then((result) => {
        if (!result.ok) {
          this.toast.error(extractErrorMessage(result.error));
          return;
        }
        this.toast.success('Категория удалена');
        if (category.parentId) {
          this.loadSubs(category.parentId);
        } else {
          this.loadRoots();
        }
      });
    });
  }
}
