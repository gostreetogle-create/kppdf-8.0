import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule, MonitorUp } from 'lucide-angular';
import { AuthService } from '../../core/auth.service';
import { PiDeviceEnrollmentService } from '../../shared/services/pi-device-enrollment.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';

/**
 * TZ-AUTH-304 — публичная активация устройства по одноразовой ссылке.
 *
 * Получатель вводит РОВНО одно значение — имя компьютера. Никаких ФИО /
 * email / логина / пароля / ролей / токенов. GET этой страницы НЕ активирует
 * invite: только явная кнопка «Подключить» шлёт POST /device/enroll.
 *
 * После успеха:
 *   - access JWT применяется через AuthService.applyDeviceAccess (без refresh),
 *   - /auth/me наполняет user (роль + permissions + pages),
 *   - токен удаляется из URL через replaceUrl, открывается первая разрешённая
 *     страница (router сам резолвит `/`).
 */
@Component({
  selector: 'app-enroll-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ButtonComponent, FormFieldComponent, InputComponent, RouterLink],
  template: `
    <div
      class="min-h-screen bg-paper text-ink font-body flex items-center justify-center px-page-x"
    >
      <main
        class="w-full max-w-sm border hairline border-sunrise-warm rounded-sm px-8 py-8 bg-white box-border overflow-hidden"
      >
        <div class="flex items-center gap-2 mb-6">
          <span class="block w-[10px] h-[10px] bg-ink shrink-0" aria-hidden="true"></span>
          <span class="font-display font-bold tracking-tight text-sm"> KPPDF · Компьютер </span>
        </div>

        <h1 class="font-display text-lg font-semibold mb-2">Подключение компьютера</h1>
        <p class="text-xs text-muted-foreground mb-6">
          После подключения откроется подготовленный для вас доступ.
        </p>

        <form
          (submit)="onSubmit($event)"
          class="space-y-section"
          autocomplete="off"
          data-test="enroll-form"
        >
          <app-pi-form-field
            label="Как назвать этот компьютер?"
            htmlFor="enroll-name"
            [required]="true"
          >
            <app-pi-input
              id="enroll-name"
              type="text"
              autocomplete="off"
              [(value)]="deviceName"
              [invalid]="!!error()"
              placeholder="Например: Офис Марии или Цеховой компьютер"
            />
          </app-pi-form-field>

          @if (error()) {
            <p role="alert" class="text-xs text-destructive" data-test="enroll-error">
              {{ error() }}
            </p>
          }

          <app-pi-button
            type="submit"
            variant="default"
            [disabled]="submitting()"
            class="w-full"
            data-test="enroll-submit"
          >
            <lucide-angular [img]="monitorUpIcon" [size]="13" aria-hidden="true" />
            {{ submitting() ? 'Подключаем…' : 'Подключить' }}
          </app-pi-button>

          <p class="text-xs text-muted-foreground text-center mt-4">
            Чтобы подключить этот компьютер, сохраняем его имя и технический cookie доступа. Не для
            рекламы.
            <br />
            <a routerLink="/legal/privacy" class="underline hover:text-ink transition-colors"
              >Политика обработки персональных данных</a
            >
          </p>
        </form>

        <p class="eyebrow text-[11px] text-muted-foreground mt-10 text-center">kppdf-8.0 · 2026</p>
      </main>
    </div>
  `,
})
export class EnrollPage {
  /** Одноразовый token из URL (`/enroll/:token`). */
  readonly token = input.required<string>();

  private readonly auth = inject(AuthService);
  private readonly devices = inject(PiDeviceEnrollmentService);
  private readonly router = inject(Router);

  protected readonly monitorUpIcon = MonitorUp;
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  // Two-way-bound to the input via ngModel-like [(value)] binding.
  protected deviceName = '';

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.submitting()) return;
    const name = this.deviceName.trim();
    if (!name) {
      this.error.set('Введите имя компьютера.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.devices.enroll(this.token(), name));
      if (!res.ok) {
        const e = res.error;
        this.error.set(this.describeEnrollError(e));
        this.submitting.set(false);
        return;
      }

      // Device session: only the short access JWT, never a refresh token.
      this.auth.applyDeviceAccess(res.data.access);
      await this.auth.ensureUser();

      // Remove the one-time token from browser history, then open the first
      // permitted page (router resolves `/` against the role's page ACL).
      await this.router.navigateByUrl('/', { replaceUrl: true });
    } catch {
      this.error.set('Не удалось подключить компьютер. Попробуйте ещё раз.');
      this.submitting.set(false);
    }
  }

  private describeEnrollError(e: { status?: number; error?: unknown }): string {
    if (e?.status === 409) return 'Эта ссылка уже была использована.';
    if (e?.status === 410 || e?.status === 400 || e?.status === 404) {
      return 'Приглашение недействительно или истекло. Обратитесь к администратору.';
    }
    const msg = (e?.error as { message?: unknown } | null)?.message;
    if (typeof msg === 'string' && msg.length > 0) return msg;
    return 'Не удалось подключить компьютер. Попробуйте ещё раз.';
  }
}
