import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  link?: string;
  icon?: string;
}

@Component({
  selector: 'hlm-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav aria-label="Breadcrumb">
      <ol class="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
        @for (item of items(); track item.label; let isLast = $last) {
          <li class="inline-flex items-center gap-1.5">
            @if (item.link && !isLast) {
              <a
                [routerLink]="item.link"
                class="inline-flex items-center gap-1 transition-colors hover:text-foreground"
              >
                @if (item.icon) {
                  <span class="lucide-{{ item.icon }} h-3.5 w-3.5" aria-hidden="true"></span>
                }
                {{ item.label }}
              </a>
            } @else {
              <span
                [attr.aria-current]="isLast ? 'page' : null"
                [class]="
                  isLast
                    ? 'inline-flex items-center gap-1 font-normal text-foreground'
                    : 'inline-flex items-center gap-1'
                "
              >
                @if (item.icon) {
                  <span class="lucide-{{ item.icon }} h-3.5 w-3.5" aria-hidden="true"></span>
                }
                {{ item.label }}
              </span>
            }
            @if (!isLast) {
              <span aria-hidden="true" class="lucide-chevron-right h-3.5 w-3.5"></span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  readonly items = input.required<BreadcrumbItem[]>();
  readonly separator = input<string>('chevron-right');
}
