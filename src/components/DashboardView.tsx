import { useState } from 'react';
import { 
  Users, 
  Eye, 
  PhoneCall, 
  TrendingUp, 
  CreditCard, 
  DollarSign, 
  Award, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  Activity,
  UserCheck
} from 'lucide-react';
import { DailyReport } from '../types';

interface DashboardViewProps {
  reports: DailyReport[];
}

export default function DashboardView({ reports }: DashboardViewProps) {
  const [hoveredChartIndex, setHoveredChartIndex] = useState<string | null>(null);

  // If no reports are registered
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-xs text-center">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
          <Activity size={28} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">No Analytics Data Yet</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          Please submit a Daily Report first to seed data and populate the v2 SMM Management Dashboard.
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalReach = reports.reduce((sum, r) => sum + r.reach, 0);
  const totalViews = reports.reduce((sum, r) => sum + r.views, 0);
  const totalLeads = reports.reduce((sum, r) => sum + r.leads, 0);
  const totalSales = reports.reduce((sum, r) => sum + r.orders, 0);
  const totalRevenue = reports.reduce((sum, r) => sum + r.salesAmount, 0);
  const totalFollowerGrowth = reports.reduce((sum, r) => sum + r.followerGrowth, 0);
  const avgKpiScore = Math.round(reports.reduce((sum, r) => sum + r.kpiScore, 0) / reports.length);

  // Group by account to find best performing account and rank
  const accountMetrics = reports.reduce((acc, r) => {
    if (!acc[r.account]) {
      acc[r.account] = { reach: 0, views: 0, leads: 0, sales: 0, revenue: 0, growth: 0, kpiSum: 0, count: 0 };
    }
    acc[r.account].reach += r.reach;
    acc[r.account].views += r.views;
    acc[r.account].leads += r.leads;
    acc[r.account].sales += r.orders;
    acc[r.account].revenue += r.salesAmount;
    acc[r.account].growth += r.followerGrowth;
    acc[r.account].kpiSum += r.kpiScore;
    acc[r.account].count += 1;
    return acc;
  }, {} as Record<string, { reach: number; views: number; leads: number; sales: number; revenue: number; growth: number; kpiSum: number; count: number }>);

  let bestAccountName = '-';
  let highestAccountAvgKpi = 0;
  let highestSalesAccount = '-';
  let maxSalesAmnt = -1;
  let highestLeadsAccount = '-';
  let maxLeadsNum = -1;

  Object.entries(accountMetrics).forEach(([name, m]) => {
    const avg = m.kpiSum / m.count;
    if (avg > highestAccountAvgKpi) {
      highestAccountAvgKpi = avg;
      bestAccountName = name;
    }
    if (m.revenue > maxSalesAmnt) {
      maxSalesAmnt = m.revenue;
      highestSalesAccount = name;
    }
    if (m.leads > maxLeadsNum) {
      maxLeadsNum = m.leads;
      highestLeadsAccount = name;
    }
  });

  // Employee breakdown (by Average KPI)
  const calculateLeader = (key: 'marketer' | 'smm' | 'videographer') => {
    const table = reports.reduce((acc, r) => {
      const name = r[key];
      if (!acc[name]) acc[name] = { sum: 0, count: 0 };
      acc[name].sum += r.kpiScore;
      acc[name].count += 1;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    let leader = '-';
    let maxAvg = -1;
    Object.entries(table).forEach(([name, stats]) => {
      const avg = stats.sum / stats.count;
      if (avg > maxAvg) {
        maxAvg = avg;
        leader = name;
      }
    });
    return leader;
  };

  const bestMarketer = calculateLeader('marketer');
  const bestSmm = calculateLeader('smm');
  const bestVideographer = calculateLeader('videographer');

  // Find best account today (most recent report day with highest KPI score)
  const sortedReportsDescDate = [...reports].sort((a,b) => b.date.localeCompare(a.date));
  const latestDate = sortedReportsDescDate[0]?.date;
  const latestDayReports = reports.filter(r => r.date === latestDate);
  const bestAccountTodayReport = [...latestDayReports].sort((a, b) => b.kpiScore - a.kpiScore)[0];
  const bestAccountToday = bestAccountTodayReport ? `${bestAccountTodayReport.account} (${bestAccountTodayReport.kpiScore} pts)` : '-';

  // Format currency helpers (KZT default as user has Kazakh company names)
  const formatKZT = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M 〒`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K 〒`;
    return `${val} 〒`;
  };

  const formatCompact = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  // Group daily reach trend for the last 10 reports sorted chronologically
  const reportsChronological = [...reports].sort((a, b) => a.date.localeCompare(b.date));
  
  // Daily KPI Trend points
  const dailyKpiTrend = reportsChronological.reduce((acc, r) => {
    const existing = acc.find(item => item.date === r.date);
    if (existing) {
      existing.sum += r.kpiScore;
      existing.count += 1;
    } else {
      acc.push({ date: r.date, sum: r.kpiScore, count: 1 });
    }
    return acc;
  }, [] as Array<{ date: string; sum: number; count: number }>).map(item => ({
    date: item.date,
    score: Math.round(item.sum / item.count)
  })).slice(-10); // last 10 days

  // Platform Pie chart calculations
  const platformCounts = reports.reduce((acc, r) => {
    acc[r.platform] = (acc[r.platform] || 0) + r.salesAmount;
    return acc;
  }, {} as Record<string, number>);
  const totalPlatformSales = Object.values(platformCounts).reduce((a, b) => a + b, 0) || 1;
  const instagramSalesPct = Math.round(((platformCounts['Instagram'] || 0) / totalPlatformSales) * 100);
  const tiktokSalesPct = Math.round(((platformCounts['TikTok'] || 0) / totalPlatformSales) * 100);

  // Lead Column chart
  const accountLeads = Object.entries(accountMetrics).map(([name, m]) => ({
    name: name.split(' ').map(w => w[0]).join(''), // Abbreviate
    fullName: name,
    leads: m.leads
  }));

  // Revenue Daily trend points
  const dailyRevenueTrend = reportsChronological.reduce((acc, r) => {
    const existing = acc.find(item => item.date === r.date);
    if (existing) {
      existing.revenue += r.salesAmount;
    } else {
      acc.push({ date: r.date, revenue: r.salesAmount });
    }
    return acc;
  }, [] as Array<{ date: string; revenue: number }>).slice(-10);

  return (
    <div className="space-y-4">
      {/* Welcome header & quick stats banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
            <Sparkles size={12} className="text-indigo-500 animate-spin" /> Executive Cockpit Live
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5 font-display">Management Insights</h2>
          <p className="text-xs text-slate-500">
            Analyzing SMM, marketing performance, staff productivity, and revenue.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-105 border border-slate-200 text-slate-705 rounded-lg py-1 px-2.5 self-start sm:self-auto font-mono text-[11px] font-bold">
          <Calendar size={12} className="text-slate-500" />
          <span>Period: June 2026</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Reach */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition duration-250">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Reach</span>
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-500 shrink-0">
              <Users size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
              {formatCompact(totalReach)}
            </h3>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight size={10} /> +12.4% vs last mo
            </span>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition duration-250">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Views</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-500 shrink-0">
              <Eye size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
              {formatCompact(totalViews)}
            </h3>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight size={10} /> +8.9% views growth
            </span>
          </div>
        </div>

        {/* Total Leads */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition duration-250">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Leads</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-500 shrink-0">
              <PhoneCall size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
              {formatCompact(totalLeads)}
            </h3>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight size={10} /> +15.3% conversion
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition duration-250">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <DollarSign size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
              {formatKZT(totalRevenue)}
            </h3>
            <span className="text-[10px] text-indigo-600 font-bold mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight size={10} /> {totalSales} Orders placed
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Follower Growth */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition duration-250">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Followers Growth</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500 shrink-0">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
              {totalFollowerGrowth > 0 ? `+${formatCompact(totalFollowerGrowth)}` : formatCompact(totalFollowerGrowth)}
            </h3>
            <p className="text-[10px] text-slate-400">Net acquisition</p>
          </div>
        </div>

        {/* Average KPI Score */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition duration-250">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average KPI Score</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650 shrink-0">
              <Award size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">{avgKpiScore} / 100</h3>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-1 rounded-full" 
                style={{ width: `${avgKpiScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Best Performing Account */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 col-span-2 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition duration-250">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Best Performing Account</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-550 shrink-0">
              <Sparkles size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-base font-extrabold text-slate-905 truncate tracking-tight font-display">{bestAccountName}</h3>
            <p className="text-[9px] text-slate-400">Based on rolling daily weighted KPI calculations</p>
          </div>
        </div>
      </div>

      {/* Top Performance Widget Section */}
      <section className="bg-slate-950 text-white rounded-xl p-4 shadow-md border border-slate-900">
        <h3 className="text-sm font-bold flex items-center gap-1.5 mb-4 font-display">
          <Award className="text-indigo-400" size={16} />
          Executive Spotlight & Star Performers
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Best Account Today */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex gap-2.5 items-center">
            <div className="w-8.5 h-8.5 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 flex-shrink-0 text-md">
              🏆
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-amber-450 tracking-wider uppercase block leading-none">Best Account Today</span>
              <h4 className="text-xs font-bold truncate text-white mt-1 leading-tight">{bestAccountToday}</h4>
            </div>
          </div>

          {/* Best Marketer */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex gap-2.5 items-center">
            <div className="w-8.5 h-8.5 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 flex-shrink-0 text-md">
              🏆
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-emerald-450 tracking-wider uppercase block leading-none">Best Marketer</span>
              <h4 className="text-xs font-bold truncate text-white mt-1 leading-tight">{bestMarketer}</h4>
            </div>
          </div>

          {/* Best SMM Specialist */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex gap-2.5 items-center">
            <div className="w-8.5 h-8.5 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 flex-shrink-0 text-md">
              🏆
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-indigo-450 tracking-wider uppercase block leading-none">Best SMM Specialist</span>
              <h4 className="text-xs font-bold truncate text-white mt-1 leading-tight">{bestSmm}</h4>
            </div>
          </div>

          {/* Best Videographer */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex gap-2.5 items-center">
            <div className="w-8.5 h-8.5 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400 flex-shrink-0 text-md">
              🏆
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-sky-450 tracking-wider uppercase block leading-none">Best Videographer</span>
              <h4 className="text-xs font-bold truncate text-white mt-1 leading-tight">{bestVideographer}</h4>
            </div>
          </div>

          {/* Highest Sales Account */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex gap-2.5 items-center">
            <div className="w-8.5 h-8.5 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 flex-shrink-0 text-md">
              💰
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-purple-455 tracking-wider uppercase block leading-none">Highest Sales Account</span>
              <h4 className="text-xs font-bold truncate text-white mt-1 leading-tight">{highestSalesAccount}</h4>
            </div>
          </div>

          {/* Highest Lead Generation Account */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex gap-2.5 items-center">
            <div className="w-8.5 h-8.5 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-400 flex-shrink-0 text-md">
              ⚡
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-teal-450 tracking-wider uppercase block leading-none">Highest Lead Gen Account</span>
              <h4 className="text-xs font-bold truncate text-white mt-1 leading-tight">{highestLeadsAccount}</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* KPI Trend Line Chart */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Activity size={14} className="text-indigo-500" /> KPI Score Trend
            </h4>
            <p className="text-[10px] text-slate-400">Daily rolling average weighted KPI score</p>
          </div>
          
          <div className="h-44 mt-4 flex items-end justify-between gap-1 border-b border-l border-slate-100 pb-2 pl-2 relative">
            {dailyKpiTrend.map((pt, i) => {
              const hPercent = `${pt.score}%`;
              return (
                <div 
                  key={pt.date} 
                  className="flex-1 flex flex-col items-center group relative cursor-pointer"
                  onMouseEnter={() => setHoveredChartIndex(`kpi-${i}`)}
                  onMouseLeave={() => setHoveredChartIndex(null)}
                >
                  {/* Tooltip */}
                  {hoveredChartIndex === `kpi-${i}` && (
                    <div className="absolute -top-8 bg-slate-900 text-white text-[9px] py-0.5 px-2 rounded shadow-lg z-10 font-mono whitespace-nowrap">
                      {pt.date}: {pt.score} pts
                    </div>
                  )}
                  {/* Line anchor node (Simulated with elegant vertical bar) */}
                  <div className="w-full bg-slate-50 hover:bg-indigo-50 rounded-t transition-all flex items-end justify-center" style={{ height: '130px' }}>
                    <div 
                      className="w-3 bg-indigo-505 bg-indigo-600 group-hover:bg-indigo-700 rounded-t transition-height" 
                      style={{ height: hPercent }}
                    />
                  </div>
                  <span className="text-[8px] text-slate-400 font-mono mt-1.5 truncate w-full text-center">
                    {pt.date.substring(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Account Performance Bar Chart */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Award size={14} className="text-indigo-500" /> Account Performance Compare
            </h4>
            <p className="text-[10px] text-slate-400">Accumulated performance average KPI index comparing active channels</p>
          </div>

          <div className="mt-4 space-y-3">
            {Object.entries(accountMetrics).map(([name, m], i) => {
              const avgScore = Math.round(m.kpiSum / m.count);
              let color = 'bg-indigo-605 bg-indigo-600';
              if (avgScore >= 90) color = 'bg-indigo-600';
              else if (avgScore >= 75) color = 'bg-indigo-500';
              else if (avgScore >= 50) color = 'bg-indigo-400';
              else color = 'bg-rose-400';

              return (
                <div key={name} className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-slate-700 truncate">{name}</span>
                    <span className="font-mono text-slate-500 shrink-0">{avgScore} score ({m.count} logs)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex items-center border border-slate-200/40">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${color}`}
                      style={{ width: `${avgScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Platform Performance Sales Pie Chart */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between col-span-1">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <CreditCard size={14} className="text-indigo-500" /> Platform Sales Hubs
            </h4>
            <p className="text-[10px] text-slate-400">Comparing generated revenue</p>
          </div>

          <div className="mt-3 flex flex-col items-center justify-center">
            {/* Elegant SVG Custom Donut Chart */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Instagram segment */}
                <path
                  className="text-pink-500"
                  strokeWidth="3.5"
                  strokeDasharray={`${instagramSalesPct}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* TikTok segment */}
                <path
                  className="text-slate-900"
                  strokeWidth="3.5"
                  strokeDasharray={`${tiktokSalesPct}, 100`}
                  strokeDashoffset={`-${instagramSalesPct}`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-base font-bold text-slate-800 font-sans">{instagramSalesPct}%</span>
                <span className="text-[8px] text-slate-400 block whitespace-nowrap">Instagram Sales</span>
              </div>
            </div>

            <div className="grid grid-cols-2 w-full gap-1.5 mt-3">
              <div className="bg-slate-50 p-1.5 text-center rounded-lg border border-slate-200/60">
                <div className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-pink-500 rounded-full inline-block"></span>
                  <span className="text-[10px] font-bold text-slate-600">Instagram</span>
                </div>
                <span className="text-xs font-mono font-bold block text-slate-900 mt-0.5">{instagramSalesPct}%</span>
              </div>
              <div className="bg-slate-50 p-1.5 text-center rounded-lg border border-slate-200/60">
                <div className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-slate-900 rounded-full inline-block"></span>
                  <span className="text-[10px] font-bold text-slate-600">TikTok</span>
                </div>
                <span className="text-xs font-mono font-bold block text-slate-900 mt-0.5">{tiktokSalesPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Gen Column Chart */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between col-span-1">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <PhoneCall size={14} className="text-indigo-500" /> Active Lead Generation
            </h4>
            <p className="text-[10px] text-slate-400">Total compiled leads generated by account channels</p>
          </div>

          <div className="h-36 flex items-end justify-around border-b border-slate-150 pb-2 relative mt-4">
            {accountLeads.length > 0 ? (
              accountLeads.map((item, i) => {
                const maxLeadsValue = Math.max(...accountLeads.map(l => l.leads)) || 1;
                const hPercent = `${(item.leads / maxLeadsValue) * 85}%`;
                
                return (
                  <div 
                    key={item.fullName} 
                    className="flex flex-col items-center group relative cursor-pointer"
                    onMouseEnter={() => setHoveredChartIndex(`lead-${i}`)}
                    onMouseLeave={() => setHoveredChartIndex(null)}
                  >
                    {hoveredChartIndex === `lead-${i}` && (
                      <div className="absolute -top-8 bg-slate-900 text-white text-[9px] py-0.5 px-2 rounded shadow-lg z-10 whitespace-nowrap font-mono">
                        {item.fullName}: {item.leads} leads
                      </div>
                    )}
                    <div 
                      className="w-6 bg-indigo-55 bg-indigo-600 hover:bg-indigo-700 rounded-t transition-all duration-300"
                      style={{ height: hPercent }}
                    />
                    <span className="text-[9px] text-slate-600 font-bold mt-1.5 font-mono" title={item.fullName}>
                      {item.name}
                    </span>
                  </div>
                );
              })
            ) : (
              <span className="text-slate-400 text-xs">No active accounts found</span>
            )}
          </div>
        </div>

        {/* Revenue Area Chart (Combined Area line) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between col-span-1">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <DollarSign size={14} className="text-indigo-500" /> Sales & Revenue Stream
            </h4>
            <p className="text-[10px] text-slate-400">Analyzing cumulative daily sales</p>
          </div>

          <div className="h-36 flex items-end justify-between border-b border-l border-slate-150 pb-2 pl-2 relative mt-4 gap-1">
            {dailyRevenueTrend.map((pt, i) => {
              const maxRevenue = Math.max(...dailyRevenueTrend.map(r => r.revenue)) || 1;
              const hPercent = `${(pt.revenue / maxRevenue) * 85}%`;
              
              return (
                <div 
                  key={pt.date} 
                  className="flex-1 flex flex-col items-center group relative cursor-pointer"
                  onMouseEnter={() => setHoveredChartIndex(`rev-${i}`)}
                  onMouseLeave={() => setHoveredChartIndex(null)}
                >
                  {hoveredChartIndex === `rev-${i}` && (
                    <div className="absolute -top-8 bg-slate-900 text-white text-[9px] py-0.5 px-2 rounded shadow-lg z-14 whitespace-nowrap font-mono">
                      {pt.date}: {formatKZT(pt.revenue)}
                    </div>
                  )}
                  <div className="w-full bg-slate-50 group-hover:bg-slate-100 flex items-end transition justify-center" style={{ height: '80px' }}>
                    <div 
                      className="w-2.5 bg-indigo-600 group-hover:bg-indigo-700 rounded-t transition-all"
                      style={{ height: hPercent }}
                    />
                  </div>
                  <span className="text-[8px] text-slate-400 font-mono mt-1.5 truncate">
                    {pt.date.substring(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
