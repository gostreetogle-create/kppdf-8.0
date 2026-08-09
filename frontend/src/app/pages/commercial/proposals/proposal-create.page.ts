import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PiGroupWorkspaceComponent } from '../../../shared/page/pi-group-workspace.component';
import { DEALS_TOC_CHIPS, KP_SECTION_CHIPS } from '../deals-group-chips';

/**
 * Route stub for the create-KP workspace.
 *
 * The actual three-zone editor is delivered by TZ-SALES-312 and following
 * tasks; this route gives the navigation a stable destination meanwhile.
 */
@Component({
  selector: 'app-proposal-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent],
  template: `
    <app-pi-group-workspace
      pathLabel="Сделки"
      [toc]="dealsToc"
      tocActiveId="proposals"
      [chips]="kpSectionChips"
      activeId="create"
    >
      <section class="space-y-2" aria-labelledby="proposal-create-title">
        <h1 id="proposal-create-title" class="text-xl font-semibold text-ink">Создать КП</h1>
        <p class="text-sm text-muted-foreground">
          Рабочее пространство создания КП будет доступно в следующем слое витрины.
        </p>
      </section>
    </app-pi-group-workspace>
  `,
})
export class ProposalCreatePage {
  protected readonly dealsToc = DEALS_TOC_CHIPS;
  protected readonly kpSectionChips = KP_SECTION_CHIPS;
}
