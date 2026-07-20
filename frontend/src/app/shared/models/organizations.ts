export const ORG_TYPES = ['customer', 'supplier', 'contractor', 'manufacturer', 'partner'] as const;
export type OrgType = (typeof ORG_TYPES)[number];

export const ORG_TYPE_LABELS: Record<OrgType, string> = {
  customer: 'Покупатель',
  supplier: 'Поставщик',
  contractor: 'Подрядчик',
  manufacturer: 'Производитель',
  partner: 'Партнёр',
};

export interface Organization {
  _id: string;
  name: string;
  shortName?: string;
  legalForm?: string;
  inn: string;
  kpp?: string;
  ogrn?: string;
  ogrnip?: string;
  bankName?: string;
  bankBik?: string;
  bankAccount?: string;
  bankCorrAccount?: string;
  signerName?: string;
  signerPosition?: string;
  paymentTermDays?: number;
  vatRate?: number;
  isActive?: boolean;
  type?: OrgType[];
  legalType?: 'ooo' | 'ip' | 'pao' | 'ao' | 'other';
  website?: string;
  directorName?: string;
  registrationDate?: string;
  partyTypes?: string[];
  photoIds?: string[];
  contactPersonId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationsListResponse {
  items: Organization[];
  total: number;
  page: number;
  limit: number;
}

export interface OrganizationsListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: OrgType;
}
