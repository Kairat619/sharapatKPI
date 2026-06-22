import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import {
  Download,
  Printer,
  User,
  ShieldAlert,
  Copy,
  Sparkles,
  Check,
  Code,
  Sliders,
  Database,
  RotateCw,
} from "lucide-react";
import {
  KpiTargets,
  AccountAssignment,
  UserSession,
  DailyReport,
  UserRole,
} from "../types";
import { getAppsScriptCode } from "../utils";

interface ExportSettingsViewProps {
  targets: KpiTargets;
  setTargets: (targets: KpiTargets) => void;
  assignments: AccountAssignment[];
  setAssignments: (assignments: AccountAssignment[]) => void;
  currentUser: UserSession;
  setCurrentUser: (user: UserSession) => void;
  reports: DailyReport[];
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  syncState: {
    status: "idle" | "syncing" | "success" | "error";
    message: string;
  };
  onPullData: () => void;
}

export default function ExportSettingsView({
  targets,
  setTargets,
  assignments,
  setAssignments,
  currentUser,
  setCurrentUser,
  reports,
  sheetUrl,
  setSheetUrl,
  syncState,
  onPullData,
}: ExportSettingsViewProps) {
  const { t } = useLanguage();

  // Roles list
  const roles: UserRole[] = ["Admin", "Manager", "Staff", "Viewer"];

  // Settings edit states
  const [targetLeads, setTargetLeads] = useState(targets.leads);
  const [targetReach, setTargetReach] = useState(targets.reach);
  const [targetViews, setTargetViews] = useState(targets.views);
  const [targetGrowth, setTargetGrowth] = useState(targets.followerGrowth);
  const [targetStories, setTargetStories] = useState(targets.stories);
  const [targetPR, setTargetPR] = useState(targets.postsAndReels);

  const [copiedScript, setCopiedScript] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Generate copyable Google Apps Script file body
  const gsCode = getAppsScriptCode();

  // Handle Targets update
  const handleSaveTargets = () => {
    setTargets({
      leads: targetLeads,
      reach: targetReach,
      views: targetViews,
      followerGrowth: targetGrowth,
      stories: targetStories,
      postsAndReels: targetPR,
    });
    setSettingsSaved(true);
    setTimeout(() => {
      setSettingsSaved(false);
    }, 3000);
  };

  // Copy standard Apps Script code
  const handleCopyScript = () => {
    navigator.clipboard.writeText(gsCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Export functions (Generate formatted CSV spreadsheets for Excel)
  const downloadCSV = (data: string, fileName: string) => {
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Export Monthly KPI Summary CSV Spreadsheet
  const exportMonthlySummary = () => {
    if (reports.length === 0) {
      alert(t("es.noData"));
      return;
    }

    let csv = "Sharapat SMM KPI Platform v2 - Monthly Report Summary\r\n";
    csv += "Generated: " + new Date().toISOString() + "\r\n\r\n";
    csv +=
      "ID,Date,Platform,Account,Marketer,SMM Specialist,Videographer,Reach,Views,Leads,Orders,Sales,KPI Score,KPI Status\r\n";

    reports.forEach((r) => {
      csv += `${r.id},${r.date},${r.platform},"${r.account}",${r.marketer},${r.smm},${r.videographer},${r.reach},${r.views},${r.leads},${r.orders},${r.salesAmount},${r.kpiScore},${r.kpiStatus}\r\n`;
    });

    downloadCSV(csv, "Sharapat_SMM_Monthly_KPI_Summary.csv");
  };

  // 2. Export Department Summary CSV (Staff contributions breakdown)
  const exportDepartmentSummary = () => {
    if (reports.length === 0) {
      alert(t("es.noData"));
      return;
    }

    let csv = "Sharapat SMM KPI Platform v2 - Staff Department Summary\r\n";
    csv +=
      "ID,Employee Name,Target Department,Accumulated KPI Score,Total Revenue Generated,Total Leads Generated,Registered Campaigns\r\n";

    // Group staff
    const staffStats: Record<
      string,
      {
        name: string;
        dept: string;
        scores: number[];
        rev: number;
        leads: number;
        count: number;
      }
    > = {};
    reports.forEach((r) => {
      // Marketer
      if (r.marketer) {
        const id = `${r.marketer}-Marketer`;
        if (!staffStats[id])
          staffStats[id] = {
            name: r.marketer,
            dept: "Marketer",
            scores: [],
            rev: 0,
            leads: 0,
            count: 0,
          };
        staffStats[id].scores.push(r.kpiScore);
        staffStats[id].rev += r.salesAmount;
        staffStats[id].leads += r.leads;
        staffStats[id].count++;
      }
      // SMM
      if (r.smm) {
        const id = `${r.smm}-SMM`;
        if (!staffStats[id])
          staffStats[id] = {
            name: r.smm,
            dept: "SMM Specialist",
            scores: [],
            rev: 0,
            leads: 0,
            count: 0,
          };
        staffStats[id].scores.push(r.kpiScore);
        staffStats[id].rev += r.salesAmount;
        staffStats[id].leads += r.leads;
        staffStats[id].count++;
      }
      // Videographer
      if (r.videographer) {
        const id = `${r.videographer}-Videographer`;
        if (!staffStats[id])
          staffStats[id] = {
            name: r.videographer,
            dept: "Videographer",
            scores: [],
            rev: 0,
            leads: 0,
            count: 0,
          };
        staffStats[id].scores.push(r.kpiScore);
        staffStats[id].rev += r.salesAmount;
        staffStats[id].leads += r.leads;
        staffStats[id].count++;
      }
    });

    Object.entries(staffStats).forEach(([id, s]) => {
      const avgKpi = Math.round(
        s.scores.reduce((a, b) => a + b, 0) / s.scores.length,
      );
      csv += `${id},"${s.name}","${s.dept}",${avgKpi},${s.rev},${s.leads},${s.count}\r\n`;
    });

    downloadCSV(csv, "Sharapat_SMM_Department_Staff_Summary.csv");
  };

  // 3. Export Account Summary CSV
  const exportAccountSummary = () => {
    if (reports.length === 0) {
      alert(t("es.noData"));
      return;
    }

    let csv = "Sharapat SMM KPI Platform v2 - Account Channels Summary\r\n";
    csv +=
      "Account Name,Average KPI,Cumulative Reach,Cumulative Views,Cumulative Leads,Total Sales Amount,Sales Conversion,Count Submissions\r\n";

    const accMetrics: Record<
      string,
      {
        name: string;
        reach: number;
        views: number;
        leads: number;
        rev: number;
        orders: number;
        scores: number[];
        count: number;
      }
    > = {};
    reports.forEach((r) => {
      if (!accMetrics[r.account]) {
        accMetrics[r.account] = {
          name: r.account,
          reach: 0,
          views: 0,
          leads: 0,
          rev: 0,
          orders: 0,
          scores: [],
          count: 0,
        };
      }
      accMetrics[r.account].reach += r.reach;
      accMetrics[r.account].views += r.views;
      accMetrics[r.account].leads += r.leads;
      accMetrics[r.account].rev += r.salesAmount;
      accMetrics[r.account].orders += r.orders;
      accMetrics[r.account].scores.push(r.kpiScore);
      accMetrics[r.account].count++;
    });

    Object.values(accMetrics).forEach((m) => {
      const avgKpi = Math.round(
        m.scores.reduce((a, b) => a + b, 0) / m.scores.length,
      );
      const conv =
        m.leads > 0 ? ((m.orders / m.leads) * 100).toFixed(1) : "0.0";
      csv += `"${m.name}",${avgKpi},${m.reach},${m.views},${m.leads},${m.rev},${conv}%,${m.count}\r\n`;
    });

    downloadCSV(csv, "Sharapat_SMM_Channels_KPI_Summary.csv");
  };

  // Standard Print Document function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-sans">
      {/* Title */}
      <div className="border-b border-slate-205 pb-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-650 font-extrabold">
          {t("es.badge")}
        </span>
        <h2 className="text-xl font-bold text-slate-905 tracking-tight mt-0.5 font-display">
          {t("es.title")}
        </h2>
        <p className="text-xs text-slate-500">
          {t("es.desc")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Column Left: Export & Roles */}
        <div className="space-y-4">
          {/* Google Sheets Live Database Connection Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Database size={13} className="text-emerald-500" /> {t("es.sheetsTitle")}
            </h3>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                {t("es.urlLabel")}
              </label>
              <input
                type="text"
                placeholder={t("es.urlPlaceholder")}
                value={sheetUrl}
                onChange={(e) => {
                  setSheetUrl(e.target.value);
                  localStorage.setItem("sharapat_v2_sheet_url", e.target.value);
                }}
                className="w-full text-[10px] p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onPullData}
                disabled={syncState.status === "syncing"}
                className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <div
                  className={`${syncState.status === "syncing" ? "animate-spin" : ""}`}
                >
                  <RotateCw size={11} />
                </div>
                <span>{t("es.syncButton")}</span>
              </button>
            </div>

            {/* Live Connection state */}
            {syncState.message && (
              <div
                className={`p-2 rounded-lg text-[10.5px] font-medium leading-relaxed border ${
                  syncState.status === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                    : syncState.status === "error"
                      ? "bg-amber-50 text-amber-850 border-amber-100"
                      : "bg-indigo-50 text-indigo-900 border-indigo-100"
                }`}
              >
                <span className="font-extrabold block">{t("es.connectionStatus")}</span>
                {syncState.message}
              </div>
            )}

            <div className="text-[10px] text-slate-550 leading-normal bg-slate-50 p-2.5 rounded-lg border border-slate-150">
              <span className="font-extrabold text-slate-700 block mb-0.5">
                🚀 {t("es.prodConnection")}
              </span>
              {t("es.prodDesc")}
            </div>
          </div>

          {/* Export card widget */}
          <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Download size={13} className="text-indigo-600" /> {t("es.exportTitle")}
            </h3>

            <div className="space-y-1.5">
              <button
                onClick={exportMonthlySummary}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-900 rounded-lg text-xs font-bold border border-slate-201 hover:border-indigo-200 transition cursor-pointer text-left"
              >
                <span>{t("es.monthlySummary")}</span>
                <span className="font-mono text-[8px] px-1.5 py-0.5 bg-white text-slate-400 border border-slate-100 rounded">
                  {t("common.csv")}
                </span>
              </button>

              <button
                onClick={exportDepartmentSummary}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-900 rounded-lg text-xs font-bold border border-slate-201 hover:border-indigo-200 transition cursor-pointer text-left"
              >
                <span>{t("es.staffSummary")}</span>
                <span className="font-mono text-[8px] px-1.5 py-0.5 bg-white text-slate-400 border border-slate-100 rounded">
                  {t("common.csv")}
                </span>
              </button>

              <button
                onClick={exportAccountSummary}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-900 rounded-lg text-xs font-bold border border-slate-201 hover:border-indigo-200 transition cursor-pointer text-left"
              >
                <span>{t("es.channelSummary")}</span>
                <span className="font-mono text-[8px] px-1.5 py-0.5 bg-white text-slate-400 border border-slate-100 rounded">
                  {t("common.csv")}
                </span>
              </button>
            </div>

            <div className="pt-1.5">
              <button
                onClick={handlePrint}
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Printer size={12} />
                <span>{t("es.printReport")}</span>
              </button>
            </div>
          </div>

          {/* Role management switcher card */}
          <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User size={13} className="text-indigo-650" /> {t("es.roleSwitcher")}
            </h3>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t("es.roleDesc")}
            </p>

            <div className="grid grid-cols-2 gap-1.5">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setCurrentUser({ ...currentUser, role })}
                  className={`p-1.5 rounded-lg text-xs font-extrabold transition text-center border cursor-pointer
                    ${
                      currentUser.role === role
                        ? "bg-slate-900 text-white border-slate-950 font-black shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-201 hover:bg-slate-100"
                    }`}
                >
                  {t("role." + role)}
                </button>
              ))}
            </div>

            <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[10px] text-indigo-900 leading-relaxed space-y-1">
              <span className="font-bold flex items-center gap-1">
                <ShieldAlert size={11} className="text-indigo-650" />
                {t("es.activePermissions")}
              </span>
              {currentUser.role === "Admin" && (
                <span className="block text-[9px] text-indigo-950 font-bold">
                  {t("es.adminPerms")}
                </span>
              )}
              {currentUser.role === "Manager" && (
                <span className="block text-[9px] text-indigo-950 font-bold font-medium">
                  {t("es.managerPerms")}
                </span>
              )}
              {currentUser.role === "Staff" && (
                <span className="block text-[9px] text-[10px] text-indigo-950 font-bold font-medium">
                  {t("es.staffPerms")}
                </span>
              )}
              {currentUser.role === "Viewer" && (
                <span className="block text-[9px] text-slate-600 font-bold font-medium">
                  {t("es.viewerPerms")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Column Right: Settings targets */}
        <div className="md:col-span-2 space-y-4">
          {/* Targets config editor */}
          <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sliders size={13} className="text-indigo-600" /> {t("es.targetsTitle")}
            </h3>

            <p className="text-[11px] text-slate-500">
              {t("es.targetsDesc")}
            </p>

            {settingsSaved && (
              <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-150 text-[11px] font-bold rounded-lg flex items-center gap-1.5">
                <Sparkles size={12} className="text-emerald-500 animate-spin" />{" "}
                {t("es.targetsSaved")}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  {t("es.targetLeads")}
                </label>
                <input
                  type="number"
                  value={targetLeads}
                  onChange={(e) =>
                    setTargetLeads(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full text-xs p-2.5 border border-slate-250 bg-white text-slate-805 rounded-lg focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  {t("es.targetReach")}
                </label>
                <input
                  type="number"
                  value={targetReach}
                  onChange={(e) =>
                    setTargetReach(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full text-xs p-2.5 border border-slate-250 bg-white text-slate-805 rounded-lg focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  {t("es.targetViews")}
                </label>
                <input
                  type="number"
                  value={targetViews}
                  onChange={(e) =>
                    setTargetViews(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full text-xs p-2.5 border border-slate-250 bg-white text-slate-805 rounded-lg focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  {t("es.targetGrowth")}
                </label>
                <input
                  type="number"
                  value={targetGrowth}
                  onChange={(e) =>
                    setTargetGrowth(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full text-xs p-2.5 border border-slate-250 bg-white text-slate-805 rounded-lg focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  {t("es.targetStories")}
                </label>
                <input
                  type="number"
                  value={targetStories}
                  onChange={(e) =>
                    setTargetStories(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full text-xs p-2.5 border border-slate-250 bg-white text-slate-805 rounded-lg focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  {t("es.targetPR")}
                </label>
                <input
                  type="number"
                  value={targetPR}
                  onChange={(e) =>
                    setTargetPR(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full text-xs p-2.5 border border-slate-250 bg-white text-slate-805 rounded-lg focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-100 font-mono font-bold"
                />
              </div>
            </div>

            <div className="pt-2 text-right">
              {currentUser.role === "Staff" || currentUser.role === "Viewer" ? (
                <span className="text-[10px] text-slate-400 font-bold font-mono">
                  {t("es.restricted")}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveTargets}
                  className="py-1.5 px-3 bg-indigo-650 hover:bg-indigo-700 bg-indigo-600 rounded-lg text-xs font-bold text-white shadow-xs transition cursor-pointer"
                >
                  {t("es.saveTargets")}
                </button>
              )}
            </div>
          </div>

          {/* Google Apps Script Integration details */}
          <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-100 font-display">
                <Code size={13} className="text-indigo-400" /> {t("es.scriptTitle")}
              </h3>
              <button
                type="button"
                onClick={handleCopyScript}
                className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border border-slate-700/60"
              >
                {copiedScript ? (
                  <Check size={11} className="text-emerald-400" />
                ) : (
                  <Copy size={11} />
                )}
                <span>{copiedScript ? t("common.copied") : t("common.copy")}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t("es.scriptDesc")}
            </p>

            <div className="relative">
              <textarea
                readOnly
                value={gsCode}
                className="w-full h-32 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[9px] text-slate-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="text-[9px] bg-slate-800/40 p-2 rounded-lg text-indigo-300 leading-relaxed font-mono">
              ★ {t("es.scriptStatus")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
