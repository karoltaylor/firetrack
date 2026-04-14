import { describe, expectTypeOf, it } from 'vitest';

import type {
  Account,
  Asset,
  ColumnMapping,
  FIREGoal,
  RealEstateAsset,
  Transaction,
} from './index.js';

describe('@firetrack/types', () => {
  it('should expose the core shared domain interfaces', () => {
    expectTypeOf<Transaction>().toMatchTypeOf<{
      id: string;
      accountId: string;
      totalAmount: number;
      currency: string;
    }>();

    expectTypeOf<Asset>().toMatchTypeOf<{
      ticker: string;
      assetClass: string;
      quantity: number;
    }>();

    expectTypeOf<FIREGoal>().toMatchTypeOf<{
      targetAmount: number;
      monthlyContribution: number;
      fireVariant: string;
    }>();

    expectTypeOf<Account>().toMatchTypeOf<{
      userId: string;
      broker: string;
      isActive: boolean;
    }>();

    expectTypeOf<RealEstateAsset>().toMatchTypeOf<{
      id: string;
      userId: string;
      name: string;
      propertyType: 'residential' | 'commercial' | 'land' | 'other';
      purchasePrice: number;
      purchaseDate: string;
      currentValue: number;
      currency: string;
    }>();

    expectTypeOf<ColumnMapping>().toMatchTypeOf<{
      id: string;
      sourceFingerprint: string;
      mappings: Record<string, keyof Transaction>;
      createdAt: string;
      updatedAt: string;
    }>();
  });
});
