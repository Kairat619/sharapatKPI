import { useState } from 'react';
import { 
  Award, 
  Users, 
  DollarSign, 
  PhoneCall, 
  TrendingUp, 
  ListFilter
} from 'lucide-react';
import { DailyReport } from '../types';

interface LeaderboardViewProps {
  reports: DailyReport[];
}

interface RankedEmployee {
  name: string;
  department: 'Marketer' | 'SMM Specialist' | 'Videographer';
  avgKpi: number;
  revenueGenerated: number;
  leadsGenerated: number;
  recordsCount: number;
}

export default function LeaderboardView({ reports }: LeaderboardViewProps) {
  const [activeTab, setActiveTab] = useState<'All' | 'Marketer' | 'SMM Specialist' | 'Videographer'>('All');

  // Compute stats for all staff members across reports
  const marketersMap: Record<string, { kpiSum: number; revSum: number; leadSum: number; count: number }> = {};
  const smmMap: Record<string, { kpiSum: number; revSum: number; leadSum: number; count: number }> = {};
  const videographerMap: Record<string, { kpiSum: number; revSum: number; leadSum: number; count: number }> = {};

  reports.forEach(r => {
    // Marketer stats
    if (r.marketer) {
      if (!marketersMap[r.marketer]) marketersMap[r.marketer] = { kpiSum: 0, revSum: 0, leadSum: 0, count: 0 };
      marketersMap[r.marketer].kpiSum += r.kpiScore;
      marketersMap[r.marketer].revSum += r.salesAmount;
      marketersMap[r.marketer].leadSum += r.leads;
      marketersMap[r.marketer].count += 1;
    }

    // SMM stats
    if (r.smm) {
      if (!smmMap[r.smm]) smmMap[r.smm] = { kpiSum: 0, revSum: 0, leadSum: 0, count: 0 };
      smmMap[r.smm].kpiSum += r.kpiScore;
      smmMap[r.smm].revSum += r.salesAmount;
      smmMap[r.smm].leadSum += r.leads;
      smmMap[r.smm].count += 1;
    }

    // Videographer stats
    if (r.videographer) {
      if (!videographerMap[r.videographer]) videographerMap[r.videographer] = { kpiSum: 0, revSum: 0, leadSum: 0, count: 0 };
      videographerMap[r.videographer].kpiSum += r.kpiScore;
      videographerMap[r.videographer].revSum += r.salesAmount;
      videographerMap[r.videographer].leadSum += r.leads;
      videographerMap[r.videographer].count += 1;
    }
  });

  const rankedEmployees: RankedEmployee[] = [];

  // Add marketers
  Object.entries(marketersMap).forEach(([name, s]) => {
    rankedEmployees.push({
      name,
      department: 'Marketer',
      avgKpi: Math.round(s.kpiSum / s.count),
      revenueGenerated: s.revSum,
      leadsGenerated: s.leadSum,
      recordsCount: s.count
    });
  });

  // Add SMM
  Object.entries(smmMap).forEach(([name, s]) => {
    rankedEmployees.push({
      name,
      department: 'SMM Specialist',
      avgKpi: Math.round(s.kpiSum / s.count),
      revenueGenerated: s.revSum,
      leadsGenerated: s.leadSum,
      recordsCount: s.count
    });
  });

  // Add Videographers
  Object.entries(videographerMap).forEach(([name, s]) => {
    rankedEmployees.push({
      name,
      department: 'Videographer',
      avgKpi: Math.round(s.kpiSum / s.count),
      revenueGenerated: s.revSum,
      leadsGenerated: s.leadSum,
      recordsCount: s.count
    });
  });

  // Filter based on tab selection
  const filteredRankings = rankedEmployees.filter(emp => {
    if (activeTab === 'All') return true;
    return emp.department === activeTab;
  }).sort((a, b) => b.avgKpi - a.avgKpi); // Rank primarily by average KPI Score

  const formatKZT = (val: number) => {
    return `${val.toLocaleString('ru-RU')} 〒`;
  };

  const getMedal = (index: number) => {
    if (index === 0) return { emoji: '🥇 Gold', style: 'bg-amber-50 text-amber-900 border-amber-250 font-extrabold' };
    if (index === 1) return { emoji: '🥈 Silver', style: 'bg-slate-100 text-slate-800 border-slate-300 font-extrabold' };
    if (index === 2) return { emoji: '🥉 Bronze', style: 'bg-orange-50 text-orange-950 border-orange-200 font-extrabold' };
    return { emoji: `${index + 1}`, style: 'bg-slate-50 text-slate-600 border-slate-205 font-bold' };
  };

  const bestPerformer = filteredRankings[0];

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-sans">
      {/* Header and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-650">Company Star Ledger</span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5 font-display">Employee Leaderboard</h2>
          <p className="text-xs text-slate-500">
            Real-time visual ranking comparing SMMs, marketers, and videographers primarily by Average KPI Index.
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          {(['All', 'Marketer', 'SMM Specialist', 'Videographer'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setActiveTab(role)}
              className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition cursor-pointer
                ${activeTab === role 
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'}`}
            >
              {role === 'All' ? 'All Roles' : `${role}s`}
            </button>
          ))}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="p-8 text-center text-slate-400 bg-white border border-slate-205 rounded-xl text-xs font-semibold">
          Please log reports to display employee leaderboard rankings.
        </div>
      ) : (
        <>
          {/* Big Spotlight Performer Hero visual */}
          {bestPerformer && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 md:p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-2xl flex items-center justify-center animate-pulse">
                  ✨
                </div>
                <div>
                  <span className="text-[9px] font-bold text-amber-400 tracking-wider uppercase block">Monthly Star Champion</span>
                  <h3 className="text-lg font-extrabold text-white mt-0.5 font-display">{bestPerformer.name}</h3>
                  <p className="text-xs text-slate-400">
                    Leading the workforce in <span className="text-indigo-400 font-bold">{bestPerformer.department}</span> with an outstanding avg KPI score.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 text-center">
                <div className="bg-slate-800/40 border border-slate-700/40 p-2 rounded-lg min-w-24">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Average KPI</span>
                  <span className="text-sm font-black font-sans text-emerald-400">{bestPerformer.avgKpi} pts</span>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/40 p-2 rounded-lg min-w-28">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Revenue Driven</span>
                  <span className="text-sm font-black font-sans text-amber-400">{formatKZT(bestPerformer.revenueGenerated)}</span>
                </div>
              </div>
            </div>
          )}

          {/* List group rankings table */}
          <div className="bg-white rounded-xl border border-slate-205 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-905 font-display">Ranked Productive Staff Members</h3>
                <p className="text-xs text-slate-400 mt-0.5">Calculated by averaging individual KPIs registered in target campaigns.</p>
              </div>
              <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                <ListFilter size={12} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[9px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-205">
                    <th className="py-2.5 px-4 text-center w-24">Rank</th>
                    <th className="py-2.5 px-4">Name</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4 text-right">Average KPI</th>
                    <th className="py-2.5 px-4 text-right">Revenue Generated</th>
                    <th className="py-2.5 px-4 text-right">Leads Generated</th>
                    <th className="py-2.5 px-4 text-center w-28">Campaign Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {filteredRankings.map((emp, index) => {
                    const rowMedal = getMedal(index);
                    const kpiColor = emp.avgKpi >= 90 ? 'text-emerald-700 font-extrabold' : 'text-slate-800 font-bold';
                    
                    return (
                      <tr key={emp.name + emp.department} className="hover:bg-slate-50/60 transition duration-150">
                        <td className="py-2 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] border tracking-wider uppercase inline-block ${rowMedal.style}`}>
                            {rowMedal.emoji}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-750 flex items-center justify-center font-black text-[10px]">
                              {emp.name.substring(0, 2)}
                            </div>
                            <span className="font-bold text-slate-800">{emp.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-4 font-semibold">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100/50 text-indigo-700 text-[9px]">
                            {emp.department}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-right">
                          <span className={`${kpiColor} font-mono`}>{emp.avgKpi} / 100</span>
                        </td>
                        <td className="py-2 px-4 text-right font-mono font-bold text-slate-700">
                          {formatKZT(emp.revenueGenerated)}
                        </td>
                        <td className="py-2 px-4 text-right font-mono text-slate-900 font-bold">
                          {emp.leadsGenerated.toLocaleString('ru-RU')}
                        </td>
                        <td className="py-2 px-4 text-center font-mono font-medium text-slate-500">
                          {emp.recordsCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
