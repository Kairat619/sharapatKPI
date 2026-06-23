import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import DailyReportView from "./components/DailyReportView";
import AccountAnalyticsView from "./components/AccountAnalyticsView";
import LeaderboardView from "./components/LeaderboardView";
import RevenueAnalyticsView from "./components/RevenueAnalyticsView";
import ExportSettingsView from "./components/ExportSettingsView";
import {
  DailyReport,
  KpiTargets,
  AccountAssignment,
  UserSession,
  UserRole,
  RolePasswords,
} from "./types";
import {
  DEFAULT_TARGETS,
  DEFAULT_ASSIGNMENTS,
  generateSeedReports,
} from "./utils";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useLanguage, languages } from "./i18n/LanguageContext";

export default function App() {
  const { t, lang, setLang } = useLanguage();
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const defaultPasswords: RolePasswords = { Admin: "admin", Manager: "manager", Staff: "staff" };
  const [rolePasswords, setRolePasswords] = useState<RolePasswords>(() => {
    try {
      const stored = localStorage.getItem("sharapat_v2_role_passwords");
      if (stored) return JSON.parse(stored);
    } catch {}
    localStorage.setItem("sharapat_v2_role_passwords", JSON.stringify(defaultPasswords));
    return defaultPasswords;
  });

  // Login form state
  const [loginRole, setLoginRole] = useState<UserRole>("Admin");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // App Session User
  const [user, setUser] = useState<UserSession>({
    email: "admin@sharapat.kz",
    name: "Director Sharapat",
    role: "Admin",
  });

  // State management for reports, targets, assignments
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [targets, setTargets] = useState<KpiTargets>(DEFAULT_TARGETS);
  const [assignments, setAssignments] =
    useState<AccountAssignment[]>(DEFAULT_ASSIGNMENTS);

  // Live Google Sheets Web App Connection state variables
  const [sheetUrl, setSheetUrl] = useState<string>(
    localStorage.getItem("sharapat_v2_sheet_url") ||
      "https://script.google.com/macros/s/AKfycbwNYjhD23ejKl8jLWzk6btj7Y4z6Cm-538sNQh6LyJ8C55UwXPezAcVG1mJlq2VUsw/exec",
  );
  const [syncState, setSyncState] = useState<{
    status: "idle" | "syncing" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  // Load state from localStorage on init
  useEffect(() => {
    // 1. Reports loading or seed generation fallback
    const localReports = localStorage.getItem("sharapat_v2_reports");
    if (localReports) {
      try {
        setReports(JSON.parse(localReports));
      } catch (e) {
        console.error("Failed loading local reports", e);
        const seeds = generateSeedReports();
        setReports(seeds);
        localStorage.setItem("sharapat_v2_reports", JSON.stringify(seeds));
      }
    } else {
      const seeds = generateSeedReports();
      setReports(seeds);
      localStorage.setItem("sharapat_v2_reports", JSON.stringify(seeds));
    }

    // 2. Targets loading
    const localTargets = localStorage.getItem("sharapat_v2_targets");
    if (localTargets) {
      try {
        setTargets(JSON.parse(localTargets));
      } catch (e) {}
    }

    // 3. Assignments loading
    const localAssignments = localStorage.getItem("sharapat_v2_assignments");
    if (localAssignments) {
      try {
        setAssignments(JSON.parse(localAssignments));
      } catch (e) {}
    }
  }, []);

  // Fetch / Sync live reports from Google Sheets
  const handlePullData = async (urlToUse: string = sheetUrl) => {
    if (!urlToUse) return;
    setSyncState({
      status: "syncing",
      message: t("app.fetchingReports"),
    });
    try {
      const response = await fetch(`${urlToUse}?action=getReports`, {
        redirect: "follow",
      });
      if (!response.ok)
        throw new Error(`HTTP Error Status: ${response.status}`);
      const data = await response.json();

      if (data && Array.isArray(data)) {
        const mapped: DailyReport[] = data.map((row) => ({
          id: String(row.id || ""),
          date: String(row.date || "").split("T")[0],
          platform: row.platform === "TikTok" ? "TikTok" : "Instagram",
          account: String(row.account || ""),
          marketer: String(row.marketer || ""),
          smm: String(row.smmspecialist || row.smm || ""),
          videographer: String(row.videographer || ""),
          postingTime: String(row.postingtime || row.postingTime || ""),
          reach: Number(row.reach || 0),
          views: Number(row.views || 0),
          likes: Number(row.likes || 0),
          comments: Number(row.comments || 0),
          saves: Number(row.saves || 0),
          leads: Number(row.leads || 0),
          stories: Number(row.stories || 0),
          posts: Number(row.posts || 0),
          reels: Number(row.reels || 0),
          followersStart: Number(row.followersstart || row.followersStart || 0),
          followersEnd: Number(row.followersend || row.followersEnd || 0),
          followerGrowth: Number(row.followergrowth || row.followerGrowth || 0),
          contentHours: Number(row.contenthours || row.contentHours || 0),
          adCost: Number(row.adcost || row.adCost || 0),
          orders: Number(row.orders || 0),
          salesAmount: Number(row.salesamount || row.salesAmount || 0),
          notes: String(row.notes || ""),
          conversionRate: Number(row.conversionrate || row.conversionRate || 0),
          costPerLead: Number(row.costperlead || row.costPerLead || 0),
          roas: Number(row.roas || 0),
          kpiScore: Number(row.kpiscore || row.kpiScore || 0),
          kpiStatus: (row.kpistatus || row.kpiStatus || "Poor") as any,
        }));

        // Sort newest first
        mapped.sort((a, b) => b.date.localeCompare(a.date));

        setReports(mapped);
        localStorage.setItem("sharapat_v2_reports", JSON.stringify(mapped));
        setSyncState({
          status: "success",
          message: t("app.connected", { count: mapped.length }),
        });
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error(t("app.invalidSheet"));
      }

      // Fetch accompanying KPI targets configurations
      const targetResp = await fetch(`${urlToUse}?action=getTargets`, {
        redirect: "follow",
      });
      if (targetResp.ok) {
        const tObj = await targetResp.json();
        if (tObj && !tObj.error) {
          const loadedT: KpiTargets = {
            leads: Number(tObj.leads || DEFAULT_TARGETS.leads),
            reach: Number(tObj.reach || DEFAULT_TARGETS.reach),
            views: Number(tObj.views || DEFAULT_TARGETS.views),
            followerGrowth: Number(
              tObj.followerGrowth || DEFAULT_TARGETS.followerGrowth,
            ),
            stories: Number(tObj.stories || DEFAULT_TARGETS.stories),
            postsAndReels: Number(
              tObj.postsAndReels || DEFAULT_TARGETS.postsAndReels,
            ),
          };
          setTargets(loadedT);
          localStorage.setItem("sharapat_v2_targets", JSON.stringify(loadedT));
        }
      }
    } catch (err: any) {
      console.warn("Failed syncing with Sheets. Running with local cache", err);
      setSyncState({
        status: "error",
        message: t("app.offlineCache", { error: err.message || "CORS or spreadsheet restriction" }),
      });
    }
  };

  // Pull on boot once
  useEffect(() => {
    if (sheetUrl) {
      handlePullData(sheetUrl);
    }
  }, [sheetUrl]);

  // Save updates helper (Pushes to Sheets if URL exists, falls back to offline storage)
  const handleSaveReport = async (newReport: DailyReport) => {
    setSyncState({
      status: "syncing",
      message: t("app.savingReport"),
    });

    // Instantly append locally first
    const updatedLocally = [newReport, ...reports];
    setReports(updatedLocally);
    localStorage.setItem("sharapat_v2_reports", JSON.stringify(updatedLocally));

    if (sheetUrl) {
      try {
        const response = await fetch(sheetUrl, {
          method: "POST",
          redirect: "follow",
          body: JSON.stringify({
            action: "submitReport",
            report: newReport,
            userEmail: user.email,
          }),
        });

        if (!response.ok)
          throw new Error(`HTTP Error Status: ${response.status}`);
        const result = await response.json();

        if (result && result.success) {
          // Replace locally with calculated fields from Sheets
          const sheetReport: DailyReport = {
            ...newReport,
            id: result.id || newReport.id,
            kpiScore: result.kpiScore ?? newReport.kpiScore,
            kpiStatus: result.kpiStatus ?? newReport.kpiStatus,
            followerGrowth: result.followerGrowth ?? newReport.followerGrowth,
          };

          const filtered = updatedLocally.filter((r) => r.id !== newReport.id);
          const finalReportList = [sheetReport, ...filtered];
          setReports(finalReportList);
          localStorage.setItem(
            "sharapat_v2_reports",
            JSON.stringify(finalReportList),
          );

          setSyncState({
            status: "success",
            message: t("app.syncSuccess"),
          });
        } else if (result && result.error) {
          throw new Error(result.error);
        } else {
          throw new Error("Invalid format returned by connector");
        }
      } catch (err: any) {
        console.warn(
          "Could not post live to Google Sheet. Stored safely in offline memory",
          err,
        );
        setSyncState({
          status: "error",
          message: t("app.localOnly", { error: err.message || "check authorization" }),
        });
      }
    } else {
      setSyncState({ status: "idle", message: t("app.localCache") });
    }

    setCurrentTab("dashboard"); // return to dashboard view
  };

  const handleUpdateTargets = async (newTargets: KpiTargets) => {
    setTargets(newTargets);
    localStorage.setItem("sharapat_v2_targets", JSON.stringify(newTargets));

    if (sheetUrl) {
      setSyncState({
        status: "syncing",
        message: t("app.syncingTargets"),
      });
      try {
        const response = await fetch(sheetUrl, {
          method: "POST",
          redirect: "follow",
          body: JSON.stringify({
            action: "updateTargets",
            targets: newTargets,
            userEmail: user.email,
          }),
        });
        if (response.ok) {
          const res = await response.json();
          if (res && res.success) {
            setSyncState({
              status: "success",
              message: t("app.targetsSynced"),
            });
          } else {
            throw new Error(res.error || "sheet returned error status");
          }
        } else {
          throw new Error("network response error");
        }
      } catch (e: any) {
        setSyncState({
          status: "error",
          message: t("app.targetsLocal", { error: e.message || "offline" }),
        });
      }
    }
  };

  const handleUpdateAssignments = (newAssigns: AccountAssignment[]) => {
    setAssignments(newAssigns);
    localStorage.setItem("sharapat_v2_assignments", JSON.stringify(newAssigns));
  };

  // Sign out handler (takes them back to styled Google login screen)
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleLogin = () => {
    if (!loginPassword.trim()) {
      setLoginError(t("auth.passwordRequired"));
      return;
    }
    const expected = rolePasswords[loginRole];
    if (loginPassword !== expected) {
      setLoginError(t("auth.invalidPassword"));
      return;
    }
    setUser({
      email: loginRole === "Staff"
        ? "staff@sharapat.kz"
        : loginRole === "Manager"
          ? "manager@sharapat.kz"
          : "admin@sharapat.kz",
      name:
        loginRole === "Staff"
          ? "Aidana SMM Lead"
          : loginRole === "Manager"
            ? "Executive Director"
            : "Director Sharapat",
      role: loginRole,
    });
    setIsAuthenticated(true);
    setCurrentTab(loginRole === "Staff" ? "daily-report" : loginRole === "Manager" ? "account-analytics" : "dashboard");
    setLoginPassword("");
    setLoginError("");
  };

  const handleUpdateRolePasswords = (newPasswords: RolePasswords) => {
    setRolePasswords(newPasswords);
    localStorage.setItem("sharapat_v2_role_passwords", JSON.stringify(newPasswords));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      {!isAuthenticated ? (
        // Styled Google Authenticator Portal screen
        <div className="flex-1 min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white select-none">
          <div className="w-full max-w-sm bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-5 text-center animate-fade-in">
            <div>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-300 font-bold tracking-widest px-3 py-1 rounded-full uppercase border border-indigo-500/20">
                {t("auth.badge")}
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight mt-4 font-display">
                {t("auth.title")}
              </h1>
              <p className="text-xs text-slate-400 mt-2">
                {t("auth.subtitle")}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="text-left">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {t("auth.selectRole")}
                </label>
                <select
                  value={loginRole}
                  onChange={(e) => setLoginRole(e.target.value as UserRole)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-bold focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="Admin">{t("auth.roleAdmin")}</option>
                  <option value="Manager">{t("auth.roleManager")}</option>
                  <option value="Staff">{t("auth.roleStaff")}</option>
                </select>
              </div>

              <div className="text-left">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {t("auth.password")}
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder={t("auth.passwordPlaceholder")}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-bold focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>

              {loginError && (
                <p className="text-[10px] text-red-400 font-bold text-left">{loginError}</p>
              )}

              <button
                onClick={handleLogin}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black text-white flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ArrowRight size={14} />
                {t("auth.signIn")}
              </button>
            </div>

            <div className="border-t border-slate-800 pt-4 text-[9px] text-slate-500 leading-relaxed font-mono flex items-center justify-center gap-1">
              <Lock size={9} /> {t("auth.footer")}
            </div>
          </div>
        </div>
      ) : (
        // Authenticated Console
        <>
          {/* Navigation Drawer */}
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            user={user}
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            onLogout={handleLogout}
          />

          {/* Main Work Content Area Wrapper */}
          <div className="flex-1 flex flex-col min-w-0" id="main-content-area">
            {/* Global Platform Top Header ribbon bar */}
            <header className="bg-white border-b border-slate-200 h-16 px-6 md:px-8 flex items-center justify-between shadow-sm sticky top-0 z-30">
              <div className="flex items-center gap-3">
                {/* Empty gap spacing on mobile to prevent overlay with sidebar toggle */}
                <div className="w-8 md:hidden"></div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded font-mono border border-indigo-100 uppercase tracking-widest font-bold">
                    {t("header.liveUpdates")}
                  </span>
                  <span className="text-xs text-slate-350 hidden sm:inline">
                    |
                  </span>
                  <span className="text-xs text-slate-600 font-bold truncate hidden sm:inline">
                    {t("header.workAccount")}{" "}
                    <strong className="text-slate-900 font-extrabold">
                      {user.name}
                    </strong>{" "}
                    ({t(`role.${user.role}`)})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                {/* Language Switcher */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                        lang === l.code
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                <div className="bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-100 rounded-lg p-2 font-bold text-indigo-700 flex items-center gap-1.5 transition">
                  <ShieldCheck size={14} className="text-indigo-600" />
                  <span className="text-[10px] uppercase tracking-wider hidden md:inline">
                    {t("header.permissionsOk")}
                  </span>
                </div>
              </div>
            </header>

            {/* Dynamic Render Frame based on currentTab state */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
              {/* Dashboard Tab view */}
              {currentTab === "dashboard" && (
                <DashboardView reports={reports} />
              )}

              {/* Daily Report Input view */}
              {currentTab === "daily-report" && (
                <DailyReportView
                  onSaveReport={handleSaveReport}
                  lastReport={reports[0] || null}
                  targets={targets}
                  assignments={assignments}
                  currentUser={user}
                />
              )}

              {/* Dedicated Account Analytics Channels view */}
              {currentTab === "account-analytics" && (
                <AccountAnalyticsView
                  reports={reports}
                  assignments={assignments}
                />
              )}

              {/* Staff Leaderboard ranking view */}
              {currentTab === "leaderboard" && (
                <LeaderboardView reports={reports} />
              )}

              {/* Financial profit and ROAS analytics view */}
              {currentTab === "revenue" && (
                <RevenueAnalyticsView reports={reports} />
              )}

              {/* Target configurations & GS code copy view */}
              {currentTab === "export-settings" && (
                <ExportSettingsView
                  targets={targets}
                  setTargets={handleUpdateTargets}
                  assignments={assignments}
                  setAssignments={handleUpdateAssignments}
                  currentUser={user}
                  setCurrentUser={setUser}
                  reports={reports}
                  sheetUrl={sheetUrl}
                  setSheetUrl={setSheetUrl}
                  syncState={syncState}
                  onPullData={() => handlePullData(sheetUrl)}
                  rolePasswords={rolePasswords}
                  onUpdateRolePasswords={handleUpdateRolePasswords}
                />
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
}
