import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PiGroupWorkspaceComponent } from './pi-group-workspace.component';

@Component({
  standalone: true,
  imports: [PiGroupWorkspaceComponent],
  template: `
    <app-pi-group-workspace [chips]="chips" activeId="first">
      <div tools data-test="tools-slot">
        <button type="button" data-test="create-category-button">+ Создать категорию</button>
      </div>
      <div data-test="workspace-body">Таблица</div>
    </app-pi-group-workspace>
  `,
})
class TestHostComponent {
  readonly chips = [
    { id: 'first', label: 'Первый', route: '/first' },
    { id: 'second', label: 'Второй', route: '/second' },
  ] as const;
}

describe('PiGroupWorkspaceComponent (TZ-DICT-312)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('keeps chips and tools in one adaptive sticky stack', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    const chrome = root.querySelector('.group-chrome');
    const chips = root.querySelector('.group-chips');
    const tools = root.querySelector('.group-tools');

    expect(chrome).toBeTruthy();
    expect(chrome?.classList.contains('sticky')).toBe(true);
    expect(chrome?.classList.contains('top-0')).toBe(true);
    expect(chrome?.contains(chips)).toBe(true);
    expect(chrome?.contains(tools)).toBe(true);
    expect(root.querySelector('[style*="6.25rem"]')).toBeFalsy();
  });

  it('keeps projected tools and CTA inside the workspace width', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[data-test="tools-slot"]')).toBeTruthy();
    expect(root.querySelector('[data-test="create-category-button"]')).toBeTruthy();
    expect(root.querySelector('[data-test="workspace-body"]')).toBeTruthy();
  });
});
