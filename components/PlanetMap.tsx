
import React from 'react';
import { GameMode } from '../types';

interface PlanetMapProps {
  onSelectPlanet: (mode: GameMode) => void;
}

const PlanetMap: React.FC<PlanetMapProps> = ({ onSelectPlanet }) => {
  return (
    <div className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden perspective-1000">
      
      {/* Background Stars (Static layout, dynamic twinkle) */}
      <div className="absolute inset-0 pointer-events-none">
         {[...Array(30)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-white rounded-full opacity-60 animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 5}s`,
                boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
              }}
            />
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-20 relative z-10 px-4 py-10 w-full max-w-7xl">
        
        {/* --- PLANET 1: ALPHA PRIME (Ice/Ring World) --- */}
        <div 
          className="flex flex-col items-center group cursor-pointer" 
          onClick={() => onSelectPlanet(GameMode.FINGERING)}
        >
          {/* Floating Wrapper */}
          <div className="relative w-48 h-48 md:w-64 md:h-64 animate-float transition-transform duration-700 group-hover:scale-110 will-change-transform">
             
             {/* The Ring (Behind) */}
             <div 
               className="absolute top-1/2 left-1/2 w-[160%] h-[160%] rounded-full border-[20px] border-cyan-200/20 blur-[1px]"
               style={{ 
                 transform: 'translate(-50%, -50%) rotateX(75deg) rotateY(10deg)',
                 boxShadow: '0 0 20px rgba(103, 232, 249, 0.2)'
               }}
             />

             {/* The Sphere */}
             <div 
               className="absolute inset-0 rounded-full shadow-[0_0_60px_rgba(6,182,212,0.4)]"
               style={{
                 background: 'radial-gradient(circle at 30% 30%, #a5f3fc 0%, #22d3ee 20%, #0891b2 50%, #164e63 85%, #083344 100%)',
                 boxShadow: 'inset -20px -20px 50px rgba(0,0,0,0.8), inset 5px 5px 15px rgba(255,255,255,0.6), 0 0 30px rgba(34,211,238,0.3)'
               }}
             >
                {/* Surface Texture (Stripes) */}
                <div className="absolute inset-0 rounded-full opacity-20 mix-blend-overlay"
                     style={{
                       background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 12px)'
                     }}
                />
             </div>

             {/* The Ring (Front overlay fix - simplified visual trick) */}
             <div 
               className="absolute top-1/2 left-1/2 w-[160%] h-[160%] rounded-full border-t-[20px] border-t-cyan-100/40 blur-[1px] pointer-events-none"
               style={{ 
                 transform: 'translate(-50%, -50%) rotateX(75deg) rotateY(10deg)',
                 zIndex: 10
               }}
             />

             {/* Icon/Label Overlay */}
             <div className="absolute inset-0 flex items-center justify-center text-7xl drop-shadow-2xl opacity-80 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-500">
                🖐️
             </div>
          </div>

          {/* Glassmorphism Card */}
          <div className="mt-12 text-center backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-2xl w-full max-w-[200px] shadow-xl group-hover:bg-white/10 transition-colors">
            <h3 className="text-2xl font-display font-bold text-cyan-300 tracking-wider drop-shadow-sm">ALPHA PRIME</h3>
            <div className="h-0.5 w-10 bg-cyan-500/50 mx-auto my-2 rounded-full"></div>
            <p className="text-cyan-100/70 font-sans text-xs uppercase tracking-widest font-bold">基础指法区</p>
          </div>
        </div>


        {/* --- PLANET 2: TYPE ACADEMY (Magma Star) --- */}
        <div 
          className="flex flex-col items-center group cursor-pointer mt-16 md:mt-0" 
          onClick={() => onSelectPlanet(GameMode.CLASSROOM)}
        >
          <div 
            className="relative w-56 h-56 md:w-72 md:h-72 animate-float transition-transform duration-700 group-hover:scale-110 will-change-transform" 
            style={{ animationDelay: '1s' }}
          >
             {/* The Sphere */}
             <div 
               className="absolute inset-0 rounded-full animate-pulse-slow"
               style={{
                 background: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #facc15 15%, #f97316 40%, #b91c1c 70%, #450a0a 100%)',
                 boxShadow: 'inset -25px -25px 60px rgba(0,0,0,0.9), inset 5px 5px 20px rgba(255,255,255,0.8), 0 0 80px rgba(249,115,22,0.6)'
               }}
             >
                {/* Surface Turbulence */}
                <div className="absolute inset-0 rounded-full opacity-30"
                     style={{
                        background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'1\'/%3E%3C/svg%3E")',
                        mixBlendMode: 'soft-light'
                     }}
                />
             </div>

             {/* Icon */}
             <div className="absolute inset-0 flex items-center justify-center text-8xl drop-shadow-2xl opacity-90 group-hover:opacity-100 transition-opacity transform group-hover:rotate-12 duration-500">
                🎓
             </div>
          </div>

          {/* Glassmorphism Card */}
          <div className="mt-12 text-center backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl w-full max-w-[220px] shadow-xl group-hover:bg-white/10 transition-colors">
            <h3 className="text-3xl font-display font-bold text-orange-400 tracking-wider drop-shadow-sm">LEXICON IV</h3>
            <div className="h-0.5 w-12 bg-orange-500/50 mx-auto my-2 rounded-full"></div>
            <p className="text-orange-100/70 font-sans text-xs uppercase tracking-widest font-bold">标准跟打学院</p>
          </div>
        </div>


        {/* --- PLANET 3: SENTENTIA (Neon Tech World) --- */}
        <div 
          className="flex flex-col items-center group cursor-pointer" 
          onClick={() => onSelectPlanet(GameMode.AI_CHAT)}
        >
          <div 
            className="relative w-48 h-48 md:w-64 md:h-64 animate-float transition-transform duration-700 group-hover:scale-110 will-change-transform" 
            style={{ animationDelay: '2s' }}
          >
             {/* Glow Behind */}
             <div className="absolute inset-0 bg-purple-600 rounded-full blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"></div>

             {/* The Sphere */}
             <div 
               className="absolute inset-0 rounded-full"
               style={{
                 background: 'radial-gradient(circle at 60% 20%, #e9d5ff 0%, #c084fc 20%, #9333ea 50%, #581c87 80%, #000 100%)',
                 boxShadow: 'inset -15px -15px 40px rgba(0,0,0,0.9), inset 5px 5px 10px rgba(255,255,255,0.7), 0 0 40px rgba(168,85,247,0.5)'
               }}
             >
                {/* Tech Grid Lines */}
                <div className="absolute inset-0 rounded-full opacity-40 mix-blend-color-dodge"
                     style={{
                       background: 'linear-gradient(transparent 95%, #f0abfc 95%), linear-gradient(90deg, transparent 95%, #f0abfc 95%)',
                       backgroundSize: '20px 20px',
                       borderRadius: '50%'
                     }}
                />
             </div>

             {/* Icon */}
             <div className="absolute inset-0 flex items-center justify-center text-7xl drop-shadow-2xl opacity-80 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-500">
                🤖
             </div>
          </div>

          {/* Glassmorphism Card */}
          <div className="mt-12 text-center backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-2xl w-full max-w-[200px] shadow-xl group-hover:bg-white/10 transition-colors">
            <h3 className="text-2xl font-display font-bold text-purple-400 tracking-wider drop-shadow-sm">SENTENTIA</h3>
            <div className="h-0.5 w-10 bg-purple-500/50 mx-auto my-2 rounded-full"></div>
            <p className="text-purple-100/70 font-sans text-xs uppercase tracking-widest font-bold">AI 语言实验室</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlanetMap;
