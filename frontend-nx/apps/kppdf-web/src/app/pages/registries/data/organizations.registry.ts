import { defineRegistry, type RegistryDefinition } from '../model/registry.types';
import {
  formatOrganizationActive,
  formatOrganizationTypes,
  ORGANIZATION_TYPE_LABELS,
} from './organization-formatters';
import {
  createOrganizationsHttpDataSource,
  type OrganizationRow,
} from './organizations-http-data-source';
import type { PiOrganizationsService } from '@kppdf/data-access';

/**
 * TZ-NX-ORGANIZATION-REGISTRY-READ — read-only Organization registry.
 * Supplier = Organization with `type` containing `supplier`; no Supplier collection.
 */
export function createOrganizationsRegistryDefinition(
  organizationsService: PiOrganizationsService,
): RegistryDefinition<OrganizationRow> {
  return {
    key: 'organizations',
    title: 'Организации',
    description:
      'Контрагенты и поставщики (GET /organizations). Поставщик — Organization с типом supplier; отдельной коллекции Supplier нет.',
    source: 'api',
    rowId: (row) => row._id,
    defaultPageSize: 25,
    emptyMessage: 'Организации не найдены.',
    columns: [
      {
        key: 'name',
        header: 'Название',
        sortable: false,
        format: (r) => r.name,
      },
      {
        key: 'shortName',
        header: 'Краткое',
        sortable: false,
        width: '10rem',
        format: (r) => r.shortName ?? '—',
      },
      {
        key: 'inn',
        header: 'ИНН',
        sortable: false,
        width: '11rem',
        format: (r) => r.inn,
      },
      {
        key: 'type',
        header: 'Типы',
        sortable: false,
        width: '12rem',
        format: (r) => formatOrganizationTypes(r.type),
      },
      {
        key: 'isOurCompany',
        header: 'Наша',
        sortable: false,
        width: '6rem',
        format: (r) => (r.isOurCompany ? 'Да' : '—'),
      },
      {
        key: 'isActive',
        header: 'Статус',
        sortable: false,
        width: '8rem',
        format: (r) => formatOrganizationActive(r.isActive),
      },
    ],
    filters: [
      {
        key: 'search',
        label: 'Поиск',
        type: 'text',
        placeholder: 'Название, ИНН…',
        ariaLabel: 'Поиск по организациям',
      },
      {
        key: 'type',
        label: 'Тип',
        type: 'select',
        ariaLabel: 'Фильтр по типу организации',
        options: Object.entries(ORGANIZATION_TYPE_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
      },
    ],
    paginationMode: 'server',
    dataSource: createOrganizationsHttpDataSource(organizationsService),
  };
}

export function createOrganizationsRegistry(organizationsService: PiOrganizationsService) {
  return defineRegistry(createOrganizationsRegistryDefinition(organizationsService));
}
