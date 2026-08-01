import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import {
  PermissionsCatalogService,
  type PermissionCatalogEntry,
  type PermissionSection,
} from '../../shared/services/pi-permissions.service';

export interface RoleFormData {
  mode: 'create' | 'edit';
  role?: {
    id: string;
    name: string;
    label: string;
    description?: string;
    permissions: string[];
  };
}

export interface RoleFormResult {
  name: string;
  label: string;
  description?: string;
  permissions: string[];
}

/**
 * TZ-256.B + TZ-257.B — role create/edit form dialog.
 *
 * Create mode requires `name` (lowercase slug); edit mode locks the
 * original name. Permissions are edited via a checkbox catalogue
 * grouped by section, fetched from `GET /api/admin/permissions` — the
 * single source of truth shared with the backend seeder/validator —
 * instead of a free-text comma list.
 *
 * Rendered inside `PiDialogComponent` (variant=form) via the
 * `PI_DIALOG_DATA` / `PI_DIALOG_REF` tokens from `PiDialogService.open()`.
 */
@Component({
  selector: 'pi-role-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      [title]="data.mode === 'create' ? 'Новая роль' : 'Редактирование роли'"
      [width]="'lg'"
      variant="form"
      [showClose]="true"
      [animate]="false"
    >
      <div body>
        <div class="role-form">
          <div class="role-form__grid">
            <label class="field">
              <span class="field__label">Системное имя</span>
              <input
                class="field__input"
                [value]="name()"
                [disabled]="data.mode === 'edit'"
                (input)="name.set(($event.target as HTMLInputElement).value)"
                autocomplete="off"
                spellcheck="false"
                data-test="role-form-name"
              />
              @if (data.mode === 'create') {
                <span class="field__hint">строчные a–z, цифры, «_», «-» (мин. 2 символа)</span>
              }
            </label>

            <label class="field">
              <span class="field__label">Название</span>
              <input
                class="field__input"
                [value]="label()"
                (input)="label.set(($event.target as HTMLInputElement).value)"
                autocomplete="off"
                data-test="role-form-label"
              />
            </label>

            <label class="field">
              <span class="field__label">Описание</span>
              <input
                class="field__input"
                [value]="description()"
                (input)="description.set(($event.target as HTMLInputElement).value)"
                autocomplete="off"
                data-test="role-form-description"
              />
            </label>
          </div>

          <div class="role-form__permissions">
            <div class="role-form__permissions-head">
              <span class="field__label">Permissions</span>
              <span class="field__hint">{{ selectedCount() }} выбрано</span>
            </div>

            @if (catalogLoading()) {
              <p class="text-sm text-muted-foreground">Загрузка каталога…</p>
            } @else if (catalogError(); as err) {
              <p class="field__error" data-test="role-form-catalog-error">{{ err }}</p>
            } @else {
              <div class="role-form__sections">
                @for (s of sections(); track s.section) {
                  <fieldset class="role-form__section">
                    <legend class="role-form__section-title">
                      {{ sectionLabel(s.section) }}
                      <button
                        type="button"
                        class="role-form__select-all"
                        (click)="toggleSection(s, !sectionAllSelected(s))"
                        data-test="role-form-section-toggle"
                      >
                        {{ sectionAllSelected(s) ? 'снять все' : 'все' }}
                      </button>
                    </legend>
                    <div class="role-form__section-grid">
                      @for (p of s.permissions; track p.key) {
                        <label class="role-form__perm">
                          <input
                            type="checkbox"
                            class="role-form__checkbox"
                            [checked]="isSelected(p.key)"
                            (change)="toggleKey(p.key)"
                            data-test="role-form-perm"
                          />
                          <span class="role-form__perm-body">
                            <span class="role-form__perm-key">{{ p.key }}</span>
                            <span class="role-form__perm-desc">{{ p.description }}</span>
                          </span>
                        </label>
                      }
                    </div>
                  </fieldset>
                }
              </div>
            }
          </div>

          @if (error()) {
            <p class="field__error" data-test="role-form-error">{{ error() }}</p>
          }
        </div>
      </div>
      <div footer>
        <app-pi-button variant="ghost" size="sm" (click)="onCancel()">Отмена</app-pi-button>
        <app-pi-button
          variant="default"
          size="sm"
          [disabled]="!canSubmit()"
          (click)="onSubmit()"
          data-test="role-form-submit"
        >
          {{ data.mode === 'create' ? 'Создать' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
  styles: [
    `
      .role-form {
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 4px 0;
      }

      .role-form__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }

      .role-form__grid .field:first-child {
        grid-column: 1 / -1;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .field__label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-muted, #7f7663);
      }

      .field__hint {
        font-size: 11px;
        color: var(--color-muted-foreground, #8a8172);
      }

      .field__input {
        width: 100%;
        padding: 8px 10px;
        font-size: 13px;
        color: var(--color-ink, #191c1d);
        background: var(--color-paper, #f8f9fa);
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 2px;
        outline: none;
        transition: border-color 120ms ease;
        font-family: inherit;
      }

      .field__input:focus {
        border-color: var(--color-sunrise-warm, #735c00);
      }

      .field__input:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .field__error {
        font-size: 12px;
        color: var(--color-destructive, #b91c1c);
        margin: 0;
      }

      .role-form__permissions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .role-form__permissions-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
      }

      .role-form__sections {
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-height: 300px;
        overflow-y: auto;
        padding-right: 4px;
      }

      .role-form__section {
        border: 1px solid var(--color-rule, #d0c5af);
        border-radius: 3px;
        padding: 10px 12px 12px;
        margin: 0;
      }

      .role-form__section-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--color-ink, #191c1d);
        padding: 0 4px;
      }

      .role-form__select-all {
        font-size: 10px;
        font-family: 'JetBrains Mono', monospace;
        color: var(--color-muted-foreground, #8a8172);
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .role-form__select-all:hover {
        color: var(--color-sunrise-warm, #735c00);
      }

      .role-form__section-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px 14px;
        margin-top: 8px;
      }

      .role-form__perm {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 4px 6px;
        border-radius: 2px;
        cursor: pointer;
      }

      .role-form__perm:hover {
        background: var(--color-paper-2, #f0ece2);
      }

      .role-form__checkbox {
        margin-top: 2px;
        width: 14px;
        height: 14px;
        accent-color: var(--color-sunrise-warm, #735c00);
        flex-shrink: 0;
      }

      .role-form__perm-body {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
      }

      .role-form__perm-key {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: var(--color-ink, #191c1d);
        word-break: break-all;
      }

      .role-form__perm-desc {
        font-size: 11px;
        color: var(--color-muted-foreground, #8a8172);
      }
    `,
  ],
})
export class RoleFormDialogComponent {
  readonly data = inject<RoleFormData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<RoleFormResult>>(PI_DIALOG_REF);
  private readonly catalogService = inject(PermissionsCatalogService);

  protected readonly name = signal<string>(this.data.role?.name ?? '');
  protected readonly label = signal<string>(this.data.role?.label ?? '');
  protected readonly description = signal<string>(this.data.role?.description ?? '');
  protected readonly error = signal<string | null>(null);

  protected readonly sections = signal<PermissionSection[]>([]);
  protected readonly catalogLoading = signal(true);
  protected readonly catalogError = signal<string | null>(null);
  protected readonly selected = signal<Set<string>>(
    new Set(this.data.role?.permissions ?? []),
  );

  constructor() {
    void this.loadCatalog();
  }

  private async loadCatalog(): Promise<void> {
    try {
      const res = await firstValueFrom(this.catalogService.getCatalog());
      if (res.ok) {
        this.sections.set(res.data.sections);
        this.catalogError.set(null);
      } else {
        this.catalogError.set(this.describe(res.error));
      }
    } catch (err) {
      this.catalogError.set(this.describe(err));
    } finally {
      this.catalogLoading.set(false);
    }
  }

  protected readonly selectedCount = (): number => this.selected().size;

  protected isSelected(key: string): boolean {
    return this.selected().has(key);
  }

  protected toggleKey(key: string): void {
    const next = new Set(this.selected());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.selected.set(next);
  }

  protected sectionAllSelected(s: PermissionSection): boolean {
    return (
      s.permissions.length > 0 &&
      s.permissions.every((p) => this.selected().has(p.key))
    );
  }

  protected toggleSection(s: PermissionSection, select: boolean): void {
    const next = new Set(this.selected());
    for (const p of s.permissions) {
      if (select) {
        next.add(p.key);
      } else {
        next.delete(p.key);
      }
    }
    this.selected.set(next);
  }

  /** Human-readable Russian label for a permission section key. */
  protected sectionLabel(section: string): string {
    const labels: Record<string, string> = {
      user: 'Пользователи и роли',
      role: 'Пользователи и роли',
      product: 'Продукция',
      category: 'Категории',
      material: 'Материалы',
      production: 'Производство',
      warehouse: 'Склад',
      procurement: 'Закупки',
      sales: 'Продажи',
      document: 'Документы',
      finance: 'Финансы',
      system: 'Система',
    };
    return labels[section] ?? section;
  }

  protected readonly canSubmit = (): boolean => {
    const name = this.name().trim();
    if (this.data.mode === 'create' && !/^[a-z][a-z0-9_-]{1,63}$/.test(name)) return false;
    if (this.label().trim().length < 2) return false;
    return true;
  };

  protected onSubmit(): void {
    const permissions = Array.from(this.selected());
    this.ref.close({
      name: this.data.mode === 'create' ? this.name().trim() : (this.data.role?.name ?? ''),
      label: this.label().trim(),
      description: this.description().trim() || undefined,
      permissions,
    });
  }

  protected onCancel(): void {
    this.ref.close();
  }

  private describe(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }
}

// Re-export for the page's type imports.
export type { PermissionCatalogEntry };
