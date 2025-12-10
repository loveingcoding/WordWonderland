
import React, { useRef, useEffect, useState } from 'react';

interface SpiderGameProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
}

// Visual entities
interface Fly {
  id: number;
  char: string;
  x: number;
  y: number;
  speed: number;
  wobbleOffset: number;
}

interface WebShot {
  id: number;
  targetId: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  progress: number; // 0 to 1
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

// --- STAGE CONFIGURATION ---
interface StageData {
  level: number;
  speed: number;      // Constant drop speed
  spawnRate: number;  // ms between spawns
  goal: number;       // Number of kills to advance
  pool: string;       // Available letters
  description: string;
}

const STAGE_CONFIG: StageData[] = [
  { level: 1, speed: 2.0, spawnRate: 1500, goal: 20, pool: "asdfjkl", description: "Stage 1: Basics" },
  { level: 2, speed: 3.0, spawnRate: 1200, goal: 25, pool: "abcdefghijklmnopqrstuvwxyz", description: "Stage 2: Full Keypad" },
  { level: 3, speed: 4.0, spawnRate: 1000, goal: 30, pool: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", description: "Stage 3: Mixed Case" },
  { level: 4, speed: 5.0, spawnRate: 800,  goal: 35, pool: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", description: "Stage 4: Expert" },
  { level: 5, speed: 6.0, spawnRate: 600,  goal: 40, pool: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", description: "Stage 5: Master" },
];

const SpiderGame: React.FC<SpiderGameProps> = ({ onGameOver, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // React State for UI
  const [score, setScore] = useState(0);
  const [stageIndex, setStageIndex] = useState(0); // 0-based index for STAGE_CONFIG
  const [stageProgress, setStageProgress] = useState(0);
  const [webHealth, setWebHealth] = useState(100);
  const [combo, setCombo] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [transitionMsg, setTransitionMsg] = useState<string | null>(null);

  // Mutable Game State (Refs for loop performance)
  const stateRef = useRef({
    flies: [] as Fly[],
    shots: [] as WebShot[],
    particles: [] as Particle[],
    lastSpawn: 0,
    score: 0,
    stageIndex: 0,
    stageProgress: 0,
    webHealth: 100,
    combo: 0,
    gameActive: true,
    isTransitioning: false, // Pauses spawning during level up
  });

  const getCurrentStage = () => {
    const idx = stateRef.current.stageIndex;
    // Cap at the last defined stage if user goes beyond
    return STAGE_CONFIG[Math.min(idx, STAGE_CONFIG.length - 1)];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize Logic
    const resize = () => {
        canvas.width = canvas.parentElement?.clientWidth || 800;
        canvas.height = 600;
    };
    resize();
    window.addEventListener('resize', resize);

    let animationId: number;

    const spawnFly = (now: number) => {
        const stage = getCurrentStage();
        const chars = stage.pool;
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        const padding = 50;
        const x = Math.random() * (canvas.width - padding * 2) + padding;
        
        stateRef.current.flies.push({
            id: now,
            char,
            x,
            y: -30,
            speed: stage.speed, // Constant speed per stage
            wobbleOffset: Math.random() * Math.PI * 2
        });

        stateRef.current.lastSpawn = now;
    };

    const createExplosion = (x: number, y: number, color: string) => {
        for(let i=0; i<8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            stateRef.current.particles.push({
                id: Math.random(),
                x, y,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                life: 1.0,
                color
            });
        }
    };

    const triggerStageClear = () => {
        stateRef.current.isTransitioning = true;
        
        // Show Message
        const nextLevel = stateRef.current.stageIndex + 2; // +1 for next, +1 for 1-based display
        setTransitionMsg(`STAGE ${stateRef.current.stageIndex + 1} COMPLETE!`);
        
        // Clear Screen
        stateRef.current.flies = [];
        stateRef.current.shots = [];

        // Pause for 2 seconds then advance
        setTimeout(() => {
            stateRef.current.stageIndex += 1;
            stateRef.current.stageProgress = 0;
            stateRef.current.isTransitioning = false;
            
            // Update UI State
            setStageIndex(stateRef.current.stageIndex);
            setStageProgress(0);
            setTransitionMsg(null);
        }, 2000);
    };

    const update = (time: number) => {
        if (!stateRef.current.gameActive) return;

        const { width, height } = canvas;
        const stage = getCurrentStage();

        // 1. Spawning (Only if not transitioning)
        if (!stateRef.current.isTransitioning) {
            if (time - stateRef.current.lastSpawn > stage.spawnRate) {
                spawnFly(time);
            }
        }

        // 2. Update Flies
        stateRef.current.flies.forEach(fly => {
            fly.y += fly.speed;
            fly.x += Math.sin((fly.y * 0.05) + fly.wobbleOffset) * 0.5;
        });

        // 3. Collision Logic (Fly hits Web/Bottom)
        const hitBottom = stateRef.current.flies.filter(f => f.y > height - 40);
        if (hitBottom.length > 0) {
            stateRef.current.webHealth -= hitBottom.length * 10; 
            stateRef.current.combo = 0; 
            
            setWebHealth(stateRef.current.webHealth);
            setCombo(0);

            hitBottom.forEach(f => createExplosion(f.x, height-20, '#ef4444'));

            // Remove flies
            stateRef.current.flies = stateRef.current.flies.filter(f => f.y <= height - 40);

            if (stateRef.current.webHealth <= 0) {
                stateRef.current.gameActive = false;
                setGameActive(false);
                onGameOver(stateRef.current.score);
                return;
            }
        }

        // 4. Update Web Shots
        const shotSpeed = 0.2; 
        stateRef.current.shots.forEach(shot => {
            shot.progress += shotSpeed;
            const target = stateRef.current.flies.find(f => f.id === shot.targetId);
            
            if (target) {
                shot.currentX = shot.startX + (target.x - shot.startX) * shot.progress;
                shot.currentY = shot.startY + (target.y - shot.startY) * shot.progress;

                if (shot.progress >= 1) {
                    // Hit!
                    stateRef.current.flies = stateRef.current.flies.filter(f => f.id !== target.id);
                    
                    // Score & Combo
                    stateRef.current.score += 10;
                    stateRef.current.combo += 1;
                    
                    // Stage Progress
                    stateRef.current.stageProgress += 1;
                    
                    // Repair Mechanic
                    if (stateRef.current.combo % 10 === 0) {
                        stateRef.current.webHealth = Math.min(100, stateRef.current.webHealth + 15);
                        setWebHealth(stateRef.current.webHealth);
                    }

                    // Check for Level Up
                    if (stateRef.current.stageProgress >= stage.goal) {
                        triggerStageClear();
                    } else {
                         // Only update progress UI if not clearing
                         setStageProgress(stateRef.current.stageProgress);
                    }

                    setScore(stateRef.current.score);
                    setCombo(stateRef.current.combo);
                    createExplosion(target.x, target.y, '#facc15'); 
                }
            }
        });
        
        // Cleanup shots
        stateRef.current.shots = stateRef.current.shots.filter(s => {
             const hasTarget = stateRef.current.flies.some(f => f.id === s.targetId);
             return s.progress < 1 && hasTarget;
        });

        // 5. Update Particles
        stateRef.current.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
        });
        stateRef.current.particles = stateRef.current.particles.filter(p => p.life > 0);

        render();
        animationId = requestAnimationFrame(update);
    };

    const render = () => {
        // Background
        ctx.fillStyle = '#111827'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const { width, height } = canvas;
        const playerX = width / 2;
        const playerY = height - 50;

        // Draw Web Health Bar
        const webHeight = 20;
        const webY = height - webHeight;
        
        ctx.fillStyle = '#374151'; 
        ctx.fillRect(0, webY, width, webHeight);

        const healthWidth = (stateRef.current.webHealth / 100) * width;
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, '#3b82f6'); 
        grad.addColorStop(1, '#a855f7'); 
        ctx.fillStyle = grad;
        ctx.fillRect(0, webY, healthWidth, webHeight);

        // Web Visuals
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        for(let i=0; i<width; i+=20) {
            ctx.moveTo(i, webY);
            ctx.lineTo(i+10, height);
        }
        ctx.stroke();

        // Draw Player (Spider)
        ctx.save();
        ctx.translate(playerX, playerY);
        // Legs
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        for(let i=0; i<4; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-20, -10 + (i*5), -30, 10 + (i*5));
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(20, -10 + (i*5), 30, 10 + (i*5));
            ctx.stroke();
        }
        // Body
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4b5563';
        ctx.stroke();
        // Eyes
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-5, -5, 3, 0, Math.PI * 2);
        ctx.arc(5, -5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw Flies
        stateRef.current.flies.forEach(fly => {
            ctx.save();
            ctx.translate(fly.x, fly.y);
            // Wings
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.ellipse(-10, -5, 12, 6, Math.PI/4, 0, Math.PI*2);
            ctx.ellipse(10, -5, 12, 6, -Math.PI/4, 0, Math.PI*2); 
            ctx.fill();
            // Body
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI*2);
            ctx.fill();
            // Text
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Nunito'; 
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(fly.char, 0, 0); 
            ctx.restore();
        });

        // Draw Web Shots
        stateRef.current.shots.forEach(shot => {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(shot.startX, shot.startY);
            ctx.lineTo(shot.currentX, shot.currentY);
            ctx.stroke();
        });

        // Draw Particles
        stateRef.current.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
            ctx.fill();
            ctx.globalAlpha = 1;
        });

        // Draw Transition Text
        if (stateRef.current.isTransitioning && transitionMsg) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, width, height);

            ctx.save();
            ctx.translate(width/2, height/2);
            ctx.fillStyle = '#FBBF24';
            ctx.font = 'bold 60px "Fredoka", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(transitionMsg, 0, 0);
            ctx.fillStyle = '#FFF';
            ctx.font = '30px "Nunito", sans-serif';
            ctx.fillText("Next Stage Incoming...", 0, 50);
            ctx.restore();
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!stateRef.current.gameActive || stateRef.current.isTransitioning) return;
        
        let key = e.key;
        const currentStage = getCurrentStage();

        // Input normalization based on level
        // Level 3+ (index 2+) is strict case. Below is insensitive.
        if (stateRef.current.stageIndex < 2) {
            if (key.length === 1) key = key.toLowerCase();
        }

        const targets = stateRef.current.flies
            .filter(f => f.char === key)
            .sort((a,b) => b.y - a.y); 
        
        if (targets.length > 0) {
            const target = targets[0];
            const playerX = canvasRef.current!.width / 2;
            const playerY = canvasRef.current!.height - 50;

            stateRef.current.shots.push({
                id: Math.random(),
                targetId: target.id,
                startX: playerX,
                startY: playerY,
                currentX: playerX,
                currentY: playerY,
                progress: 0
            });
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    animationId = requestAnimationFrame(update);

    return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', handleKeyDown);
        cancelAnimationFrame(animationId);
    };
  }, [transitionMsg]); // Add transitionMsg dependency to re-bind if needed, though ref handles most

  const activeStage = STAGE_CONFIG[Math.min(stageIndex, STAGE_CONFIG.length - 1)];

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-700 shadow-2xl">
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        {/* HUD Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
             <div className="flex gap-4">
                 <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-600 backdrop-blur-sm">
                     <div className="text-xs text-slate-400 font-bold uppercase">分数 Score</div>
                     <div className="text-2xl font-display text-yellow-400 font-bold">{score}</div>
                 </div>
                 
                 <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-600 backdrop-blur-sm">
                     <div className="text-xs text-slate-400 font-bold uppercase">关卡 Stage</div>
                     <div className="text-lg font-display text-white font-bold whitespace-nowrap">
                        {activeStage.level} <span className="text-xs text-gray-400 font-normal">({activeStage.description})</span>
                     </div>
                 </div>

                 <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-600 backdrop-blur-sm">
                     <div className="text-xs text-slate-400 font-bold uppercase">进度 Progress</div>
                     <div className="text-xl font-display text-blue-300 font-bold">
                        {stageProgress} / <span className="text-sm text-gray-400">{activeStage.goal}</span>
                     </div>
                 </div>
             </div>

             <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-600 backdrop-blur-sm">
                 <div className="text-xs text-slate-400 font-bold uppercase text-right">网 Health</div>
                 <div className="flex items-center gap-2 mt-1">
                     <div className="w-24 md:w-32 h-3 bg-slate-700 rounded-full overflow-hidden">
                         <div 
                            className={`h-full transition-all duration-300 ${webHealth < 30 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${webHealth}%` }}
                         />
                     </div>
                 </div>
             </div>
        </div>

        {/* Controls */}
        <button 
            onClick={onExit}
            className="absolute top-4 right-4 pointer-events-auto bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm transition mt-[60px]"
        >
            退出 Esc
        </button>

        {!gameActive && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto z-50">
                <div className="bg-white p-8 rounded-3xl text-center max-w-md animate-bounce-in border-4 border-brand-yellow">
                    <h2 className="text-4xl font-display font-bold text-slate-800 mb-2">防御失败! 🕸️</h2>
                    <p className="text-gray-500 mb-6">在第 {stageIndex + 1} 关倒下了...</p>
                    
                    <div className="bg-slate-100 p-4 rounded-xl mb-6">
                        <div className="text-sm text-gray-500 uppercase font-bold">最终得分</div>
                        <div className="text-5xl font-bold text-brand-blue">{score}</div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button onClick={onExit} className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition">
                            返回菜单
                        </button>
                        <button onClick={() => window.location.reload()} className="flex-1 bg-brand-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200">
                             再试一次
                        </button>
                    </div>
                </div>
            </div>
        )}

        {gameActive && score === 0 && !stateRef.current.isTransitioning && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-50">
                <div className="text-white text-xl font-bold animate-pulse">
                    按键发射蛛丝，守护网底！
                </div>
            </div>
        )}
    </div>
  );
};

export default SpiderGame;
