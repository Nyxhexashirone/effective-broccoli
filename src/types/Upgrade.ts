import { BigNumber } from './BigNumber';

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  cost: Record<string, BigNumber>;
}