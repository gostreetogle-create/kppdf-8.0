import { firstValueFrom } from 'rxjs';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiRegistryDataSourcesService, PiTableTemplatesService, PiTextBlockCategoriesService, PiTextBlocksService, type RegistryDataSource, type TableTemplate, type TextBlock } from '@kppdf/data-access';
import type { DestroyRef, Injector } from '@angular/core';
import { PiDialogService } from '@kppdf/ui/dialog';
import { onDialogCloseOnce } from '../../on-dialog-close-once';
import { TextBlockFormDialogComponent } from '../../../doc-studio/dialogs/text-block-form-dialog.component';
import { TableTemplateFormDialogComponent } from '../../../doc-studio/dialogs/table-template-form-dialog.component';
import type { RegistryActionContext, RegistryRowAction } from '../model/registry.types';
import type { TextBlockRow } from './text-blocks-http-data-source';
import type { TableTemplateRow } from './table-templates-http-data-source';
import { createRegistryCrudActions, copyName } from './registry-crud-actions';

export interface DocStudioDialogDeps { readonly dialog: PiDialogService; readonly destroyRef: DestroyRef; readonly injector: Injector; textBlocks: PiTextBlocksService; categories: PiTextBlockCategoriesService; templates: PiTableTemplatesService; dataSources: PiRegistryDataSourcesService; }
export function createDocStudioDialogDeps(dialog: PiDialogService, destroyRef: DestroyRef, injector: Injector): DocStudioDialogDeps { return { dialog, destroyRef, injector, textBlocks: undefined as never, categories: undefined as never, templates: undefined as never, dataSources: undefined as never }; }

export function buildTextBlockActions(deps: DocStudioDialogDeps): readonly RegistryRowAction<TextBlockRow>[] {
  return createRegistryCrudActions({ entityLabel: 'текст', edit: (row, ctx) => openTextEdit(deps, row, ctx), copy: (row, ctx) => openTextCreate(deps, ctx, row), remove: async (row, ctx) => { const result = await firstValueFrom(deps.textBlocks.remove(row._id)); if (!result.ok) return ctx.notify(extractErrorMessage(result.error), 'error'); ctx.notify('Текст удалён', 'success'); ctx.reload(); } });
}
export function buildTableTemplateActions(deps: DocStudioDialogDeps): readonly RegistryRowAction<TableTemplateRow>[] {
  return createRegistryCrudActions({ entityLabel: 'вид таблицы', edit: (row, ctx) => openTemplateEdit(deps, row, ctx), copy: (row, ctx) => openTemplateCreate(deps, ctx, row), remove: async (row, ctx) => { const result = await firstValueFrom(deps.templates.remove(row._id)); if (!result.ok) return ctx.notify(extractErrorMessage(result.error), 'error'); ctx.notify('Вид таблицы удалён', 'success'); ctx.reload(); } });
}
export function buildTextBlockCreateAction(deps: DocStudioDialogDeps) { return { label: 'Создать текст', run: (ctx: RegistryActionContext) => openTextCreate(deps, ctx) }; }
export function buildTableTemplateCreateAction(deps: DocStudioDialogDeps) { return { label: 'Создать вид таблицы', run: (ctx: RegistryActionContext) => openTemplateCreate(deps, ctx) }; }
function openTextCreate(deps: DocStudioDialogDeps, ctx: RegistryActionContext, source?: TextBlockRow): void { const ref = deps.dialog.open<TextBlock | null | undefined>(TextBlockFormDialogComponent, { data: { mode: 'create', textBlock: source ? { ...source, name: copyName(source.name) } : undefined }, parentDestroyRef: deps.destroyRef }); onDialogCloseOnce(ref, deps.injector, (value) => { if (value) { ctx.notify('Текст создан', 'success'); ctx.reload(); } }); }
function openTextEdit(deps: DocStudioDialogDeps, row: TextBlockRow, ctx: RegistryActionContext): void { void firstValueFrom(deps.textBlocks.getById(row._id)).then((result) => { if (!result.ok) return ctx.notify(extractErrorMessage(result.error), 'error'); const ref = deps.dialog.open<TextBlock | null | undefined>(TextBlockFormDialogComponent, { data: { mode: 'edit', textBlock: result.data }, parentDestroyRef: deps.destroyRef }); onDialogCloseOnce(ref, deps.injector, (value) => { if (value) { ctx.notify('Текст обновлён', 'success'); ctx.reload(); } }); }); }
function openTemplateCreate(deps: DocStudioDialogDeps, ctx: RegistryActionContext, source?: TableTemplateRow): void { const ref = deps.dialog.open<TableTemplate | null | undefined>(TableTemplateFormDialogComponent, { data: { mode: 'create', template: source ? { ...source, name: copyName(source.name) } : undefined }, parentDestroyRef: deps.destroyRef }); onDialogCloseOnce(ref, deps.injector, (value) => { if (value) { ctx.notify('Вид таблицы создан', 'success'); ctx.reload(); } }); }
function openTemplateEdit(deps: DocStudioDialogDeps, row: TableTemplateRow, ctx: RegistryActionContext): void { void firstValueFrom(deps.templates.getById(row._id)).then((result) => { if (!result.ok) return ctx.notify(extractErrorMessage(result.error), 'error'); const ref = deps.dialog.open<TableTemplate | null | undefined>(TableTemplateFormDialogComponent, { data: { mode: 'edit', template: result.data }, parentDestroyRef: deps.destroyRef }); onDialogCloseOnce(ref, deps.injector, (value) => { if (value) { ctx.notify('Вид таблицы обновлён', 'success'); ctx.reload(); } }); }); }
export type DataSourceOption = RegistryDataSource;
