import React, { useEffect, useRef, useState } from 'react';
import { Hammer, BookOpen, Settings, Trophy, Zap } from 'lucide-react';

import { targets } from '../data/targets';
import { upgrades } from '../data/upgrades';
import { achievements } from '../data/achievements';

import { formatBigNumber } from '../utils/format';
import { applyDamage } from '../systems/damage';
import { applyDrops } from '../systems/drops';
import { tickDamage } from '../systems/tick';
import { calculateAutoDPS } from '../systems/autoClick';
import { getUpgradeCost, applyClickDamageUpgrade } from '../systems/upgrades';
import { checkAchievements } from '../systems/achievements';
import { compare, subtract } from '../systems/bigNumbers';
import { createLog, LogEntry } from '../systems/log';
import { loadSave, saveGame, createNewSave } from '../systems/save';

import { BigNumber } from '../types/BigNumber';
import { AchievementProgress } from '../systems/achievements';
import { AchievementState } from '../types/Achievement';

const Panel = ({ title, children, disabled = false }: any) => (
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
  const save = loadSave() ?? createNewSave();

  // ===== CORE STATE =====
  const [targetIndex, setTargetIndex] = useState(0);
  const target = targets[targetIndex];

  const [hp, setHp] = useState<BigNumber>(target.maxHP);
  const [currencies, setCurrencies] = useState(save.currencies);
  const [upgradeLevels, setUpgradeLevels] = useState<Record<string, number>>(
    save.upgrades ?? {}
  );

  // ===== LOG =====
  const [log, setLog] = useState<LogEntry[]>([
    createLog('You exist. Unfortunately.'),
  ]);

  // ===== ACHIEVEMENT STATE =====
  const [achievementProgress] = useState<AchievementProgress>({
    unlocked: new Set(),
  });

  const achievementState = useRef<AchievementState>({
    clicks: 0,
    targetsDestroyed: 0,
    upgradesPurchased: 0,
  });

  // ===== DAMAGE =====
  const baseClickDamage: BigNumber = { mantissa: 1, exponent: 0 };
  const clickDamage = applyClickDamageUpgrade(
    baseClickDamage,
    upgradeLevels['click_damage'] ?? 0
  );

  const autoDamage: BigNumber = { mantissa: 0, exponent: 0 };
  const autoSpeed = 0; // será desbloqueado via achievements
  const autoDps = calculateAutoDPS(autoDamage, autoSpeed);

  // ===== SAVE EFFECT =====
  useEffect(() => {
    saveGame({
      version: 1,
      currencies,
      upgrades: upgradeLevels,
      discovery: { currencies: ['bronze'] },
    });
  }, [currencies, upgradeLevels]);

  // ===== LOG HELPER =====
  function pushLog(text: string) {
    setLog((prev) => [...prev.slice(-30), createLog(text)]);
  }

  // ===== ACHIEVEMENT CHECK =====
  function evaluateAchievements() {
    const unlocked = checkAchievements(
      achievements,
      achievementState.current,
      achievementProgress
    );

    unlocked.forEach((id) => {
      const a = achievements.find((x) => x.id === id);
      if (!a) return;

      pushLog(`Achievement unlocked: ${a.name}`);
    });
  }

  // ===== CLICK =====
  function onClickTarget() {
    achievementState.current.clicks += 1;

    const newHp = applyDamage(hp, clickDamage, target.defense);
    setHp(newHp);

    evaluateAchievements();

    if (newHp.mantissa === 0) {
      achievementState.current.targetsDestroyed += 1;

      pushLog(`You destroyed ${target.name}.`);
      setCurrencies((prev) => applyDrops(prev, target.drops));

      if (targetIndex < targets.length - 1) {
        setTargetIndex(targetIndex + 1);
        setHp(targets[targetIndex + 1].maxHP);
        pushLog('A new target appears.');
      } else {
        setHp(target.maxHP);
      }

      evaluateAchievements();
    }
  }

  // ===== BUY UPGRADE =====
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

    achievementState.current.upgradesPurchased += 1;

    pushLog(`Upgrade purchased: ${upgrade.name} (Lv ${level + 1})`);
    evaluateAchievements();
  }

  // ===== IDLE TICK LOOP =====
  const lastTime = useRef<number>(performance.now());

  useEffect(() => {
    let frame: number;

    function loop(now: number) {
      const delta = (now - lastTime.current) / 1000;
      lastTime.current = now;

      if (autoDps.mantissa > 0) {
        const result = tickDamage(hp, autoDps, target.defense, delta);

        if (result.destroyed) {
          achievementState.current.targetsDestroyed += 1;
          setCurrencies((prev) => applyDrops(prev, target.drops));

          if (targetIndex < targets.length - 1) {
            setTargetIndex(targetIndex + 1);
            setHp(targets[targetIndex + 1].maxHP);
            pushLog('Destroyed automatically.');
          } else {
            setHp(target.maxHP);
          }

          evaluateAchievements();
        } else {
          setHp(result.newHp);
        }
      }

      frame = requestAnimationFrame(loop);
    }

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [autoDps, hp, targetIndex]);

  // ===== RENDER =====
  return (
    <div className="h-screen w-full bg-[#f6f6f6] text-gray-800 flex flex-col select-none">
      <header className="flex justify-between px-6 py-3 bg-white border-b">
        <h1>Destroyer Clicker</h1>
        <span>🟤 {formatBigNumber(currencies.bronze)}</span>
      </header>

      <main className="flex-1 grid grid-cols-[320px_1fr] gap-6 p-6">
        <aside className="flex flex-col gap-4">
          <Panel title="Target">
            <img
              src={target.image}
              onClick={onClickTarget}
              draggable={false}
              className="w-48 mx-auto cursor-pointer active:scale-95 transition"
            />
            <h2 className="text-center text-xl">{target.name}</h2>
            <p className="text-center text-gray-500">{target.subtitle}</p>
          </Panel>

          <Panel title="Target Status">
            <p>HP: {formatBigNumber(hp)}</p>
            <p>Defense: {formatBigNumber(target.defense)}</p>
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
                  className="border border-gray-300 p-2 mb-2 text-left hover:bg-gray-50 disabled:opacity-40"
                >
                  <strong>{u.name}</strong> (Lv {level})<br />
                  Cost: {formatBigNumber(cost)} 🟤
                </button>
              );
            })}
          </Panel>

          <Panel title="Stats">
            <p>Damage / click: {formatBigNumber(clickDamage)}</p>
            <p>Auto DPS: {formatBigNumber(autoDps)}</p>
            <p>Luck: 0%</p>
          </Panel>

          <Panel title="Log">
            <div className="flex-1 border border-gray-200 p-2 text-sm text-gray-600 overflow-y-auto">
              {log.map((l) => (
                <div key={l.id}>{l.text}</div>
              ))}
            </div>
          </Panel>
        </section>
      </main>

      <footer className="px-4 py-2 bg-[#e0e0e0] border-t text-sm">
        Destruction continues even when you do nothing.
      </footer>
    </div>
  );
}
