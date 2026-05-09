import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, TrendingUp, BarChart3, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'sports', label: 'SPORTS', icon: Trophy, path: '/sports' },
    { id: 'finance', label: 'FINANCE', icon: TrendingUp, path: '/finance' },
    { id: 'prediction', label: 'MARKETS', icon: BarChart3, path: '/prediction-markets' },
    { id: 'account', label: 'ACCOUNT', icon: User, path: '/account' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-24 bg-[#020617]/95 backdrop-blur-2xl border-t border-white/10 px-6 flex items-center justify-between z-50 w-full">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <button 
            key={item.id}
            onClick={() => (item.path.startsWith('/') && item.id !== 'account') ? navigate(item.path) : null}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 flex-1 ${isActive ? 'text-[#00d4aa]' : 'text-slate-500 opacity-40'}`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-[#00d4aa] rounded-full shadow-[0_0_10px_#00d4aa]" />}
          </button>
        );
      })}
    </nav>
  );
}
