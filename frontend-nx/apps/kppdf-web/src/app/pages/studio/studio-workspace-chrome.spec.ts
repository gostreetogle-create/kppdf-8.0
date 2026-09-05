import { signal } from '@angular/core';
import { onStudioSectionClick, studioPanelSide, studioPanelTitle } from './studio-workspace-chrome';

describe('studio workspace chrome (TZ-NX-DOCSTUDIO-D56)', () => {
  it('places Data and Selected on the left and titles the selected panel', () => {
    expect(studioPanelSide('data')).toBe('left');
    expect(studioPanelSide('selected')).toBe('left');
    expect(studioPanelTitle('selected')).toBe('Выбрано');
    expect(studioPanelSide('properties')).toBe('right');
  });

  it('opens Selected and collapses it on a repeated click', () => {
    const activeSection = signal<string | null>('data');
    const panelCollapsed = signal(false);

    onStudioSectionClick('selected', activeSection, panelCollapsed);
    expect(activeSection()).toBe('selected');
    expect(panelCollapsed()).toBe(false);

    onStudioSectionClick('selected', activeSection, panelCollapsed);
    expect(panelCollapsed()).toBe(true);
  });
});
