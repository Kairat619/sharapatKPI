import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  PhoneCall, 
  DollarSign, 
  Award, 
  ListFilter
} from 'lucide-react';
import { DailyReport, AccountAssignment } from '../types';
import { useLanguage } from "../i18n/LanguageContext";

interface AccountAnalyticsViewProps {
  reports: DailyReport[];
  assignments: AccountAssignment[];
}

export default function AccountAnalyticsView({ reports, assignments }: AccountAnalyticsViewProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>(
    assignments[0]?.accountName || 'Шарапат күмістері'
  );
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const { t } = useLanguage();

  // Filter reports specifically for this account + platform
  const filteredReports = reports.filter(r => {
    const matchAccount = r.account === selectedAccount;
    const matchPlatform = platformFilter === 'All' || r.platform === platformFilter;
    return matchAccount && matchPlatform;
  }).sort((a, b) => b.date.localeCompare(a.date)); // descending date order

  // Calculate Metrics specifically for this selected account
  const totalReach = filteredReports.reduce((sum, r) => sum + r.reach, 0);
  const totalViews = filteredReports.reduce((sum, r) => sum + r.views, 0);
  const totalLeads = filteredReports.reduce((sum, r) => sum + r.leads, 0);
  const totalSalesCount = filteredReports.reduce((sum, r) => sum + r.orders, 0);
  const totalRevenue = filteredReports.reduce((sum, r) => sum + r.salesAmount, 0);
  const totalFollowerGrowth = filteredReports.reduce((sum, r) => sum + r.followerGrowth, 0);
  const avgKpi = filteredReports.length > 0 
    ? Math.round(filteredReports.reduce((sum, r) => sum + r.kpiScore, 0) / filteredReports.length)
    : 0;

  const currentAssignment = assignments.find(a => a.accountName === selectedAccount);

  const formatKZT = (val: number) => {
    return `${val.toLocaleString('ru-RU')} 〒`;
  };

  const formatCompact = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString('ru-RU');
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-sans">
      {/* Selector & Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-650">{t("aa.badge")}</span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5 font-display">{t("aa.title")}</h2>
          <p className="text-xs text-slate-500">
            {t("aa.desc")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-sans">
          {/* Account Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">{t("aa.channel")}</span>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="p-1.5 text-xs bg-white border border-slate-205 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
            >
              {assignments.map(a => (
                <option key={a.accountName} value={a.accountName}>{a.accountName}</option>
              ))}
            </select>
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="p-1.5 text-xs bg-white border border-slate-205 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
            >
              <option value="All">{t("aa.allPlatforms")}</option>
              <option value="Instagram">{t("aa.instagram")}</option>
              <option value="TikTok">{t("aa.tiktok")}</option>
            </select>
          </div>
        </div>
      </div>

      {currentAssignment && (
        <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl flex flex-wrap gap-x-6 gap-y-1.5 text-[11px] text-slate-600 font-sans">
          <div>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider block uppercase">{t("aa.assignedMarketer")}</span>
            <span className="font-extrabold text-slate-800">{currentAssignment.marketer}</span>
          </div>
          <div className="border-l border-slate-200 h-6 hidden sm:block"></div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider block uppercase">{t("aa.assignedSmm")}</span>
            <span className="font-extrabold text-slate-800">{currentAssignment.smm}</span>
          </div>
          <div className="border-l border-slate-200 h-6 hidden sm:block"></div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider block uppercase">{t("aa.assignedVideographer")}</span>
            <span className="font-extrabold text-slate-800">{currentAssignment.videographer}</span>
          </div>
          <div className="border-l border-slate-200 h-6 hidden sm:block"></div>
          <div className="flex items-center">
            <span className="py-0.5 px-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold text-[9px] uppercase font-mono inline-block">
              {t("aa.connected")}
            </span>
          </div>
        </div>
      )}

      {/* Account metrics summary block */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-slate-205 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("aa.reachVolume")}</span>
            <Users size={12} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-800 mt-1">{formatCompact(totalReach)}</h3>
          <p className="text-[9px] text-slate-400 mt-0.5">{t("aa.reachSub")}</p>
        </div>

        <div className="p-3 bg-white border border-slate-205 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("aa.videoViews")}</span>
            <Eye size={12} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-800 mt-1">{formatCompact(totalViews)}</h3>
          <p className="text-[9px] text-slate-400 mt-0.5">{t("aa.viewsSub")}</p>
        </div>

        <div className="p-3 bg-white border border-slate-205 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("aa.leadsGenerated")}</span>
            <PhoneCall size={12} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-800 mt-1">{formatCompact(totalLeads)}</h3>
          <p className="text-[9px] text-slate-400 mt-0.5">{t("aa.leadsSub")}</p>
        </div>

        <div className="p-3 bg-white border border-slate-205 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("aa.revenue")}</span>
            <DollarSign size={12} className="text-indigo-650" />
          </div>
          <h3 className="text-lg font-extrabold text-indigo-650 mt-1">{formatKZT(totalRevenue)}</h3>
          <p className="text-[9px] text-slate-400 mt-0.5">{t("aa.revenueSub", { count: totalSalesCount })}</p>
        </div>

        <div className="p-3 bg-white border border-slate-205 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("aa.avgKpi")}</span>
            <Award size={12} className="text-indigo-650" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-800 mt-1">{avgKpi} / 100</h3>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${avgKpi}%` }}></div>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-205 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-505 font-sans">{t("aa.followerDelta")}</span>
            <TrendingUp size={12} className="text-indigo-600" />
          </div>
          <h3 className={`text-lg font-extrabold mt-1 ${totalFollowerGrowth >= 0 ? 'text-emerald-705' : 'text-rose-600'}`}>
            {totalFollowerGrowth >= 0 ? `+${formatCompact(totalFollowerGrowth)}` : formatCompact(totalFollowerGrowth)}
          </h3>
          <p className="text-[9px] text-slate-400 mt-0.5 font-sans">{t("aa.followerSub")}</p>
        </div>

        <div className="p-3 bg-white border border-slate-205 rounded-xl shadow-sm col-span-2 flex flex-col justify-between font-sans">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-505">{t("aa.channelRatio")}</span>
          <div className="flex items-center justify-between mt-1 text-xs">
            <div>
              <span className="block text-slate-400 text-[9px] uppercase font-bold">{t("aa.instaPages")}</span>
              <span className="font-extrabold text-slate-700">{filteredReports.filter(r => r.platform === 'Instagram').length} registered days</span>
            </div>
            <div className="border-l border-slate-200 h-6 self-center"></div>
            <div>
              <span className="block text-slate-400 text-[9px] uppercase font-bold">{t("aa.tiktokStreams")}</span>
              <span className="font-extrabold text-slate-700">{filteredReports.filter(r => r.platform === 'TikTok').length} registered days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Historical Daily Logs Table */}
      <div className="bg-white rounded-xl border border-slate-205 shadow-sm overflow-hidden font-sans">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-905 font-display">{t("aa.ledgerTitle")}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{t("aa.ledgerSub")}</p>
          </div>
          <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
            <ListFilter size={12} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[9px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-205">
                <th className="py-2.5 px-4 animate-fade-in">{t("aa.colDate")}</th>
                <th className="py-2.5 px-4">{t("aa.colPlatform")}</th>
                <th className="py-2.5 px-4 text-center">{t("aa.colPosting")}</th>
                <th className="py-2.5 px-4 text-right">{t("aa.colReach")}</th>
                <th className="py-2.5 px-4 text-right">{t("aa.colViews")}</th>
                <th className="py-2.5 px-4 text-right">{t("aa.colLeads")}</th>
                <th className="py-2.5 px-4 text-right">{t("aa.colStoriesPosts")}</th>
                <th className="py-2.5 px-4 text-right">{t("aa.colRevenue")}</th>
                <th className="py-2.5 px-4 text-right">{t("aa.colKpi")}</th>
                <th className="py-2.5 px-4 text-center">{t("aa.colStatus")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredReports.map((report) => {
                let pillColor = 'bg-rose-50 text-rose-705 border-rose-100';
                if (report.kpiStatus === 'Excellent') pillColor = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                else if (report.kpiStatus === 'Good') pillColor = 'bg-indigo-50 text-indigo-805 border-indigo-100';
                else if (report.kpiStatus === 'Average') pillColor = 'bg-sky-50 text-sky-800 border-sky-100';

                return (
                  <tr key={report.id} className="hover:bg-slate-50/60 transition duration-150 group">
                    <td className="py-2 px-4 font-mono font-bold text-slate-900">{report.date}</td>
                    <td className="py-2 px-4 font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold inline-block ${report.platform === 'Instagram' ? 'bg-pink-50 text-pink-700 border border-pink-100 font-sans' : 'bg-slate-805 bg-slate-800 text-white font-sans'}`}>
                        {report.platform}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-center font-mono text-slate-500">{report.postingTime || '-'}</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-600">{report.reach.toLocaleString('ru-RU')}</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-600">{report.views.toLocaleString('ru-RU')}</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">{report.leads}</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-500">{report.stories}s / {report.posts}p</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">{report.salesAmount.toLocaleString('ru-RU')}</td>
                    <td className="py-2 px-4 text-right font-mono font-black text-indigo-650">{report.kpiScore}</td>
                    <td className="py-2 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[8px] uppercase tracking-wider inline-block border ${pillColor}`}>
                        {report.kpiStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                    {t("aa.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
