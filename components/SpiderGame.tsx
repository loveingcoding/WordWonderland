
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

const SpiderGame: React.FC<SpiderGameProps> = ({ onGameOver, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [webHealth, setWebHealth] = useState(100); // 0-100%
  const [combo, setCombo] = useState(0);
  const [gameActive, setGameActive] = useState(true);

  // Game loop state refs
  const stateRef = useRef({
    flies: [] as Fly[],
    shots: [] as WebShot[],
    particles: [] as Particle[],
    lastSpawn: 0,
    spawnRate: 1500,
    score: 0,
    webHealth: 100,
    combo: 0,
    gameActive: true,
    difficultyMultiplier: 1
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
        const chars = "abcdefghijklmnopqrstuvwxyz";
        const char = chars[Math.floor(Math.random() * chars.length)];
        const padding = 50;
        const x = Math.random() * (canvas.width - padding * 2) + padding;
        
        // Difficulty scaling
        const speedBase = 1 + (stateRef.current.score * 0.02);
        
        stateRef.current.flies.push({
            id: now,
            char,
            x,
            y: -30,
            speed: speedBase,
            wobbleOffset: Math.random() * Math.PI * 2
        });

        // Increase spawn rate cap at 400ms
        const newRate = Math.max(400, 1500 - (stateRef.current.score * 10));
        stateRef.current.spawnRate = newRate;
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

        const { width, height } = canvas;
        const playerX = width / 2;
        const playerY = height - 60; // Spider sits above the web

        // 1. Spawning
        if (time - stateRef.current.lastSpawn > stateRef.current.spawnRate) {
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

            // Visual feedback for damage (shake maybe? handled in render)
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
        const shotSpeed = 0.15; // Progress per frame (very fast)
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
                        // Visual fanfare for repair could go here
                    }

                    setScore(stateRef.current.score);
                    setCombo(stateRef.current.combo);
                    createExplosion(target.x, target.y, '#facc15'); // Yellow explosion
                }
            }
        });
        // Cleanup finished shots or shots with missing targets
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
        ctx.fillStyle = '#111827'; // Dark gray/blue
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const { width, height } = canvas;
        const playerX = width / 2;
        const playerY = height - 50;

        // Draw The Broken Web (Health Bar)
        const webHeight = 20;
        const webY = height - webHeight;
        
        // Empty web background (Dark)
        ctx.fillStyle = '#374151'; 
        ctx.fillRect(0, webY, width, webHeight);

        // Active web (Health)
        // We draw it as a mesh pattern that degrades
        const healthWidth = (stateRef.current.webHealth / 100) * width;
        
        // Health Gradient
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, '#3b82f6'); // Blue
        grad.addColorStop(1, '#a855f7'); // Purple
        ctx.fillStyle = grad;
        ctx.fillRect(0, webY, healthWidth, webHeight);

        // Web Mesh Pattern overlay
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
            // Left legs
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-20, -10 + (i*5), -30, 10 + (i*5));
            ctx.stroke();
            // Right legs
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(20, -10 + (i*5), 30, 10 + (i*5));
            ctx.stroke();
        }

        // Body
        ctx.fillStyle = '#1f2937'; // Dark body
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4b5563';
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#fbbf24'; // Yellow eyes
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
            ctx.ellipse(-10, -5, 12, 6, Math.PI/4, 0, Math.PI*2); // Left
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(10, -5, 12, 6, -Math.PI/4, 0, Math.PI*2); // Right
            ctx.fill();

            // Body
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI*2);
            ctx.fill();

            // Text
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Nunito';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(fly.char.toUpperCase(), 0, 0);
            
            ctx.restore();
        });

        // Draw Web Shots (Silk)
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
        const key = e.key.toLowerCase();
        
        // Find closest fly with this char
        // Sort by Y (lowest first/closest to web)
        const targets = stateRef.current.flies
            .filter(f => f.char === key)
            .sort((a,b) => b.y - a.y);
        
        if (targets.length > 0) {
            const target = targets[0];
            const playerX = canvas.width / 2;
            const playerY = canvas.height - 50;

            // Shoot web!
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
                     <div className="text-xs text-slate-400 font-bold uppercase">Score</div>
                     <div className="text-2xl font-display text-yellow-400 font-bold">{score}</div>
                 </div>
                 <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-600 backdrop-blur-sm">
                     <div className="text-xs text-slate-400 font-bold uppercase">Combo</div>
                     <div className={`text-2xl font-display font-bold ${combo > 5 ? 'text-orange-400 animate-pulse' : 'text-blue-300'}`}>
                        {combo}
                     </div>
                 </div>
             </div>

             <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-600 backdrop-blur-sm">
                 <div className="text-xs text-slate-400 font-bold uppercase text-right">Web Integrity</div>
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
            style={{ marginTop: '60px' }} // Offset below stats
        >
            Esc
        </button>

        {!gameActive && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto z-50">
                <div className="bg-white p-8 rounded-3xl text-center max-w-md animate-bounce-in border-4 border-brand-yellow">
                    <h2 className="text-4xl font-display font-bold text-slate-800 mb-2">Web Broken! 🕸️</h2>
                    <p className="text-gray-500 mb-6">You defended the web bravely!</p>
                    
                    <div className="bg-slate-100 p-4 rounded-xl mb-6">
                        <div className="text-sm text-gray-500 uppercase font-bold">Final Score</div>
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
                    Typing letters to shoot web!
                </div>
            </div>
        )}
    </div>
  );
};

export default SpiderGame;
