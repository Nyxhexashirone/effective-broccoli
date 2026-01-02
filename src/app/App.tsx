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

// Componentes simples para os achievements
const AchievementsButton = ({ onClick, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-40 flex items-center gap-2"
  >
    <Trophy size={16} />
    Achievements
  </button>
);

const AchievementsPanel = ({ unlockedAchievements, onClose }: any) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Achievements</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1"
        >
          ✕
        </button>
      </div>
      <div className="mb-4">
        <p className="text-gray-600">
          Unlocked: <strong>{unlockedAchievements.size}</strong> achievements
        </p>
      </div>
      <div className="space-y-3">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedAchievements.has(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`p-3 border rounded ${
                isUnlocked
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    isUnlocked ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}
                >
                  <Trophy
                    size={20}
                    className={isUnlocked ? 'text-yellow-600' : 'text-gray-400'}
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      isUnlocked ? 'text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    {achievement.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      isUnlocked ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {achievement.description}
                  </p>
                </div>
                {isUnlocked && (
                  <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                    Unlocked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

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

  // Estado para mostrar achievements
  const [showAchievements, setShowAchievements] = useState(false);
  // Estado para desbloquear botão de achievements
  const [unlocks, setUnlocks] = useState({
    achievements: true // Pode ajustar essa lógica conforme necessário
  });

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
    // Simulando que o save tenha achievements
    const achievementsArray = Array.from(achievementProgress.unlocked);
    
    saveGame({
      version: 1,
      currencies,
      upgrades: upgradeLevels,
      discovery: { currencies: ['bronze'] },
      achievements: achievementsArray, // Adicionado achievements ao save
    });
  }, [currencies, upgradeLevels, achievementProgress]);

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
        <h1 className="text-xl font-bold">Destroyer Clicker</h1>
        <span className="font-medium">🟤 {formatBigNumber(currencies.bronze)}</span>
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
            <h2 className="text-center text-xl font-medium mt-2">{target.name}</h2>
            <p className="text-center text-gray-500 text-sm">{target.subtitle}</p>
          </Panel>

          <Panel title="Target Status">
            <div className="space-y-1">
              <p className="flex justify-between">
                <span className="text-gray-600">HP:</span>
                <span className="font-medium">{formatBigNumber(hp)}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Defense:</span>
                <span className="font-medium">{formatBigNumber(target.defense)}</span>
              </p>
            </div>
          </Panel>
        </aside>

        <section className="grid grid-rows-[auto_auto_1fr] gap-6">
          <Panel title="Upgrades">
            <div className="space-y-2">
              {upgrades.map((u) => {
                const level = upgradeLevels[u.id] ?? 0;
                const cost = getUpgradeCost(u.cost.bronze, level);
                const affordable = compare(currencies.bronze, cost) >= 0;

                return (
                  <button
                    key={u.id}
                    onClick={() => buyUpgrade(u.id)}
                    disabled={!affordable || level >= u.maxLevel}
                    className={`w-full border border-gray-300 p-3 text-left hover:bg-gray-50 disabled:opacity-40 transition ${
                      affordable && level < u.maxLevel ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-gray-800">{u.name}</strong>
                        <p className="text-sm text-gray-600 mt-1">{u.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          Lv {level}/{u.maxLevel}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Cost:</span>
                      <span className="font-medium">{formatBigNumber(cost)} 🟤</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Stats">
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Damage / click:</span>
                <span className="font-medium">{formatBigNumber(clickDamage)}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Auto DPS:</span>
                <span className="font-medium">{formatBigNumber(autoDps)}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Luck:</span>
                <span className="font-medium">0%</span>
              </p>
            </div>
          </Panel>

          <Panel title="Log">
            <div className="flex-1 border border-gray-200 p-3 text-sm text-gray-600 overflow-y-auto h-64">
              <div className="space-y-1">
                {log.map((l) => (
                  <div key={l.id} className="py-1 border-b border-gray-100 last:border-0">
                    {l.text}
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </section>
      </main>

      <footer className="px-4 py-2 bg-[#e0e0e0] border-t text-sm flex justify-between items-center">
        <span className="text-gray-600">
          Destruction continues even when you do nothing.
        </span>
        
        <AchievementsButton
          onClick={() => setShowAchievements(true)}
          disabled={!unlocks.achievements}
        />
      </footer>

      {showAchievements && (
        <AchievementsPanel
          unlockedAchievements={new Set(save.achievements || [])}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </div>
  );
}
