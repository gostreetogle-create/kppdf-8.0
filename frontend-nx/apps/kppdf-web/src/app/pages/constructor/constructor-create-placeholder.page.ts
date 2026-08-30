import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { PiPageChromeComponent } from '@kppdf/ui/page';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { ButtonComponent } from '@kppdf/ui/button';
import {
  CONSTRUCTOR_CREATE_KINDS,
  constructorCreateKindMeta,
  isConstructorCreateKind,
} from './constructor.types';

/**
 * TZ-NX-CONSTRUCTOR-SHELL — honest «раздел готовится» placeholder for each
 * create kind. Typed route param `:kind` must be one of the four create kinds.
 */
@Component({
  selector: 'pi-constructor-create-placeholder-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PiPageChromeComponent, PiStatusBannerComponent, ButtonComponent],
  template: `
    <section
      class="max-w-xl mx-auto"
      [attr.aria-labelledby]="
        meta() ? 'constructor-placeholder-heading' : 'constructor-unknown-kind-heading'
      "
      data-test="constructor-create-placeholder"
    >
      <app-pi-page-chrome
        [crumbs]="[
          { label: 'Конструктор', link: '/constructor' },
          { label: placeholderTitle() },
        ]"
      />

      @if (meta(); as kindMeta) {
        <app-pi-status-banner
          tone="info"
          [message]="placeholderMessage(kindMeta)"
          data-test="constructor-placeholder-banner"
        />

        <div class="mt-4 hairline rounded-sm px-4 py-3 text-sm" data-test="constructor-placeholder-copy">
          <h2
            id="constructor-placeholder-heading"
            class="font-display text-base tracking-tight text-ink m-0 mb-2"
          >
            {{ kindMeta.label }}
          </h2>
          <p class="m-0 text-muted-foreground leading-relaxed">{{ kindMeta.description }}</p>
          @if (kindMeta.kind === 'part') {
            <p class="m-0 mt-2 text-muted-foreground leading-relaxed">
              Backend хранит деталь в коллекции Material с
              <code class="font-mono text-[11px]">materialKind = part</code>.
            </p>
          }
          @if (kindMeta.kind === 'product') {
            <p class="m-0 mt-2 text-muted-foreground leading-relaxed">
              Комплекс — производное изделие: отдельного create-kind и коллекции Complex нет.
            </p>
          }
        </div>

        <div class="mt-4">
          <app-pi-button
            variant="outline"
            size="sm"
            data-test="constructor-placeholder-back"
            (click)="goToConstructorChoice()"
          >
            ← К выбору типа
          </app-pi-button>
        </div>
      } @else {
        <h2 id="constructor-unknown-kind-heading" class="sr-only">Неизвестный тип создания</h2>
        <div
          class="hairline rounded-sm px-4 py-3 text-sm flex items-center justify-between gap-3 flex-wrap"
          role="alert"
          data-test="constructor-unknown-kind"
        >
          <span>Неизвестный тип «{{ rawKind() }}».</span>
          <a
            routerLink="/constructor"
            class="pi-focus-ring underline decoration-dotted"
            data-test="constructor-unknown-back"
          >
            ← К конструктору
          </a>
        </div>
      }
    </section>
  `,
})
export class ConstructorCreatePlaceholderPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly rawKind = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('kind'))),
    { initialValue: this.route.snapshot.paramMap.get('kind') },
  );

  protected readonly meta = computed(() => {
    const kind = this.rawKind();
    if (!isConstructorCreateKind(kind)) return null;
    return constructorCreateKindMeta(kind) ?? null;
  });

  protected readonly placeholderTitle = computed(() => this.meta()?.label ?? 'Создание');

  protected goToConstructorChoice(): void {
    void this.router.navigateByUrl('/constructor');
  }

  protected placeholderMessage(kindMeta: { label: string }): string {
    return (
      `Раздел «${kindMeta.label}» готовится. Форма паспорта и редактор состава ` +
      'появятся в следующих волнах — без новых сущностей и без отдельного типа «Комплекс».'
    );
  }

  /** Exported for tests — ensures Complex is never a create kind. */
  protected readonly allCreateKindLabels = CONSTRUCTOR_CREATE_KINDS.map((k) => k.label);
}
