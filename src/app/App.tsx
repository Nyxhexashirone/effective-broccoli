import React, { useEffect, useState } from 'react';
import { Hammer, BookOpen, Settings, Trophy, Zap } from 'lucide-react';

import { targets } from '../data/targets';
import { upgrades } from '../data/upgrades';
import { formatBigNumber } from '../utils/format';
import { applyDamage } from '../systems/damage';
import { applyDrops } from '../systems/drops';
import { createLog, LogEntry } from '../systems/log';
import { loadSave, saveGame, createNewSave } from '../systems/save';
import { getUpgradeCost, applyClickDamageUpgrade } from '../systems/upgrades';
import { compare, subtract } from '../systems/bigNumbers';
import { BigNumber } from '../types/BigNumber';

const Panel = ({ title, children, disabled = false }: any) => (
  <div className={`border border-gray-300 p-3 bg-white ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
    <h2 className="text-xs uppercase text-gray-500 mb-2">{title}</h2>
    {children}
  </div>
);

const ZERO: BigNumber = { mantissa: 0, exponent: 0 };

export default function App() {
  const save = loadSave() ?? createNewSave();

  const [targetIndex, setTargetIndex] = useState(0);
  const target = targets[targetIndex];

  const [hp, setHp] = useState<BigNumber>(target.maxHP);
  const [currencies, setCurrencies] = useState(save.currencies);
  const [upgradeLevels, setUpgradeLevels] = useState<Record<string, number>>(
    save.upgrades ?? {}
  );

  const [log, setLog] = useState<LogEntry[]>([
    createLog('You exist. Unfortunately.'),
  ]);

  // ===== CLICK DAMAGE =====
  const baseClickDamage: BigNumber = { mantissa: 1, exponent: 0 };
  const clickDamage = applyClickDamageUpgrade(
    baseClickDamage,
    upgradeLevels['click_damage'] ?? 0
  );

  // ===== SAVE =====
  useEffect(() => {
    saveGame({
      version: 1,
      currencies,
      upgrades: upgradeLevels,
      discovery: { currencies: ['bronze'] },
    });
  }, [currencies, upgradeLevels]);

  function pushLog(text: string) {
    setLog((prev) => [...prev.slice(-20), createLog(text)]);
  }

  function onClickTarget() {
    const newHp = applyDamage(hp, clickDamage, target.defense);
    setHp(newHp);

    if (newHp.mantissa === 0) {
      pushLog(`You destroyed ${target.name}.`);

      setCurrencies((prev) => applyDrops(prev, target.drops));

      if (targetIndex < targets.length - 1) {
        setTargetIndex(targetIndex + 1);
        setHp(targets[targetIndex + 1].maxHP);
        pushLog('Something else wants to be destroyed.');
      } else {
        setHp(target.maxHP);
      }
    }
  }

  function buyUpgrade(id: string) {
    const upgrade = upgrades.find((u) => u.id === id);
    if (!upgrade) return;

    const level = upgradeLevels[id] ?? 0;
    if (level >= upgrade.maxLevel) return;

    const cost = getUpgradeCost(upgrade.cost.bronze, level);
    if (compare(currencies.bronze, cost) < 0) return;

    setCurrencies((prev) => ({
      ...prev,
      bronze: subtract(prev.bronze, cost),
    }));

    setUpgradeLevels((prev) => ({
      ...prev,
      [id]: level + 1,
    }));

    pushLog(`Upgrade purchased: ${upgrade.name} (Lv ${level + 1})`);
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
            <p>HP: {formatBigNumber(hp)}</p>
          </Panel>
        </aside>

        <section className="grid grid-rows-[auto_auto_1fr] gap-6">
          <Panel title="Upgrades">
            {upgrades.map((u) => {
              const level = upgradeLevels[u.id] ?? 0;
              const cost = getUpgradeCost(u.cost.bronze, level);
              const affordable = compare(currencies.bronze, cost) >= 0;

              return (
                <button
                  key={u.id}
                  onClick={() => buyUpgrade(u.id)}
                  disabled={!affordable}
                  className="border border-gray-300 p-2 mb-2 hover:bg-gray-50 text-left disabled:opacity-40"
                >
                  <strong>{u.name}</strong> (Lv {level})<br />
                  Cost: {formatBigNumber(cost)} 🟤
                </button>
              );
            })}
          </Panel>

          <Panel title="Stats">
            <p>Damage / click: {formatBigNumber(clickDamage)}</p>
            <p>Auto DPS: 0</p>
            <p>Luck: 0%</p>
          </Panel>

          <Panel title="Log">
            <div className="text-sm text-gray-600">
              {log.map((l) => (
                <div key={l.id}>{l.text}</div>
              ))}
            </div>
          </Panel>
        </section>
      </main>

      <footer className="px-4 py-2 bg-gray-200 border-t text-sm">
        Destroy responsibly.
      </footer>
    </div>
  );
}
