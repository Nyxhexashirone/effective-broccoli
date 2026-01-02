export interface GameState {
  targetIndex: number;
  hp: BigNumber;
  currencies: Record<string, BigNumber>;
  upgrades: Record<string, number>;
  unlocks: Unlocks;
}