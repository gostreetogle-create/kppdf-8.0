import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { PiGroupWorkspaceComponent } from '../../../shared/page/pi-group-workspace.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { DEALS_TOC_CHIPS, KP_SECTION_CHIPS } from '../deals-group-chips';
import { ProposalDraftLine, ProposalProductRailComponent } from './proposal-product-rail.component';

/**
 * Create-KP studio (TZ-SALES-312 shell + TZ-SALES-314 product rail).
 *
 * Draft lines are in-memory until a later save TZ; no quotation PATCH here.
 */
@Component({
  selector: 'app-proposal-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent, ButtonComponent, ProposalProductRailComponent],
  template: `
    <app-pi-group-workspace
      pathLabel="Сделки"
      [toc]="dealsToc"
      tocActiveId="proposals"
      [chips]="kpSectionChips"
      activeId="create"
    >
      <div class="kp-create-studio" data-test="kp-create-studio">
        <div class="kp-create-studio__toolbar" data-test="kp-create-toolbar">
          <h1 id="proposal-create-title" class="text-xl font-semibold text-ink m-0">Создать КП</h1>
          @if (!isWide()) {
            <div class="kp-create-studio__toggles" role="toolbar" aria-label="Панели студии КП">
              <app-pi-button
                variant="ghost"
                size="sm"
                [attr.aria-expanded]="leftOpen()"
                [attr.aria-controls]="'kp-create-left'"
                data-test="kp-create-toggle-left"
                (click)="toggleLeft()"
              >
                Товары
              </app-pi-button>
              <app-pi-button
                variant="ghost"
                size="sm"
                [attr.aria-expanded]="rightOpen()"
                [attr.aria-controls]="'kp-create-right'"
                data-test="kp-create-toggle-right"
                (click)="toggleRight()"
              >
                Параметры
              </app-pi-button>
            </div>
          }
        </div>

        <div
          class="kp-create-studio__body"
          [class.kp-create-studio__body--wide]="isWide()"
          data-test="kp-create-body"
        >
          <aside
            id="kp-create-left"
            class="kp-create-studio__panel kp-create-studio__panel--left"
            [class.kp-create-studio__panel--open]="isWide() || leftOpen()"
            data-test="kp-create-left"
            aria-label="Товары"
          >
            <h2 class="kp-create-studio__zone-title">Товары</h2>
            <app-proposal-product-rail (productAdd)="onProductAdd($event)" />
          </aside>

          <section
            class="kp-create-studio__panel kp-create-studio__panel--center"
            data-test="kp-create-center"
            aria-labelledby="proposal-create-title"
          >
            <div class="kp-create-studio__sheet" data-test="kp-create-sheet">
              <h2 class="kp-create-studio__zone-title">Превью КП</h2>
              @if (draftLines().length === 0) {
                <p class="kp-create-studio__empty" data-test="kp-create-center-empty">
                  Выберите шаблон КП или добавьте позиции слева
                </p>
              } @else {
                <ul class="kp-create-studio__draft" data-test="kp-create-draft-lines">
                  @for (line of draftLines(); track $index) {
                    <li>
                      {{ line.productName }}
                      · qty {{ line.quantity }} · {{ line.unitPrice }} ₽
                    </li>
                  }
                </ul>
              }
            </div>
          </section>

          <aside
            id="kp-create-right"
            class="kp-create-studio__panel kp-create-studio__panel--right"
            [class.kp-create-studio__panel--open]="isWide() || rightOpen()"
            data-test="kp-create-right"
            aria-label="Параметры"
          >
            <h2 class="kp-create-studio__zone-title">Параметры</h2>
            <p class="kp-create-studio__empty" data-test="kp-create-right-empty">
              Укажите нашу фирму (бланк) и наценку
            </p>
          </aside>
        </div>
      </div>
    </app-pi-group-workspace>
  `,
  styles: `
    :host {
      display: block;
    }

    .kp-create-studio {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: calc(100vh - 11rem);
    }

    .kp-create-studio__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .kp-create-studio__toggles {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .kp-create-studio__body {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 0.75rem;
      flex: 1;
      min-height: 0;
    }

    .kp-create-studio__body--wide {
      grid-template-columns: clamp(17.5rem, 22vw, 20rem) minmax(30rem, 1fr) clamp(
          18.75rem,
          24vw,
          21.25rem
        );
      gap: 1rem;
      align-items: stretch;
    }

    .kp-create-studio__panel {
      min-width: 0;
      min-height: 12rem;
      padding: 0.75rem;
      border: 1px solid var(--color-rule);
      background: var(--color-paper, transparent);
    }

    .kp-create-studio__panel--center {
      min-height: 20rem;
    }

    .kp-create-studio__body:not(.kp-create-studio__body--wide) .kp-create-studio__panel--left,
    .kp-create-studio__body:not(.kp-create-studio__body--wide) .kp-create-studio__panel--right {
      display: none;
    }

    .kp-create-studio__body:not(.kp-create-studio__body--wide)
      .kp-create-studio__panel--left.kp-create-studio__panel--open,
    .kp-create-studio__body:not(.kp-create-studio__body--wide)
      .kp-create-studio__panel--right.kp-create-studio__panel--open {
      display: block;
      position: absolute;
      z-index: 2;
      top: 0;
      bottom: 0;
      width: min(20rem, calc(100% - 1rem));
      max-width: 100%;
      overflow: auto;
      background: var(--color-paper, Canvas);
    }

    .kp-create-studio__body:not(.kp-create-studio__body--wide)
      .kp-create-studio__panel--left.kp-create-studio__panel--open {
      left: 0;
    }

    .kp-create-studio__body:not(.kp-create-studio__body--wide)
      .kp-create-studio__panel--right.kp-create-studio__panel--open {
      right: 0;
    }

    .kp-create-studio__sheet {
      width: 100%;
      max-width: 794px;
      margin-inline: auto;
      min-height: 18rem;
      padding: 1rem;
      border: 1px solid var(--color-rule);
      background: var(--color-paper-2, transparent);
    }

    .kp-create-studio__zone-title {
      margin: 0 0 0.5rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--color-ink);
    }

    .kp-create-studio__empty {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-muted-foreground, var(--color-ink-muted, #6b7280));
    }

    .kp-create-studio__draft {
      margin: 0;
      padding-left: 1.1rem;
      font-size: 0.875rem;
      color: var(--color-ink);
    }

    .kp-create-studio__body--wide .kp-create-studio__panel--left,
    .kp-create-studio__body--wide .kp-create-studio__panel--right {
      overflow: auto;
    }
  `,
})
export class ProposalCreatePage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly dealsToc = DEALS_TOC_CHIPS;
  protected readonly kpSectionChips = KP_SECTION_CHIPS;

  protected readonly isWide = signal(true);
  protected readonly leftOpen = signal(false);
  protected readonly rightOpen = signal(false);
  /** In-memory draft positions (SALES-314). Not persisted until a later save TZ. */
  protected readonly draftLines = signal<ProposalDraftLine[]>([]);

  private mediaQuery: MediaQueryList | null = null;

  ngOnInit(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      this.isWide.set(true);
      return;
    }

    this.mediaQuery = window.matchMedia('(min-width: 1280px)');
    this.applyViewport(this.mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent): void => {
      this.applyViewport(event.matches);
    };
    this.mediaQuery.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => {
      this.mediaQuery?.removeEventListener('change', onChange);
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isWide()) return;
    this.leftOpen.set(false);
    this.rightOpen.set(false);
  }

  protected toggleLeft(): void {
    const next = !this.leftOpen();
    this.leftOpen.set(next);
    if (next) this.rightOpen.set(false);
  }

  protected toggleRight(): void {
    const next = !this.rightOpen();
    this.rightOpen.set(next);
    if (next) this.leftOpen.set(false);
  }

  protected onProductAdd(line: ProposalDraftLine): void {
    this.draftLines.update((rows) => [...rows, line]);
  }

  private applyViewport(wide: boolean): void {
    this.isWide.set(wide);
    if (wide) {
      this.leftOpen.set(false);
      this.rightOpen.set(false);
    }
  }
}
