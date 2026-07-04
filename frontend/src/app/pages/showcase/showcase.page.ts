import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { SwitchComponent } from '../../shared/components/switch/switch.component';
import { SliderComponent } from '../../shared/components/slider/slider.component';
import { TabsComponent } from '../../shared/components/tabs/tabs.component';
import { TabsListComponent } from '../../shared/components/tabs/tabs-list.component';
import { TabsTriggerComponent } from '../../shared/components/tabs/tabs-trigger.component';
import { TabsContentComponent } from '../../shared/components/tabs/tabs-content.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { AccordionComponent, AccordionItemComponent } from '../../shared/components/accordion/accordion.component';
import { SheetComponent } from '../../shared/components/sheet/sheet.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ComboboxComponent, ComboboxOption } from '../../shared/components/combobox/combobox.component';
import { RatingComponent } from '../../shared/components/rating/rating.component';
import { StepperComponent, StepperStep } from '../../shared/components/stepper/stepper.component';
import { ProgressComponent } from '../../shared/components/progress/progress.component';
import { AvatarComponent, AvatarGroupComponent } from '../../shared/components/avatar/avatar.component';
import { CommandPaletteComponent, CommandItem } from '../../shared/components/command-palette/command-palette.component';
import { DensityToggleComponent } from '../../shared/components/density-toggle/density-toggle.component';
import { ShortcutsComponent } from '../../shared/components/shortcuts/shortcuts.component';
import { ChartComponent } from '../../shared/components/chart/chart.component';
import { CalendarComponent } from '../../shared/components/calendar/calendar.component';
import { OtpInputComponent } from '../../shared/components/otp-input/otp-input.component';
import { KbdComponent, KbdGroupComponent } from '../../shared/components/kbd/kbd.component';
import { PopoverComponent } from '../../shared/components/popover/popover.component';
import { ContextMenuComponent, ContextMenuItem } from '../../shared/components/context-menu/context-menu.component';
import { HoverCardComponent } from '../../shared/components/hover-card/hover-card.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { ResizablePanelGroupComponent } from '../../shared/components/resizable/resizable-panel-group.component';
import { ResizablePanelComponent } from '../../shared/components/resizable/resizable-panel-group.component';
import { ResizableHandleComponent } from '../../shared/components/resizable/resizable-panel-group.component';
import { ScrollAreaComponent } from '../../shared/components/scroll-area/scroll-area.component';
import { AspectRatioComponent } from '../../shared/components/aspect-ratio/aspect-ratio.component';
import { CollapsibleComponent } from '../../shared/components/collapsible/collapsible.component';
import { CarouselComponent, CarouselItemComponent, CarouselSlide } from '../../shared/components/carousel/carousel.component';
import { ThemeService } from '../../core/services/theme.service';
import { ScrollSpyDirective } from '../../core/directives/scroll-spy.directive';
import { TooltipDirective } from '../../shared/components/tooltip/tooltip.directive';
import { ToastService } from '../../core/services/toast.service';

interface Section {
  id: string;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    BadgeComponent,
    CardComponent,
    SwitchComponent,
    SliderComponent,
    TabsComponent,
    TabsListComponent,
    TabsTriggerComponent,
    TabsContentComponent,
    BreadcrumbComponent,
    AccordionComponent,
    AccordionItemComponent,
    SheetComponent,
    PaginationComponent,
    ComboboxComponent,
    RatingComponent,
    StepperComponent,
    ProgressComponent,
    AvatarComponent,
    AvatarGroupComponent,
    CommandPaletteComponent,
    DensityToggleComponent,
    ShortcutsComponent,
    ChartComponent,
    CalendarComponent,
    OtpInputComponent,
    KbdComponent,
    KbdGroupComponent,
    PopoverComponent,
    ContextMenuComponent,
    HoverCardComponent,
    BottomSheetComponent,
    ResizablePanelGroupComponent,
    ResizablePanelComponent,
    ResizableHandleComponent,
    CarouselItemComponent,
    ScrollAreaComponent,
    AspectRatioComponent,
    CollapsibleComponent,
    CarouselComponent,
    ScrollSpyDirective,
    TooltipDirective,
  ],
  template: `
    <!-- Top Toolbar -->
    <div class="sticky top-0 z-30 -mx-4 mb-6 border-b border-border bg-background/80 backdrop-blur px-4 py-3 flex items-center gap-3">
      <h1 class="text-lg font-bold tracking-tight flex items-center gap-2">
        <span class="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">UI Kit</span>
        <span class="text-muted-foreground text-sm font-normal">showcase</span>
      </h1>
      <span class="text-xs text-muted-foreground hidden md:inline">v1.0 · {{ sections().length }} sections · TZ-35</span>
      <div class="ml-auto flex items-center gap-2">
        <hlm-density-toggle></hlm-density-toggle>
        <button hlmTooltip="Toggle theme" hlmTooltipPosition="bottom" class="btn-icon btn-outline" (click)="theme.toggle()">
          <span [class]="'h-4 w-4 ' + (theme.theme() === 'dark' ? 'lucide-sun' : 'lucide-moon')"></span>
        </button>
        <button hlmTooltip="Show shortcuts (?)" class="btn-outline btn-sm" (click)="shortcuts.show()">
          <span class="lucide-keyboard h-3.5 w-3.5"></span>
        </button>
        <button hlmTooltip="Command palette (⌘K)" class="btn-primary btn-sm" (click)="palette.show()">
          <span class="lucide-search h-3.5 w-3.5"></span>
          <span>⌘K</span>
        </button>
      </div>
    </div>

    <!-- Section nav pills -->
    <hlm-scroll-area className="mb-6" [maxHeight]="'auto'">
      <div class="flex gap-1 pb-1 min-w-max">
        @for (s of sections(); track s.id) {
          <a
            [href]="'#' + s.id"
            [class]="'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ' + (activeSection() === s.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent text-muted-foreground hover:text-foreground')"
          >
            <span>{{ s.icon }}</span>
            <span>{{ s.title }}</span>
          </a>
        }
      </div>
    </hlm-scroll-area>

    <!-- Main scrollable sections -->
    <main hlmScrollSpy (activeIdChange)="activeSection.set($event)" class="space-y-12 pb-20">

      <!-- 1. Colors & Typography -->
      <section id="colors" class="space-y-4 scroll-mt-20">
        <header class="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
          <h2 class="text-2xl font-bold tracking-tight">{{ sections()[0].icon }} Colors & Typography</h2>
          <p class="text-sm text-muted-foreground">Design tokens as CSS custom properties · Inter + JetBrains Mono</p>
        </header>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="card p-5">
            <h3 class="text-sm font-semibold mb-3">Color palette</h3>
            <div class="space-y-2">
              @for (sw of colorSwatches; track sw.name) {
                <div class="flex items-center gap-3">
                  <div [class]="'h-10 w-10 rounded-md shadow-sm ' + sw.class"></div>
                  <div class="flex-1">
                    <div class="text-sm font-medium">{{ sw.name }}</div>
                    <div class="text-xs text-muted-foreground font-mono">{{ sw.token }}</div>
                  </div>
                  <code class="text-xs text-muted-foreground font-mono">{{ sw.value }}</code>
                </div>
              }
            </div>
          </div>
          <div class="card p-5">
            <h3 class="text-sm font-semibold mb-3">Typography scale</h3>
            <div class="divide-y divide-border">
              <div class="flex items-baseline gap-4 py-2"><span class="text-xs font-mono text-muted-foreground w-24">Display</span><span class="text-display">The future</span></div>
              <div class="flex items-baseline gap-4 py-2"><span class="text-xs font-mono text-muted-foreground w-24">H1</span><span class="text-h1">Bold Statement</span></div>
              <div class="flex items-baseline gap-4 py-2"><span class="text-xs font-mono text-muted-foreground w-24">H2</span><span class="text-h2">Powerful Title</span></div>
              <div class="flex items-baseline gap-4 py-2"><span class="text-xs font-mono text-muted-foreground w-24">H3</span><span class="text-h3">Section Heading</span></div>
              <div class="flex items-baseline gap-4 py-2"><span class="text-xs font-mono text-muted-foreground w-24">Body</span><span class="text-body">Body text for descriptions and paragraphs.</span></div>
              <div class="flex items-baseline gap-4 py-2"><span class="text-xs font-mono text-muted-foreground w-24">Caption</span><span class="text-caption">Small label / caption</span></div>
              <div class="flex items-baseline gap-4 py-2"><span class="text-xs font-mono text-muted-foreground w-24">Code</span><code class="text-code">const value = 42;</code></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Buttons & Badges -->
      <section id="buttons" class="space-y-4 scroll-mt-20">
        <header class="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
          <h2 class="text-2xl font-bold tracking-tight">{{ sections()[1].icon }} Buttons & Badges</h2>
          <p class="text-sm text-muted-foreground">CVA variants, sizes, loading state, button groups</p>
        </header>
        <div class="card p-5 space-y-4">
          <div>
            <h3 class="text-sm font-semibold mb-2">Variants</h3>
            <div class="flex flex-wrap gap-2">
              <hlm-button variant="default">Default</hlm-button>
              <hlm-button variant="secondary">Secondary</hlm-button>
              <hlm-button variant="outline">Outline</hlm-button>
              <hlm-button variant="ghost">Ghost</hlm-button>
              <hlm-button variant="destructive">Destructive</hlm-button>
              <hlm-button variant="link">Link</hlm-button>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2">Sizes</h3>
            <div class="flex flex-wrap items-center gap-2">
              <hlm-button size="sm">Small</hlm-button>
              <hlm-button size="default">Default</hlm-button>
              <hlm-button size="lg">Large</hlm-button>
              <hlm-button size="icon"><span class="lucide-settings h-4 w-4"></span></hlm-button>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2">States</h3>
            <div class="flex flex-wrap gap-2">
              <hlm-button [loading]="loading()" (click)="toggleLoading()">
                {{ loading() ? 'Loading…' : 'Click to load' }}
              </hlm-button>
              <hlm-button disabled>Disabled</hlm-button>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-semibold mb-2">Badges</h3>
            <div class="flex flex-wrap gap-2">
              <app-badge label="Default" variant="default"></app-badge>
              <app-badge label="Secondary" variant="secondary"></app-badge>
              <app-badge label="Success" variant="success"></app-badge>
              <app-badge label="Warning" variant="warning"></app-badge>
              <app-badge label="Destructive" variant="destructive"></app-badge>
              <app-badge label="Outline" variant="outline"></app-badge>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Inputs -->
      <section id="inputs" class="space-y-4 scroll-mt-20">
        <header class="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
          <h2 class="text-2xl font-bold tracking-tight">{{ sections()[2].icon }} Inputs & Forms</h2>
          <p class="text-sm text-muted-foreground">Text, textarea, combobox, switch, slider, rating, calendar, OTP</p>
        </header>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="card p-5 space-y-3">
            <h3 class="text-sm font-semibold">Text + Combobox</h3>
            <input class="input" placeholder="Default input" />
            <textarea class="input min-h-20" placeholder="Textarea (4 rows)"></textarea>
            <hlm-combobox
              [options]="peopleOptions"
              [value]="comboboxValue()"
              (valueChange)="comboboxValue.set($event)"
              placeholder="Search people…"
            />
          </div>
          <div class="card p-5 space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Notifications</span>
              <hlm-switch [checked]="notifications()" (checkedChange)="notifications.set($event)"></hlm-switch>
            </div>
            <div>
              <label class="label">Volume: {{ volume() }}</label>
              <hlm-slider [min]="0" [max]="100" [step]="1" [value]="volume()" (valueChange)="onVolume($event)" />
            </div>
            <div>
              <label class="label">Rating</label>
              <hlm-rating [value]="rating()" (valueChange)="rating.set($event)" [allowHalf]="true" [showValue]="true" />
            </div>
          </div>
          <div class="card p-5 space-y-3">
            <h3 class="text-sm font-semibold">Calendar (single)</h3>
            <hlm-calendar [(value)]="calendarValue" />
          </div>
          <div class="card p-5 space-y-3">
            <h3 class="text-sm font-semibold">OTP Input</h3>
            <hlm-otp-input [length]="6" [value]="otpValue()" (valueChange)="otpValue.set($event)" (completed)="onOtpComplete($event)" />
            <p class="text-xs text-muted-foreground">Type 6 digits. Paste supported.</p>
            <p class="text-xs text-muted-foreground font-mono">Current: {{ otpValue() || '(empty)' }}</p>
          </div>
        </div>
      </section>

      <!-- 4. Navigation -->
      <section id="navigation" class="space-y-4 scroll-mt-20">
        <header class="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
          <h2 class="text-2xl font-bold tracking-tight">{{ sections()[3].icon }} Navigation</h2>
          <p class="text-sm text-muted-foreground">Breadcrumb, tabs, pagination, stepper, accordion</p>
        </header>
        <div class="card p-5 space-y-4">
          <hlm-breadcrumb [items]="breadcrumbs" />            <hlm-tabs [value]="tabValue()" (valueChange)="tabValue.set($event)">
            <hlm-tabs-list [scrollable]="true">
              <hlm-tabs-trigger value="overview">Overview</hlm-tabs-trigger>
              <hlm-tabs-trigger value="analytics">Analytics</hlm-tabs-trigger>
              <hlm-tabs-trigger value="reports">Reports</hlm-tabs-trigger>
              <hlm-tabs-trigger value="settings">Settings</hlm-tabs-trigger>
            </hlm-tabs-list>
            <hlm-tabs-content value="overview">
              <p class="text-sm">Overview content — uses fade transitions.</p>
            </hlm-tabs-content>
            <hlm-tabs-content value="analytics">
              <p class="text-sm">Analytics — graphs live here.</p>
            </hlm-tabs-content>
            <hlm-tabs-content value="reports">
              <p class="text-sm">Reports section.</p>
            </hlm-tabs-content>
            <hlm-tabs-content value="settings">
              <p class="text-sm">Settings panel.</p>
            </hlm-tabs-content>
          </hlm-tabs>
          <div>
            <h3 class="text-sm font-semibold mb-2">Pagination</h3>
            <hlm-pagination [total]="200" [pageSize]="10" [page]="page()" (pageChange)="page.set($event)" />
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="card p-5 space-y-3">
            <h3 class="text-sm font-semibold">Stepper (vertical)</h3>
            <hlm-stepper [steps]="steps" [value]="stepValue()" (valueChange)="stepValue.set($event)" orientation="vertical" />
            <div class="flex gap-2">
              <hlm-button size="sm" variant="outline" (click)="onStepPrev()">Back</hlm-button>
              <hlm-button size="sm" (click)="onStepNext()">Continue</hlm-button>
            </div>
          </div>
          <div class="card p-5 space-y-2">
            <h3 class="text-sm font-semibold">Accordion (FAQ)</h3>
            <hlm-accordion [defaultValue]="'q1'">
              <hlm-accordion-item [item]="{id:'q1',title:'What is shadcn/ui?',icon:'sparkles'}">
                A collection of copy-paste components built on Radix UI + Tailwind CSS.
              </hlm-accordion-item>
              <hlm-accordion-item [item]="{id:'q2',title:'Is this a library?',icon:'package'}">
                No — it's a registry. You own the code, copy it into your repo.
              </hlm-accordion-item>
              <hlm-accordion-item [item]="{id:'q3',title:'Can I customize it?',icon:'settings'}">
                Yes — every component is just a function. Edit it freely.
              </hlm-accordion-item>
            </hlm-accordion>
          </div>
        </div>
      </section>

      <!-- 5. Overlays -->
      <section id="overlays" class="space-y-4 scroll-mt-20">
        <header class="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
          <h2 class="text-2xl font-bold tracking-tight">{{ sections()[4].icon }} Overlays</h2>
          <p class="text-sm text-muted-foreground">Sheet, popover, hover card, context menu, bottom sheet</p>
        </header>
        <div class="card p-5 space-y-3">
          <div class="flex flex-wrap gap-2">
            <hlm-button variant="outline" (click)="sheetOpen.set(true)">
              <span class="lucide-panel-right h-4 w-4"></span>
              Open Sheet
            </hlm-button>
            <hlm-popover placement="bottom-start">
              <button trigger hlmButton variant="outline">Open Popover</button>
              <div content>
                <h4 class="text-sm font-semibold mb-2">Dimensions</h4>
                <p class="text-xs text-muted-foreground">Adjust the panel to your taste.</p>
                <hlm-slider class="mt-3" [min]="50" [max]="100" [value]="sheetWidth()" (valueChange)="onSheetWidth($event)" />
              </div>
            </hlm-popover>
            <hlm-hover-card>
              <a trigger class="text-sm text-primary underline" href="#">@username</a>
              <div content>
                <div class="flex items-center gap-3">
                  <hlm-avatar name="Jane Doe" color="primary" />
                  <div>
                    <div class="text-sm font-semibold">Jane Doe</div>
                    <div class="text-xs text-muted-foreground">Senior Engineer</div>
                  </div>
                </div>
              </div>
            </hlm-hover-card>
            <hlm-button variant="outline" (click)="bottomSheetOpen.set(true)">
              <span class="lucide-arrow-down h-4 w-4"></span>
              Open Bottom Sheet
            </hlm-button>
          </div>
          <div class="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            <div class="text-foreground font-medium mb-2">Right-click here for context menu</div>
            <div (contextmenu)="$event.preventDefault()">
              <hlm-context-menu [items]="contextItems" (selected)="toast.show('Picked: ' + $event.label)">
                <div class="inline-flex items-center gap-2 rounded-md bg-muted px-4 py-3">
                  <span class="lucide-box h-4 w-4"></span>
                  Right-click area
                </div>
              </hlm-context-menu>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. Data Display & Charts -->
      <section id="data" class="space-y-4 scroll-mt-20">
        <header class="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
          <h2 class="text-2xl font-bold tracking-tight">{{ sections()[5].icon }} Data Display & Charts</h2>
          <p class="text-sm text-muted-foreground">Avatars, badges, progress, charts (Line/Bar/Donut), resizable panels</p>
        </header>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="card p-5">
            <h3 class="text-sm font-semibold mb-3">Avatars</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <hlm-avatar name="Anna" color="primary" />
                <hlm-avatar name="Boris" color="secondary" />
                <hlm-avatar name="Carla" color="accent" />
                <hlm-avatar name="Dmitri" color="muted" />
              </div>
              <hlm-avatar-group [names]="['Anna','Boris','Carla','Dmitri','Eva','Frank','Grace']" [max]="4" />
            </div>
          </div>
          <div class="card p-5 space-y-3">
            <h3 class="text-sm font-semibold">Progress</h3>
            <hlm-progress [value]="66" />
            <hlm-progress [indeterminate]="true" />
            <div class="flex justify-around pt-2">
              <hlm-progress [value]="25" variant="circular" [size]="60" [showLabel]="true" />
              <hlm-progress [value]="75" variant="circular" [size]="60" [showLabel]="true" />
              <hlm-progress [value]="100" variant="circular" [size]="60" [showLabel]="true" />
            </div>
          </div>
          <div class="card p-5">
            <h3 class="text-sm font-semibold mb-3">Carousel</h3>
            <hlm-carousel [items]="slides" [autoplay]="true" [interval]="3000">
              @for (s of slides; track s.id) {
                <hlm-carousel-item>
                  <div class="aspect-video bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-4xl font-bold text-foreground">
                    {{ s.id }}
                  </div>
                </hlm-carousel-item>
              }
            </hlm-carousel>
          </div>
        </div>
        <div class="card p-5">
          <h3 class="text-sm font-semibold mb-3">Charts (Chart.js via ng2-charts)</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs text-muted-foreground mb-2">Line chart — Monthly revenue</p>
              <hlm-chart [type]="'line'" [data]="lineData" [height]="220" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-2">Bar chart — Sales by category</p>
              <hlm-chart [type]="'bar'" [data]="barData" [height]="220" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-2">Doughnut — Distribution</p>
              <hlm-chart [type]="'doughnut'" [data]="doughnutData" [height]="220" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground mb-2">Area — Cumulative</p>
              <hlm-chart [type]="'line'" [data]="areaData" [height]="220" />
            </div>
          </div>
        </div>
        <div class="card p-5">
          <h3 class="text-sm font-semibold mb-3">Resizable panels</h3>
          <div class="border border-border rounded-md overflow-hidden h-64">
            <hlm-resizable-panel-group direction="horizontal">
              <hlm-resizable-panel [size]="{size: 30, unit: 'percent'}">
                <div class="p-4 bg-muted/30 h-full">
                  <p class="text-sm font-semibold">Left panel</p>
                  <p class="text-xs text-muted-foreground">Drag the handle to resize.</p>
                </div>
              </hlm-resizable-panel>
              <hlm-resizable-handle></hlm-resizable-handle>
              <hlm-resizable-panel [size]="{size: 70, unit: 'percent'}">
                <div class="p-4 h-full">
                  <p class="text-sm font-semibold">Right panel</p>
                  <p class="text-xs text-muted-foreground">Width persists via localStorage (autoSaveId).</p>
                </div>
              </hlm-resizable-panel>
            </hlm-resizable-panel-group>
          </div>
        </div>
      </section>

      <!-- 7. Layout Primitives -->
      <section id="layout" class="space-y-4 scroll-mt-20">
        <header class="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
          <h2 class="text-2xl font-bold tracking-tight">{{ sections()[6].icon }} Layout Primitives</h2>
          <p class="text-sm text-muted-foreground">Scroll area, aspect ratio, collapsible</p>
        </header>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="card p-5">
            <h3 class="text-sm font-semibold mb-3">ScrollArea (max 160px)</h3>
            <hlm-scroll-area [maxHeight]="'160px'">
              <div class="space-y-1 text-sm">
                @for (n of [1,2,3,4,5,6,7,8,9,10]; track n) {
                  <div class="rounded px-2 py-1.5 hover:bg-muted">Item #{{ n }} — long content that may overflow</div>
                }
              </div>
            </hlm-scroll-area>
          </div>
          <div class="card p-5">
            <h3 class="text-sm font-semibold mb-3">AspectRatio 16:9</h3>
            <hlm-aspect-ratio [ratio]="16/9">
              <div class="h-full w-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                16:9
              </div>
            </hlm-aspect-ratio>
          </div>
        </div>
        <div class="card p-5 space-y-2">
          <h3 class="text-sm font-semibold">Collapsible</h3>
          <hlm-collapsible [open]="collapsibleOpen()" (openChange)="collapsibleOpen.set($event)" icon="info">
            <span trigger>What is the design system made of?</span>
            <p class="text-sm text-muted-foreground">It is composed of design tokens (CSS custom properties), primitive components built on top of Angular CDK, and patterns for forms, navigation, and feedback. The tokens map directly to Tailwind utility classes via the <code class="text-code">tailwind.config.js</code> theme extension.</p>
          </hlm-collapsible>
          <hlm-collapsible icon="help-circle">
            <span trigger>How do I add a new component?</span>
            <p class="text-sm text-muted-foreground">Create a new folder under <code class="text-code">frontend/src/app/shared/components/&lt;name&gt;/</code>, write a standalone Angular 20 component, and export it from <code class="text-code">index.ts</code>.</p>
          </hlm-collapsible>
        </div>
      </section>

      <!-- Footer / shortcuts hint -->
      <section class="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        <p class="mb-2">Press <hlm-kbd>⌘</hlm-kbd> + <hlm-kbd>K</hlm-kbd> for command palette · <hlm-kbd>?</hlm-kbd> for shortcuts</p>
        <p>Built with TZ-40 → TZ-34 → TZ-31 → TZ-32 → TZ-33 → TZ-36 → TZ-37 → TZ-38 → TZ-39 → TZ-35</p>
      </section>
    </main>

    <!-- Sheet overlay -->
    @if (sheetOpen()) {
      <hlm-sheet side="right" [widthClass]="(sheetWidth() + '%')" (closed)="sheetOpen.set(false)">
        <div slot="header">
          <h2 class="text-lg font-semibold">Right-side sheet</h2>
          <p class="text-sm text-muted-foreground">Press Esc to close</p>
        </div>
        <div class="space-y-3">
          <p class="text-sm">This sheet slides in from the right. Adjust the popover slider to change its width.</p>
          <hlm-button class="w-full" (click)="sheetOpen.set(false)">Close</hlm-button>
        </div>
      </hlm-sheet>
    }

    <!-- Bottom sheet -->
    @if (bottomSheetOpen()) {
      <hlm-bottom-sheet (closed)="bottomSheetOpen.set(false)">
        <div slot="header">
          <h2 class="text-lg font-semibold">Mobile-style bottom sheet</h2>
        </div>
        <p class="text-sm text-muted-foreground">This is great for mobile pickers and confirmations.</p>
        <div class="mt-4 flex gap-2">
          <hlm-button (click)="bottomSheetOpen.set(false)">Got it</hlm-button>
        </div>
      </hlm-bottom-sheet>
    }

    <!-- Cmd+K palette -->
    <hlm-command-palette #palette [items]="paletteItems" />

    <!-- Shortcuts overlay -->
    <hlm-shortcuts #shortcuts />
  `,
})
export class ShowcasePage {
  protected readonly theme = inject(ThemeService);
  protected readonly toast = inject(ToastService);

  // Section definitions
  readonly sections = signal<Section[]>([
    { id: 'colors', title: 'Colors & Type', description: 'Design tokens & scale', icon: '🎨' },
    { id: 'buttons', title: 'Buttons & Badges', description: 'Variants, sizes, states', icon: '🔘' },
    { id: 'inputs', title: 'Inputs & Forms', description: 'Text, switch, slider, OTP', icon: '📝' },
    { id: 'navigation', title: 'Navigation', description: 'Breadcrumb, tabs, stepper', icon: '🧭' },
    { id: 'overlays', title: 'Overlays', description: 'Sheet, popover, hover card', icon: '🪟' },
    { id: 'data', title: 'Data & Charts', description: 'Charts, avatars, panels', icon: '📊' },
    { id: 'layout', title: 'Layout', description: 'ScrollArea, aspect ratio', icon: '🧱' },
  ]);

  readonly activeSection = signal<string>('colors');

  // Demo state
  readonly loading = signal(false);
  readonly notifications = signal(true);
  readonly volume = signal(50);
  readonly rating = signal(4.5);
  readonly sheetWidth = signal(33);
  readonly sheetOpen = signal(false);
  readonly bottomSheetOpen = signal(false);
  readonly comboboxValue = signal<string>('');
  readonly calendarValue = signal<Date | null>(new Date());
  readonly otpValue = signal<string>('');
  readonly tabValue = signal<string>('overview');
  readonly page = signal<number>(1);
  readonly stepValue = signal<number>(0);
  readonly collapsibleOpen = signal<boolean>(true);

  readonly breadcrumbs = [
    { label: 'Home', link: '/', icon: 'home' },
    { label: 'UI Kit', link: '/p/showcase' },
    { label: 'Showcase' },
  ];

  readonly steps: StepperStep[] = [
    { id: 's1', label: 'Account', description: 'Personal info' },
    { id: 's2', label: 'Verify', description: 'Email confirmation' },
    { id: 's3', label: 'Profile', description: 'Set preferences' },
    { id: 's4', label: 'Done', description: 'Finish' },
  ];

  readonly slides: CarouselSlide[] = [
    { id: '1', caption: 'Welcome' },
    { id: '2', caption: 'Explore' },
    { id: '3', caption: 'Customize' },
    { id: '4', caption: 'Ship' },
  ];

  readonly peopleOptions: ComboboxOption[] = [
    { value: '1', label: 'Anna Ivanova', description: 'Designer' },
    { value: '2', label: 'Boris Petrov', description: 'Engineer' },
    { value: '3', label: 'Carla Schmidt', description: 'Product Manager' },
    { value: '4', label: 'Dmitri Volkov', description: 'QA' },
    { value: '5', label: 'Eva Wong', description: 'Marketing' },
  ];

  readonly contextItems: ContextMenuItem[] = [
    { id: 'view', label: 'View', icon: 'eye', shortcut: '⌘V' },
    { id: 'edit', label: 'Edit', icon: 'edit', shortcut: '⌘E' },
    { id: 'copy', label: 'Duplicate', icon: 'copy', shortcut: '⌘D' },
    { id: 'divider', label: '', divider: true },
    { id: 'archive', label: 'Archive', icon: 'archive' },
    { id: 'delete', label: 'Delete', icon: 'trash-2', destructive: true, shortcut: '⌫' },
  ];

  readonly colorSwatches = [
    { name: 'Primary', token: '--primary', value: '262 83% 58%', class: 'bg-primary' },
    { name: 'Secondary', token: '--secondary', value: '188 95% 43%', class: 'bg-secondary' },
    { name: 'Accent', token: '--accent', value: '262 83% 96%', class: 'bg-accent' },
    { name: 'Success', token: '--success', value: '142 71% 36%', class: 'bg-success' },
    { name: 'Warning', token: '--warning', value: '38 92% 50%', class: 'bg-warning' },
    { name: 'Destructive', token: '--destructive', value: '0 72% 51%', class: 'bg-destructive' },
    { name: 'Muted', token: '--muted', value: '240 4.8% 95.9%', class: 'bg-muted' },
    { name: 'Border', token: '--border', value: '240 5.9% 90%', class: 'bg-border' },
  ];

  // Charts data
  readonly lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12, 19, 14, 22, 28, 32],
        borderColor: 'hsl(262 83% 58%)',
        backgroundColor: 'hsl(262 83% 58% / 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Cost',
        data: [8, 12, 10, 14, 16, 18],
        borderColor: 'hsl(188 95% 43%)',
        backgroundColor: 'hsl(188 95% 43% / 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  readonly barData = {
    labels: ['A', 'B', 'C', 'D', 'E'],
    datasets: [
      {
        label: 'Units sold',
        data: [240, 139, 980, 390, 480],
        backgroundColor: 'hsl(262 83% 58%)',
      },
    ],
  };

  readonly doughnutData = {
    labels: ['A', 'B', 'C', 'D'],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: [
          'hsl(262 83% 58%)',
          'hsl(188 95% 43%)',
          'hsl(142 71% 45%)',
          'hsl(38 92% 55%)',
        ],
      },
    ],
  };

  readonly areaData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Cumulative',
        data: [100, 220, 350, 480],
        borderColor: 'hsl(262 83% 58%)',
        backgroundColor: 'hsl(262 83% 58% / 0.3)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  readonly paletteItems: CommandItem[] = [
    { id: 'nav-dashboard', label: 'Go to Dashboard', icon: 'home', group: 'Navigation', action: () => this.toast.show('→ /dashboard') },
    { id: 'nav-products', label: 'Go to Products', icon: 'package', group: 'Navigation', action: () => this.toast.show('→ /p/product') },
    { id: 'nav-counterparty', label: 'Go to Counterparties', icon: 'users', group: 'Navigation', action: () => this.toast.show('→ /p/counterparty') },
    { id: 'theme-toggle', label: 'Toggle theme', icon: 'moon', group: 'Theme', action: () => this.theme.toggle() },
    { id: 'density-compact', label: 'Density: Compact', icon: 'align-justify', group: 'View', action: () => this.toast.show('Compact') },
    { id: 'density-comfortable', label: 'Density: Comfortable', icon: 'rows-3', group: 'View', action: () => this.toast.show('Comfortable') },
    { id: 'density-spacious', label: 'Density: Spacious', icon: 'rows-4', group: 'View', action: () => this.toast.show('Spacious') },
    { id: 'show-shortcuts', label: 'Show keyboard shortcuts', icon: 'keyboard', shortcut: '?', group: 'Help', action: () => this.toast.show('Press ?') },
  ];

  toggleLoading(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1500);
  }

  onOtpComplete(code: string): void {
    this.toast.success(`OTP completed: ${code}`);
  }

  onVolume(v: number | [number, number]): void {
    if (typeof v === 'number') this.volume.set(v);
  }

  onSheetWidth(v: number | [number, number]): void {
    if (typeof v === 'number') this.sheetWidth.set(v);
  }

  onStepNext(): void {
    this.stepValue.update((v) => Math.min(this.steps.length - 1, v + 1));
  }

  onStepPrev(): void {
    this.stepValue.update((v) => Math.max(0, v - 1));
  }
}
