export type ShipmentStatus = 'draft' | 'scheduled' | 'in_transit' | 'delivered' | 'cancelled';

export interface ShipmentItem {
  lineId?: string;
  productId: string;
  productName?: string;
  quantity: number;
  unit?: string;
}

export interface ShipmentDocumentLine {
  number: string;
  date: string;
  type: string;
  totalAmount: number;
  signatures?: string[];
  pdfUrl?: string;
  notes?: string;
}

export interface Shipment {
  _id: string;
  number: string;
  orderId: string | { _id: string; number?: string };
  counterpartyId: string | { _id: string; name?: string };
  date: string;
  recipient?: string;
  address?: string;
  status: ShipmentStatus;
  driverInfo?: string;
  warehouseId?: string;
  items: ShipmentItem[];
  notes?: string;
  docs?: ShipmentDocumentLine[];
  dispatchedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShipmentListFilters {
  orderId?: string;
  status?: ShipmentStatus | '';
  date?: string;
}

export type ShipmentUpdatePayload = Partial<
  Pick<Shipment, 'recipient' | 'address' | 'status' | 'driverInfo' | 'warehouseId' | 'notes'>
>;

export interface ShipmentAddDocPayload {
  type: string;
  totalAmount: number;
  number?: string;
  date?: string;
  pdfUrl?: string;
  notes?: string;
  signatures?: string[];
}
