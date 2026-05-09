import React from 'react';

interface MonthlySnapshotsProps {
  json9: any;
}

export default function MonthlySnapshots({ json9 }: MonthlySnapshotsProps) {
  if (!json9) return null;

  const monthlyData = [];
  for (let i = 30; i <= 360; i += 30) {
    if (json9[i.toString()]) {
      const monthData = typeof json9[i.toString()] === 'string' ? JSON.parse(json9[i.toString()]) : json9[i.toString()];
      monthlyData.push({ days: i, correct: monthData.Correct === 'true' || monthData.Correct === true });
    }
  }

  if (monthlyData.length === 0) return null;

  const correctCount = monthlyData.filter(m => m.correct).length;
  const analysis = json9.Analysis?.replace(/\*/g, '') || 'N/A';
  const parameters = json9.Parameters || 'N/A';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Monthly Snapshots</h2>
        <div className="text-[10px] font-black text-[#00D8FF] uppercase italic bg-[#00D8FF]/10 px-3 py-1.5 rounded-lg border border-[#00D8FF]/30 shadow-[0_0_15px_rgba(0,216,255,0.2)]">
          Rate: {correctCount}/12
        </div>
      </div>
      
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex justify-around text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <div className="flex gap-2 items-center"><span className="text-[8px] opacity-40">IND:</span> <span className="text-white">{analysis}</span></div>
        <div className="flex gap-2 items-center"><span className="text-[8px] opacity-40">PAR:</span> <span className="text-white">{parameters}</span></div>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {monthlyData.map((m) => (
          <div 
            key={m.days}
            className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 shadow-lg ${m.correct ? 'bg-emerald-900/40 border-emerald-600' : 'bg-red-900/40 border-red-600'}`}
          >
            <div className={`text-sm font-black ${m.correct ? 'text-emerald-400' : 'text-red-400'}`}>{m.days}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
