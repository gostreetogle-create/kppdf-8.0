import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { Package } from 'lucide-angular';

import {
  ProposalWorkspaceShellComponent,
  type WsRailItem,
} from './proposal-workspace-shell.component';

const RAIL: readonly WsRailItem[] = [
  { id: 'catalog', title: 'Каталог', icon: Package },
  { id: 'template', title: 'Шаблон', icon: Package },
];

describe('ProposalWorkspaceShellComponent', () => {
  let fixture: ComponentFixture<ProposalWorkspaceShellComponent>;
  let component: ProposalWorkspaceShellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposalWorkspaceShellComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ProposalWorkspaceShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the geometry frame (shell / ribbon / panel / viewport / sheet / status)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="kp-workspace-shell"]')).not.toBeNull();
    expect(el.querySelector('[data-test="kp-workspace-ribbon"]')).not.toBeNull();
    expect(el.querySelector('[data-test="kp-tools-panel"]')).not.toBeNull();
    expect(el.querySelector('[data-test="kp-viewport"]')).not.toBeNull();
    expect(el.querySelector('[data-test="kp-a4-sheet"]')).not.toBeNull();
    expect(el.querySelector('[data-test="kp-workspace-status"]')).not.toBeNull();
  });

  it('defaults to portrait and applies the orientation class; toggling emits orientationChange', () => {
    const shell = fixture.nativeElement.querySelector(
      '[data-test="kp-workspace-shell"]',
    ) as HTMLElement;
    expect(shell.classList.contains('kp-ws-shell--portrait')).toBe(true);

    const emitSpy = jest.spyOn(component.orientationChange, 'emit');
    const landscapeBtn = (fixture.nativeElement as HTMLElement).querySelector(
      'button[title="Альбомная"]',
    ) as HTMLButtonElement;
    landscapeBtn.click();
    expect(emitSpy).toHaveBeenCalledWith('landscape');
    expect(component.orientationChange.emit).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('orientation', 'landscape');
    fixture.detectChanges();
    expect(shell.classList.contains('kp-ws-shell--landscape')).toBe(true);
    expect(shell.classList.contains('kp-ws-shell--portrait')).toBe(false);
  });

  it('renders panel title in the panel head and marks collapsed state on the body', () => {
    fixture.componentRef.setInput('panelTitle', 'Каталог');
    fixture.detectChanges();
    const head = fixture.nativeElement.querySelector('.kp-ws-panel__head') as HTMLElement;
    expect(head.textContent?.trim()).toBe('Каталог');

    const body = fixture.nativeElement.querySelector(
      '[data-test="kp-workspace-body"]',
    ) as HTMLElement;
    expect(body.classList.contains('kp-ws-body--collapsed')).toBe(false);
    fixture.componentRef.setInput('panelCollapsed', true);
    fixture.detectChanges();
    expect(body.classList.contains('kp-ws-body--collapsed')).toBe(true);
  });

  it('anchors the tools panel on the right when panelSide is right', () => {
    fixture.componentRef.setInput('panelSide', 'right');
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector(
      '[data-test="kp-tools-panel"]',
    ) as HTMLElement;
    expect(panel.classList.contains('kp-ws-panel--right')).toBe(true);
    expect(panel.getAttribute('data-panel-side')).toBe('right');
  });

  it('derives right anchor from activeSection when panelSide is omitted', () => {
    fixture.componentRef.setInput('activeSection', 'params');
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector(
      '[data-test="kp-tools-panel"]',
    ) as HTMLElement;
    expect(panel.getAttribute('data-panel-side')).toBe('right');
    expect(panel.classList.contains('kp-ws-panel--left')).toBe(false);
  });

  it('renders rail strip buttons; different section emits sectionChange, same open section emits panelToggle', () => {
    fixture.componentRef.setInput('railItems', RAIL);
    fixture.componentRef.setInput('activeSection', 'catalog');
    fixture.detectChanges();

    const strip = fixture.nativeElement.querySelector(
      '[data-test="kp-icon-rail-horizontal"]',
    ) as HTMLElement;
    expect(strip).not.toBeNull();
    const buttons = strip.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    expect((buttons[0] as HTMLButtonElement).title).toBe('Каталог');

    const sectionSpy = jest.spyOn(component.sectionChange, 'emit');
    const toggleSpy = jest.spyOn(component.panelToggle, 'emit');

    (buttons[1] as HTMLButtonElement).click(); // template ≠ active → sectionChange
    expect(sectionSpy).toHaveBeenCalledWith('template');

    (buttons[0] as HTMLButtonElement).click(); // same + open → panelToggle
    expect(toggleSpy).toHaveBeenCalled();
    expect(sectionSpy).toHaveBeenCalledTimes(1);
  });

  it('hides the rail strip when no railItems are provided', () => {
    const strip = fixture.nativeElement.querySelector('[data-test="kp-icon-rail-horizontal"]');
    expect(strip).toBeNull();
  });

  it('emits sheetClick on A4 sheet click', () => {
    const spy = jest.spyOn(component.sheetClick, 'emit');
    const sheet = fixture.nativeElement.querySelector('[data-test="kp-a4-sheet"]') as HTMLElement;
    sheet.click();
    expect(spy).toHaveBeenCalled();
  });

  it('renders status text and debug text in the footer', () => {
    fixture.componentRef.setInput('statusText', 'Dummy статус');
    fixture.componentRef.setInput('debugText', 'portrait · open');
    fixture.detectChanges();
    const footer = fixture.nativeElement.querySelector(
      '[data-test="kp-workspace-status"]',
    ) as HTMLElement;
    expect(footer.textContent).toContain('Dummy статус');
    expect(footer.querySelector('.kp-ws-status__debug')?.textContent).toContain('portrait · open');
  });

  it('projects panel body, sheet and ribbon slots from the consumer', async () => {
    @Component({
      standalone: true,
      imports: [ProposalWorkspaceShellComponent],
      template: `
        <app-proposal-workspace-shell panelTitle="Тест">
          <button kpWsRibbonActions data-test="host-ribbon-actions">PDF</button>
          <div kpWsPanel data-test="host-panel">панель</div>
          <div kpWsSheet data-test="host-sheet">лист</div>
        </app-proposal-workspace-shell>
      `,
    })
    class TestHostComponent {}

    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const el = hostFixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-test="host-panel"]')?.textContent).toContain('панель');
    expect(el.querySelector('[data-test="host-sheet"]')?.textContent).toContain('лист');
    expect(el.querySelector('[data-test="host-ribbon-actions"]')).not.toBeNull();
  });
});
