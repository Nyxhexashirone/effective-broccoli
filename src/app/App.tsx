import { useEffect, useReducer, useRef, useState } from 'react';

import { targets } from '../data/targets';
import { upgrades } from '../data/upgrades';
import { achievements } from '../data/achievements';

import { formatBigNumber } from '../utils/format';
import { applyDamage } from '../systems/damage';
import { tickDamage } from '../systems/tick';
import { calculateAutoDPS } from '../systems/autoClick';
import { getUpgradeCost, applyClickDamageUpgrade } from '../systems/upgrades';
import { checkAchievements } from '../systems/achievements';
import { compare, subtract } from '../systems/bigNumbers';
import { createLog, LogEntry } from '../systems/log';
import { loadSave, saveGame, createNewSave } from '../systems/save';
import { saveToGameState } from '../systems/saveMapper';

import { BigNumber } from '../types/BigNumber';
import { AchievementProgress } from '../systems/achievements';
import { AchievementState } from '../types/Achievement';

// Importar componentes de achievements
import { AchievementsButton } from '../components/achievements/AchievementsButton';
import { AchievementsPanel } from '../components/achievements/AchievementsPanel';

// Definir o tipo GameState
interface GameState {
  targetIndex: number;
  hp: BigNumber;
  currencies: Record<string, BigNumber>;
  upgrades: Record<string, number>;
  unlocks: {
    achievements: boolean;
    upgrades: boolean;
    autoClick: boolean;
  };
}

// Definir ações para o reducer
type GameAction =
  | { type: 'SET_TARGET'; payload: number }
  | { type: 'SET_HP'; payload: BigNumber }
  | { type: 'SET_CURRENCIES'; payload: { bronze: BigNumber } }
  | { type: 'SET_UPGRADES'; payload: Record<string, number> }
  | { type: 'SET_UNLOCKS'; payload: { achievements: boolean; upgrades: boolean; autoClick: boolean } }
  | { type: 'APPLY_DROPS'; payload: Array<{ currency: string; amount: BigNumber }> }
  | { type: 'BUY_UPGRADE'; payload: { id: string; cost: BigNumber; level: number } }
  | { type: 'TICK'; payload: { delta: number } };

// Reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_TARGET':
      return {
        ...state,
        targetIndex: action.payload,
        hp: targets[action.payload].maxHP
      };
    
    case 'SET_HP':
      return {
        ...state,
        hp: action.payload
      };
    
    case 'SET_CURRENCIES':
      return {
        ...state,
        currencies: action.payload
      };
    
    case 'SET_UPGRADES':
      return {
        ...state,
        upgrades: action.payload
      };
    
    case 'SET_UNLOCKS':
      return {
        ...state,
        unlocks: action.payload
      };
    
    case 'APPLY_DROPS':
      const newCurrencies = { ...state.currencies };
      action.payload.forEach(drop => {
        if (drop.currency === 'bronze') {
          newCurrencies.bronze = {
            mantissa: newCurrencies.bronze.mantissa + drop.amount.mantissa,
            exponent: newCurrencies.bronze.exponent + drop.amount.exponent
          };
        }
      });
      return {
        ...state,
        currencies: newCurrencies
      };
    
    case 'BUY_UPGRADE':
      const newUpgrades = { ...state.upgrades };
      newUpgrades[action.payload.id] = action.payload.level;
      
      return {
        ...state,
        currencies: {
          ...state.currencies,
          bronze: subtract(state.currencies.bronze, action.payload.cost)
        },
        upgrades: newUpgrades
      };
    
    case 'TICK':
      return state;
    
    default:
      return state;
  }
}

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

  // ===== INITIAL STATE =====
  const initialState = saveToGameState(save);

  // ===== USE REDUCER =====
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Destructuring para facilitar o uso
  const { targetIndex, hp, currencies, upgrades: upgradeLevels, unlocks } = state;
  const target = targets[targetIndex];

  // ===== LOCAL STATE (não relacionado ao reducer) =====
  const [showAchievements, setShowAchievements] = useState(false);
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
  const autoSpeed = 0;
  const autoDps = calculateAutoDPS(autoDamage, autoSpeed);

  // ===== SAVE EFFECT =====
  useEffect(() => {
    const achievementsArray = Array.from(achievementProgress.unlocked);
    
    saveGame({
      version: 1,
      currencies,
      upgrades: upgradeLevels,
      discovery: { currencies: ['bronze'] },
      achievements: achievementsArray,
      unlocks,
      lastPlayed: Date.now(),
    });
  }, [currencies, upgradeLevels, achievementProgress, unlocks]);

  // ===== LOG HELPER =====
  const pushLog = useRef((text: string) => {
    setLog((prev) => [...prev.slice(-30), createLog(text)]);
  }).current;

  // ===== ACHIEVEMENT CHECK =====
  const evaluateAchievements = useRef(() => {
    const result = checkAchievements(
      achievements,
      achievementState.current,
      achievementProgress,
      unlocks
    );

    result.unlockedIds.forEach((id) => {
      const a = achievements.find((x) => x.id === id);
      if (!a) return;

      pushLog(`Achievement unlocked: ${a.name}`);
    });

    if (result.unlocks !== unlocks) {
      dispatch({ type: 'SET_UNLOCKS', payload: result.unlocks });
    }
  }).current;

  // ===== CLICK =====
  const onClickTarget = useRef(() => {
    achievementState.current.clicks += 1;

    const newHp = applyDamage(hp, clickDamage, target.defense);
    dispatch({ type: 'SET_HP', payload: newHp });

    evaluateAchievements();

    if (newHp.mantissa === 0) {
      achievementState.current.targetsDestroyed += 1;

      pushLog(`You destroyed ${target.name}.`);
      
      dispatch({ 
        type: 'APPLY_DROPS', 
        payload: Object.entries(target.drops).map(([currency, amount]) => ({ 
          currency, 
          amount 
        })) 
      });

      if (targetIndex < targets.length - 1) {
        const newTargetIndex = targetIndex + 1;
        dispatch({ type: 'SET_TARGET', payload: newTargetIndex });
        pushLog('A new target appears.');
      } else {
        dispatch({ type: 'SET_HP', payload: target.maxHP });
      }

      evaluateAchievements();
    }
  }).current;

  // ===== BUY UPGRADE =====
  const buyUpgrade = useRef((id: string) => {
    const upgrade = upgrades.find((u) => u.id === id);
    if (!upgrade) return;

    const level = upgradeLevels[id] ?? 0;
    if (level >= upgrade.maxLevel) return;

    const cost = getUpgradeCost(upgrade.cost.bronze, level);
    if (compare(currencies.bronze, cost) < 0) return;

    dispatch({
      type: 'BUY_UPGRADE',
      payload: { id, cost, level: level + 1 }
    });

    achievementState.current.upgradesPurchased += 1;

    pushLog(`Upgrade purchased: ${upgrade.name} (Lv ${level + 1})`);
    evaluateAchievements();
  }).current;

  // ===== ÚNICO TICK LOOP =====
  useEffect(() => {
    let frame: number;
    let last = performance.now();

    function loop(now: number) {
      const delta = (now - last) / 1000;
      last = now;

      dispatch({ type: 'TICK', payload: { delta } });

      if (autoDps.mantissa > 0) {
        const result = tickDamage(hp, autoDps, target.defense, delta);
        
        if (result.destroyed) {
          achievementState.current.targetsDestroyed += 1;
          
          dispatch({ 
            type: 'APPLY_DROPS', 
            payload: Object.entries(target.drops).map(([currency, amount]) => ({ 
              currency, 
              amount 
            })) 
          });

          if (targetIndex < targets.length - 1) {
            const newTargetIndex = targetIndex + 1;
            dispatch({ type: 'SET_TARGET', payload: newTargetIndex });
            pushLog('Destroyed automatically.');
          } else {
            dispatch({ type: 'SET_HP', payload: target.maxHP });
          }

          evaluateAchievements();
        } else if (result.newHp.mantissa !== hp.mantissa || result.newHp.exponent !== hp.exponent) {
          dispatch({ type: 'SET_HP', payload: result.newHp });
        }
      }

      frame = requestAnimationFrame(loop);
    }

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [dispatch, autoDps, hp, target.defense, target.drops, target.maxHP, targetIndex, evaluateAchievements, pushLog]);

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