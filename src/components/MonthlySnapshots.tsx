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
        <div className="text-[10px] font-black text-[#00D8FF] uppercase italic bg-[#00D8FF]/10 px-2 py-0.5 rounded border border-[#00D8FF]/20">
          Rate: {correctCount}/12
        </div>
      </div>
      
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex justify-around text-[9px] font-black uppercase tracking-widest text-slate-400">
        <div className="flex gap-2 items-center"><span className="text-[7px] opacity-50">IND:</span> <span className="text-white">{analysis}</span></div>
        <div className="flex gap-2 items-center"><span className="text-[7px] opacity-50">PAR:</span> <span className="text-white">{parameters}</span></div>
      </div>

      <div className="flex flex-wrap gap-1.5 justify-between">
        {monthlyData.map((m) => (
          <div 
            key={m.days}
            className={`w-[48px] h-[36px] rounded-lg border flex flex-col items-center justify-center transition-all ${m.correct ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}
          >
            <div className="text-[10px] font-black text-white leading-none">{m.days}</div>
            <div className={`text-[6px] font-black uppercase ${m.correct ? 'text-emerald-400' : 'text-red-400'}`}>
              {m.correct ? 'OK' : 'ERR'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
