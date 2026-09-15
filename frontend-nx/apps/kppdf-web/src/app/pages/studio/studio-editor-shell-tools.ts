import { effect, type Signal } from '@angular/core';
import {
  Archive,
  ClipboardList,
  Database,
  Eye,
  File as DocumentIcon,
  FileDown,
  FileStack,
  FileText,
  Layers,
  LayoutTemplate,
  PenLine,
  Save,
  Settings2,
} from 'lucide-angular';
import type { StudioBlock, StudioDocument } from '@kppdf/data-access';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';

export const STUDIO_TOOL_OWNER = 'studio-editor';

/**
 * TZ-NX-STUDIO-EDITOR-PAGE-THIN — chrome-rail wiring split out of
 * `StudioEditorPage` purely to shrink the page file. `ShellToolRailService`
 * is app-only (see `shell-tool-rail.service.ts`), so this can't live in
 * `@kppdf/features/doc-studio` next to the facade. Must be called
 * synchronously from the page constructor (injection context for `effect()`).
 */
export interface StudioShellToolsDeps {
  readonly activeSection: Signal<string | null>;
  readonly panelCollapsed: Signal<boolean>;
  readonly viewMode: Signal<'editor' | 'preview'>;
  readonly document: Signal<StudioDocument | null>;
  readonly selectedId: Signal<string | null>;
  readonly blocks: Signal<readonly StudioBlock[]>;
  readonly saving: Signal<boolean>;
  readonly pdfLoading: Signal<boolean>;
  readonly finalizing: Signal<boolean>;
  readonly selectedBufferCount: Signal<number>;
  readonly onSection: (id: string) => void;
  readonly setViewMode: (mode: 'editor' | 'preview') => void;
  readonly saveDocument: () => void;
  readonly onDownloadPdf: () => void;
  readonly onFinalize: () => void;
}

export function registerStudioShellTools(shellTools: ShellToolRailService, deps: StudioShellToolsDeps): void {
  effect(() => {
    const section = deps.activeSection();
    const collapsed = deps.panelCollapsed();
    const viewMode = deps.viewMode();
    const doc = deps.document();
    const selectedId = deps.selectedId();
    const selectedBlock = selectedId ? deps.blocks().find((b) => b._id === selectedId) : null;
    // TZ-NX-PO-SWEEP-02: table selected but Свойства not open yet — hint the
    // rail button (same active/жёлтый style) instead of auto-opening the panel.
    const propertiesHint =
      section !== 'properties' && selectedBlock?.type === 'table' && !selectedBlock.locked;
    shellTools.setTools(STUDIO_TOOL_OWNER, {
      left: [
        {
          id: 'data', side: 'left', ariaLabel: 'Данные', title: 'Данные', icon: Database,
          active: !collapsed && section === 'data', onClick: () => deps.onSection('data'),
        },
        {
          id: 'selected', side: 'left', ariaLabel: 'Выбрано', title: 'Выбрано', icon: ClipboardList,
          badge: deps.selectedBufferCount() > 0 ? deps.selectedBufferCount() : undefined,
          active: !collapsed && section === 'selected', onClick: () => deps.onSection('selected'),
        },
      ],
      right: [
        // TZ-NX-PO-SWEEP-07 — one «Документ» category instead of 5 flat
        // lifecycle icons (mode-editor/mode-preview/save/pdf/archive):
        // rail slots are categories that open a menu, not one-icon=one-action.
        {
          id: 'document', side: 'right', ariaLabel: 'Документ', title: 'Документ', icon: DocumentIcon,
          items: [
            {
              id: 'mode-editor', label: 'Редактор', icon: PenLine,
              active: viewMode === 'editor', onClick: () => deps.setViewMode('editor'),
            },
            {
              id: 'mode-preview', label: 'Просмотр', icon: Eye,
              active: viewMode === 'preview', onClick: () => deps.setViewMode('preview'),
            },
            {
              id: 'save', label: 'Сохранить', icon: Save,
              disabled: deps.saving(), onClick: () => deps.saveDocument(),
            },
            {
              id: 'pdf', label: 'Скачать PDF', icon: FileDown,
              disabled: deps.pdfLoading(), onClick: () => deps.onDownloadPdf(),
            },
            {
              id: 'archive',
              label: doc?.status === 'draft' ? 'В архив' : 'Уже в архиве',
              icon: Archive,
              disabled: deps.finalizing() || doc?.status !== 'draft',
              onClick: () => deps.onFinalize(),
            },
          ],
        },
        { id: 'elements', side: 'right', ariaLabel: 'Элементы', title: 'Элементы', icon: FileText, active: !collapsed && section === 'elements', onClick: () => deps.onSection('elements') },
        { id: 'layers', side: 'right', ariaLabel: 'Слои', title: 'Слои', icon: Layers, active: !collapsed && section === 'layers', onClick: () => deps.onSection('layers') },
        { id: 'pages', side: 'right', ariaLabel: 'Страницы', title: 'Страницы', icon: FileStack, active: !collapsed && section === 'pages', onClick: () => deps.onSection('pages') },
        { id: 'properties', side: 'right', ariaLabel: 'Свойства', title: 'Свойства', icon: Settings2, active: !collapsed && (section === 'properties' || propertiesHint), onClick: () => deps.onSection('properties') },
        { id: 'template', side: 'right', ariaLabel: 'Шаблон', title: 'Шаблон', icon: LayoutTemplate, active: !collapsed && section === 'template', onClick: () => deps.onSection('template') },
      ],
    });
  });
}
