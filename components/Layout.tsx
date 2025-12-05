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
    { id: 'HOME', label: '🏠 Home', color: 'text-gray-700' },
    { id: GameMode.TYPING, label: '⌨️ Typing Practice', color: 'text-brand-blue' },
    { id: GameMode.AI_CHAT, label: '🤖 AI Tutor', color: 'text-brand-purple' },
    { id: GameMode.VIDEO_MAKER, label: '🎬 Magic Video', color: 'text-brand-orange' },
    { id: 'LIBRARY', label: '📚 My Library', color: 'text-brand-green' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6 flex items-center justify-center border-b border-gray-100">
          <h1 className="text-2xl font-display font-bold text-brand-blue tracking-tight">
            Word<span className="text-brand-orange">Wonder</span>
          </h1>
        </div>
        
        <div className="p-4">
          <div className="bg-brand-yellow/20 p-4 rounded-xl border border-brand-yellow text-center mb-6">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Level {user.level}</div>
            <div className="text-2xl font-display font-bold text-gray-800">{user.xp} XP</div>
            <div className="mt-2 text-sm font-medium text-brand-orange">⭐ {user.stars} Stars</div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-bold ${
                  currentMode === item.id 
                    ? 'bg-brand-blue text-white shadow-md transform scale-105' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white z-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-display font-bold text-brand-blue">WordWonder</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-2xl">
          {mobileMenuOpen ? '✖️' : '🍔'}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 pt-20 px-6 space-y-4 md:hidden">
           {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-4 rounded-xl text-lg font-bold border-2 ${
                   currentMode === item.id ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 relative">
        <div className="max-w-5xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;