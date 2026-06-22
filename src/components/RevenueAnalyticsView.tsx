import { useState } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  ShoppingBag,
  LineChart
} from 'lucide-react';
import { DailyReport } from '../types';

interface RevenueAnalyticsViewProps {
  reports: DailyReport[];
}

export default function RevenueAnalyticsView({ reports }: RevenueAnalyticsViewProps) {
  const [revenueHoverId, setRevenueHoverId] = useState<string | null>(null);

  if (reports.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white border border-slate-205 rounded-xl font-medium text-xs">
        Please complete and log daily SMM reports to display compiled revenue analytics.
      </div>
    );
  }

  // Core metrics calculations
  const totalRevenue = reports.reduce((sum, r) => sum + r.salesAmount, 0);
  const totalOrders = reports.reduce((sum, r) => sum + r.orders, 0);
  const totalAdCost = reports.reduce((sum, r) => sum + r.adCost, 0);
  const totalLeads = reports.reduce((sum, r) => sum + r.leads, 0);

  // AOV = Total Revenue / Total Orders
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  // Conversion rate = (Orders / Leads) * 100
  const conversionRate = totalLeads > 0 ? (totalOrders / totalLeads) * 100 : 0;

  // ROAS = Revenue / Advertising Cost
  const overallRoas = totalAdCost > 0 ? (totalRevenue / totalAdCost) : 0;

  // Account revenue breakdown
  const accountRevenueMap = reports.reduce((acc, r) => {
    acc[r.account] = (acc[r.account] || 0) + r.salesAmount;
    return acc;
  }, {} as Record<string, number>);

  let bestPerformingAccount = '-';
  let bestAccountRev = -1;
  Object.entries(accountRevenueMap).forEach(([name, rev]) => {
    if (rev > bestAccountRev) {
      bestAccountRev = rev;
      bestPerformingAccount = name;
    }
  });

  const formatKZT = (val: number) => {
    return `${Math.round(val).toLocaleString('ru-RU')} 〒`;
  };

  const formatKZTCompact = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M 〒`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K 〒`;
    return `${val} 〒`;
  };

  // Chronological Daily Trend Data
  const revenueTrendPoints = [...reports]
    .sort((a,b) => a.date.localeCompare(b.date))
    .reduce((acc, r) => {
      const existing = acc.find(item => item.date === r.date);
      if (existing) {
        existing.revenue += r.salesAmount;
        existing.spend += r.adCost;
      } else {
        acc.push({ date: r.date, revenue: r.salesAmount, spend: r.adCost });
      }
      return acc;
    }, [] as Array<{ date: string; revenue: number; spend: number }>);

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-sans">
      {/* View Header */}
      <div className="border-b border-slate-205 pb-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-650">Financial Intelligence Hub</span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5 font-display">Marketing ROI & Revenue</h2>
        <p className="text-xs text-slate-500">
          Executive analytics focusing on marketing profit streams, acquisition cost, and return of advertising spend (ROAS).
        </p>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Revenue */}
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Gross SMM Revenue</span>
            <DollarSign size={14} className="text-emerald-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-extrabold font-sans text-white tracking-tight">{formatKZTCompact(totalRevenue)}</h3>
            <p className="text-[9px] text-slate-400 mt-0.5">Accumulated from completed social orders</p>
          </div>
        </div>

        {/* Orders completd */}
        <div className="bg-white p-3 rounded-xl border border-slate-205 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Orders Count</span>
            <ShoppingBag size={14} className="text-indigo-600" />
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">{totalOrders}</h3>
            <p className="text-[9px] text-slate-400 mt-0.5">SMM direct order checkouts</p>
          </div>
        </div>

        {/* Ad Cost Spent */}
        <div className="bg-white p-3 rounded-xl border border-slate-205 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Advertising Spend</span>
            <CreditCard size={14} className="text-rose-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">{formatKZTCompact(totalAdCost)}</h3>
            <p className="text-[9px] text-rose-500 font-bold mt-0.5">Paid acquisition channels</p>
          </div>
        </div>

        {/* ROAS Metric */}
        <div className="bg-white p-3 rounded-xl border border-slate-205 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ad Return (ROAS)</span>
            <TrendingUp size={14} className="text-emerald-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-extrabold text-emerald-700 tracking-tight">{overallRoas.toFixed(2)}x</h3>
            <p className="text-[9px] text-slate-400 mt-0.5">Sales return ratio per ad budget unit</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Average Order Value (AOV) */}
        <div className="bg-white p-3 rounded-xl border border-slate-205 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">Average Order Value (AOV)</span>
          <h3 className="text-base font-extrabold text-slate-800 mt-1 font-sans">{formatKZT(avgOrderValue)}</h3>
          <p className="text-[9px] text-slate-400 mt-0.5">Ticket average amount per conversion</p>
        </div>

        {/* SMM Lead-to-Order Conversion Rate */}
        <div className="bg-white p-3 rounded-xl border border-slate-205 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">Sales Conversion Rate</span>
          <h4 className="text-base font-extrabold text-slate-800 mt-1 font-sans">{conversionRate.toFixed(1)}%</h4>
          <p className="text-[9px] text-slate-400 mt-0.5">Inbound leads generating checks</p>
        </div>

        {/* Best Performing Revenue Account */}
        <div className="bg-white p-3 rounded-xl border border-slate-205 col-span-2 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Best Revenue Account Channel</span>
            <h4 className="text-sm font-extrabold text-slate-800 mt-0.5 truncate">{bestPerformingAccount}</h4>
          </div>
          <p className="text-[10px] text-emerald-700 font-extrabold mt-0.5">
            Sales: {formatKZT(bestAccountRev)} driven
          </p>
        </div>
      </div>

      {/* ROAS Performance Alerts & Strategic Warnings */}
      {overallRoas > 0 && overallRoas < 2.5 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-905 rounded-xl flex items-start gap-2 text-[11px] leading-relaxed shadow-xs">
          <AlertCircle size={15} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block">Ad Return Alert (Low Margin Indicator)</span>
            Your SMM campaigns are registering an overall ROAS of <strong>{overallRoas.toFixed(2)}x</strong>.
            This falls below the targeted threshold of 3.0x. Managers should audit SMM creatives or negotiate better ad bids on TikTok & Instagram channels to boost performance.
          </div>
        </div>
      )}

      {/* Revenue and Ad Cost timeline charts */}
      <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-sm">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-display">
            <LineChart size={14} className="text-emerald-500" /> Revenue & Marketing Spend Timeline
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Compare green bars (Gross SMM Sales) against rose accents (Paid Advertising Cost) over time (last 10 days)</p>
        </div>

        <div className="h-48 mt-4 flex items-end justify-between border-b border-l border-slate-200 pb-1.5 pl-1.5 gap-1.5 relative">
          {revenueTrendPoints.slice(-10).map((pt, i) => {
            const maxVal = Math.max(...revenueTrendPoints.map(p => Math.max(p.revenue, p.spend))) || 1;
            const hRevenuePercent = `${(pt.revenue / maxVal) * 85}%`;
            const hSpendPercent = `${(pt.spend / maxVal) * 85}%`;

            return (
              <div 
                key={pt.date} 
                className="flex-1 flex flex-col items-center group relative cursor-pointer"
                onMouseEnter={() => setRevenueHoverId(pt.date)}
                onMouseLeave={() => setRevenueHoverId(null)}
              >
                {/* Tooltip */}
                {revenueHoverId === pt.date && (
                  <div className="absolute -top-14 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-xl z-20 font-mono whitespace-nowrap leading-relaxed text-left border border-slate-850">
                    <span className="block font-bold text-slate-400 text-[8px]">{pt.date}</span>
                    <span className="block text-emerald-400">💰 Sales: {formatKZT(pt.revenue)}</span>
                    <span className="block text-rose-400">💳 Spend: {formatKZT(pt.spend)}</span>
                  </div>
                )}

                {/* Double Bars */}
                <div className="w-full bg-slate-50 flex items-end justify-center gap-0.5 hover:bg-slate-100 py-1 px-0.5 rounded" style={{ height: '120px' }}>
                  {/* Revenue Bar */}
                  <div className="w-2.5 bg-emerald-500 rounded-t-xs" style={{ height: hRevenuePercent }} />
                  {/* Spend Bar */}
                  <div className="w-2.5 bg-rose-450 rounded-t-xs" style={{ height: hSpendPercent }} />
                </div>

                <span className="text-[9px] font-bold text-slate-400 font-mono mt-1.5 truncate w-full text-center">
                  {pt.date.substring(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
