import type { RegistryRowActionIcon, RegistryRowActionTone } from './model/registry.types';

/** Default icon per stable action id when registry author omits `icon`. */
const ACTION_ID_ICON: Readonly<Record<string, RegistryRowActionIcon>> = {
  'copy-key': 'copy',
  'copy-code': 'copy',
  'copy-material': 'copy',
  'copy-product': 'copy',
  activate: 'check',
  deactivate: 'x',
  'edit-material': 'pencil',
  'edit-module': 'pencil',
  'edit-product': 'pencil',
  'open-composition': 'layers',
  'open-constructor': 'layers',
  'archive-material': 'archive',
  'archive-module': 'archive',
  'archive-product': 'archive',
  archive: 'archive',
};

/** Default tone when registry author omits `tone`. */
const ICON_TONE: Readonly<Partial<Record<RegistryRowActionIcon, RegistryRowActionTone>>> = {
  pencil: 'edit',
  copy: 'copy',
  archive: 'destructive',
  layers: 'doc',
  check: 'success',
  x: 'neutral',
  power: 'neutral',
  plus: 'accent',
};

export function resolveRegistryActionIcon(
  actionId: string,
  explicit?: RegistryRowActionIcon,
): RegistryRowActionIcon {
  return explicit ?? ACTION_ID_ICON[actionId] ?? 'pencil';
}

export function resolveRegistryActionTone(
  actionId: string,
  icon: RegistryRowActionIcon,
  opts: { destructive?: boolean; tone?: RegistryRowActionTone },
): RegistryRowActionTone {
  if (opts.tone) return opts.tone;
  if (opts.destructive) return 'destructive';
  return ICON_TONE[icon] ?? 'neutral';
}

export function registryActionToneClass(tone: RegistryRowActionTone): string {
  switch (tone) {
    case 'destructive':
      return 'pi-icon-btn pi-icon-btn-danger pi-focus-ring';
    case 'edit':
      return 'pi-icon-btn pi-icon-btn-edit pi-focus-ring';
    case 'copy':
      return 'pi-icon-btn pi-icon-btn-copy pi-focus-ring';
    case 'doc':
      return 'pi-icon-btn pi-icon-btn-doc pi-focus-ring';
    case 'success':
      return 'pi-icon-btn registry-icon-btn-success pi-focus-ring';
    case 'accent':
      return 'pi-icon-btn registry-icon-btn-accent pi-focus-ring';
    default:
      return 'pi-icon-btn pi-focus-ring';
  }
}
