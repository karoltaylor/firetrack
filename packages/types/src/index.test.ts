import { describe, expectTypeOf, it } from 'vitest';

import type { Account, Asset, FIREGoal, Transaction } from './index.js';

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
  });
});
