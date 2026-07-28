export type ThemeMode = 'light' | 'dark';

export type ActiveTab = 'constructor' | 'catalog' | 'deals' | 'warehouse' | 'audit';

// Document Constructor Types
export type BlockType = 'header' | 'text' | 'table' | 'total' | 'signatures' | 'terms';

export interface DocumentBlock {
  id: string;
  type: BlockType;
  title: string;
  content?: string;
  tableData?: TableItem[];
  variables?: Record<string, string>;
  isLocked?: boolean;
}

export interface TableItem {
  id: string;
  name: string;
  code: string;
  unit: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface ProposalDocument {
  id: string;
  number: string;
  date: string;
  validUntil: string;
  organizationName: string;
  clientName: string;
  clientInn: string;
  contractorName: string;
  currency: string;
  status: 'draft' | 'review' | 'approved' | 'sent' | 'rejected';
  blocks: DocumentBlock[];
  totalAmount: number;
  vatAmount: number;
  discountAmount: number;
  notes: string;
}

// Catalog & BOM Types
export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  modulesCount: number;
  costPrice: number;
  sellingPrice: number;
  marginPercent: number;
  unit: string;
  status: 'active' | 'archived';
  description: string;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  type: 'metal' | 'fastener' | 'coating' | 'electrical' | 'packaging';
  stockQuantity: number;
  reservedQuantity: number;
  unit: string;
  purchasePrice: number;
  supplier: string;
}

export interface WorkType {
  id: string;
  code: string;
  name: string;
  hourlyRate: number;
  standardHours: number;
  workCenter: string;
}

// Deals & Contracts Types
export interface Organization {
  id: string;
  name: string;
  inn: string;
  kpp: string;
  city: string;
  contactPerson: string;
  email: string;
  phone: string;
  role: 'client' | 'supplier' | 'partner';
  status: 'active' | 'lead';
}

export interface Contract {
  id: string;
  number: string;
  date: string;
  clientName: string;
  proposalRef: string;
  amount: number;
  status: 'draft' | 'signed' | 'active' | 'completed';
}

// Warehouse Types
export interface StockMovement {
  id: string;
  date: string;
  materialName: string;
  quantity: number;
  type: 'in' | 'out' | 'reserve';
  documentRef: string;
  operator: string;
}

// Audit & Review Types
export interface AuditIssue {
  id: string;
  category: 'ui' | 'dark_mode' | 'architecture' | 'ux';
  severity: 'high' | 'medium' | 'low';
  title: string;
  problem: string;
  solution: string;
  status: 'fixed' | 'recommendation';
}
