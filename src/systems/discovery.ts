export interface DiscoveryState {
  currencies: Set<string>;
  upgrades: Set<string>;
  systems: Set<string>;
}

export const initialDiscovery: DiscoveryState = {
  currencies: new Set(['bronze']),
  upgrades: new Set(),
  systems: new Set(),
};

export function discoverCurrency(state: DiscoveryState, id: string) {
  state.currencies.add(id);
}

export function isCurrencyDiscovered(state: DiscoveryState, id: string): boolean {
  return state.currencies.has(id);
}
