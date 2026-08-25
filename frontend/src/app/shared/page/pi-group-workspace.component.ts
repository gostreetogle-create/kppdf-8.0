import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterEveryRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { filterByPageAcl } from '../../core/capabilities/page-acl';

/**
 * PiGroupWorkspace — group chip workspace shell (DICT-308+).
 *
 * Chrome (sticky under app header):
 *   1) Optional TOC row — dictionary groups (Классификация / Измерения / …)
 *   2) Section chips — siblings inside the active group (**hidden when empty** —
 *      DESK-429: no ghost gold strip on pages like /supply passing [])
 *   3) Tools slot — search / filters / CTA (**hidden when empty** — no ghost strip)
 *   4) Body — table / tree / studio
 *
 * Section identity SoT = top nav (yellow). Do not render pathLabel eyebrow (TZ-UX-315).
 * Both chip rows are dense; first chrome row sits flush under the app header.
 * Chips with `pageKey` / `anyPageKeys` are hidden when the role lacks that page ACL
 * (same rule as top nav) — user never clicks into /forbidden by accident.
 */
@Component({
  selector: 'app-pi-group-workspace',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="group-chrome sticky top-0 z-20 bg-paper" [class.group-chrome--flush]="flushBody()">
      @if (visibleToc().length > 0) {
        <nav
          class="group-toc flex items-center gap-1 flex-wrap pt-0 pb-0.5 min-w-0"
          aria-label="Группы справочников"
          data-test="group-toc"
        >
          @for (chip of visibleToc(); track chip.id) {
            <a
              [routerLink]="chip.route"
              [queryParams]="chip.queryParams"
              class="group-toc-chip inline-flex items-center px-2 py-0.5
                     text-[11px] leading-4 font-medium tracking-wide rounded-sm
                     transition-colors pi-focus-ring cursor-pointer no-underline"
              [class.bg-ink]="tocActiveId() === chip.id"
              [class.text-paper]="tocActiveId() === chip.id"
              [class.text-muted-foreground]="tocActiveId() !== chip.id"
              [class.hover:text-ink]="tocActiveId() !== chip.id"
              [class.hover:bg-paper-2]="tocActiveId() !== chip.id"
              [attr.aria-current]="tocActiveId() === chip.id ? 'page' : undefined"
              (click)="tocClick.emit(chip.id)"
            >
              {{ chip.label }}
            </a>
          }
        </nav>
      }

      @if (visibleChips().length > 0) {
        <div
          class="group-chips flex items-center gap-1 flex-wrap
                 pt-0.5 pb-1 min-w-0 hairline-b"
          [class.pt-0]="visibleToc().length === 0"
          data-test="group-chips"
        >
          @for (chip of visibleChips(); track chip.id) {
            <a
              [routerLink]="chip.route"
              [queryParams]="chip.queryParams"
              class="group-chip inline-flex items-center gap-1 px-2.5 py-0.5
                     text-xs leading-5 rounded-sm transition-colors
                     pi-focus-ring cursor-pointer no-underline"
              [class.bg-sunrise-warm]="activeId() === chip.id"
              [class.text-on-gold]="activeId() === chip.id"
              [class.text-ink]="activeId() !== chip.id"
              [class.hover:bg-paper-2]="activeId() !== chip.id"
              [attr.aria-current]="activeId() === chip.id ? 'page' : undefined"
              [attr.data-test]="dataTestPrefix() ? dataTestPrefix() + '-' + chip.id : null"
              (click)="chipClick.emit(chip.id)"
            >
              {{ chip.label }}
            </a>
          }
        </div>
      }

      <div
        class="group-tools flex items-center gap-form-field flex-wrap py-2 min-w-0"
        [class.group-tools--empty]="!toolsProjected()"
        data-test="group-tools"
        #toolsHost
      >
        <ng-content select="[tools]" />
      </div>
    </div>

    <div class="group-body" [class.group-body--flush]="flushBody()" data-test="group-body">
      <ng-content />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
      }

      .group-tools--empty {
        display: none;
      }

      .group-tools > * {
        min-width: 0;
      }

      .group-body {
        padding-top: 0.5rem;
        padding-inline: var(--panel-content-inset);
      }

      .group-body--flush {
        padding-top: 0;
        padding-inline: 0;
      }

      /* Flush studios (KP workspace): single tight row between TOC and chips. */
      .group-chrome--flush .group-toc {
        padding-bottom: 0;
      }

      .group-chrome--flush .group-chips {
        padding-top: 0;
      }
    `,
  ],
})
export class PiGroupWorkspaceComponent {
  private readonly auth = inject(AuthService);
  private readonly toolsHost = viewChild<ElementRef<HTMLElement>>('toolsHost');

  /**
   * @deprecated Unused — top nav is SoT for section identity (TZ-UX-315).
   * Kept as no-op input so callers can drop the attribute gradually.
   */
  readonly pathLabel = input<string>('');

  /** Top TOC: sibling groups (optional). Empty = hide row. */
  readonly toc = input<readonly GroupChip[]>([]);

  /** Active TOC group id. */
  readonly tocActiveId = input<string | null>(null);

  /** Section chips inside the current group. */
  readonly chips = input.required<readonly GroupChip[]>();

  /** Currently active section chip id (yellow). */
  readonly activeId = input.required<string>();

  /** Optional `data-test` prefix: renders `{prefix}-{chip.id}` per chip link. */
  readonly dataTestPrefix = input<string | null>(null);

  /**
   * No body top gap under chips — for full-bleed studios (Create КП).
   * Default keeps a small breathing room for tables/lists.
   */
  readonly flushBody = input(false);

  readonly tocClick = output<string>();
  readonly chipClick = output<string>();

  /** True when `[tools]` slot projected at least one element. */
  protected readonly toolsProjected = signal(false);

  /** Page-ACL filtered TOC (same source as top nav: user.pages). */
  readonly visibleToc = computed(() => filterByPageAcl(this.toc(), this.auth.user()?.pages));

  /** Page-ACL filtered section chips. */
  readonly visibleChips = computed(() => filterByPageAcl(this.chips(), this.auth.user()?.pages));

  constructor() {
    afterEveryRender(() => {
      const host = this.toolsHost()?.nativeElement;
      this.toolsProjected.set(!!host && host.childElementCount > 0);
    });
  }
}

/** Chip configuration for TOC or section row. */
export interface GroupChip {
  id: string;
  label: string;
  route: string;
  /** Optional query parameters kept separate from the route path for RouterLink. */
  queryParams?: Record<string, string | null>;
  /** Must be in role `pages` when set (ACCESS page ACL). */
  pageKey?: string;
  /** TOC groups spanning several pages — show if any key is granted. */
  anyPageKeys?: readonly string[];
}
