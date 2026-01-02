import React, { useEffect, useState } from 'react';
import { Hammer, BookOpen, Settings, Trophy, Zap } from 'lucide-react';

import { targets } from '../data/targets';
import { formatBigNumber } from '../utils/format';
import { applyDamage } from '../systems/damage';
import { applyDrops } from '../systems/drops';
import { createLog, LogEntry } from '../systems/log';
import { loadSave, saveGame, createNewSave } from '../systems/save';
import { BigNumber } from '../types/BigNumber';

// UI helper
const Panel = ({
  title,
  children,
  disabled = false,
}: {
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <div
    className={`border border-gray-300 p-3 flex flex-col bg-white ${
      disabled ? 'opacity-40 pointer-events-none' : ''
    }`}
  >
    <h2 className="text-xs uppercase text-gray-500 mb-2">{title}</h2>
    {children}
  </div>
);

const ZERO: BigNumber = { mantissa: 0, exponent: 0 };

export default function App() {
  // ===== LOAD SAVE =====
  const loadedSave = loadSave() ?? createNewSave();

  // ===== STATE =====
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const target = targets[currentTargetIndex];

  const [hp, setHp] = useState<BigNumber>(target.maxHP);
  const [currencies, setCurrencies] = useState<Record<string, BigNumber>>(
    loadedSave.currencies
  );

  const [discoveredCurrencies, setDiscoveredCurrencies] = useState<Set<string>>(
    new Set(loadedSave.discovery.currencies)
  );

  const [log, setLog] = useState<LogEntry[]>([
    createLog('You exist. Unfortunately.'),
  ]);

  // ===== CONSTANTS =====
  const clickDamage: BigNumber = { mantissa: 1, exponent: 0 };

  // ===== EFFECTS =====
  useEffect(() => {
    saveGame({
      version: 1,
      currencies,
      upgrades: {},
      discovery: {
        currencies: Array.from(discoveredCurrencies),
      },
    });
  }, [currencies, discoveredCurrencies]);

  // ===== LOG HELPERS =====
  function pushLog(text: string) {
    setLog((prev) => [...prev.slice(-20), createLog(text)]);
  }

  // ===== CLICK HANDLER =====
  function onClickTarget() {
    const newHp = applyDamage(hp, clickDamage, target.defense);
    setHp(newHp);

    if (newHp.mantissa === 0) {
      pushLog(`You destroyed ${target.name}. It did not resist.`);

      const newCurrencies = applyDrops(currencies, target.drops);
      setCurrencies(newCurrencies);

      Object.keys(target.drops).forEach((id) => {
        if (!discoveredCurrencies.has(id)) {
          setDiscoveredCurrencies((prev) => new Set(prev).add(id));
          pushLog(`You discovered a new currency.`);
        }
      });

      if (currentTargetIndex < targets.length - 1) {
        setCurrentTargetIndex((i) => i + 1);
        setHp(targets[currentTargetIndex + 1].maxHP);
        pushLog('A new target appears.');
      } else {
        setHp(target.maxHP);
        pushLog('There is nothing else to destroy. For now.');
      }
    }
  }

  // ===== RENDER =====
  return (
    <div className="h-screen w-full bg-[#f6f6f6] text-gray-800 font-sans flex flex-col select-none">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <h1 className="text-lg font-medium">Destroyer Clicker</h1>
        <div className="flex items-center gap-6 text-sm font-medium">
          {Array.from(discoveredCurrencies).map((id) => (
            <span key={id}>
              {id === 'bronze' && '🟤'}
              {id === 'silver' && '⚪'}
              {formatBigNumber(currencies[id] ?? ZERO)}
            </span>
          ))}
          {discoveredCurrencies.size === 1 && <span>⚪ ???</span>}
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 grid grid-cols-[320px_1fr] gap-6 p-6">
        {/* LEFT */}
        <aside className="flex flex-col gap-4">
          <Panel title="Target">
            <div className="flex flex-col items-center">
              <img
                src={target.image}
                alt={target.name}
                draggable={false}
                onClick={onClickTarget}
                className="w-48 h-48 mb-3 cursor-pointer active:scale-95 transition"
              />
              <h2 className="text-2xl font-bold">{target.name}</h2>
              <p className="text-sm text-gray-500">{target.subtitle}</p>
            </div>
          </Panel>

          <Panel title="Target Status">
            <p>
              HP: {formatBigNumber(hp)} /{' '}
              {formatBigNumber(target.maxHP)}
            </p>
            <p>Defense: {formatBigNumber(target.defense)}</p>
            <p>Tier: {target.tier}</p>
          </Panel>
        </aside>

        {/* CENTER / RIGHT */}
        <section className="grid grid-rows-[auto_auto_1fr] gap-6">
          {/* UPGRADES */}
          <Panel title="Upgrades">
            <div className="grid grid-cols-4 gap-3">
              <button className="border border-gray-300 p-3 hover:bg-gray-50">
                <Zap size={18} />
              </button>
              <button className="border border-gray-300 p-3 hover:bg-gray-50">
                <Hammer size={18} />
              </button>
              <button className="border border-gray-300 p-3 bg-gray-100" disabled>
                ???
              </button>
              <button className="border border-gray-300 p-3 bg-gray-100" disabled>
                ???
              </button>
            </div>
          </Panel>

          {/* TOOL + STATS */}
          <div className="grid grid-cols-2 gap-6">
            <Panel title="Weapon">
              <p>Hands</p>
              <p>Power: 1</p>
              <p>Quality: 100%</p>
            </Panel>

            <Panel title="Stats">
              <p>Damage / click: 1</p>
              <p>Auto DPS: 0</p>
              <p>Luck: 0%</p>
            </Panel>
          </div>

          {/* LOG */}
          <Panel title="Log">
            <div className="flex-1 border border-gray-200 mb-2 p-2 text-sm text-gray-600 overflow-y-auto">
              {log.map((entry) => (
                <div key={entry.id}>{entry.text}</div>
              ))}
            </div>
            <button className="w-fit bg-[#d0d0d0] hover:bg-[#c0c0c0] border border-gray-400 px-4 py-1 text-sm">
              Craft weapon (locked)
            </button>
          </Panel>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="flex gap-3 px-4 py-2 bg-[#e0e0e0] border-t border-gray-300 text-sm">
        <button className="flex items-center gap-2 px-4 py-1 bg-white border border-gray-400 hover:bg-gray-50">
          <Zap size={16} /> Destroy
        </button>
        <button className="flex items-center gap-2 px-4 py-1 bg-white border border-gray-400 hover:bg-gray-50">
          <Trophy size={16} /> Achievements
        </button>
        <button className="flex items-center gap-2 px-4 py-1 bg-white border border-gray-400 hover:bg-gray-50">
          <BookOpen size={16} /> Story
        </button>
        <button className="flex items-center gap-2 px-4 py-1 bg-gray-200 border border-gray-400 cursor-not-allowed">
          Prestige
        </button>
        <div className="ml-auto">
          <button className="flex items-center gap-2 px-4 py-1 bg-white border border-gray-400 hover:bg-gray-50">
            <Settings size={16} /> Settings
          </button>
        </div>
      </footer>
    </div>
  );
}
