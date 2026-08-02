/**
 * TZ-DOC-311 — DOM-contract regression tests for BuilderInspectorComponent.
 *
 * Locks the template-properties panel contract after the cleanup:
 *   - «Нумерация страниц» toggle IS rendered (pageNumbering stays supported);
 *   - «Оглавление», «Шапка Документа» and «Подвал Документа» controls are
 *     GONE from the DOM — the builder no longer offers fields that cannot
 *     be persisted by the backend DTO (tableOfContents/headerText/footerText);
 *   - toggling pageNumbering emits `templateUpdate` with `{ pageNumbering }`.
 *
 * TestBed strategy mirrors the project's component spec convention:
 * overrideComponent with empty imports + NO_ERRORS_SCHEMA.
 */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuilderInspectorComponent } from './builder-inspector.component';
import type { DocumentTemplate } from '../../../shared/services/pi-document-templates.service';

describe('BuilderInspectorComponent (TZ-DOC-311)', () => {
  let fixture: ComponentFixture<BuilderInspectorComponent>;

  const template: DocumentTemplate = {
    _id: 'tpl-1',
    name: 'T',
    organizationId: 'org-1',
    docTypeId: 'dt-1',
    pageSize: 'A4',
    orientation: 'portrait',
    backgroundOpacity: 0.3,
    pageNumbering: false,
    version: 1,
  } as DocumentTemplate;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuilderInspectorComponent],
    })
      .overrideComponent(BuilderInspectorComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(BuilderInspectorComponent);
    fixture.componentRef.setInput('templateSelected', true);
    fixture.componentRef.setInput('template', template);
    fixture.componentRef.setInput('allBlocks', []);
    fixture.detectChanges();
  });

  function textContent(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('renders the «Нумерация страниц» toggle for the selected template', () => {
    expect(textContent()).toContain('Нумерация страниц');
    const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('does NOT render the removed «Оглавление» control (TZ-DOC-311 cleanup)', () => {
    expect(textContent()).not.toContain('Оглавление');
  });

  it('does NOT render the removed «Шапка Документа» / «Подвал Документа» fields', () => {
    expect(textContent()).not.toContain('Шапка Документа');
    expect(textContent()).not.toContain('Подвал Документа');
  });

  it('emits templateUpdate with pageNumbering when the toggle is flipped', () => {
    const updates: Partial<DocumentTemplate>[] = [];
    fixture.componentInstance.templateUpdate.subscribe((p) => updates.push(p));
    const checkbox = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="checkbox"]'),
    ).find((el) =>
      (el as HTMLInputElement).closest('.toggle-row')?.textContent?.includes('Нумерация'),
    );
    expect(checkbox).toBeTruthy();
    (checkbox as HTMLInputElement).checked = true;
    (checkbox as HTMLInputElement).dispatchEvent(new Event('change'));
    expect(updates.some((p) => p.pageNumbering === true)).toBe(true);
  });

  it('smoke: empty state still renders when nothing is selected (no NG5xxx regression)', () => {
    const f = TestBed.createComponent(BuilderInspectorComponent);
    f.componentRef.setInput('templateSelected', false);
    f.componentRef.setInput('template', null);
    f.componentRef.setInput('block', null);
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).textContent).toContain('Ничего не выбрано');
  });
});
