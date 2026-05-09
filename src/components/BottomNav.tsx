import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Trophy, BarChart3, Menu, X, User, Bell, Settings } from 'lucide-react';

export default function GlobalNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home, path: '/' },
    { id: 'finance', label: 'FINANCE', icon: TrendingUp, path: '/finance' },
    { id: 'sports', label: 'SPORTS', icon: Trophy, path: '/sports' },
    { id: 'markets', label: 'MARKETS', icon: BarChart3, path: '/prediction-markets' }
  ];

  const drawerItems = [
    { id: 'account', label: 'Account', icon: User, path: '/account' },
    { id: 'alerts', label: 'Alerts', icon: Bell, path: '/alerts' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
  ];

  // Close drawer on path change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#020617]/95 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-3 active:scale-95 transition-transform" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center p-1.5">
            <img src="/logo.png" alt="HiLEX" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic text-white">HiLEX</span>
        </div>
        
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 text-slate-400 hover:text-white active:scale-90 transition-all"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Slide-in Drawer */}
      <div 
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
          onClick={() => setIsDrawerOpen(false)}
        />
        
        {/* Drawer Panel */}
        <div 
          ref={drawerRef}
          className={`absolute top-0 right-0 h-full w-[280px] bg-[#0a0e1a] border-l border-white/10 shadow-2xl transition-transform duration-500 ease-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Menu</span>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-2">
              {drawerItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#00d4aa]/30 hover:bg-[#00d4aa]/5 transition-all group"
                >
                  <item.icon size={20} className="text-slate-500 group-hover:text-[#00d4aa]" />
                  <span className="font-black italic uppercase tracking-tight text-white group-hover:text-[#00d4aa]">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto">
              <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.2em] text-center italic">
                HiLEX Institutional Mobile v1.0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-[#020617]/95 backdrop-blur-2xl border-t border-white/10 px-4 flex items-center justify-around z-40">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.id === 'home' && location.pathname === '/');
          const Icon = item.icon;
          
          return (
            <button 
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 flex-1 relative ${isActive ? 'text-[#00d4aa]' : 'text-slate-500 opacity-40'}`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#00d4aa] rounded-full shadow-[0_0_10px_#00d4aa] animate-in zoom-in" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
