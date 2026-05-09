import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface MonthlySnapshotsProps {
  json9: any;
}

export default function MonthlySnapshots({ json9 }: MonthlySnapshotsProps) {
  if (!json9) return null;

  const monthlyData = [];
  for (let i = 30; i <= 360; i += 30) {
    if (json9[i.toString()]) {
      const monthData = typeof json9[i.toString()] === 'string'
        ? JSON.parse(json9[i.toString()])
        : json9[i.toString()];
      monthlyData.push({
        days: i,
        ...monthData
      });
    }
  }

  if (monthlyData.length === 0) return null;

  const correctCount = monthlyData.filter(month => month.Correct === 'true' || month.Correct === true).length;
  const winRate = `${correctCount}/12`;
  const analysis = json9.Analysis?.replace(/\*/g, '') || 'N/A';
  const parameters = json9.Parameters || 'N/A';

  return (
    <div className="space-y-6">
      <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Top Historical Parameter: Monthly Snapshots</h2>
      
      {/* Summary Header */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/50 border border-slate-800 rounded-xl p-3">
        <div className="text-center">
          <div className="text-[7px] text-slate-500 uppercase font-black tracking-widest mb-1">Indicator</div>
          <div className="text-[10px] text-white font-black">{analysis}</div>
        </div>
        <div className="text-center">
          <div className="text-[7px] text-slate-500 uppercase font-black tracking-widest mb-1">Parameters</div>
          <div className="text-[10px] text-white font-black">{parameters}</div>
        </div>
        <div className="text-center">
          <div className="text-[7px] text-slate-500 uppercase font-black tracking-widest mb-1">Accuracy Rate</div>
          <div className="text-[10px] text-[#00D8FF] font-black">{winRate}</div>
        </div>
      </div>

      {/* Snapshots Grid */}
      <div className="grid grid-cols-2 gap-2">
        {monthlyData.map((month) => {
          const isCorrect = month.Correct === 'true' || month.Correct === true;
          return (
            <div 
              key={month.days}
              className={`rounded-xl border-2 p-4 text-center transition-all ${isCorrect ? 'bg-emerald-900/20 border-emerald-600/50' : 'bg-red-900/20 border-red-600/50'}`}
            >
              {isCorrect ? (
                <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              )}
              <div className="text-2xl font-black text-white leading-none mb-0.5">{month.days}</div>
              <div className="text-[8px] text-white/40 uppercase font-black tracking-widest mb-2">days</div>
              <div className={`text-[10px] font-black uppercase italic ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {isCorrect ? 'Accurate' : 'Inaccurate'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
