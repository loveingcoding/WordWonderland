import React, { useState } from 'react';
import { UserProgress, GameMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProgress;
  onNavigate: (mode: GameMode | 'HOME' | 'LIBRARY') => void;
  currentMode: string;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onNavigate, currentMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'HOME', label: '🚀 基地', color: 'hover:text-brand-blue' },
    { id: GameMode.VIDEO_MAKER, label: '🎬 魔法工作室', color: 'hover:text-brand-orange' },
    { id: 'LIBRARY', label: '📚 档案库', color: 'hover:text-brand-green' },
  ];

  // Logic to determine if we should wrap the children in a "Paper" container
  // The Planet Map (HOME) looks best on the raw dark background.
  // The Games/Tools (Typing, Library) look best in a bright container (for now).
  const needsContainer = currentMode !== 'HOME';

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-100">
      
      {/* Glassmorphism Top Navigation */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-900/60 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate('HOME')}>
              <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-purple rounded-lg flex items-center justify-center text-xl shadow-lg mr-3">
                🚀
              </div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-white">
                Type<span className="text-brand-blue">Hero</span>
              </h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as any)}
                    className={`px-3 py-2 rounded-md text-sm font-bold transition-all duration-200 ${
                      currentMode === item.id 
                        ? 'text-white bg-white/10 shadow-inner' 
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* User Stats */}
            <div className="hidden md:flex items-center gap-4">
               <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Level {user.level}</span>
                  <div className="flex items-center gap-2">
                     <span className="text-brand-yellow drop-shadow-md">⭐ {user.stars}</span>
                     <span className="w-px h-4 bg-slate-600 mx-1"></span>
                     <span className="text-brand-blue">{user.xp} XP</span>
                  </div>
               </div>
               <div className="h-10 w-10 rounded-full bg-gradient-to-r from-brand-orange to-brand-yellow p-[2px]">
                  <div className="h-full w-full rounded-full bg-slate-800 flex items-center justify-center text-lg">
                    👩‍🚀
                  </div>
               </div>
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? '✖️' : '🍔'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-b border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`block px-3 py-4 rounded-md text-base font-bold w-full text-left ${
                    currentMode === item.id ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-slate-700 pt-4 mt-4 px-3 flex justify-between items-center text-white font-bold">
                 <span>⭐ {user.stars}</span>
                 <span>XP {user.xp}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 h-full">
           {needsContainer ? (
             <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-10 min-h-[80vh] text-gray-800 animate-slide-in">
                {children}
             </div>
           ) : (
             <div className="h-full animate-fade-in">
                {children}
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default Layout;