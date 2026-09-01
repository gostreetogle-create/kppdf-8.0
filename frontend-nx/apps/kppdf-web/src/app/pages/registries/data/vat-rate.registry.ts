import { defineRegistry, type RegistryDefinition, type RegistryRow } from '../model/registry.types';
import { createOrganizationsHttpDataSource } from './organizations-http-data-source';
import type { PiOrganizationsService } from '@kppdf/data-access';

/** S22 — reuse Organization.vatRate as VAT SoT; edit via organizations registry. */
export function createVatRateRegistry(
  organizationsService: PiOrganizationsService,
): RegistryDefinition<RegistryRow> {
  return defineRegistry({
    key: 'vat-rate',
    title: 'Ставки НДС',
    category: 'Финансы',
    description: 'Ставка НДС нашей организации (поле vatRate). Редактируется в карточке организации.',
    source: 'api',
    rowId: (row) => row._id,
    defaultPageSize: 25,
    emptyMessage: 'Организации не найдены.',
    columns: [
      { key: 'name', header: 'Организация', sortable: false, format: (row) => row.name },
      { key: 'vatRate', header: 'НДС, %', sortable: false, format: (row) => String(row.vatRate ?? 20) },
    ],
    filters: [{ key: 'search', label: 'Поиск', type: 'text', placeholder: 'Название, ИНН…' }],
    paginationMode: 'server',
    dataSource: createOrganizationsHttpDataSource(organizationsService),
  }) as RegistryDefinition<RegistryRow>;
}
