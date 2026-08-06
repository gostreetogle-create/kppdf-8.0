import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { extractErrorMessage, type SilentResult } from '../../core/silent-http';
import {
  PermissionsCatalogService,
  type PermissionCatalogEntry,
  type PermissionSection,
} from '../../shared/services/pi-permissions.service';
import {
  PERMISSION_ACTION_RU,
  PERMISSION_GROUP_TITLE_RU,
  ROLE_FORM_COPY,
  permissionLabelRu,
} from './permission-labels.ru';

export interface RoleFormData {
  mode: 'create' | 'edit';
  submit?: (result: RoleFormResult) => Observable<SilentResult<unknown>>;
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

/** Display group for the checkbox matrix (merged API sections). */
export interface PermissionDisplayGroup {
  id: string;
  title: string;
  permissions: PermissionCatalogEntry[];
}

const ACTION_RU = PERMISSION_ACTION_RU;

/** Preferred order of display groups in the role dialog. */
const GROUP_ORDER = [
  'admin',
  'catalog',
  'warehouse',
  'sales',
  'production',
  'procurement',
  'document',
  'finance',
  'system',
] as const;

const SECTION_TO_GROUP: Record<string, string> = {
  user: 'admin',
  role: 'admin',
  product: 'catalog',
  category: 'catalog',
  material: 'catalog',
  warehouse: 'warehouse',
  sales: 'sales',
  production: 'production',
  procurement: 'procurement',
  document: 'document',
  finance: 'finance',
  system: 'system',
};

/**
 * Role create/edit dialog — RU permission matrix, wide layout.
 *
 * Permissions = capability keys (смотреть / менять / полный доступ по разделам),
 * not the nav page-ACL list (pages[]). Grouped for managers.
 */
@Component({
  selector: 'pi-role-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      [title]="data.mode === 'create' ? 'Новая роль' : 'Редактирование роли'"
      [width]="'xl'"
      [maxWidth]="'1120px'"
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
                (input)="onNameInput($event)"
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
                (input)="onLabelInput($event)"
                autocomplete="off"
                data-test="role-form-label"
              />
            </label>

            <label class="field">
              <span class="field__label">Описание</span>
              <input
                class="field__input"
                [value]="description()"
                (input)="onDescriptionInput($event)"
                autocomplete="off"
                data-test="role-form-description"
              />
            </label>
          </div>

          <div class="role-form__permissions">
            <div class="role-form__permissions-head">
              <div class="role-form__permissions-intro">
                <span class="field__label">{{ copy.permissionsHeading }}</span>
                <p class="role-form__logic-hint">{{ copy.logicHint }}</p>
              </div>
              <div class="role-form__permissions-actions">
                <span class="field__hint" data-test="role-form-selected-count"
                  >{{ selectedCount() }} выбрано</span
                >
                <div class="role-form__permissions-btns">
                  <app-pi-button
                    variant="outline"
                    size="sm"
                    type="button"
                    [disabled]="catalogLoading() || !!catalogError() || groups().length === 0"
                    (click)="selectAllPermissions()"
                    data-test="role-form-select-all"
                  >
                    {{ copy.selectAll }}
                  </app-pi-button>
                  <app-pi-button
                    variant="ghost"
                    size="sm"
                    type="button"
                    [disabled]="catalogLoading() || !!catalogError() || selectedCount() === 0"
                    (click)="clearAllPermissions()"
                    data-test="role-form-clear-all"
                  >
                    {{ copy.clearAll }}
                  </app-pi-button>
                </div>
              </div>
            </div>

            @if (catalogLoading()) {
              <p class="text-sm text-muted-foreground">Загрузка каталога…</p>
            } @else if (catalogError(); as err) {
              <p class="field__error" data-test="role-form-catalog-error">{{ err }}</p>
            } @else if (groups().length === 0) {
              <p
                class="text-sm text-muted-foreground"
                role="status"
                data-test="role-form-catalog-empty"
              >
                Каталог прав пуст — обратитесь к администратору. Создание роли без прав не
                рекомендуется.
              </p>
            } @else {
              <div class="role-form__sections" data-test="role-form-sections">
                @for (g of groups(); track g.id) {
                  <fieldset class="role-form__section">
                    <legend class="role-form__section-title">
                      {{ g.title }}
                      <button
                        type="button"
                        class="role-form__select-all"
                        (click)="toggleGroup(g, !groupAllSelected(g))"
                        data-test="role-form-section-toggle"
                      >
                        {{ groupAllSelected(g) ? copy.clearAll : copy.selectAll }}
                      </button>
                    </legend>
                    <div class="role-form__section-grid">
                      @for (p of g.permissions; track p.key) {
                        <label class="role-form__perm">
                          <input
                            type="checkbox"
                            class="role-form__checkbox"
                            [checked]="isSelected(p.key)"
                            (change)="toggleKey(p.key)"
                            data-test="role-form-perm"
                          />
                          <span class="role-form__perm-body">
                            <span class="role-form__perm-title">{{ permissionLabel(p.key) }}</span>
                            <span class="role-form__perm-meta">{{ actionLabel(p.action) }}</span>
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
          [disabled]="!canSubmit() || submitting()"
          (click)="onSubmit()"
          data-test="role-form-submit"
        >
          {{ submitting() ? 'Сохранение…' : data.mode === 'create' ? 'Создать' : 'Сохранить' }}
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
        color: var(--color-muted);
      }

      .field__hint {
        font-size: 11px;
        color: var(--color-muted-foreground);
      }

      .field__input {
        width: 100%;
        padding: 8px 10px;
        font-size: 13px;
        color: var(--color-ink);
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        outline: none;
        transition: border-color 120ms ease;
        font-family: inherit;
      }

      .field__input:focus {
        border-color: var(--color-sunrise-warm);
      }

      .field__input:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .field__error {
        font-size: 12px;
        color: var(--color-destructive);
        margin: 0;
      }

      .role-form__permissions {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .role-form__permissions-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .role-form__permissions-intro {
        min-width: 0;
        flex: 1;
      }

      .role-form__permissions-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
        flex-shrink: 0;
      }

      .role-form__permissions-btns {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 8px;
      }

      .role-form__logic-hint {
        margin: 6px 0 0;
        max-width: 52rem;
        font-size: 12px;
        line-height: 1.45;
        color: var(--color-muted-foreground);
      }

      .role-form__sections {
        display: flex;
        flex-direction: column;
        gap: 0;
        max-height: min(58vh, 560px);
        overflow-y: auto;
        padding-right: 4px;
        border-top: 1px solid var(--color-rule);
      }

      .role-form__section {
        border: none;
        border-bottom: 1px solid var(--color-rule);
        border-radius: 0;
        padding: 14px 4px 16px;
        margin: 0;
      }

      .role-form__section:last-child {
        border-bottom: none;
      }

      .role-form__section-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.04em;
        color: var(--color-ink);
        padding: 0 2px 4px;
      }

      .role-form__select-all {
        font-size: 11px;
        font-family: 'JetBrains Mono', monospace;
        color: var(--color-muted-foreground);
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .role-form__select-all:hover {
        color: var(--color-sunrise-warm);
      }

      .role-form__section-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px 12px;
        margin-top: 10px;
      }

      @media (min-width: 1100px) {
        .role-form__section-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }

      @media (max-width: 720px) {
        .role-form__section-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      .role-form__perm {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 8px;
        border: 1px solid var(--color-rule);
        border-radius: 3px;
        cursor: pointer;
        min-height: 3.25rem;
      }

      .role-form__perm:hover {
        background: var(--color-paper-2);
      }

      .role-form__checkbox {
        margin-top: 2px;
        width: 14px;
        height: 14px;
        accent-color: var(--color-sunrise-warm);
        flex-shrink: 0;
      }

      .role-form__perm-body {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .role-form__perm-title {
        font-size: 12px;
        line-height: 1.35;
        color: var(--color-ink);
      }

      .role-form__perm-meta {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.04em;
        color: var(--color-muted-foreground);
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
  protected readonly submitting = signal(false);
  protected readonly copy = ROLE_FORM_COPY;

  protected permissionLabel(key: string): string {
    return permissionLabelRu(key);
  }

  protected onNameInput(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  protected onLabelInput(event: Event): void {
    this.label.set((event.target as HTMLInputElement).value);
  }

  protected onDescriptionInput(event: Event): void {
    this.description.set((event.target as HTMLInputElement).value);
  }

  /** Raw API sections (kept for tests / debugging). */
  protected readonly sections = signal<PermissionSection[]>([]);
  /** Grouped RU categories for the checkbox matrix. */
  protected readonly groups = signal<PermissionDisplayGroup[]>([]);
  protected readonly catalogLoading = signal(true);
  protected readonly catalogError = signal<string | null>(null);
  protected readonly selected = signal<Set<string>>(new Set(this.data.role?.permissions ?? []));

  constructor() {
    void this.loadCatalog();
  }

  private async loadCatalog(): Promise<void> {
    try {
      const res = await firstValueFrom(this.catalogService.getCatalog());
      if (res.ok) {
        this.sections.set(res.data.sections);
        this.groups.set(regroupPermissions(res.data.sections));
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

  /** Select every permission across all groups. */
  protected selectAllPermissions(): void {
    const next = new Set<string>();
    for (const g of this.groups()) {
      for (const p of g.permissions) {
        next.add(p.key);
      }
    }
    this.selected.set(next);
  }

  /** Clear the entire selection. */
  protected clearAllPermissions(): void {
    this.selected.set(new Set());
  }

  protected groupAllSelected(g: PermissionDisplayGroup): boolean {
    return g.permissions.length > 0 && g.permissions.every((p) => this.selected().has(p.key));
  }

  protected toggleGroup(g: PermissionDisplayGroup, select: boolean): void {
    const next = new Set(this.selected());
    for (const p of g.permissions) {
      if (select) {
        next.add(p.key);
      } else {
        next.delete(p.key);
      }
    }
    this.selected.set(next);
  }

  /** @deprecated use groupAllSelected — kept for existing unit tests */
  protected sectionAllSelected(s: PermissionSection): boolean {
    return s.permissions.length > 0 && s.permissions.every((p) => this.selected().has(p.key));
  }

  /** @deprecated use toggleGroup — kept for existing unit tests */
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

  protected actionLabel(action: string): string {
    return ACTION_RU[action] ?? action;
  }

  protected readonly canSubmit = (): boolean => {
    const name = this.name().trim();
    if (this.data.mode === 'create' && !/^[a-z][a-z0-9_-]{1,63}$/.test(name)) return false;
    if (this.label().trim().length < 2) return false;
    // Block create/edit while catalog is loading or failed; allow empty
    // selection only when catalog actually loaded with sections (or empty
    // catalog with explicit empty-state — still allow name/label-only role).
    if (this.catalogLoading() || this.catalogError()) return false;
    return true;
  };

  protected onSubmit(): void {
    if (this.submitting()) return;
    const result: RoleFormResult = {
      name: this.data.mode === 'create' ? this.name().trim() : (this.data.role?.name ?? ''),
      label: this.label().trim(),
      description: this.description().trim() || undefined,
      permissions: Array.from(this.selected()),
    };
    if (!this.data.submit) {
      this.ref.close(result);
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.data.submit(result).subscribe((res) => {
      if (res.ok) {
        this.submitting.set(false);
        this.ref.close(result);
      } else {
        this.error.set(extractErrorMessage(res.error));
        this.submitting.set(false);
      }
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

/** Merge API sections into manager-facing RU categories. */
export function regroupPermissions(sections: PermissionSection[]): PermissionDisplayGroup[] {
  const buckets = new Map<string, PermissionDisplayGroup>();
  for (const s of sections) {
    const groupId = SECTION_TO_GROUP[s.section] ?? s.section;
    const meta = {
      id: groupId,
      title: PERMISSION_GROUP_TITLE_RU[groupId] ?? groupId,
    };
    const bucket = buckets.get(meta.id) ?? {
      id: meta.id,
      title: meta.title,
      permissions: [],
    };
    bucket.permissions.push(...s.permissions);
    buckets.set(meta.id, bucket);
  }
  const ordered: PermissionDisplayGroup[] = [];
  for (const id of GROUP_ORDER) {
    const g = buckets.get(id);
    if (g?.permissions.length) ordered.push(g);
    buckets.delete(id);
  }
  for (const g of buckets.values()) {
    if (g.permissions.length) ordered.push(g);
  }
  return ordered;
}

export type { PermissionCatalogEntry };
