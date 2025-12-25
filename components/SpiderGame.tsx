
import React, { useRef, useEffect, useState } from 'react';

// FIXED: 蜘蛛语录彩蛋数组
const SPIDER_QUOTES = [
  "🕷️ 蜘蛛侠为你点赞！",
  "🕸️ 织网速度提升 20%！",
  "🚀 你的手指着火了吗？太快了！",
  "🧬 正在进化为盲打大师...",
  "🕸️ 织一张完美的网需要耐心和速度！",
  "🎖️ 捕虫达人勋章正在路上的路上！",
  "🍬 奖励你一只特大号苍蝇（虚拟的）！"
];

interface GameConfig {
  keyScope: 'HOME' | 'TOP' | 'ALL';
  speed: 'SLOW' | 'NORMAL' | 'FAST';
  skin: 'FLY' | 'METEOR' | 'RANDOM';
}

type EnemyType = 'FLY' | 'SPORE' | 'PLANE';

interface Fly {
  id: number;
  text: string;     
  typedLen: number; 
  x: number;
  y: number;
  speed: number;
  wobbleOffset: number;
  isLocked: boolean;
  type: EnemyType;
}

interface WebShot {
  id: number;
  targetId: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  life: number; 
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface SpiderGameProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
  mode?: 'CHAR' | 'WORD';
  customWords?: string[];
}

const KEY_POOLS = {
  HOME: "asdfjklgh".split(''),
  TOP: "asdfjklghqwertyuiop".split(''),
  ALL: "abcdefghijklmnopqrstuvwxyz".split('')
};

const SPEED_VALS = {
  SLOW: 1.2,
  NORMAL: 2.2,
  FAST: 3.5
};

const SpiderGame: React.FC<SpiderGameProps> = ({ onGameOver, onExit, mode = 'CHAR', customWords }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // FIXED: 扩充 gameState 增加 'TRANSITION' 状态
  const [gameState, setGameState] = useState<'SETUP' | 'PLAYING' | 'TRANSITION' | 'GAMEOVER'>('SETUP');
  const [config, setConfig] = useState<GameConfig>({
    keyScope: 'HOME',
    speed: 'NORMAL',
    skin: 'RANDOM'
  });
  
  const [score, setScore] = useState(0);
  const [webHealth, setWebHealth] = useState(100);
  const [combo, setCombo] = useState(0);
  const [stage, setStage] = useState(1);
  const [progressInStage, setProgressInStage] = useState(0);
  const [currentQuote, setCurrentQuote] = useState("");

  const stateRef = useRef({
    flies: [] as Fly[],
    shots: [] as WebShot[],
    particles: [] as Particle[],
    lastSpawn: 0,
    score: 0,
    webHealth: 100,
    combo: 0,
    stage: 1,
    progressInStage: 0,
    activeTargetId: null as number | null,
    frameCount: 0,
    spiderRecoil: 0 
  });

  const startGame = () => {
    stateRef.current = {
      flies: [],
      shots: [],
      particles: [],
      lastSpawn: 0,
      score: 0,
      webHealth: 100,
      combo: 0,
      stage: 1,
      progressInStage: 0,
      activeTargetId: null,
      frameCount: 0,
      spiderRecoil: 0
    };
    setScore(0);
    setWebHealth(100);
    setCombo(0);
    setStage(1);
    setProgressInStage(0);
    setGameState('PLAYING');
  };

  // FIXED: 进入下一关逻辑
  const nextStage = () => {
    stateRef.current.stage++;
    stateRef.current.progressInStage = 0;
    stateRef.current.flies = []; // 清空残留敌人
    setStage(stateRef.current.stage);
    setProgressInStage(0);
    setGameState('PLAYING');
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
        const parent = canvas.parentElement;
        canvas.width = Math.max(800, parent?.clientWidth || 0);
        canvas.height = Math.max(600, parent?.clientHeight || 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let animationId: number;

    const spawnFly = (now: number) => {
        const pool = customWords && customWords.length > 0 ? customWords : KEY_POOLS[config.keyScope];
        const text = pool[Math.floor(Math.random() * pool.length)];
        const x = Math.random() * (canvas.width - 160) + 80;
        
        const types: EnemyType[] = ['FLY', 'SPORE', 'PLANE'];
        const randomType = types[Math.floor(Math.random() * types.length)];

        stateRef.current.flies.push({
            id: now,
            text: text,
            typedLen: 0,
            x,
            y: -40,
            speed: SPEED_VALS[config.speed] * (1 + (stateRef.current.stage - 1) * 0.1), 
            wobbleOffset: Math.random() * Math.PI * 2,
            isLocked: false,
            type: randomType
        });
        stateRef.current.lastSpawn = now;
    };

    const createExplosion = (x: number, y: number, color: string) => {
        for(let i=0; i<12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const force = Math.random() * 6 + 2;
            stateRef.current.particles.push({
                id: Math.random(),
                x, y,
                vx: Math.cos(angle) * force,
                vy: Math.sin(angle) * force,
                life: 1.0,
                color
            });
        }
    };

    const update = (time: number) => {
        const { width, height } = canvas;
        stateRef.current.frameCount++;

        if (stateRef.current.spiderRecoil > 0) {
            stateRef.current.spiderRecoil -= 1;
        }

        const spawnRate = Math.max(400, (config.speed === 'FAST' ? 700 : config.speed === 'NORMAL' ? 1200 : 2000) - (stateRef.current.stage * 50));
        if (time - stateRef.current.lastSpawn > spawnRate) {
            spawnFly(time);
        }

        stateRef.current.flies.forEach(fly => {
            fly.y += fly.speed;
            fly.x += Math.sin((fly.y * 0.05) + fly.wobbleOffset) * 0.8;
        });

        const hitBottom = stateRef.current.flies.filter(f => f.y > height - 60);
        if (hitBottom.length > 0) {
            stateRef.current.webHealth -= hitBottom.length * 15;
            stateRef.current.combo = 0; 
            if (hitBottom.some(f => f.id === stateRef.current.activeTargetId)) {
                stateRef.current.activeTargetId = null;
            }
            setWebHealth(Math.max(0, stateRef.current.webHealth));
            setCombo(0);
            hitBottom.forEach(f => createExplosion(f.x, height-30, '#ef4444'));
            stateRef.current.flies = stateRef.current.flies.filter(f => f.y <= height - 60);

            if (stateRef.current.webHealth <= 0) {
                setGameState('GAMEOVER');
                return;
            }
        }

        stateRef.current.shots.forEach(shot => {
            shot.life -= 0.1; 
        });
        stateRef.current.shots = stateRef.current.shots.filter(s => s.life > 0);

        stateRef.current.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.life -= 0.04;
        });
        stateRef.current.particles = stateRef.current.particles.filter(p => p.life > 0);

        render();
        animationId = requestAnimationFrame(update);
    };

    const render = () => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const { width, height } = canvas;
        const playerX = width / 2;
        const playerY = height - 50 + stateRef.current.spiderRecoil;

        ctx.fillStyle = '#1e293b'; 
        ctx.fillRect(0, height-20, width, 20);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(0, height-20, (Math.max(0, stateRef.current.webHealth) / 100) * width, 20);

        ctx.save();
        ctx.translate(playerX, playerY);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        for(let i=0; i<8; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI / 4) + (stateRef.current.frameCount * 0.02));
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(25, Math.sin(stateRef.current.frameCount * 0.1 + i) * 5);
            ctx.stroke();
            ctx.restore();
        }
        ctx.fillStyle = '#1e293b';
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(-7, -5, 4, 0, Math.PI * 2); ctx.arc(7, -5, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(-8, -6, 1.5, 0, Math.PI * 2); ctx.arc(6, -6, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        stateRef.current.shots.forEach(shot => {
            ctx.save();
            ctx.strokeStyle = `rgba(255, 255, 255, ${shot.life})`;
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]); 
            ctx.beginPath();
            ctx.moveTo(shot.startX, shot.startY);
            ctx.lineTo(shot.targetX, shot.targetY);
            ctx.stroke();
            ctx.restore();
        });

        stateRef.current.flies.forEach(fly => {
            ctx.save();
            ctx.translate(fly.x, fly.y);
            
            const isTarget = fly.id === stateRef.current.activeTargetId;
            const wobble = Math.sin(stateRef.current.frameCount * 0.1 + fly.wobbleOffset);
            ctx.rotate(wobble * 0.1);

            if (config.skin === 'METEOR') {
                const tailGrad = ctx.createLinearGradient(0, 0, 0, -40);
                tailGrad.addColorStop(0, '#f97316');
                tailGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = tailGrad;
                ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(0, -40); ctx.lineTo(10, 0); ctx.fill();
                ctx.fillStyle = '#475569';
                ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2); ctx.fill();
                ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2; ctx.stroke();
            } else {
                const isInsect = fly.type === 'FLY' || config.skin === 'RANDOM';
                if (isInsect) {
                    const wingSpread = Math.sin(stateRef.current.frameCount * 0.4) * 8;
                    const radiusY = Math.max(1, 10 + wingSpread);
                    ctx.fillStyle = isTarget ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.4)';
                    ctx.beginPath(); ctx.ellipse(-14, -5, 18, radiusY, Math.PI/4, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.ellipse(14, -5, 18, radiusY, -Math.PI/4, 0, Math.PI*2); ctx.fill();
                }

                switch(fly.type) {
                    case 'FLY': 
                        ctx.fillStyle = isTarget ? '#ef4444' : '#000';
                        ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI*2); ctx.fill();
                        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
                        break;
                    case 'SPORE': 
                        const pulse = Math.sin(stateRef.current.frameCount * 0.2) * 2;
                        ctx.fillStyle = isTarget ? '#ef4444' : '#6366f1';
                        ctx.beginPath(); ctx.arc(0, 0, 14 + pulse, 0, Math.PI*2); ctx.fill();
                        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
                        break;
                    case 'PLANE': 
                        ctx.fillStyle = isTarget ? '#ef4444' : '#334155';
                        ctx.beginPath();
                        ctx.moveTo(0, 18); ctx.lineTo(-15, -12); ctx.lineTo(15, -12);
                        ctx.closePath(); ctx.fill();
                        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
                        break;
                }
            }

            ctx.font = 'bold 22px "Nunito", monospace';
            const typed = fly.text.substring(0, fly.typedLen);
            const remaining = fly.text.substring(fly.typedLen);
            const totalW = ctx.measureText(fly.text).width;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#4ade80';
            ctx.fillText(typed, -totalW/2, 2);
            ctx.fillStyle = '#fff';
            ctx.fillText(remaining, -totalW/2 + ctx.measureText(typed).width, 2);

            ctx.restore();
        });

        stateRef.current.particles.forEach(p => {
            ctx.fillStyle = p.color; 
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.beginPath(); 
            ctx.arc(p.x, p.y, Math.max(0, p.life * 5), 0, Math.PI*2); 
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (gameState !== 'PLAYING') return;
        const key = e.key;
        if (key.length > 1) return; 

        const playerX = canvas.width / 2;
        const playerY = canvas.height - 50;
        
        let targetId = stateRef.current.activeTargetId;
        let targetFly = stateRef.current.flies.find(f => f.id === targetId);

        const registerShot = (fly: Fly) => {
            stateRef.current.shots.push({
                id: Math.random(), 
                targetId: fly.id,
                startX: playerX, 
                startY: playerY,
                targetX: fly.x, 
                targetY: fly.y,
                life: 1.0 
            });
            stateRef.current.spiderRecoil = 8; 
        };

        if (targetFly) {
            if (key === targetFly.text[targetFly.typedLen]) {
                targetFly.typedLen++;
                registerShot(targetFly);

                if (targetFly.typedLen >= targetFly.text.length) {
                    createExplosion(targetFly.x, targetFly.y, '#facc15');
                    stateRef.current.flies = stateRef.current.flies.filter(f => f.id !== targetFly!.id);
                    stateRef.current.activeTargetId = null;
                    stateRef.current.score += (targetFly.text.length * 10);
                    stateRef.current.combo++;
                    
                    stateRef.current.progressInStage++;
                    
                    // FIXED: 当达到 20 个目标时，触发转场
                    if (stateRef.current.progressInStage >= 20) {
                        setCurrentQuote(SPIDER_QUOTES[Math.floor(Math.random() * SPIDER_QUOTES.length)]);
                        setGameState('TRANSITION');
                    }

                    setScore(stateRef.current.score);
                    setCombo(stateRef.current.combo);
                    setProgressInStage(stateRef.current.progressInStage);
                }
            }
        } else {
            const candidate = stateRef.current.flies
                .filter(f => f.text[0] === key)
                .sort((a,b) => b.y - a.y)[0];

            if (candidate) {
                stateRef.current.activeTargetId = candidate.id;
                candidate.typedLen = 1;
                registerShot(candidate);

                if (candidate.text.length === 1) {
                    createExplosion(candidate.x, candidate.y, '#facc15');
                    stateRef.current.flies = stateRef.current.flies.filter(f => f.id !== candidate.id);
                    stateRef.current.activeTargetId = null;
                    stateRef.current.score += 10;
                    
                    stateRef.current.progressInStage++;
                    
                    // FIXED: 同样在此处检测关卡完成
                    if (stateRef.current.progressInStage >= 20) {
                        setCurrentQuote(SPIDER_QUOTES[Math.floor(Math.random() * SPIDER_QUOTES.length)]);
                        setGameState('TRANSITION');
                    }

                    setScore(stateRef.current.score);
                    setProgressInStage(stateRef.current.progressInStage);
                }
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    animationId = requestAnimationFrame(update);
    return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', handleKeyDown);
        cancelAnimationFrame(animationId);
    };
  }, [gameState, config, customWords]);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-700 shadow-2xl font-sans">
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        {/* HUD */}
        {gameState === 'PLAYING' && (
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                <div className="flex gap-4">
                    <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-600 backdrop-blur-sm shadow-lg text-center">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">分数</div>
                        <div className="text-2xl font-display text-yellow-400 font-bold">{score}</div>
                    </div>
                    <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-600 backdrop-blur-sm shadow-lg text-center">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">关卡</div>
                        <div className="text-2xl font-display text-brand-blue font-bold">第 {stage} 关</div>
                    </div>
                    <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-600 backdrop-blur-sm shadow-lg text-center">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">进度</div>
                        <div className="text-2xl font-display text-brand-green font-bold">{progressInStage} / 20</div>
                    </div>
                </div>
                <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-600 backdrop-blur-sm shadow-lg text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">网的耐久</div>
                    <div className={`text-2xl font-display font-bold ${webHealth < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{webHealth}%</div>
                </div>
            </div>
        )}

        {/* Setup Modal */}
        {gameState === 'SETUP' && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 z-50">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-b-8 border-gray-200 animate-slide-in">
                    <h2 className="text-3xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="text-4xl">🕷️</span> 战前准备
                    </h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 uppercase mb-2">练习范围</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['HOME', 'TOP', 'ALL'] as const).map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setConfig({...config, keyScope: s})}
                                        className={`py-2 rounded-xl font-bold transition-all border-2 ${config.keyScope === s ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'}`}
                                    >
                                        {s === 'HOME' ? '新手' : s === 'TOP' ? '进阶' : '大师'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-500 uppercase mb-2">下落速度</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['SLOW', 'NORMAL', 'FAST'] as const).map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setConfig({...config, speed: s})}
                                        className={`py-2 rounded-xl font-bold transition-all border-2 ${config.speed === s ? 'bg-brand-orange text-white border-brand-orange shadow-md' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'}`}
                                    >
                                        {s === 'SLOW' ? '慢' : s === 'NORMAL' ? '中' : '快'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-500 uppercase mb-2">敌人皮肤</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setConfig({...config, skin: 'RANDOM'})}
                                    className={`p-4 rounded-xl flex flex-col items-center gap-1 border-2 transition-all ${config.skin === 'RANDOM' ? 'bg-indigo-50 border-brand-purple' : 'bg-gray-50 border-transparent'}`}
                                >
                                    <span className="text-3xl">🪰</span>
                                    <span className={`text-xs font-bold ${config.skin === 'RANDOM' ? 'text-brand-purple' : 'text-gray-400'}`}>随机幻象</span>
                                </button>
                                <button 
                                    onClick={() => setConfig({...config, skin: 'METEOR'})}
                                    className={`p-4 rounded-xl flex flex-col items-center gap-1 border-2 transition-all ${config.skin === 'METEOR' ? 'bg-indigo-50 border-brand-purple' : 'bg-gray-50 border-transparent'}`}
                                >
                                    <span className="text-3xl">☄️</span>
                                    <span className={`text-xs font-bold ${config.skin === 'METEOR' ? 'text-brand-purple' : 'text-gray-400'}`}>陨石</span>
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={startGame}
                            className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold text-xl shadow-xl shadow-green-100 hover:scale-105 active:scale-95 transition-transform"
                        >
                            开始防御 🚀
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* FIXED: 关卡转场组件 (Transition Overlay) */}
        {gameState === 'TRANSITION' && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
                <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl transform scale-100 animate-slide-in border-b-8 border-gray-100">
                    <div className="mb-6">
                        {/* 庆祝动作的蜘蛛图标 */}
                        <div className="text-6xl inline-block animate-bounce mb-2">🕷️</div>
                        <h2 className="text-3xl font-display font-bold text-brand-blue">
                            第 {stage} 关 达成！
                        </h2>
                    </div>
                    
                    <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100 relative">
                        {/* 蜘蛛语录显示 */}
                        <p className="text-slate-600 font-bold italic leading-relaxed">
                            "{currentQuote}"
                        </p>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-50 border-r border-b border-slate-100 rotate-45"></div>
                    </div>

                    <button 
                        onClick={nextStage}
                        className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold text-xl shadow-xl shadow-green-100 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <span>继续下一关</span> ➡️
                    </button>
                </div>
            </div>
        )}

        {/* Game Over Modal */}
        {gameState === 'GAMEOVER' && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 z-50 animate-fade-in">
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none stroke-white" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="10" fill="none" />
                    <circle cx="50" cy="50" r="20" fill="none" />
                    <circle cx="50" cy="50" r="30" fill="none" />
                    <line x1="0" y1="0" x2="100" y2="100" />
                    <line x1="100" y1="0" x2="0" y2="100" />
                    <line x1="50" y1="0" x2="50" y2="100" />
                    <line x1="0" y1="50" x2="100" y2="50" />
                </svg>

                <div className="bg-white p-10 rounded-3xl text-center max-w-sm w-full border-b-8 border-gray-200 relative animate-bounce-in shadow-2xl overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-8xl text-gray-100 rotate-12 pointer-events-none">🕸️</div>
                    
                    <div className="relative z-10">
                        <h2 className="text-4xl font-display font-bold text-slate-800 mb-2">防御失败！</h2>
                        <p className="text-gray-500 mb-6">在第 {stage} 关未能守住防线...</p>
                        
                        <div className="bg-slate-100 p-6 rounded-2xl mb-8">
                            <div className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">最终得分</div>
                            <div className="text-5xl font-display font-bold text-brand-orange">{score}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setGameState('SETUP')}
                                className="bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                            >
                                返回菜单
                            </button>
                            <button 
                                onClick={startGame}
                                className="bg-brand-blue text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-600 transition"
                            >
                                再试一次
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default SpiderGame;
