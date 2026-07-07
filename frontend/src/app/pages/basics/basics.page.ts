import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { LucideAngularModule, Settings, CircleDot } from 'lucide-angular';

/**
 * Basics page (/basics) — TZ-71.
 *
 * Showcase Button (6 variants × 4 sizes), Input/Textarea с валидацией,
 * Badge (4 variants), Card compositions.
 *
 * Note: Input/Textarea directives были deprecated — используем native
 * <input> / <textarea> с Tailwind-стилями (как в kppdf-7.0).
 */
@Component({
  selector: 'app-basics-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    ButtonComponent,
    BadgeComponent,
    CardComponent,
    FormFieldComponent,
    LucideAngularModule,
  ],
  template: `
    <app-pi-page-header
      eyebrow="03 · кнопки и инпуты"
      title="Кнопки &amp; Инпуты"
      subtitle="6 вариантов × 4 размера для кнопок; состояния disabled и loading."
      hint="0.2s · variants"
    />

    <!-- ───── Section I. Buttons ───── -->
    <app-pi-section title="Buttons" hint="6 variants × 4 sizes × 2 states" eyebrow="I">
      <div class="space-y-8">
        <div>
          <p class="eyebrow mb-3">Variants</p>
          <div class="flex flex-wrap gap-2">
            <app-pi-button variant="default">Default</app-pi-button>
            <app-pi-button variant="secondary">Secondary</app-pi-button>
            <app-pi-button variant="outline">Outline</app-pi-button>
            <app-pi-button variant="ghost">Ghost</app-pi-button>
            <app-pi-button variant="link">Link</app-pi-button>
            <app-pi-button variant="destructive">Destructive</app-pi-button>
          </div>
        </div>
        <div>
          <p class="eyebrow mb-3">Sizes</p>
          <div class="flex flex-wrap items-center gap-2">
            <app-pi-button size="sm">Small</app-pi-button>
            <app-pi-button size="md">Medium</app-pi-button>
            <app-pi-button size="lg">Large</app-pi-button>
            <app-pi-button size="icon" ariaLabel="Settings">
              <lucide-angular [img]="settingsIcon" size="16" />
            </app-pi-button>
          </div>
        </div>
        <div>
          <p class="eyebrow mb-3">States</p>
          <div class="flex flex-wrap items-center gap-2">
            <app-pi-button [disabled]="true">Disabled</app-pi-button>
            <app-pi-button [disabled]="true">Loading…</app-pi-button>
          </div>
        </div>
      </div>
    </app-pi-section>

    <!-- ───── Section II. Inputs (form pattern) ───── -->
    <app-pi-section title="Inputs" hint="form-field + native input/textarea + signal-state" eyebrow="II">
      <div class="max-w-xl space-y-section">
        <app-pi-form-field label="Имя клиента" hint="Как в паспорте">
          <input
            id="basic-name"
            type="text"
            name="name"
            placeholder="Иван Иванов"
            class="pi-input w-full"
            [value]="name()"
            (input)="name.set($any($event.target).value)"
          />
        </app-pi-form-field>

        <app-pi-form-field label="E-mail" [required]="true" [error]="emailError()">
          <input
            id="basic-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            class="pi-input w-full"
            [class.border-rule]="!emailError()"
            [class.border-destructive]="!!emailError()"
            [value]="email()"
            (input)="email.set($any($event.target).value)"
          />
        </app-pi-form-field>

        <app-pi-form-field label="Комментарий" hint="До 240 символов">
          <textarea
            id="basic-comment"
            name="comment"
            rows="4"
            maxlength="240"
            placeholder="Ваш комментарий…"
            class="pi-input w-full h-auto py-control-y resize-none"
            [value]="comment()"
            (input)="comment.set($any($event.target).value)"
          ></textarea>
          <span class="font-mono text-[10px] text-muted-foreground block mt-1">
            {{ comment().length }} / 240
          </span>
        </app-pi-form-field>
      </div>
    </app-pi-section>

    <!-- ───── Section III. Badges ───── -->
    <app-pi-section title="Badges" hint="4 variants × 2 sizes" eyebrow="III">
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <app-pi-badge variant="default">Default</app-pi-badge>
          <app-pi-badge variant="secondary">Secondary</app-pi-badge>
          <app-pi-badge variant="outline">Outline</app-pi-badge>
          <app-pi-badge variant="destructive">Destructive</app-pi-badge>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <app-pi-badge variant="default" size="sm">Small</app-pi-badge>
          <app-pi-badge variant="secondary" size="sm">Small</app-pi-badge>
          <app-pi-badge variant="outline" size="sm">Small</app-pi-badge>
          <app-pi-badge variant="destructive" size="sm">Small</app-pi-badge>
        </div>
        <div class="flex items-center gap-2">
          <app-pi-badge variant="default" size="sm">
            <lucide-angular [img]="circleDotIcon" size="10" />
            beta
          </app-pi-badge>
          <span class="eyebrow text-[10px]">v0.1.2</span>
        </div>
      </div>
    </app-pi-section>

    <!-- ───── Section IV. Card compositions ───── -->
    <app-pi-section title="Cards" hint="default · interactive · with footer" eyebrow="IV">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <app-pi-card title="Default" description="Eyebrow + title + body" />

        <a class="block p-5 hairline rounded-sm hover:border-ink transition-colors">
          <p class="eyebrow text-[10px]">02</p>
          <h3 class="font-display text-lg font-semibold mt-2">Interactive</h3>
          <p class="text-sm text-muted-foreground mt-1">
            Hover → border-ink. Полностью кликабельная.
          </p>
        </a>

        <div class="p-5 hairline rounded-sm">
          <p class="eyebrow text-[10px]">03</p>
          <h3 class="font-display text-lg font-semibold mt-2">With footer</h3>
          <p class="text-sm text-muted-foreground mt-1">
            Контент сверху, action-button снизу.
          </p>
          <div class="mt-4 pt-3 hairline-t">
            <app-pi-button size="sm" variant="outline">Действие</app-pi-button>
          </div>
        </div>
      </div>
    </app-pi-section>
  `,
})
export class BasicsPage {
  protected readonly settingsIcon = Settings;
  protected readonly circleDotIcon = CircleDot;

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly comment = signal('');

  protected readonly emailError = computed(() => {
    const v = this.email().trim();
    if (v === '') return '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Невалидный e-mail';
    return '';
  });
}
