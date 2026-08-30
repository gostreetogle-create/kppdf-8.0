import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PiPageHeaderComponent } from '@kppdf/ui/page';
import { PiSectionComponent } from '@kppdf/ui/page';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiToastService } from '@kppdf/ui/toast';
import { DropdownMenuComponent, DropdownMenuItem } from '@kppdf/ui/dropdown-menu';
import { LucideAngularModule, User, ChevronDown } from 'lucide-angular';

/**
 * Overlays page (/kit/overlays) — TZ-73, TZ-UI-WR-506.
 *
 * KIT-AUDIT-2 (2026-08-29): this page used to claim "showcase 10 overlay
 * primitives" while 8 of them were actually toast-simulated triggers, not
 * the real component. That claim is dropped. Honest split:
 *
 *  - REAL, interactive: **Toast** (PiToastService, live) and
 *    **DropdownMenu** (`app-pi-dropdown-menu`, live — was a hand-rolled
 *    lookalike `<div role="menu">` until this pass; now the real component).
 *  - PLACEHOLDER: Dialog / AlertDialog / Sheet / Drawer / Popover click a
 *    button that shows a toast, not the real CDK-overlay component — wiring
 *    `PiDialogService.open()`, `PiSheetService`, `PiDrawerComponent`, and
 *    `pi-popover.directive.ts` for real is its own task (each needs a host
 *    component + config, more than a docs-page pass should improvise).
 *  - PLACEHOLDER (native, not the Pi component): "Tooltip" is a plain HTML
 *    `title` attribute, not `pi-tooltip.directive.ts`.
 *  - NOT PRESENT AT ALL despite being named in the old claim: **HoverCard**,
 *    **ContextMenu** — no section for either exists on this page.
 *
 * Each placeholder section below says so inline, not just here.
 *
 * ── Паспорта примитивов ──
 *
 * Dialog
 *   Назначение: модальное окно с затемнением фона, подтверждение действий.
 *   Anti-use: не для inline-редактирования, не для навигации.
 *   Keyboard: Esc закрывает, фокус заперт внутри.
 *   Статус: компонент canonical; демо на этой странице — placeholder (toast,
 *     не реальный `PiDialogService.open()`).
 *
 * Sheet
 *   Назначение: боковая панель (right/left) для фильтров, состава, заметок.
 *   Anti-use: не для основного контента, не на мобильных (Drawer).
 *   Keyboard: Esc закрывает.
 *   Статус: компонент canonical; демо на этой странице — placeholder (toast).
 *
 * Drawer
 *   Назначение: нижняя панель на мобильных, быстрые действия.
 *   Anti-use: не на десктопе (Sheet).
 *   Keyboard: Esc закрывает.
 *   Статус: компонент canonical; демо на этой странице — placeholder (toast).
 *
 * DropdownMenu
 *   Назначение: выпадающее меню действий (три точки / контекст).
 *   Anti-use: не для навигации (используй OverflowSelect), не для форм.
 *   Keyboard: ↑↓ стрелки, Enter выбор, Esc закрыть.
 *   Статус: canonical — демо на этой странице реально использует
 *     `app-pi-dropdown-menu` (до KIT-AUDIT-2 здесь был hand-rolled div-двойник).
 *
 * OverflowSelect
 *   Назначение: выбор из выпадающего списка с overflow-поведением.
 *   Anti-use: не для меню действий (DropdownMenu).
 *   Keyboard: ↑↓ стрелки, Enter выбрать, Esc закрыть.
 *   Статус: canonical (см. app-pi-overflow-select).
 *
 * Toast
 *   Назначение: краткое уведомление (success, error, warning) — Sonner-style.
 *   Anti-use: не для долгих сообщений, не для confirm-диалогов.
 *   Keyboard: автоисчезновение, не фокусируется.
 *   Статус: canonical.
 */
@Component({
  selector: 'app-overlays-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiPageHeaderComponent,
    PiSectionComponent,
    ButtonComponent,
    LucideAngularModule,
    DropdownMenuComponent,
  ],
  template: `
    <app-pi-page-header
      eyebrow="05 · оверлеи"
      title="Оверлеи"
      description="Toast и DropdownMenu — реальные компоненты. Dialog/Sheet/Drawer/Popover/Tooltip
        ниже — placeholder-триггеры (toast или native title), не сами CDK-компоненты."
    />

    <!-- ───── Section I. Dialog + AlertDialog (PLACEHOLDER — toast, не PiDialogService.open()) ───── -->
    <app-pi-section title="Dialog" hint="placeholder · toast, не CDK Overlay" eyebrow="I">
      <div class="flex flex-wrap gap-form-field">
        <app-pi-button variant="default" (click)="demoDefaultDialog()">
          Default dialog
        </app-pi-button>
        <app-pi-button variant="outline" (click)="demoFormDialog()"> Form dialog </app-pi-button>
        <app-pi-button variant="destructive" (click)="demoAlertDialog()">
          AlertDialog (destructive)
        </app-pi-button>
      </div>
      <p class="text-xs text-muted-foreground mt-form-row">
        Placeholder: каждый trigger только показывает toast, реальный CDK-диалог не открывается.
        <code class="font-mono text-[11px]">PiDialogService.open(component, config)</code> нужен
        для полноценного flow — требует host-компонент, не заведён на этой демо-странице.
      </p>
    </app-pi-section>

    <!-- ───── Section II. Sheet + Drawer (PLACEHOLDER — toast) ───── -->
    <app-pi-section title="Sheet &amp; Drawer" hint="placeholder · toast, не CDK Overlay" eyebrow="II">
      <div class="flex flex-wrap gap-form-field">
        <app-pi-button variant="outline" (click)="demoSheetRight()">Sheet right</app-pi-button>
        <app-pi-button variant="outline" (click)="demoSheetLeft()">Sheet left</app-pi-button>
        <app-pi-button variant="outline" (click)="demoDrawerBottom()">Drawer bottom</app-pi-button>
      </div>
      <p class="text-xs text-muted-foreground mt-form-row">
        Placeholder: toast вместо реального <code class="font-mono text-[11px]">PiSheetService</code>
        / <code class="font-mono text-[11px]">PiDrawerComponent</code>.
      </p>
    </app-pi-section>

    <!-- ───── Section III. Tooltip + Popover (PLACEHOLDER) ───── -->
    <app-pi-section
      title="Tooltip &amp; Popover"
      hint="placeholder · native title / toast"
      eyebrow="III"
    >
      <div class="flex flex-wrap gap-form-field">
        <app-pi-button variant="outline" ariaLabel="Сохранить документ" title="Сохранить документ">
          Hover me (native title tooltip)
        </app-pi-button>
        <app-pi-button variant="outline" (click)="demoPopover()">
          <lucide-angular [img]="userIcon" size="14" />
          Open Popover
        </app-pi-button>
      </div>
      <p class="text-xs text-muted-foreground mt-form-row">
        Placeholder: «Tooltip» здесь — обычный HTML <code class="font-mono text-[11px]">title</code>,
        не <code class="font-mono text-[11px]">pi-tooltip.directive.ts</code>. «Popover» — toast,
        не <code class="font-mono text-[11px]">pi-popover.directive.ts</code>. HoverCard и
        ContextMenu на этой странице не показаны вообще (были в старом заголовке страницы, но
        секции для них никогда не было).
      </p>
    </app-pi-section>

    <!-- ───── Section IV. DropdownMenu (реальный компонент) ───── -->
    <app-pi-section title="Dropdown menu" hint="app-pi-dropdown-menu · реальный компонент" eyebrow="IV">
      <div class="relative inline-block">
        <app-pi-button variant="default" (click)="toggleDropdown()">
          Меню пользователя
          <lucide-angular [img]="chevronDownIcon" size="14" />
        </app-pi-button>
        @if (dropdownOpen()) {
          <div class="absolute top-full left-0 mt-1 z-30">
            <app-pi-dropdown-menu
              [items]="userMenuItems"
              ariaLabel="Меню пользователя"
              (close)="dropdownOpen.set(false)"
            />
          </div>
        }
      </div>
    </app-pi-section>

    <!-- ───── Section V. Toast ───── -->
    <app-pi-section title="Toast" hint="Sonner-style" eyebrow="V">
      <div class="flex flex-wrap gap-form-field">
        <app-pi-button variant="default" (click)="toast.show('Привет')"> Default </app-pi-button>
        <app-pi-button variant="secondary" (click)="toast.success('Готово!')">
          Success
        </app-pi-button>
        <app-pi-button variant="destructive" (click)="toast.error('Ошибка')"> Error </app-pi-button>
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
          The <code class="font-mono text-[11px]">PiEmptyState</code> component wraps content in a
          centered, max-384px panel with 2px dashed border. Used inside
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

  protected readonly userMenuItems: DropdownMenuItem[] = [
    { label: 'Профиль', dataTest: 'menu-profile', handler: () => this.onMenuItem('profile') },
    { label: 'Настройки', dataTest: 'menu-settings', handler: () => this.onMenuItem('settings') },
    { label: 'Выйти', dataTest: 'menu-logout', handler: () => this.onMenuItem('logout') },
  ];

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
