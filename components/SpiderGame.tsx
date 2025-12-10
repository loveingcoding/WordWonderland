
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
  wobbleOffset: number; // For sine wave movement
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

// --- DIFFICULTY MANAGER ---
class DifficultyManager {
  static getLevel(score: number): number {
    if (score < 200) return 1;
    if (score < 500) return 2;
    return 3;
  }

  static getLevelDescription(level: number): string {
    switch (level) {
      case 1: return "LV 1: 基准键 (Home Row)";
      case 2: return "LV 2: 全键盘 (A-Z)";
      case 3: return "LV 3: 大师 (Aa-Zz)";
      default: return "Unknown";
    }
  }

  static getLetterPool(level: number): string {
    switch (level) {
      case 1: return "asdfjkl";
      case 2: return "abcdefghijklmnopqrstuvwxyz";
      case 3: return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      default: return "asdfjkl";
    }
  }

  static getDropSpeed(score: number): number {
    // Base speed 1.0, increases by 0.5 every 100 points
    return 1 + Math.floor(score / 100) * 0.5;
  }

  static getSpawnRate(score: number): number {
    // Base 1500ms, decreases by 50ms every 100 points, capped at 400ms
    const rate = 1500 - Math.floor(score / 100) * 50;
    return Math.max(400, rate);
  }
}

const SpiderGame: React.FC<SpiderGameProps> = ({ onGameOver, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [webHealth, setWebHealth] = useState(100); // 0-100%
  const [combo, setCombo] = useState(0);
  const [gameActive, setGameActive] = useState(true);

  // Game loop state refs
  const stateRef = useRef({
    flies: [] as Fly[],
    shots: [] as WebShot[],
    particles: [] as Particle[],
    lastSpawn: 0,
    score: 0,
    level: 1,
    webHealth: 100,
    combo: 0,
    gameActive: true,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive Canvas
    const resize = () => {
        canvas.width = canvas.parentElement?.clientWidth || 800;
        canvas.height = 600;
    };
    resize();
    window.addEventListener('resize', resize);

    let animationId: number;

    const spawnFly = (now: number) => {
        const currentLevel = stateRef.current.level;
        const chars = DifficultyManager.getLetterPool(currentLevel);
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        const padding = 50;
        const x = Math.random() * (canvas.width - padding * 2) + padding;
        
        // Difficulty scaling
        const speed = DifficultyManager.getDropSpeed(stateRef.current.score);
        
        stateRef.current.flies.push({
            id: now,
            char,
            x,
            y: -30,
            speed: speed,
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

    const update = (time: number) => {
        if (!stateRef.current.gameActive) return;

        // Update Level based on score
        const newLevel = DifficultyManager.getLevel(stateRef.current.score);
        if (newLevel !== stateRef.current.level) {
            stateRef.current.level = newLevel;
            setLevel(newLevel); // Update React state for UI
        }

        const { width, height } = canvas;
        
        // 1. Spawning
        const spawnRate = DifficultyManager.getSpawnRate(stateRef.current.score);
        if (time - stateRef.current.lastSpawn > spawnRate) {
            spawnFly(time);
        }

        // 2. Update Flies
        stateRef.current.flies.forEach(fly => {
            fly.y += fly.speed;
            // Wobble effect
            fly.x += Math.sin((fly.y * 0.05) + fly.wobbleOffset) * 0.5;
        });

        // 3. Collision Logic (Fly hits Web)
        const hitBottom = stateRef.current.flies.filter(f => f.y > height - 40);
        if (hitBottom.length > 0) {
            stateRef.current.webHealth -= hitBottom.length * 15; // Damage
            stateRef.current.combo = 0; // Reset combo
            setWebHealth(stateRef.current.webHealth);
            setCombo(0);

            // Visual feedback for damage
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
        const shotSpeed = 0.15; // Progress per frame
        stateRef.current.shots.forEach(shot => {
            shot.progress += shotSpeed;
            const target = stateRef.current.flies.find(f => f.id === shot.targetId);
            
            if (target) {
                shot.currentX = shot.startX + (target.x - shot.startX) * shot.progress;
                shot.currentY = shot.startY + (target.y - shot.startY) * shot.progress;

                if (shot.progress >= 1) {
                    // Hit!
                    stateRef.current.flies = stateRef.current.flies.filter(f => f.id !== target.id);
                    stateRef.current.score += 10;
                    stateRef.current.combo += 1;
                    
                    // Repair mechanic
                    if (stateRef.current.combo % 10 === 0) {
                        stateRef.current.webHealth = Math.min(100, stateRef.current.webHealth + 15);
                        setWebHealth(stateRef.current.webHealth);
                    }

                    setScore(stateRef.current.score);
                    setCombo(stateRef.current.combo);
                    createExplosion(target.x, target.y, '#facc15'); // Yellow explosion
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

        // Draw The Broken Web (Health Bar)
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

        // Web Pattern
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
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
            ctx.stroke();
            ctx.beginPath();
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
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(10, -5, 12, 6, -Math.PI/4, 0, Math.PI*2); 
            ctx.fill();

            // Body
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI*2);
            ctx.fill();

            // Text
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Nunito'; // Slightly bigger font
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Render exact char (case sensitive for display)
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
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!stateRef.current.gameActive) return;
        
        let key = e.key;
        const currentLvl = stateRef.current.level;

        // Input normalization based on level
        // Level 1 & 2 are case-insensitive. Level 3 is strict.
        if (currentLvl < 3) {
            if (key.length === 1) key = key.toLowerCase();
        }

        // Find targets
        // We filter flies based on matching char.
        // For Lev 1/2, flies are stored as lowercase (from pool), so key.toLowerCase() matches.
        // For Lev 3, flies are mixed, so strict match works.
        const targets = stateRef.current.flies
            .filter(f => f.char === key)
            .sort((a,b) => b.y - a.y); // Target closest to bottom
        
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
  }, []);

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
                     <div className="text-xs text-slate-400 font-bold uppercase">难度 Level</div>
                     <div className="text-lg font-display text-white font-bold whitespace-nowrap">
                        {DifficultyManager.getLevelDescription(level)}
                     </div>
                 </div>

                 <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-600 backdrop-blur-sm">
                     <div className="text-xs text-slate-400 font-bold uppercase">连击 Combo</div>
                     <div className={`text-2xl font-display font-bold ${combo > 5 ? 'text-orange-400 animate-pulse' : 'text-blue-300'}`}>
                        {combo}
                     </div>
                 </div>
             </div>

             <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-600 backdrop-blur-sm">
                 <div className="text-xs text-slate-400 font-bold uppercase text-right">防御网 Health</div>
                 <div className="flex items-center gap-2 mt-1">
                     <div className="w-32 h-3 bg-slate-700 rounded-full overflow-hidden">
                         <div 
                            className={`h-full transition-all duration-300 ${webHealth < 30 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${webHealth}%` }}
                         />
                     </div>
                     <span className="font-mono text-white text-sm">{Math.round(webHealth)}%</span>
                 </div>
             </div>
        </div>

        {/* Controls */}
        <button 
            onClick={onExit}
            className="absolute top-4 right-4 pointer-events-auto bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm transition"
            style={{ marginTop: '60px' }} 
        >
            退出 Esc
        </button>

        {!gameActive && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto z-50">
                <div className="bg-white p-8 rounded-3xl text-center max-w-md animate-bounce-in border-4 border-brand-yellow">
                    <h2 className="text-4xl font-display font-bold text-slate-800 mb-2">防御失败! 🕸️</h2>
                    <p className="text-gray-500 mb-6">蜘蛛网被攻破了！</p>
                    
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

        {/* Start Overlay */}
        {gameActive && score === 0 && combo === 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-50">
                <div className="text-white text-xl font-bold animate-pulse">
                    按下对应的字母发射蛛丝！
                </div>
            </div>
        )}
    </div>
  );
};

export default SpiderGame;
