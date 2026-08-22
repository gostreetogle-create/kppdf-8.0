import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

/**
 * Paper & Ink — карточка-витрина.
 *
 * Три размерных варианта одного и того же компонента:
 *   size="sm" → компактная строка для списка/каталога
 *    (40×40 медиа слева, заголовок+описание в одну строку, slots для actions-sm)
 *   size="md" → средняя плитка для сеток / витрины Create КП
 *    (stretch equal-height: заголовок 2 строки + медиа 16:9 + описание 2 строки + footer)
 *   size="lg" → большая «журнальная» витрина для детального показа
 *    (eyebrow + badge + заголовок + медиа 16:9 + описание + body + related + footer actions)
 *
 * Проекция контента через стандартный <ng-content>; именованные слоты:
 *   [sc-actions] / [sc-actions-md] / [sc-actions-sm] → кнопки в footer
 *   [sc-related] → связанные сущности (только lg)
 *
 * Дизайн-токены: hairline border (var(--color-rule)), rounded-md,
 * Paper & Ink палитра, executive-shadow при hover (если interactive).
 *
 * TZ-PRODUCTS-305 — самостоятельный UI Kit; переиспользуется в TZ-PRODUCTS-302/303/304.
 */
export type ShowcaseCardSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-pi-showcase-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    @switch (size()) {
      @case ('sm') {
        <article [class]="hostClass()" data-test="showcase-card" data-size="sm">
          <div class="sc-row">
            @if (mediaUrl()) {
              <div
                class="sc-media sc-media--sm"
                [class.sc-media--interactive]="mediaInteractive() && !!mediaUrl()"
                [attr.role]="mediaInteractive() && mediaUrl() ? 'button' : null"
                [attr.tabindex]="mediaInteractive() && mediaUrl() ? 0 : null"
                [attr.aria-label]="
                  mediaInteractive() && mediaUrl() ? 'Открыть фото: ' + title() : null
                "
                (click)="onMediaActivate($event)"
                (keydown)="onMediaKeydown($event)"
              >
                <img [src]="mediaUrl()" [alt]="title() || ''" loading="lazy" />
              </div>
            }
            <div class="sc-body-sm">
              @if (eyebrow()) {
                <span class="sc-eyebrow" data-test="eyebrow">{{ eyebrow() }}</span>
              }
              @if (title()) {
                <h4 class="sc-title-sm" data-test="title">{{ title() }}</h4>
              }
              @if (description()) {
                <p class="sc-desc-sm" data-test="description">{{ description() }}</p>
              }
            </div>
            <div class="sc-actions-sm">
              <ng-content select="[sc-actions-sm]" />
            </div>
          </div>
        </article>
      }
      @case ('md') {
        <article [class]="hostClass()" data-test="showcase-card" data-size="md">
          <header class="sc-head-md">
            <div class="sc-head-md-left">
              @if (eyebrow()) {
                <span class="sc-eyebrow" data-test="eyebrow">{{ eyebrow() }}</span>
              }
              @if (badge()) {
                <span class="sc-badge" data-test="badge">{{ badge() }}</span>
              }
            </div>
            @if (interactive() && arrow()) {
              <i-lucide
                name="arrow-up-right"
                class="sc-arrow"
                aria-hidden="true"
                data-test="arrow"
              ></i-lucide>
            }
          </header>
          @if (title()) {
            <h3 class="sc-title-md font-display" data-test="title">{{ title() }}</h3>
          }
          <div
            class="sc-media sc-media--md"
            [class.sc-media--empty]="!mediaUrl()"
            [class.sc-media--interactive]="mediaInteractive() && !!mediaUrl()"
            [attr.role]="mediaInteractive() && mediaUrl() ? 'button' : null"
            [attr.tabindex]="mediaInteractive() && mediaUrl() ? 0 : null"
            [attr.aria-label]="mediaInteractive() && mediaUrl() ? 'Открыть фото: ' + title() : null"
            (click)="onMediaActivate($event)"
            (keydown)="onMediaKeydown($event)"
            data-test="showcase-media"
          >
            @if (mediaUrl()) {
              <img [src]="mediaUrl()" [alt]="title() || ''" loading="lazy" />
            }
          </div>
          @if (description()) {
            <p class="sc-desc-md" data-test="description" [attr.title]="description()">
              {{ description() }}
            </p>
          }
          <ng-content />
          @if (hasActionsMd()) {
            <footer class="sc-footer-md">
              <ng-content select="[sc-actions-md]" />
            </footer>
          }
        </article>
      }
      @case ('lg') {
        <article [class]="hostClass()" data-test="showcase-card" data-size="lg">
          <header class="sc-head-lg">
            <div class="sc-head-lg-left">
              @if (eyebrow()) {
                <span class="sc-eyebrow sc-eyebrow--lg" data-test="eyebrow">{{ eyebrow() }}</span>
              }
              @if (badge()) {
                <span class="sc-badge sc-badge--lg" data-test="badge">{{ badge() }}</span>
              }
            </div>
            @if (interactive() && arrow()) {
              <i-lucide
                name="arrow-up-right"
                class="sc-arrow"
                aria-hidden="true"
                data-test="arrow"
              ></i-lucide>
            }
          </header>
          @if (title()) {
            <h2 class="sc-title-lg font-display" data-test="title">{{ title() }}</h2>
          }
          @if (mediaUrl()) {
            <div
              class="sc-media sc-media--lg"
              [class.sc-media--interactive]="mediaInteractive() && !!mediaUrl()"
              [attr.role]="mediaInteractive() && mediaUrl() ? 'button' : null"
              [attr.tabindex]="mediaInteractive() && mediaUrl() ? 0 : null"
              [attr.aria-label]="
                mediaInteractive() && mediaUrl() ? 'Открыть фото: ' + title() : null
              "
              (click)="onMediaActivate($event)"
              (keydown)="onMediaKeydown($event)"
            >
              <img [src]="mediaUrl()" [alt]="title() || ''" loading="lazy" />
            </div>
          }
          @if (description()) {
            <p class="sc-desc-lg" data-test="description">{{ description() }}</p>
          }

          <div class="sc-body-lg">
            <ng-content />
          </div>

          <div class="sc-related" data-test="related">
            <ng-content select="[sc-related]" />
          </div>

          @if (hasActionsLg()) {
            <footer class="sc-footer-lg">
              <ng-content select="[sc-actions]" />
            </footer>
          }
        </article>
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      article {
        background: var(--color-paper, #fafafa);
        border: 1px solid var(--color-rule, #e7e3da);
        border-radius: var(--radius-md, 8px);
        position: relative;
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
      }
      article.is-hoverable {
        cursor: pointer;
        transition:
          transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
          box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1),
          border-color 200ms ease,
          background-color 200ms ease;
      }
      article.is-hoverable:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px -8px rgba(15, 15, 15, 0.12);
      }

      .sc-eyebrow {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-muted-foreground-strong, #5a554c);
      }
      .sc-eyebrow--lg {
        font-size: 11px;
      }
      .sc-badge {
        font-size: 11px;
        font-weight: 500;
        padding: 2px 8px;
        border: 1px solid var(--color-rule, #e7e3da);
        border-radius: 999px;
        background: var(--color-paper-2, #f3efe6);
        color: var(--color-ink, #1a1815);
      }
      .sc-badge--lg {
        font-size: 11px;
      }

      .sc-media img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
        display: block;
      }
      .sc-media--interactive {
        cursor: zoom-in;
        pointer-events: auto;
      }

      /* sm */
      .sc-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        min-height: 56px;
      }
      .sc-media--sm {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        overflow: hidden;
        flex-shrink: 0;
        background: var(--color-paper-2, #f3efe6);
      }
      .sc-body-sm {
        flex: 1;
        min-width: 0;
      }
      .sc-title-sm {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-ink, #1a1815);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .sc-desc-sm {
        font-size: 11px;
        color: var(--color-muted-foreground, #797063);
        margin: 2px 0 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .sc-actions-sm {
        flex-shrink: 0;
        display: flex;
        gap: 6px;
      }

      /* md — equal-height catalog tiles */
      article.size-md {
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 14px 14px 12px;
        background: var(--color-paper-2, #f3efe6);
        border-color: color-mix(
          in oklab,
          var(--color-rule, #e7e3da) 85%,
          var(--color-ink, #1a1815)
        );
        box-shadow: inset 0 1px 0 color-mix(in oklab, var(--color-paper, #fafafa) 55%, transparent);
      }
      article.size-md.is-hoverable:hover {
        background: var(--color-paper, #fafafa);
        border-color: color-mix(
          in oklab,
          var(--color-rule, #e7e3da) 60%,
          var(--color-ink, #1a1815)
        );
        box-shadow: 0 8px 20px -12px color-mix(in oklab, var(--color-ink, #1a1815) 28%, transparent);
      }
      .sc-head-md {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 1.25rem;
        flex-shrink: 0;
      }
      .sc-head-md-left {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .sc-title-md {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-ink, #1a1815);
        margin: 6px 0 0;
        min-width: 0;
        line-height: 1.3;
        min-height: calc(1.3em * 2);
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        flex-shrink: 0;
      }
      .sc-media--md {
        margin: 10px 0 0;
        aspect-ratio: 16 / 9;
        flex: 0 0 auto;
        border-radius: 4px;
        overflow: hidden;
        background: color-mix(
          in oklab,
          var(--color-paper, #fafafa) 70%,
          var(--color-paper-2, #f3efe6)
        );
        border: 1px solid var(--color-rule, #e7e3da);
        flex-shrink: 0;
      }
      .sc-media--md.sc-media--empty {
        background: linear-gradient(
          135deg,
          color-mix(in oklab, var(--color-paper-2, #f3efe6) 80%, var(--color-rule, #e7e3da)),
          var(--color-paper, #fafafa)
        );
      }
      .sc-desc-md {
        font-size: 13px;
        color: var(--color-muted-foreground, #797063);
        margin: 8px 0 0;
        min-width: 0;
        line-height: 1.4;
        min-height: calc(1.4em * 2);
        max-height: calc(1.4em * 2);
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        transition: max-height 180ms ease;
        flex-shrink: 0;
      }
      article.size-md.is-hoverable:hover .sc-desc-md {
        -webkit-line-clamp: unset;
        max-height: 6.5em;
        overflow: auto;
      }
      .sc-footer-md {
        margin-top: auto;
        padding-top: 12px;
        display: flex;
        gap: 8px;
        flex-shrink: 0;
        border-top: 1px solid color-mix(in oklab, var(--color-rule, #e7e3da) 80%, transparent);
      }

      /* lg */
      article.size-lg {
        padding: 24px;
      }
      .sc-head-lg {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      .sc-head-lg-left {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        min-width: 0;
      }
      .sc-title-lg {
        font-size: 28px;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: var(--color-ink, #1a1815);
        margin: 6px 0 14px;
        line-height: 1.15;
      }
      .sc-media--lg {
        margin: 12px 0;
        aspect-ratio: 16 / 9;
        border-radius: 6px;
        overflow: hidden;
        background: var(--color-paper-2, #f3efe6);
      }
      .sc-desc-lg {
        font-size: 15px;
        color: var(--color-ink, #1a1815);
        margin: 0 0 16px;
        max-width: 60ch;
        line-height: 1.5;
      }
      .sc-body-lg {
        display: grid;
        gap: 16px;
      }
      .sc-related {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--color-rule, #e7e3da);
      }
      .sc-footer-lg {
        margin-top: 20px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }

      .sc-arrow {
        color: var(--color-ink, #1a1815);
        transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      article.is-hoverable:hover .sc-arrow {
        transform: translate(2px, -2px);
      }
    `,
  ],
})
export class PiShowcaseCardComponent {
  readonly size = input<ShowcaseCardSize>('md');
  readonly eyebrow = input<string>('');
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly mediaUrl = input<string>('');
  readonly badge = input<string>('');
  readonly interactive = input<boolean>(false);
  /** Enables keyboard-accessible photo activation on the media region only. */
  readonly mediaInteractive = input<boolean>(false);
  readonly mediaActivate = output<void>();
  readonly arrow = input<boolean>(true);

  readonly hostClass = computed(() => {
    const cls = [`size-${this.size()}`];
    if (this.interactive()) cls.push('is-hoverable');
    if (this.size() === 'md' && this.mediaUrl()) cls.push('size-md-with-media');
    return cls.join(' ');
  });

  readonly hasActionsMd = computed(() => true);
  readonly hasActionsLg = computed(() => true);

  protected onMediaActivate(event: Event): void {
    if (!this.mediaInteractive() || !this.mediaUrl()) return;
    event.preventDefault();
    event.stopPropagation();
    this.mediaActivate.emit();
  }

  protected onMediaKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    this.onMediaActivate(event);
  }
}
