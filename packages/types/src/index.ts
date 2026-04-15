export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  type: 'buy' | 'sell' | 'dividend' | 'deposit' | 'withdrawal' | 'fee';
  ticker?: string;
  quantity?: number;
  pricePerUnit?: number;
  totalAmount: number;
  currency: string;
  notes?: string;
}

export interface Asset {
  id: string;
  accountId: string;
  ticker: string;
  name: string;
  assetClass: 'stock' | 'etf' | 'bond' | 'crypto' | 'real-estate' | 'cash' | 'other';
  quantity: number;
  currency: string;
}

export interface FIREGoal {
  id: string;
  userId: string;
  targetAmount: number;
  monthlyContribution: number;
  expectedReturnRate: number;
  inflationRate: number;
  fireVariant: 'lean' | 'regular' | 'fat' | 'coast' | 'barista';
  targetDate?: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  broker: string;
  accountType: 'brokerage' | 'retirement' | 'savings' | 'crypto' | 'real-estate';
  currency: string;
  isActive: boolean;
}

export interface RealEstateAsset {
  id: string;
  userId: string;
  name: string;
  address?: string;
  propertyType: 'residential' | 'commercial' | 'land' | 'other';
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  currency: string;
  notes?: string;
}

export interface ColumnMapping {
  id: string;
  sourceFingerprint: string;
  brokerName?: string;
  mappings: Record<string, keyof Transaction>;
  createdAt: string;
  updatedAt: string;
}
