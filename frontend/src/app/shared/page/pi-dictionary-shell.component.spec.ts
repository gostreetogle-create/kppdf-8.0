import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PiDictionaryShellComponent } from './pi-dictionary-shell.component';

describe('PiDictionaryShellComponent', () => {
  let fixture: ComponentFixture<PiDictionaryShellComponent>;
  let component: PiDictionaryShellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiDictionaryShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PiDictionaryShellComponent);
    component = fixture.componentInstance;
  });

  function render(title: string, totalLabel = '') {
    fixture.componentRef.setInput('title', title);
    fixture.componentRef.setInput('totalLabel', totalLabel);
    fixture.detectChanges();
  }

  it('renders the title as an H1', () => {
    render('Единицы измерения');
    const h1 = fixture.debugElement.query(By.css('h1'));
    expect(h1).toBeTruthy();
    expect(h1.nativeElement.textContent.trim()).toBe('Единицы измерения');
  });

  it('renders optional totalLabel next to the title', () => {
    render('Цвета', '3 записи');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Цвета');
    expect(el.textContent).toContain('3 записи');
  });

  it('does not render totalLabel when empty', () => {
    render('Категории');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Категории');
    const labels = el.querySelectorAll('.text-muted-foreground');
    expect(labels.length).toBe(0);
  });

  it('has a sticky tools slot with the correct CSS classes', () => {
    render('Шаблоны');
    const tools = fixture.debugElement.query(By.css('.dictionary-tools'));
    expect(tools).toBeTruthy();
    expect(tools.classes['sticky']).toBe(true);
    expect(tools.classes['top-14']).toBe(true);
    expect(tools.classes['z-20']).toBe(true);
    expect(tools.classes['bg-paper']).toBe(true);
    expect(tools.classes['hairline-b']).toBe(true);
  });

  it('projects [tools] content into the sticky bar and default content below', () => {
    @Component({
      template: `
        <app-pi-dictionary-shell [title]="'Тест'">
          <input tools placeholder="Поиск" />
          <p>Контент таблицы</p>
        </app-pi-dictionary-shell>
      `,
      imports: [PiDictionaryShellComponent],
    })
    class TestHost {}

    const hostFixture = TestBed.createComponent(TestHost);
    hostFixture.detectChanges();

    const toolsBar = hostFixture.debugElement.query(By.css('.dictionary-tools'));
    expect(toolsBar).toBeTruthy();
    const input = toolsBar.query(By.css('input[placeholder="Поиск"]'));
    expect(input).toBeTruthy();

    const tableContent = toolsBar.query(By.css('p'));
    expect(tableContent).toBeFalsy();

    const content = hostFixture.debugElement.query(By.css('.dictionary-content'));
    expect(content).toBeTruthy();
    const paragraph = content.query(By.css('p'));
    expect(paragraph).toBeTruthy();
    expect(paragraph.nativeElement.textContent).toContain('Контент таблицы');
  });

  it('has no eyebrow or description API', () => {
    render('Тест');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.eyebrow')).toBeFalsy();

    expect(Object.prototype.hasOwnProperty.call(component, 'eyebrow')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(component, 'description')).toBe(false);
  });
});
