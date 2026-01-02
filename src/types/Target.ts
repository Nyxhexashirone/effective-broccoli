import { BigNumber } from './BigNumber';

export interface Target {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  tier: number;
  maxHP: BigNumber;
  defense: BigNumber;
  drops: Record<string, BigNumber>;
}
