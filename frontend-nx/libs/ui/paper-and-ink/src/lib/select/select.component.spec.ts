import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectComponent } from './select.component';
import { SelectOptionComponent } from './select-option.component';

@Component({
  selector: 'app-test-host',
  standalone: true,
  imports: [SelectComponent, SelectOptionComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <app-pi-select formControlName="role" placeholder="Role" ariaLabel="Role">
        <app-pi-select-option value="admin">Admin</app-pi-select-option>
        <app-pi-select-option value="manager">Manager</app-pi-select-option>
        <app-pi-select-option value="user">User</app-pi-select-option>
      </app-pi-select>
    </form>
  `,
})
class TestHostComponent {
  form = new FormGroup({ role: new FormControl('admin') });
}

describe('SelectComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function trigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('app-pi-select-trigger button') as HTMLButtonElement;
  }

  function listbox(): HTMLElement | null {
    return fixture.nativeElement.querySelector('[role="listbox"]');
  }

  function options(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('button[role="option"]'));
  }

  it('renders the listbox in the DOM but hidden by default', () => {
    expect(listbox()).toBeTruthy();
    expect(listbox()!.hidden).toBe(true);
  });

  it('opens on trigger click', () => {
    trigger().click();
    fixture.detectChanges();
    expect(listbox()).toBeTruthy();
  });

  it('closes on second trigger click', () => {
    trigger().click();
    fixture.detectChanges();
    expect(listbox()).toBeTruthy();
    trigger().click();
    fixture.detectChanges();
    expect(listbox()!.hidden).toBe(true);
  });

  it('shows aria-expanded on trigger when open', () => {
    trigger().click();
    fixture.detectChanges();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('shows the selected option label in the trigger', () => {
    fixture.componentInstance.form.controls.role.setValue('admin');
    fixture.detectChanges();
    expect(trigger().textContent).toContain('Admin');
    trigger().click();
    fixture.detectChanges();
    options()[1].click();
    fixture.detectChanges();
    expect(trigger().textContent).toContain('Manager');
  });

  it('uses the placeholder when no option is selected', () => {
    host.form.controls.role.setValue(null);
    fixture.detectChanges();
    expect(trigger().textContent).toContain('Role');
  });

  it('selects an option on click and closes', () => {
    trigger().click();
    fixture.detectChanges();
    const opts = options();
    expect(opts.length).toBe(3);
    opts[1].click(); // Manager
    fixture.detectChanges();
    expect(host.form.controls.role.value).toBe('manager');
    expect(listbox()!.hidden).toBe(true);
  });

  it('closes on Escape', () => {
    trigger().click();
    fixture.detectChanges();
    expect(listbox()).toBeTruthy();
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    listbox()!.parentElement!.dispatchEvent(event);
    fixture.detectChanges();
    expect(listbox()!.hidden).toBe(true);
  });

  it('closes on click outside', () => {
    trigger().click();
    fixture.detectChanges();
    expect(listbox()).toBeTruthy();
    document.body.click();
    fixture.detectChanges();
    expect(listbox()!.hidden).toBe(true);
  });

  it('selected option has correct classes (text-on-gold, not text-paper)', () => {
    trigger().click();
    fixture.detectChanges();
    const admin = options()[0];
    const classList = admin.className;
    expect(classList).toContain('bg-sunrise-warm');
    expect(classList).toContain('text-on-gold');
    expect(classList).not.toContain('text-paper');
  });
});
