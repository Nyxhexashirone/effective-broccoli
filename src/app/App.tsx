import React, { useState } from 'react';
import { Hammer, BookOpen, Settings, Trophy, Zap } from 'lucide-react';
import { targets } from '../data/targets';
import { formatBigNumber } from '../utils/format';
import { applyDamage } from '../systems/damage';
import { applyDrops } from '../systems/drops';
import { BigNumber } from '../types/BigNumber';

const Panel = ({ title, children, disabled = false }: any) => (
  <div className={`border border-gray-300 p-3 bg-white ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
    <h2 className="text-xs uppercase text-gray-500 mb-2">{title}</h2>
    {children}
  </div>
);

export default function App() {
  const [target] = useState(targets[0]);
  const [hp, setHp] = useState<BigNumber>(target.maxHP);
  const [currencies, setCurrencies] = useState<Record<string, BigNumber>>({
    bronze: { mantissa: 0, exponent: 0 },
  });

  const clickDamage: BigNumber = { mantissa: 1, exponent: 0 };

  function onClickTarget() {
    const newHp = applyDamage(hp, clickDamage, target.defense);
    setHp(newHp);

    if (newHp.mantissa === 0) {
      setCurrencies(prev => applyDrops(prev, target.drops));
      setHp(target.maxHP);
    }
  }

  return (
    <div className="h-screen bg-[#f6f6f6] flex flex-col select-none">
      <header className="flex justify-between px-6 py-3 bg-white border-b">
        <h1>Destroyer Clicker</h1>
        <span>🟤 {formatBigNumber(currencies.bronze)}</span>
      </header>

      <main className="flex-1 grid grid-cols-[320px_1fr] gap-6 p-6">
        <aside>
          <Panel title="Target">
            <img
              src={target.image}
              onClick={onClickTarget}
              draggable={false}
              className="w-48 mx-auto cursor-pointer active:scale-95"
            />
            <h2 className="text-center text-xl">{target.name}</h2>
            <p className="text-center text-gray-500">{target.subtitle}</p>
          </Panel>

          <Panel title="Target Status">
            <p>HP: {formatBigNumber(hp)} / {formatBigNumber(target.maxHP)}</p>
          </Panel>
        </aside>
      </main>
    </div>
  );
}
