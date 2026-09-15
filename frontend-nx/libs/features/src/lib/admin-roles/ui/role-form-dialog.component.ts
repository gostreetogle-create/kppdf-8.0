import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent } from '@kppdf/ui/dialog';
import type { SilentResult } from '@kppdf/util-http';
import type { AdminPermissionSection as PermissionSection } from '@kppdf/data-access/admin';
import { ROLE_FORM_COPY } from './permission-labels.ru';
import { RoleFormFacade, type PermissionDisplayGroup, type PageDisplayGroup } from '../role-form.facade';

export interface RoleFormData {
  mode: 'create' | 'edit' | 'view';
  submit?: (result: RoleFormResult) => Observable<SilentResult<unknown>>;
  role?: {
    id: string;
    name: string;
    label: string;
    description?: string;
    permissions: string[];
    pages?: string[];
    isSystem?: boolean;
  };
}

export interface RoleFormResult {
  name: string;
  label: string;
  description?: string;
  permissions: string[];
  pages: string[];
}

export type { PermissionDisplayGroup, PageDisplayGroup };

/**
 * Role create/edit/view dialog — RU permission + pageKey matrix.
 *
 * - `permissions` = capability keys (смотреть / менять / полный доступ)
 * - `pages` = nav pageKey ACL (Клиенты, Снабжение, …)
 * - `mode: 'view'` = system role read-only; after catalog load every
 *   pageKey + capability is shown checked+disabled (TZ-ADMIN-302).
 *   Stored `permissions: ['*']` alone would leave the matrix empty.
 */
@Component({
  selector: 'pi-role-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RoleFormFacade],
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      [title]="dialogTitle()"
      [width]="'xl'"
      [maxWidth]="'1120px'"
      variant="form"
      [showClose]="true"
      [animate]="false"
    >
      <div body>
        <div class="role-form">
          @if (readOnly()) {
            <p class="role-form__banner" role="status" data-test="role-form-system-banner">
              {{ copy.systemReadonlyBanner }}
            </p>
          }

          <div class="role-form__grid">
            <label class="field">
              <span class="field__label">Системное имя</span>
              <input
                class="field__input"
                [value]="name()"
                [disabled]="data.mode !== 'create'"
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
                [disabled]="readOnly()"
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
                [disabled]="readOnly()"
                (input)="onDescriptionInput($event)"
                autocomplete="off"
                data-test="role-form-description"
              />
            </label>
          </div>

          <div class="role-form__permissions">
            <div class="role-form__permissions-head">
              <div class="role-form__permissions-intro">
                <span class="field__label">{{ copy.pagesHeading }}</span>
                <p class="role-form__logic-hint">{{ copy.pagesHint }}</p>
              </div>
              @if (!readOnly()) {
                <div class="role-form__permissions-actions">
                  <span class="field__hint" data-test="role-form-pages-count"
                    >{{ selectedPagesCount() }} выбрано</span
                  >
                  <div class="role-form__permissions-btns">
                    <app-pi-button
                      variant="outline"
                      size="sm"
                      type="button"
                      [disabled]="catalogLoading() || !!catalogError() || pageGroups().length === 0"
                      (click)="selectAllPages()"
                      data-test="role-form-pages-select-all"
                    >
                      {{ copy.selectAll }}
                    </app-pi-button>
                    <app-pi-button
                      variant="ghost"
                      size="sm"
                      type="button"
                      [disabled]="
                        catalogLoading() || !!catalogError() || selectedPagesCount() === 0
                      "
                      (click)="clearAllPages()"
                      data-test="role-form-pages-clear-all"
                    >
                      {{ copy.clearAll }}
                    </app-pi-button>
                  </div>
                </div>
              }
            </div>

            @if (catalogLoading()) {
              <p class="text-sm text-muted-foreground">Загрузка каталога…</p>
            } @else if (catalogError(); as err) {
              <p class="field__error" data-test="role-form-catalog-error">{{ err }}</p>
            } @else if (pageGroups().length === 0) {
              <p
                class="text-sm text-muted-foreground"
                role="status"
                data-test="role-form-pages-empty"
              >
                Каталог разделов меню пуст.
              </p>
            } @else {
              <div class="role-form__sections" data-test="role-form-pages">
                @for (g of pageGroups(); track g.id) {
                  <fieldset class="role-form__section">
                    <legend class="role-form__section-title">
                      {{ g.title }}
                      @if (!readOnly()) {
                        <button
                          type="button"
                          class="role-form__select-all"
                          (click)="togglePageGroup(g, !pageGroupAllSelected(g))"
                          data-test="role-form-page-group-toggle"
                        >
                          {{ pageGroupAllSelected(g) ? copy.clearAll : copy.selectAll }}
                        </button>
                      }
                    </legend>
                    <div class="role-form__section-grid">
                      @for (key of g.keys; track key) {
                        <label
                          class="role-form__perm"
                          [class.role-form__perm--readonly]="readOnly()"
                        >
                          <input
                            type="checkbox"
                            class="role-form__checkbox"
                            [checked]="isPageSelected(key)"
                            [disabled]="readOnly()"
                            (change)="togglePage(key)"
                            data-test="role-form-page"
                          />
                          <span class="role-form__perm-body">
                            <span class="role-form__perm-title">{{ pageLabel(key) }}</span>
                            <span class="role-form__perm-meta">{{ key }}</span>
                          </span>
                        </label>
                      }
                    </div>
                  </fieldset>
                }
              </div>
            }
          </div>

          <div class="role-form__permissions">
            <div class="role-form__permissions-head">
              <div class="role-form__permissions-intro">
                <span class="field__label">{{ copy.permissionsHeading }}</span>
                <p class="role-form__logic-hint">{{ copy.logicHint }}</p>
              </div>
              @if (!readOnly()) {
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
              }
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
                      @if (!readOnly()) {
                        <button
                          type="button"
                          class="role-form__select-all"
                          (click)="toggleGroup(g, !groupAllSelected(g))"
                          data-test="role-form-section-toggle"
                        >
                          {{ groupAllSelected(g) ? copy.clearAll : copy.selectAll }}
                        </button>
                      }
                    </legend>
                    <div class="role-form__section-grid">
                      @for (p of g.permissions; track p.key) {
                        <label
                          class="role-form__perm"
                          [class.role-form__perm--readonly]="readOnly()"
                        >
                          <input
                            type="checkbox"
                            class="role-form__checkbox"
                            [checked]="isSelected(p.key)"
                            [disabled]="readOnly()"
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
        <app-pi-button variant="ghost" size="sm" (click)="onCancel()">
          {{ readOnly() ? 'Закрыть' : 'Отмена' }}
        </app-pi-button>
        @if (!readOnly()) {
          <app-pi-button
            variant="default"
            size="sm"
            [disabled]="!canSubmit() || submitting()"
            (click)="onSubmit()"
            data-test="role-form-submit"
          >
            {{ submitting() ? 'Сохранение…' : data.mode === 'create' ? 'Создать' : 'Сохранить' }}
          </app-pi-button>
        }
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

      .role-form__banner {
        margin: 0;
        padding: 10px 12px;
        font-size: 13px;
        line-height: 1.45;
        color: var(--color-ink);
        background: var(--color-paper-2);
        border: 1px solid var(--color-rule);
        border-radius: 3px;
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
        font-family: var(--font-mono);
        font-size: 11px;
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
        max-height: min(42vh, 420px);
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
        font-family: var(--font-mono);
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

      .role-form__perm:hover:not(.role-form__perm--readonly) {
        background: var(--color-paper-2);
      }

      .role-form__perm--readonly {
        cursor: default;
        opacity: 0.85;
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
        font-family: var(--font-mono);
        font-size: 11px;
        letter-spacing: 0.04em;
        color: var(--color-muted-foreground);
      }
    `,
  ],
})
export class RoleFormDialogComponent {
  protected readonly facade = inject(RoleFormFacade);

  protected readonly data = this.facade.data;
  protected readonly copy = ROLE_FORM_COPY;
  protected readonly readOnly = this.facade.readOnly;

  protected readonly name = this.facade.name;
  protected readonly label = this.facade.label;
  protected readonly description = this.facade.description;
  protected readonly error = this.facade.error;
  protected readonly submitting = this.facade.submitting;
  protected readonly sections = this.facade.sections;
  protected readonly groups = this.facade.groups;
  protected readonly pageGroups = this.facade.pageGroups;
  protected readonly catalogLoading = this.facade.catalogLoading;
  protected readonly catalogError = this.facade.catalogError;
  protected readonly selected = this.facade.selected;
  protected readonly selectedPages = this.facade.selectedPages;

  protected readonly selectedCount = this.facade.selectedCount;
  protected readonly selectedPagesCount = this.facade.selectedPagesCount;
  protected readonly canSubmit = this.facade.canSubmit;

  protected dialogTitle(): string {
    return this.facade.dialogTitle();
  }

  protected permissionLabel(key: string): string {
    return this.facade.permissionLabel(key);
  }

  protected pageLabel(key: string): string {
    return this.facade.pageLabel(key);
  }

  protected onNameInput(event: Event): void {
    this.facade.onNameInput(event);
  }

  protected onLabelInput(event: Event): void {
    this.facade.onLabelInput(event);
  }

  protected onDescriptionInput(event: Event): void {
    this.facade.onDescriptionInput(event);
  }

  protected isSelected(key: string): boolean {
    return this.facade.isSelected(key);
  }

  protected isPageSelected(key: string): boolean {
    return this.facade.isPageSelected(key);
  }

  protected toggleKey(key: string): void {
    this.facade.toggleKey(key);
  }

  protected togglePage(key: string): void {
    this.facade.togglePage(key);
  }

  protected selectAllPermissions(): void {
    this.facade.selectAllPermissions();
  }

  protected clearAllPermissions(): void {
    this.facade.clearAllPermissions();
  }

  protected selectAllPages(): void {
    this.facade.selectAllPages();
  }

  protected clearAllPages(): void {
    this.facade.clearAllPages();
  }

  protected groupAllSelected(g: PermissionDisplayGroup): boolean {
    return this.facade.groupAllSelected(g);
  }

  protected pageGroupAllSelected(g: PageDisplayGroup): boolean {
    return this.facade.pageGroupAllSelected(g);
  }

  protected toggleGroup(g: PermissionDisplayGroup, select: boolean): void {
    this.facade.toggleGroup(g, select);
  }

  protected togglePageGroup(g: PageDisplayGroup, select: boolean): void {
    this.facade.togglePageGroup(g, select);
  }

  /** @deprecated use groupAllSelected — kept for existing unit tests */
  protected sectionAllSelected(s: PermissionSection): boolean {
    return this.facade.sectionAllSelected(s);
  }

  /** @deprecated use toggleGroup — kept for existing unit tests */
  protected toggleSection(s: PermissionSection, select: boolean): void {
    this.facade.toggleSection(s, select);
  }

  protected actionLabel(action: string): string {
    return this.facade.actionLabel(action);
  }

  protected onSubmit(): void {
    this.facade.onSubmit();
  }

  protected onCancel(): void {
    this.facade.onCancel();
  }
}
