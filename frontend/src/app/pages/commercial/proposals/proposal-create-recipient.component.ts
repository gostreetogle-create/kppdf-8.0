import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { distinctUntilChanged, of, switchMap } from 'rxjs';
import { CounterpartyFullEditorDialogComponent } from '../../counterparties/counterparty-full-editor-dialog.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { PiOverflowSelectComponent } from '../../../shared/ui/overflow-select/pi-overflow-select.component';
import {
  Counterparty,
  CounterpartyService,
} from '../../../shared/services/pi-counterparty.service';
import { Person, PersonsService } from '../../../shared/services/pi-persons.service';
import { Site, SiteService } from '../../../shared/services/pi-site.service';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { extractErrorMessage } from '../../../core/silent-http';
import { PersonQuickCreateDialogComponent } from '../../../shared/person/person-quick-create-dialog.component';
import { personToOverflowItem } from '../../../shared/person/person.util';

export interface ProposalRecipientState {
  counterpartyId: string;
  contactPersonId: string;
  siteId: string;
}

@Component({
  selector: 'app-proposal-create-recipient',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, PiOverflowSelectComponent],
  template: `
    <div class="recipient" data-test="kp-recipient-panel">
      <div class="recipient__heading">
        <div>
          <h3>Получатель</h3>
          <p>Клиент, контакт и объект на бланке</p>
        </div>
        <app-pi-button
          type="button"
          variant="ghost"
          size="sm"
          (click)="quickCreateOpen.set(!quickCreateOpen())"
        >
          Создать клиента
        </app-pi-button>
      </div>
      <label>
        <span>Клиент</span>
        <app-pi-overflow-select
          [items]="counterpartyItems()"
          [value]="selectedCounterpartyId()"
          (valueChange)="selectCounterparty($event)"
          searchable="auto"
          placeholder="— выберите клиента —"
          ariaLabel="Клиент"
          dataTest="kp-recipient-client"
          [disabled]="readOnly()"
        />
      </label>
      @if (selectedCounterparty(); as client) {
        <section class="recipient__card" data-test="kp-recipient-card">
          <strong>{{ client.name }}</strong>
          <span>ИНН {{ client.inn }}{{ client.kpp ? ' · КПП ' + client.kpp : '' }}</span>
          @if (client.bankName) {
            <span>Банк: {{ client.bankName }}</span>
          }
          @if (client.signerName || client.directorName) {
            <span>Подписант: {{ client.signerName || client.directorName }}</span>
          }
          <app-pi-button type="button" variant="ghost" size="sm" (click)="openCard()"
            >Открыть карточку клиента</app-pi-button
          >
        </section>
        <label>
          <span>Контактное лицо</span>
          <div class="pi-select-add-row">
            <app-pi-overflow-select
              [items]="personItems()"
              [value]="selectedContactPersonId()"
              (valueChange)="selectContact($event)"
              searchable="auto"
              placeholder="— не выбрано —"
              ariaLabel="Контактное лицо"
              dataTest="kp-recipient-contact"
              [disabled]="readOnly()"
            />
            <button
              type="button"
              class="pi-select-add-btn"
              (click)="openCreatePerson()"
              [disabled]="readOnly()"
              title="Новое контактное лицо"
              aria-label="Новое контактное лицо"
              data-test="kp-recipient-contact-add"
            >
              +
            </button>
          </div>
        </label>
        <label>
          <span>Объект / адрес</span>
          <select
            class="pi-input w-full"
            [ngModel]="selectedSiteId()"
            (ngModelChange)="selectSite($event)"
            [disabled]="readOnly()"
            data-test="kp-recipient-site"
          >
            <option value="">— не выбран —</option>
            @for (site of sites(); track site._id) {
              <option [value]="site._id">{{ site.name }} · {{ site.address }}</option>
            }
          </select>
        </label>
      } @else {
        <p class="text-xs text-muted-foreground">
          Выберите клиента, чтобы показать ИНН, КПП, банк и объект.
        </p>
      }
      @if (quickCreateOpen()) {
        <section class="recipient__quick" data-test="kp-recipient-quick-create">
          <h4>Новый клиент</h4>
          <input class="pi-input w-full" placeholder="Название" [(ngModel)]="newClientName" />
          <input
            class="pi-input w-full"
            placeholder="Адрес объекта"
            [(ngModel)]="newClientAddress"
          />
          <div class="recipient__actions">
            <app-pi-button type="button" variant="default" size="sm" (click)="createClient()"
              >Создать и выбрать</app-pi-button
            >
            <span class="text-xs text-destructive">{{ error() }}</span>
          </div>
        </section>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 0;
    }
    .recipient {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      height: 100%;
      overflow: auto;
    }
    .recipient__heading,
    .recipient__actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    h3,
    h4,
    p {
      margin: 0;
    }
    .recipient__heading h3 {
      font-size: 0.9rem;
    }
    .recipient__heading p,
    label,
    .recipient__card {
      font-size: 0.7rem;
      color: var(--color-muted-foreground, #6b7280);
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .recipient__card,
    .recipient__quick {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      padding: 0.75rem;
      border: 1px solid var(--color-rule);
      background: color-mix(in oklch, var(--color-paper, #fff) 90%, transparent);
    }
    .recipient__card strong,
    .recipient__quick h4 {
      color: var(--color-ink);
      font-size: 0.8rem;
    }
  `,
})
export class ProposalCreateRecipientComponent {
  private readonly counterpartiesService = inject(CounterpartyService);
  private readonly personsService = inject(PersonsService);
  private readonly sitesService = inject(SiteService);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly selectedCounterpartyId = input('');
  readonly selectedContactPersonId = input('');
  readonly selectedSiteId = input('');
  readonly readOnly = input(false);
  readonly stateChange = output<ProposalRecipientState>();

  protected readonly counterparties = signal<Counterparty[]>([]);
  protected readonly persons = signal<Person[]>([]);
  protected readonly sites = signal<Site[]>([]);
  protected readonly quickCreateOpen = signal(false);
  protected readonly error = signal('');
  protected newClientName = '';
  protected newClientAddress = '';

  protected readonly selectedCounterparty = computed(
    () => this.counterparties().find((item) => item._id === this.selectedCounterpartyId()) ?? null,
  );
  protected readonly counterpartyItems = computed(() =>
    this.counterparties().map((item) => ({
      id: item._id,
      label: `${item.name} · ИНН ${item.inn}`,
    })),
  );
  protected readonly personItems = computed(() =>
    this.persons().map((p) => personToOverflowItem(p)),
  );

  constructor() {
    this.counterpartiesService.list({ limit: 200 }).subscribe((res) => {
      if (res.ok)
        this.counterparties.set((res.data.items ?? []).filter((item) => item.isActive !== false));
    });
    this.personsService.list().subscribe((res) => {
      if (res.ok) this.persons.set(res.data.items ?? []);
    });
    toObservable(this.selectedCounterpartyId)
      .pipe(
        distinctUntilChanged(),
        switchMap((id) =>
          id
            ? this.sitesService.listByCounterparty(id)
            : of({ ok: true as const, data: [] as Site[] }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (res.ok) {
          this.sites.set((res.data ?? []).filter((site) => site.isActive !== false));
        } else {
          this.sites.set([]);
        }
      });
  }

  protected selectCounterparty(id: string): void {
    if (this.readOnly()) return;
    this.emit({ counterpartyId: id, contactPersonId: '', siteId: '' });
  }
  protected selectContact(contactPersonId: string): void {
    if (this.readOnly()) return;
    this.emit({
      counterpartyId: this.selectedCounterpartyId(),
      contactPersonId,
      siteId: this.selectedSiteId(),
    });
  }
  protected selectSite(siteId: string): void {
    if (this.readOnly()) return;
    this.emit({
      counterpartyId: this.selectedCounterpartyId(),
      contactPersonId: this.selectedContactPersonId(),
      siteId,
    });
  }
  private emit(state: ProposalRecipientState): void {
    this.stateChange.emit(state);
  }
  protected openCard(): void {
    const id = this.selectedCounterpartyId();
    if (!id) return;
    const cached = this.selectedCounterparty();
    if (cached) {
      this.openCounterpartyDialog(cached);
      return;
    }
    this.counterpartiesService
      .findById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (!res.ok) {
          this.error.set(extractErrorMessage(res.error));
          return;
        }
        this.openCounterpartyDialog(res.data);
      });
  }

  private openCounterpartyDialog(client: Counterparty): void {
    const ref = this.dialog.open<Counterparty>(CounterpartyFullEditorDialogComponent, {
      data: client,
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (saved) => {
      this.counterparties.update((items) =>
        items.map((item) => (item._id === saved._id ? saved : item)),
      );
    });
  }
  protected openCreatePerson(): void {
    if (this.readOnly()) return;
    const ref = this.dialog.open<Person | null>(PersonQuickCreateDialogComponent, {
      width: 'sm',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce<Person | null>(ref, this.injector, (person) => {
      this.persons.update((items) =>
        items.some((item) => item._id === person._id) ? items : [...items, person],
      );
      this.emit({
        counterpartyId: this.selectedCounterpartyId(),
        contactPersonId: person._id,
        siteId: this.selectedSiteId(),
      });
    });
  }
  protected createClient(): void {
    if (this.readOnly() || !this.newClientName.trim() || !this.newClientAddress.trim()) {
      this.error.set('Заполните название и адрес объекта.');
      return;
    }
    this.error.set('');
    this.counterpartiesService
      .quickCreateParty({ name: this.newClientName.trim(), address: this.newClientAddress.trim() })
      .subscribe((res) => {
        if (!res.ok) {
          this.error.set(extractErrorMessage(res.error));
          return;
        }
        this.counterparties.update((items) => [...items, res.data.counterparty]);
        this.quickCreateOpen.set(false);
        this.newClientName = '';
        this.newClientAddress = '';
        this.emit({
          counterpartyId: res.data.counterparty._id,
          contactPersonId: '',
          siteId: res.data.site._id,
        });
      });
  }
}
