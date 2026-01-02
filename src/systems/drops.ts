import { BigNumber } from '../types/BigNumber';
import { add } from './bigNumbers';

export function applyDrops(
  inventory: Record<string, BigNumber>,
  drops: Record<string, BigNumber>
) {
  const result = { ...inventory };

  for (const id in drops) {
    result[id] = result[id]
      ? add(result[id], drops[id])
      : drops[id];
  }

  return result;
}
