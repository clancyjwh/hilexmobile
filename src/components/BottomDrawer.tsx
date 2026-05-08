import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export default function BottomDrawer({ isOpen, onClose, children, title }: BottomDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsAnimating(false), 300);
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`relative w-full max-h-[90vh] bg-[#020617] border-t border-white/10 rounded-t-[32px] p-6 shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" onClick={onClose} />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full text-slate-400 active:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
