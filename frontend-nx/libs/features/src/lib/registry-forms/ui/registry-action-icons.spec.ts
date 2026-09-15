import { resolveRegistryActionIcon, resolveRegistryActionTone, registryActionToneClass } from './registry-action-icons';

describe('registry-action-icons', () => {
  it('resolves icons from action id', () => {
    expect(resolveRegistryActionIcon('copy-material')).toBe('copy');
    expect(resolveRegistryActionIcon('activate')).toBe('check');
    expect(resolveRegistryActionIcon('open-composition')).toBe('layers');
  });

  it('prefers explicit icon over id map', () => {
    expect(resolveRegistryActionIcon('custom', 'power')).toBe('power');
  });

  it('maps tones from icon and destructive flag', () => {
    expect(
      resolveRegistryActionTone('archive-material', 'archive', { destructive: true }),
    ).toBe('destructive');
    expect(resolveRegistryActionTone('activate', 'check', {})).toBe('success');
    expect(resolveRegistryActionTone('edit-module', 'pencil', {})).toBe('edit');
  });

  it('emits token-based pi-icon-btn classes', () => {
    expect(registryActionToneClass('destructive')).toContain('pi-icon-btn-danger');
    expect(registryActionToneClass('success')).toContain('registry-icon-btn-success');
    expect(registryActionToneClass('accent')).toContain('registry-icon-btn-accent');
  });
});
