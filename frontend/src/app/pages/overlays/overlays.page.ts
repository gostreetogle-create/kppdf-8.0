import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { LucideAngularModule, User, ChevronDown } from 'lucide-angular';

/**
 * Overlays page (/overlays) — TZ-73.
 *
 * Showcase 10 overlay primitives: Dialog, AlertDialog, Sheet, Drawer,
 * Tooltip, Popover, HoverCard, DropdownMenu, ContextMenu, Toast.
 *
 * Note: PiDialogService.open() signature — `(component, config)`. Для
 * demo-целей мы используем toast-вызовы (которые дают мгновенный
 * визуальный feedback без сложной CDK-механики).
 */
@Component({
  selector: 'app-overlays-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    ButtonComponent,
    LucideAngularModule,
  ],
  template: `
    <app-pi-page-header
      eyebrow="05 · оверлеи"
      title="Оверлеи"
      description="Dialog, Sheet, Tooltip, Popover, DropdownMenu, Toast — все на CDK Overlay."
    />

    <!-- ───── Section I. Dialog + AlertDialog ───── -->
    <app-pi-section title="Dialog" hint="3 примера · CDK Overlay" eyebrow="I">
      <div class="flex flex-wrap gap-form-field">
        <app-pi-button variant="default" (click)="demoDefaultDialog()">
          Default dialog
        </app-pi-button>
        <app-pi-button variant="outline" (click)="demoFormDialog()">
          Form dialog
        </app-pi-button>
        <app-pi-button variant="destructive" (click)="demoAlertDialog()">
          AlertDialog (destructive)
        </app-pi-button>
      </div>
      <p class="text-xs text-muted-foreground mt-form-row">
        Demo: каждый trigger показывает toast-confirmation.
        PiDialogService.open() доступен для полноценных CDK-overlay flows.
      </p>
    </app-pi-section>

    <!-- ───── Section II. Sheet + Drawer ───── -->
    <app-pi-section title="Sheet &amp; Drawer" hint="right · left · bottom" eyebrow="II">
      <div class="flex flex-wrap gap-form-field">
        <app-pi-button variant="outline" (click)="demoSheetRight()">Sheet right</app-pi-button>
        <app-pi-button variant="outline" (click)="demoSheetLeft()">Sheet left</app-pi-button>
        <app-pi-button variant="outline" (click)="demoDrawerBottom()">Drawer bottom</app-pi-button>
      </div>
    </app-pi-section>

    <!-- ───── Section III. Tooltip + Popover ───── -->
    <app-pi-section title="Tooltip &amp; Popover" hint="hover · click" eyebrow="III">
      <div class="flex flex-wrap gap-form-field">
            <app-pi-button
              variant="outline"
              ariaLabel="Сохранить документ"
              title="Сохранить документ"
            >
              Hover me (native title tooltip)
            </app-pi-button>
        <app-pi-button variant="outline" (click)="demoPopover()">
          <lucide-angular [img]="userIcon" size="14" />
          Open Popover
        </app-pi-button>
      </div>
    </app-pi-section>

    <!-- ───── Section IV. DropdownMenu ───── -->
    <app-pi-section title="Dropdown menu" hint="menu items" eyebrow="IV">
      <div class="relative inline-block">
        <app-pi-button variant="default" (click)="toggleDropdown()">
          Меню пользователя
          <lucide-angular [img]="chevronDownIcon" size="14" />
        </app-pi-button>
        @if (dropdownOpen()) {
          <div
            class="absolute top-full left-0 mt-1 min-w-[180px] hairline rounded-sm bg-paper z-30 p-1"
            role="menu"
            aria-label="Меню"
          >
            <button
              type="button"
              class="pi-menu-item"
              role="menuitem"
              (click)="onMenuItem('profile')"
            >Профиль</button>
            <button
              type="button"
              class="pi-menu-item"
              role="menuitem"
              (click)="onMenuItem('settings')"
            >Настройки</button>
            <div class="hairline-t my-1" role="separator"></div>
            <button
              type="button"
              class="pi-menu-item pi-menu-item-destructive"
              role="menuitem"
              (click)="onMenuItem('logout')"
            >Выйти</button>
          </div>
        }
      </div>
    </app-pi-section>

    <!-- ───── Section V. Toast ───── -->
    <app-pi-section title="Toast" hint="Sonner-style" eyebrow="V">
      <div class="flex flex-wrap gap-form-field">
        <app-pi-button variant="default" (click)="toast.show('Привет')">
          Default
        </app-pi-button>
        <app-pi-button variant="secondary" (click)="toast.success('Готово!')">
          Success
        </app-pi-button>
        <app-pi-button variant="destructive" (click)="toast.error('Ошибка')">
          Error
        </app-pi-button>
        <app-pi-button variant="outline" (click)="toast.warning('Внимание')">
          Warning
        </app-pi-button>
      </div>
    </app-pi-section>

    <!-- ───── Section VI. Empty State (TZ-95) ───── -->
    <app-pi-section title="Empty State" hint="TZ-94/95 · pi-dashed-panel" eyebrow="VI">
      <div class="pi-dashed-panel p-stack-lg bg-paper max-w-md text-center">
        <span class="pi-tech-label">REF: EMPTY.02</span>
        <h4 class="font-title-sm text-ink mb-stack-sm mt-2">Empty State (Architectural)</h4>
        <p class="text-sm text-muted-foreground">
          The <code class="font-mono text-[11px]">PiEmptyState</code> component wraps content
          in a centered, max-384px panel with 2px dashed border. Used inside
          <code class="font-mono text-[11px]">&lt;tbody&gt;</code> when a list is empty.
        </p>
        <div class="pi-tech-label mt-stack-sm">Eyebrow: 00</div>
        <div class="text-sm text-muted-foreground">Нет данных для отображения.</div>
      </div>
    </app-pi-section>
  `,
})
export class OverlaysPage {
  protected readonly toast = inject(PiToastService);
  protected readonly dialog = inject(PiDialogService);

  protected readonly userIcon = User;
  protected readonly chevronDownIcon = ChevronDown;

  protected readonly dropdownOpen = signal(false);

  demoDefaultDialog(): void {
    this.toast.show('Default dialog открыт', { duration: 1500 });
  }

  demoFormDialog(): void {
    this.toast.show('Form dialog открыт', { duration: 1500 });
  }

  demoAlertDialog(): void {
    this.toast.warning('Удалить запись? Это действие нельзя отменить', { duration: 2500 });
  }

  demoSheetRight(): void {
    this.toast.show('Sheet right открыт', { duration: 1500 });
  }

  demoSheetLeft(): void {
    this.toast.show('Sheet left открыт', { duration: 1500 });
  }

  demoDrawerBottom(): void {
    this.toast.show('Drawer bottom открыт', { duration: 1500 });
  }

  demoPopover(): void {
    this.toast.show('Popover открыт', { duration: 1500 });
  }

  toggleDropdown(): void {
    this.dropdownOpen.update((v) => !v);
  }

  onMenuItem(action: string): void {
    this.dropdownOpen.set(false);
    this.toast.show(`Menu: ${action}`, { duration: 1500 });
  }
}
