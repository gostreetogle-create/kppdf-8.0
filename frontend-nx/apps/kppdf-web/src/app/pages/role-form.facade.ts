/**
 * TZ-NX-ROLE-FORM-FACADE — domain facade for `RoleFormDialogComponent`.
 *
 * Owns: form/catalog/matrix signals and every load/toggle/select-all/submit
 * method — moved as-is from the dialog. No ACL rule changes.
 *
 * `PI_DIALOG_DATA` / `PI_DIALOG_REF` are DI tokens (not `@Input()`s), so
 * this facade — provided in the same component's `providers` array —
 * injects them directly; no host-bind pattern needed (unlike a component
 * with `input.required()`, e.g. `OrderHubFacade`).
 */
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { extractErrorMessage } from '@kppdf/util-http';
import {
  PermissionsCatalogService,
  type PermissionCatalogEntry,
  type AdminPermissionSection as PermissionSection,
} from '@kppdf/data-access/admin';
import {
  PAGE_GROUP_ORDER,
  PAGE_GROUP_TITLE_RU,
  PAGE_KEY_GROUP,
  PERMISSION_ACTION_RU,
  PERMISSION_GROUP_TITLE_RU,
  pageLabelRu,
  permissionLabelRu,
} from './permission-labels.ru';
import type { RoleFormData, RoleFormResult } from './role-form-dialog.component';

/** Display group for the checkbox matrix (merged API sections). */
export interface PermissionDisplayGroup {
  id: string;
  title: string;
  permissions: PermissionCatalogEntry[];
}

/** Display group for nav pageKey ACL. */
export interface PageDisplayGroup {
  id: string;
  title: string;
  keys: string[];
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
  'desktop',
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
  desktop: 'desktop',
};

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

/** Group PAGE_KEYS into nav-facing RU categories. */
export function regroupPages(pages: readonly string[]): PageDisplayGroup[] {
  const buckets = new Map<string, PageDisplayGroup>();
  for (const key of pages) {
    const groupId = PAGE_KEY_GROUP[key] ?? 'other';
    const bucket = buckets.get(groupId) ?? {
      id: groupId,
      title: PAGE_GROUP_TITLE_RU[groupId] ?? groupId,
      keys: [],
    };
    bucket.keys.push(key);
    buckets.set(groupId, bucket);
  }
  const ordered: PageDisplayGroup[] = [];
  for (const id of PAGE_GROUP_ORDER) {
    const g = buckets.get(id);
    if (g?.keys.length) ordered.push(g);
    buckets.delete(id);
  }
  for (const g of buckets.values()) {
    if (g.keys.length) ordered.push(g);
  }
  return ordered;
}

@Injectable()
export class RoleFormFacade {
  readonly data = inject<RoleFormData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<RoleFormResult>>(PI_DIALOG_REF);
  private readonly catalogService = inject(PermissionsCatalogService);

  readonly name = signal<string>(this.data.role?.name ?? '');
  readonly label = signal<string>(this.data.role?.label ?? '');
  readonly description = signal<string>(this.data.role?.description ?? '');
  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly readOnly = (): boolean => this.data.mode === 'view';

  dialogTitle(): string {
    if (this.data.mode === 'create') return 'Новая роль';
    if (this.data.mode === 'view') return 'Системная роль';
    return 'Редактирование роли';
  }

  permissionLabel(key: string): string {
    return permissionLabelRu(key);
  }

  pageLabel(key: string): string {
    return pageLabelRu(key);
  }

  onNameInput(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  onLabelInput(event: Event): void {
    this.label.set((event.target as HTMLInputElement).value);
  }

  onDescriptionInput(event: Event): void {
    this.description.set((event.target as HTMLInputElement).value);
  }

  /** Raw API sections (kept for tests / debugging). */
  readonly sections = signal<PermissionSection[]>([]);
  /** Grouped RU categories for the checkbox matrix. */
  readonly groups = signal<PermissionDisplayGroup[]>([]);
  readonly pageGroups = signal<PageDisplayGroup[]>([]);
  readonly catalogLoading = signal(true);
  readonly catalogError = signal<string | null>(null);
  readonly selected = signal<Set<string>>(new Set(this.data.role?.permissions ?? []));
  readonly selectedPages = signal<Set<string>>(new Set(this.data.role?.pages ?? []));

  constructor() {
    void this.loadCatalog();
  }

  private async loadCatalog(): Promise<void> {
    try {
      const res = await firstValueFrom(this.catalogService.getCatalog());
      if (res.ok) {
        this.sections.set(res.data.sections);
        this.groups.set(regroupPermissions(res.data.sections));
        this.pageGroups.set(regroupPages(res.data.pages ?? []));
        this.catalogError.set(null);
        // System view: show effective full access (all ✓), not raw ['*']/sparse pages.
        if (this.data.mode === 'view') {
          this.applyFullAccessDisplay();
        }
      } else {
        this.catalogError.set(this.describe(res.error));
      }
    } catch (err) {
      this.catalogError.set(this.describe(err));
    } finally {
      this.catalogLoading.set(false);
    }
  }

  /** Mark every catalog capability + pageKey selected (view/system only). */
  private applyFullAccessDisplay(): void {
    const caps = new Set<string>();
    for (const g of this.groups()) {
      for (const p of g.permissions) caps.add(p.key);
    }
    this.selected.set(caps);
    const pages = new Set<string>();
    for (const g of this.pageGroups()) {
      for (const key of g.keys) pages.add(key);
    }
    this.selectedPages.set(pages);
  }

  readonly selectedCount = (): number => this.selected().size;
  readonly selectedPagesCount = (): number => this.selectedPages().size;

  isSelected(key: string): boolean {
    return this.selected().has(key);
  }

  isPageSelected(key: string): boolean {
    return this.selectedPages().has(key);
  }

  toggleKey(key: string): void {
    if (this.readOnly()) return;
    const next = new Set(this.selected());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.selected.set(next);
  }

  togglePage(key: string): void {
    if (this.readOnly()) return;
    const next = new Set(this.selectedPages());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.selectedPages.set(next);
  }

  /** Select every permission across all groups. */
  selectAllPermissions(): void {
    if (this.readOnly()) return;
    const next = new Set<string>();
    for (const g of this.groups()) {
      for (const p of g.permissions) {
        next.add(p.key);
      }
    }
    this.selected.set(next);
  }

  /** Clear the entire selection. */
  clearAllPermissions(): void {
    if (this.readOnly()) return;
    this.selected.set(new Set());
  }

  selectAllPages(): void {
    if (this.readOnly()) return;
    const next = new Set<string>();
    for (const g of this.pageGroups()) {
      for (const key of g.keys) next.add(key);
    }
    this.selectedPages.set(next);
  }

  clearAllPages(): void {
    if (this.readOnly()) return;
    this.selectedPages.set(new Set());
  }

  groupAllSelected(g: PermissionDisplayGroup): boolean {
    return g.permissions.length > 0 && g.permissions.every((p) => this.selected().has(p.key));
  }

  pageGroupAllSelected(g: PageDisplayGroup): boolean {
    return g.keys.length > 0 && g.keys.every((k) => this.selectedPages().has(k));
  }

  toggleGroup(g: PermissionDisplayGroup, select: boolean): void {
    if (this.readOnly()) return;
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

  togglePageGroup(g: PageDisplayGroup, select: boolean): void {
    if (this.readOnly()) return;
    const next = new Set(this.selectedPages());
    for (const key of g.keys) {
      if (select) next.add(key);
      else next.delete(key);
    }
    this.selectedPages.set(next);
  }

  /** @deprecated use groupAllSelected — kept for existing unit tests */
  sectionAllSelected(s: PermissionSection): boolean {
    return s.permissions.length > 0 && s.permissions.every((p) => this.selected().has(p.key));
  }

  /** @deprecated use toggleGroup — kept for existing unit tests */
  toggleSection(s: PermissionSection, select: boolean): void {
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

  actionLabel(action: string): string {
    return ACTION_RU[action] ?? action;
  }

  readonly canSubmit = (): boolean => {
    if (this.readOnly()) return false;
    const name = this.name().trim();
    if (this.data.mode === 'create' && !/^[a-z][a-z0-9_-]{1,63}$/.test(name)) return false;
    if (this.label().trim().length < 2) return false;
    // Catalog must be ready. Empty permissions[] remains allowed (AC 2026-08-08
    // admin audit): PO may later forbid 0-permission roles; until then FE matches
    // BE create with permissions: []. Empty catalog shows RU empty-state but does
    // not block submit on name/label alone.
    if (this.catalogLoading() || this.catalogError()) return false;
    return true;
  };

  onSubmit(): void {
    if (this.submitting() || this.readOnly()) return;
    const result: RoleFormResult = {
      name: this.data.mode === 'create' ? this.name().trim() : (this.data.role?.name ?? ''),
      label: this.label().trim(),
      description: this.description().trim() || undefined,
      permissions: Array.from(this.selected()),
      pages: Array.from(this.selectedPages()),
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

  onCancel(): void {
    this.ref.close();
  }

  private describe(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }
}
