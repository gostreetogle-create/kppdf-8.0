import { defineRegistry, type RegistryDefinition } from '../model/registry.types';
import { formatOrganizationActive, formatOrganizationTypes, ORGANIZATION_TYPE_LABELS } from './organization-formatters';
import { createOrganizationsHttpDataSource, type OrganizationRow } from './organizations-http-data-source';
import type { PiOrganizationsService } from '@kppdf/data-access';
import { PiDialogService } from '@kppdf/ui/dialog';
import { simpleCrudActions, openSimpleDialog } from './registry-simple-crud';

export function createOrganizationsRegistryDefinition(organizationsService: PiOrganizationsService, dialog = undefined as PiDialogService | undefined): RegistryDefinition<OrganizationRow> {
  const values = (row: OrganizationRow) => ({ name: row.name, inn: row.inn });
  const actions = dialog ? simpleCrudActions(dialog, organizationsService as never, 'organization', 'организацию', values, (ctx, value) => openSimpleDialog(dialog, 'organization', ctx, value)) : [];
  return { key: 'organizations', title: 'Организации', description: 'Организации и поставщики (GET /organizations).', source: 'api', rowId: (row) => row._id, defaultPageSize: 25, emptyMessage: 'Организации не найдены.', columns: [{ key: 'name', header: 'Название', sortable: false, format: (r) => r.name }, { key: 'shortName', header: 'Краткое', sortable: false, format: (r) => r.shortName ?? '—' }, { key: 'inn', header: 'ИНН', sortable: false, format: (r) => r.inn }, { key: 'type', header: 'Типы', sortable: false, format: (r) => formatOrganizationTypes(r.type) }, { key: 'isOurCompany', header: 'Наша', sortable: false, format: (r) => r.isOurCompany ? 'Да' : '—' }, { key: 'isActive', header: 'Статус', sortable: false, format: (r) => formatOrganizationActive(r.isActive) }], filters: [{ key: 'search', label: 'Поиск', type: 'text', placeholder: 'Название, ИНН…' }, { key: 'type', label: 'Тип', type: 'select', options: Object.entries(ORGANIZATION_TYPE_LABELS).map(([value, label]) => ({ value, label })) }], paginationMode: 'server', createAction: dialog ? { label: 'Создать организацию', run: (ctx) => openSimpleDialog(dialog, 'organization', ctx) } : undefined, rowActions: actions, dataSource: createOrganizationsHttpDataSource(organizationsService) };
}
export function createOrganizationsRegistry(organizationsService: PiOrganizationsService, dialog?: PiDialogService) { return defineRegistry(createOrganizationsRegistryDefinition(organizationsService, dialog)); }
