
import React, { useRef, useEffect, useState } from 'react';

interface SpiderGameProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
}

interface Spider {
  id: number;
  char: string;
  x: number;
  y: number;
  speed: number;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  targetId: number; // The spider this projectile is tracking
}

const SpiderGame: React.FC<SpiderGameProps> = ({ onGameOver, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [gameActive, setGameActive] = useState(true);

  // Game state refs for animation loop
  const stateRef = useRef({
    spiders: [] as Spider[],
    projectiles: [] as Projectile[],
    lastSpawn: 0,
    spawnRate: 2000,
    score: 0,
    lives: 5,
    gameActive: true
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
        canvas.width = canvas.parentElement?.clientWidth || 800;
        canvas.height = 500;
    };
    resize();
    window.addEventListener('resize', resize);

    let animationId: number;

    const spawnSpider = (now: number) => {
        const chars = "abcdefghijklmnopqrstuvwxyz";
        const char = chars[Math.floor(Math.random() * chars.length)];
        // Ensure somewhat central spawn but spread out
        const padding = 50;
        const x = Math.random() * (canvas.width - padding * 2) + padding;
        
        stateRef.current.spiders.push({
            id: now,
            char,
            x,
            y: -50,
            speed: 0.5 + (stateRef.current.score * 0.05) // Speed increases with score
        });
        
        // Increase difficulty
        stateRef.current.spawnRate = Math.max(500, 2000 - (stateRef.current.score * 50));
        stateRef.current.lastSpawn = now;
    };

    const update = (time: number) => {
        if (!stateRef.current.gameActive) return;

        // Spawn
        if (time - stateRef.current.lastSpawn > stateRef.current.spawnRate) {
            spawnSpider(time);
        }

        // Update Spiders
        stateRef.current.spiders.forEach(spider => {
            spider.y += spider.speed;
        });

        // Check spider boundaries (Game Logic)
        const spidersReachedBottom = stateRef.current.spiders.filter(s => s.y > canvas.height);
        if (spidersReachedBottom.length > 0) {
             stateRef.current.lives -= spidersReachedBottom.length;
             setLives(stateRef.current.lives);
             // Remove them
             stateRef.current.spiders = stateRef.current.spiders.filter(s => s.y <= canvas.height);

             if (stateRef.current.lives <= 0) {
                 stateRef.current.gameActive = false;
                 setGameActive(false);
                 onGameOver(stateRef.current.score);
                 return;
             }
        }

        // Update Projectiles
        stateRef.current.projectiles.forEach(p => {
             // Find target spider
             const target = stateRef.current.spiders.find(s => s.id === p.targetId);
             if (target) {
                 // Move towards target
                 const dx = target.x - p.x;
                 const dy = target.y - p.y;
                 const dist = Math.sqrt(dx*dx + dy*dy);
                 
                 if (dist < 10) {
                     // Hit!
                     stateRef.current.spiders = stateRef.current.spiders.filter(s => s.id !== target.id);
                     stateRef.current.projectiles = stateRef.current.projectiles.filter(proj => proj.id !== p.id);
                     stateRef.current.score += 10;
                     setScore(stateRef.current.score);
                 } else {
                     p.x += (dx / dist) * 15;
                     p.y += (dy / dist) * 15;
                 }
             } else {
                 // Target gone, just move up
                 p.y -= 15;
             }
        });
        
        // Cleanup off-screen projectiles
        stateRef.current.projectiles = stateRef.current.projectiles.filter(p => p.y > -50);

        render();
        animationId = requestAnimationFrame(update);
    };

    const render = () => {
        // Clear
        ctx.fillStyle = '#1e1b4b'; // Dark blue bg
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Web
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        for(let i=0; i<canvas.width; i+=100) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }

        // Draw Spiders
        stateRef.current.spiders.forEach(spider => {
            // Thread
            ctx.beginPath();
            ctx.moveTo(spider.x, 0);
            ctx.lineTo(spider.x, spider.y);
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.stroke();

            // Body
            ctx.fillStyle = '#ef4444'; // Red body
            ctx.beginPath();
            ctx.arc(spider.x, spider.y, 20, 0, Math.PI * 2);
            ctx.fill();

            // Legs (simple)
            ctx.strokeStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(spider.x - 20, spider.y);
            ctx.lineTo(spider.x - 30, spider.y - 10);
            ctx.stroke();

            // Char Bubble
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Fredoka';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(spider.char.toUpperCase(), spider.x, spider.y);
        });

        // Draw Projectiles
        stateRef.current.projectiles.forEach(p => {
             ctx.fillStyle = '#fbbf24'; // Yellow
             ctx.beginPath();
             ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
             ctx.fill();
        });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!stateRef.current.gameActive) return;
        const key = e.key.toLowerCase();
        
        // Find lowest spider with this char
        const targets = stateRef.current.spiders.filter(s => s.char === key).sort((a,b) => b.y - a.y);
        
        if (targets.length > 0) {
            const target = targets[0];
            // Shoot!
            stateRef.current.projectiles.push({
                id: Math.random(),
                x: canvas.width / 2, // Shoot from bottom center
                y: canvas.height,
                targetId: target.id
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
        <canvas ref={canvasRef} className="block" />
        
        {/* HUD */}
        <div className="absolute top-4 left-4 text-white font-bold text-xl font-display flex gap-4">
             <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-600">
                 分数: <span className="text-yellow-400">{score}</span>
             </div>
             <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-600">
                 生命: <span className="text-red-400">{'❤️'.repeat(lives)}</span>
             </div>
        </div>

        <button 
            onClick={onExit}
            className="absolute top-4 right-4 bg-slate-800/80 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold border border-slate-600"
        >
            退出
        </button>

        {!gameActive && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="bg-white p-8 rounded-3xl text-center max-w-md animate-bounce-in">
                    <h2 className="text-4xl font-bold text-slate-800 mb-4">游戏结束!</h2>
                    <p className="text-xl text-gray-600 mb-6">你保卫了蛋糕！<br/>最终得分: {score}</p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={onExit} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold">
                            返回
                        </button>
                        <button onClick={() => window.location.reload()} className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold">
                             再玩一次
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default SpiderGame;
