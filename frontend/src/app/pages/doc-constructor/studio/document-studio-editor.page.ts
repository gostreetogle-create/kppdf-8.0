import { ChangeDetectionStrategy, Component, DestroyRef, inject, input } from '@angular/core';
import { PiGroupWorkspaceComponent } from '../../../shared/page/pi-group-workspace.component';
import { ProposalWorkspaceShellComponent } from '../../../shared/document-workspace-shell/proposal-workspace-shell.component';
import { BuilderCanvasComponent } from '../builder/builder-canvas.component';
import { STUDIO_SECTION_CHIPS, STUDIO_TOC_CHIPS } from './studio-group-chips';
import {
  StudioRibbonActionsComponent,
  StudioRibbonModeComponent,
  type StudioViewMode,
} from './studio-ribbon.component';
import { StudioPanelElementsComponent } from './studio-panel-elements.component';
import { StudioPanelLayersComponent } from './studio-panel-layers.component';
import { StudioPanelPropertiesComponent } from './studio-panel-properties.component';
import { StudioPanelDataComponent } from './studio-panel-data.component';
import { StudioPanelTableComponent } from './studio-panel-table.component';
import { StudioPanelTemplateComponent } from './studio-panel-template.component';
import {
  buildStudioRailItems,
  createStudioWorkspaceChrome,
  onStudioSectionClick,
} from './studio-workspace-chrome';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { StudioBlocksStateService } from './studio-blocks-state.service';
import { DocumentStudioEditorFacade } from './document-studio-editor.facade';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';

@Component({
  selector: 'app-document-studio-editor-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StudioBlocksStateService, DocumentStudioEditorFacade],
  imports: [
    PiGroupWorkspaceComponent,
    ProposalWorkspaceShellComponent,
    BuilderCanvasComponent,
    StudioRibbonModeComponent,
    StudioRibbonActionsComponent,
    StudioPanelElementsComponent,
    StudioPanelLayersComponent,
    StudioPanelPropertiesComponent,
    StudioPanelDataComponent,
    StudioPanelTableComponent,
    StudioPanelTemplateComponent,
    ButtonComponent,
  ],
  templateUrl: './document-studio-editor.page.html',
  styleUrl: './document-studio-shell.layout.css',
  styles: [
    `
      .studio-canvas-host {
        width: 100%;
        height: 100%;
        pointer-events: auto;
      }
      .studio-canvas-host app-builder-canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
      .studio-preview-frame {
        width: 100%;
        height: 100%;
        border: 0;
        background: var(--color-paper);
      }
    `,
  ],
})
export class DocumentStudioEditorPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly workspaceChrome = createStudioWorkspaceChrome();
  protected readonly vm = inject(DocumentStudioEditorFacade);

  readonly id = input.required<string>();

  protected readonly toc = STUDIO_TOC_CHIPS;
  protected readonly chips = STUDIO_SECTION_CHIPS;
  protected readonly railItems = buildStudioRailItems();
  protected readonly blockTypeLabel = (block: TemplateBlock) =>
    this.vm.blocksState.blockTypeLabel(block);

  constructor() {
    this.workspaceChrome.bind(
      this.destroyRef,
      this.vm.activeSection,
      this.vm.panelCollapsed,
      (sectionId) => onStudioSectionClick(sectionId, this.vm.activeSection, this.vm.panelCollapsed),
    );
    this.vm.init(this.id, this.destroyRef);
  }

  protected setViewMode(mode: StudioViewMode): void {
    this.vm.setViewMode(mode, this.id());
  }

  protected onContentChange(content: string): void {
    const block = this.vm.selectedBlock();
    if (block) this.vm.onContentChange(block, content);
  }

  protected onTitleChange(title: string): void {
    const block = this.vm.selectedBlock();
    if (block) this.vm.onTitleChange(block, title);
  }

  protected onLockChange(locked: boolean): void {
    const block = this.vm.selectedBlock();
    if (block) this.vm.onLockChange(block, locked);
  }

  protected onImageFullPage(): void {
    const block = this.vm.selectedBlock();
    if (block) this.vm.applyImageFullPage(block);
  }

  protected onImageToBack(): void {
    const block = this.vm.selectedBlock();
    if (block) this.vm.sendImageToBack(block);
  }

  protected onLinkQuotation(): void {
    const block = this.vm.selectedTableBlock();
    if (block) this.vm.linkTableToQuotation(block);
  }

  protected onLinkOrder(): void {
    const block = this.vm.selectedTableBlock();
    if (block) this.vm.linkTableToOrder(block);
  }
}
