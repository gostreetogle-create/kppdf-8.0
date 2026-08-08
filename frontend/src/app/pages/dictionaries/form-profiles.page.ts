import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { DICTIONARY_TOC_CHIPS } from './dictionary-group-chips';
import type { GroupChip } from '../../shared/page/pi-group-workspace.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../shared/ui/checkbox/checkbox.component';
import { PiOverflowSelectComponent } from '../../shared/ui/overflow-select/pi-overflow-select.component';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import {
  ALLOWED_FIELD_KEYS,
  ENTITY_LABEL_RU,
  FORM_PROFILE_ENTITIES,
  FORM_PROFILE_SIZES,
  FormProfilesService,
  SIZE_HINT_RU,
  type FormProfileEntity,
  type FormProfileSize,
} from '../../shared/services/form-profiles.service';

/**
 * TZ-DICT-315 — настройки профилей быстрого create (S/M/L) в Справочниках.
 * Canon: docs/audits/2026-08-09-quick-create-form-profiles.md
 * API: DICT-314. QuickCreate wire → DICT-316.
 */
@Component({
  selector: 'app-form-profiles-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PiGroupWorkspaceComponent,
    ButtonComponent,
    CheckboxComponent,
    PiOverflowSelectComponent,
  ],
  template: `
    <app-pi-group-workspace
      pathLabel="Справочники"
      [toc]="toc"
      tocActiveId="form-ux"
      [chips]="chips"
      activeId="form-profiles"
    >
      <div class="space-y-5 max-w-3xl" data-test="form-profiles-page">
        <header>
          <p class="eyebrow text-muted-foreground mb-1">Быстрый create</p>
          <h1 class="font-display text-2xl tracking-tight m-0">Профили быстрых форм</h1>
          <p class="text-sm text-muted-foreground mt-1 max-w-2xl m-0">
            Какие поля показывать в коротком диалоге создания изделия или модуля. Обязательные поля
            нельзя снять — иначе create сломается. Полный редактор не меняется.
          </p>
        </header>

        @if (loadError()) {
          <div
            role="alert"
            class="border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
            data-test="load-error"
          >
            <p class="m-0">{{ loadError() }}</p>
            <p class="text-xs text-muted-foreground mt-2 m-0">
              Нажмите «Повторить» или откройте пункт «Профили быстрых форм» в меню Справочники.
            </p>
            <app-pi-button
              class="mt-3"
              variant="outline"
              size="sm"
              (click)="reload()"
              data-test="retry-load"
            >
              Повторить
            </app-pi-button>
          </div>
        }

        <div class="flex flex-wrap items-end gap-4" data-test="profile-controls">
          <div class="min-w-[14rem] flex-1 max-w-xs">
            <label class="block text-xs text-muted-foreground mb-1" for="fp-entity">Сущность</label>
            <app-pi-overflow-select
              [items]="entityItems"
              [value]="entity()"
              (valueChange)="onEntityChange($event)"
              ariaLabel="Сущность профиля"
              dataTest="entity-select"
            />
          </div>

          <div>
            <p class="text-xs text-muted-foreground mb-1 m-0">Размер диалога</p>
            <div
              class="flex gap-1"
              role="tablist"
              aria-label="Размер профиля"
              data-test="size-chips"
            >
              @for (sz of sizes; track sz) {
                <button
                  type="button"
                  role="tab"
                  class="pi-input px-3 py-1.5 text-sm font-medium min-w-[2.5rem] cursor-pointer"
                  [class.bg-paper-2]="size() === sz"
                  [attr.aria-selected]="size() === sz"
                  [attr.data-test]="'size-' + sz"
                  (click)="onSizeChange(sz)"
                >
                  {{ sz }}
                </button>
              }
            </div>
            <p class="text-xs text-muted-foreground mt-1 m-0">{{ sizeHint() }}</p>
          </div>
        </div>

        @if (loading()) {
          <p class="text-sm text-muted-foreground" role="status" data-test="loading">Загрузка…</p>
        } @else if (!loadError()) {
          <section class="hairline rounded-sm bg-paper" data-test="field-matrix">
            <div class="px-4 py-3 hairline-b bg-paper-2/50">
              <h2 class="font-display text-base m-0">Поля · {{ entityLabel() }} · {{ size() }}</h2>
              <p class="text-xs text-muted-foreground mt-1 m-0">
                Отметьте видимые поля. Обязательные заблокированы.
              </p>
            </div>

            @if (fieldRows().length === 0) {
              <p
                class="px-4 py-6 text-sm text-muted-foreground m-0"
                role="status"
                data-test="empty-fields"
              >
                Нет полей в allowlist. Выберите сущность «Изделие» или «Модуль» выше.
              </p>
            } @else {
              <ul class="divide-y hairline m-0 p-0 list-none">
                @for (row of fieldRows(); track row.key) {
                  <li class="flex items-center gap-3 px-4 py-2.5">
                    <app-pi-checkbox
                      [checked]="row.visible"
                      [disabled]="row.locked"
                      [ariaLabel]="row.label"
                      size="sm"
                      (checkedChange)="onToggle(row.key, $event)"
                      [attr.data-test]="'field-' + row.key"
                    />
                    <div class="min-w-0 flex-1">
                      <span class="text-sm font-medium">{{ row.label }}</span>
                      <span class="text-xs text-muted-foreground ml-2 font-mono">{{
                        row.key
                      }}</span>
                      @if (row.locked) {
                        <span
                          class="eyebrow hairline rounded-sm px-1.5 py-0.5 text-muted-foreground ml-2"
                          title="Обязательное поле — нельзя снять"
                          >обязательное</span
                        >
                      }
                    </div>
                  </li>
                }
              </ul>
            }
          </section>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-xs text-muted-foreground m-0">
              Сохранение перезапишет профиль для текущей организации (entity × размер).
            </p>
            <app-pi-button
              variant="default"
              type="button"
              [disabled]="saving() || loading() || !!loadError()"
              (click)="onSave()"
              data-test="save-button"
            >
              {{ saving() ? 'Сохранение…' : 'Сохранить профиль' }}
            </app-pi-button>
          </div>
        }

        @if (saveError()) {
          <p class="text-sm text-destructive" role="alert" data-test="save-error">
            {{ saveError() }}
          </p>
        }
      </div>
    </app-pi-group-workspace>
  `,
})
export class FormProfilesPage implements OnInit {
  /** Local TOC leaf — shared dictionary-group-chips stays peer-clean. */
  protected readonly toc: readonly GroupChip[] = [
    ...DICTIONARY_TOC_CHIPS,
    {
      id: 'form-ux',
      label: 'Формы',
      route: '/dictionaries/form-profiles',
    },
  ];
  protected readonly chips: readonly GroupChip[] = [
    {
      id: 'form-profiles',
      label: 'Профили быстрых форм',
      route: '/dictionaries/form-profiles',
    },
  ];

  protected readonly sizes = FORM_PROFILE_SIZES;
  protected readonly entityItems = FORM_PROFILE_ENTITIES.map((id) => ({
    id,
    label: ENTITY_LABEL_RU[id],
  }));

  protected readonly entity = signal<FormProfileEntity>('product');
  protected readonly size = signal<FormProfileSize>('M');
  protected readonly visible = signal<ReadonlySet<string>>(new Set());
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly saveError = signal<string | null>(null);

  private readonly svc = inject(FormProfilesService);
  private readonly toast = inject(PiToastService);

  protected readonly entityLabel = computed(() => ENTITY_LABEL_RU[this.entity()]);
  protected readonly sizeHint = computed(() => SIZE_HINT_RU[this.size()]);

  protected readonly fieldRows = computed(() => {
    const entity = this.entity();
    const vis = this.visible();
    return ALLOWED_FIELD_KEYS[entity].map((key) => ({
      key,
      label: this.svc.labelRu(key),
      locked: this.svc.isLocked(entity, key),
      visible: vis.has(key) || this.svc.isLocked(entity, key),
    }));
  });

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loadCurrent();
  }

  protected onEntityChange(raw: string): void {
    if (raw !== 'product' && raw !== 'module') return;
    this.entity.set(raw);
    this.loadCurrent();
  }

  protected onSizeChange(sz: FormProfileSize): void {
    if (this.size() === sz) return;
    this.size.set(sz);
    this.loadCurrent();
  }

  protected onToggle(key: string, checked: boolean): void {
    if (this.svc.isLocked(this.entity(), key)) return;
    const next = new Set(this.visible());
    if (checked) next.add(key);
    else next.delete(key);
    // Always keep locked required in the set.
    for (const locked of ALLOWED_FIELD_KEYS[this.entity()]) {
      if (this.svc.isLocked(this.entity(), locked)) next.add(locked);
    }
    this.visible.set(next);
    this.saveError.set(null);
  }

  protected onSave(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.saveError.set(null);
    const keys = this.ensureLocked([...this.visible()]);
    this.svc.upsert(this.entity(), this.size(), keys).subscribe((result) => {
      this.saving.set(false);
      if (result.ok) {
        this.visible.set(new Set(result.data.visibleFieldKeys));
        this.toast.success('Профиль сохранён');
      } else {
        const message = extractErrorMessage(result.error);
        this.saveError.set(message);
        this.toast.error(message);
      }
    });
  }

  private loadCurrent(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.saveError.set(null);
    this.svc.getOne(this.entity(), this.size()).subscribe((result) => {
      this.loading.set(false);
      if (result.ok) {
        this.visible.set(new Set(this.ensureLocked(result.data.visibleFieldKeys)));
      } else {
        this.visible.set(new Set());
        this.loadError.set(
          extractErrorMessage(result.error) || 'Не удалось загрузить профиль. Нажмите «Повторить».',
        );
      }
    });
  }

  private ensureLocked(keys: string[]): string[] {
    const set = new Set(keys);
    for (const locked of ALLOWED_FIELD_KEYS[this.entity()]) {
      if (this.svc.isLocked(this.entity(), locked)) set.add(locked);
    }
    return [...set];
  }
}
