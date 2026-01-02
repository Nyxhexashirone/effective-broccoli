import { BigNumber } from './BigNumber';

export interface Save {
  version: number;
  currencies: Record<string, BigNumber>;
  upgrades: Record<string, number>;
  discovery: {
    currencies: string[];
  };
}
