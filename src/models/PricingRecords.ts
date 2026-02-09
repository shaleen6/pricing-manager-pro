interface PricingRecord {
  id: string;
  storeId: string;
  sku: string;
  productName: string;
  price: number;
  date: string;
  currency: string;
}

interface CreatePricingRecord {
  storeId: string;
  sku: string;
  productName: string;
  price: number;
  date: string;
  currency: string;
  updatedBy?: string;
  notes?: string;
}

interface PricingRecordEdit extends PricingRecord {
  notes?: string;
}

export type {PricingRecord, PricingRecordEdit, CreatePricingRecord};