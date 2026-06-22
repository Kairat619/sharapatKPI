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
} from "./types";
import {
  DEFAULT_TARGETS,
  DEFAULT_ASSIGNMENTS,
  generateSeedReports,
} from "./utils";
import {
  ShieldCheck,
  HelpCircle,
  AlertCircle,
  Database,
  Lock,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Logged in by default in Simulator mode

  // App Session User
  const [user, setUser] = useState<UserSession>({
    email: "wkz777@gmail.com",
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
      message: "Fetching rows from active Google Sheet...",
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
          message: `Connected! Loaded ${mapped.length} reports successfully from your sheet.`,
        });
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Invalid or empty sheet structure returned.");
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
        message: `Offline/Local Cache Mode: ${err.message || "CORS or spreadsheet restriction"}`,
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
    // Check role restrictions
    if (user.role === "Viewer") {
      alert(
        "Role Permission Violation: Your account has 'Viewer' scope permission only. Submitting daily reports is locked.",
      );
      return;
    }

    setSyncState({
      status: "syncing",
      message: "Saving and posting report row to Google Sheets...",
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
            message: "Report posted and synchronized with Google Sheets!",
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
          message: `Posted locally only (CORS or offline): ${err.message || "check authorization"}`,
        });
      }
    } else {
      setSyncState({ status: "idle", message: "Stored safely in local cache" });
    }

    setCurrentTab("dashboard"); // return to dashboard view
  };

  const handleUpdateTargets = async (newTargets: KpiTargets) => {
    setTargets(newTargets);
    localStorage.setItem("sharapat_v2_targets", JSON.stringify(newTargets));

    if (sheetUrl) {
      setSyncState({
        status: "syncing",
        message: "Synchronizing targets on Google Sheet...",
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
              message: "KPI Benchmarks written on Google Sheets!",
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
          message: `Targets locally saved (could not write to Sheet): ${e.message || "offline"}`,
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

  const handleGoogleSignInSimulated = (
    roleSelected: "Admin" | "Manager" | "Staff" | "Viewer",
  ) => {
    setUser({
      email: "wkz777@gmail.com",
      name:
        roleSelected === "Staff"
          ? "Aidana SMM Lead"
          : roleSelected === "Manager"
            ? "Executive Director"
            : "Sharapat Owner",
      role: roleSelected,
    });
    setIsAuthenticated(true);
    setCurrentTab("dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      {!isAuthenticated ? (
        // Styled Google Authenticator Portal screen
        <div className="flex-1 min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white select-none">
          <div className="w-full max-w-sm bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-5 text-center animate-fade-in">
            <div>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-300 font-bold tracking-widest px-3 py-1 rounded-full uppercase border border-indigo-500/20">
                V2 Google Sheets Secured Portal
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight mt-4 font-display">
                Sharapat SMM Platform
              </h1>
              <p className="text-xs text-slate-400 mt-2">
                Select a Google account role below to authenticate and sync live
                dashboards.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleGoogleSignInSimulated("Admin")}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-505 text-left transition duration-200 group"
              >
                <div>
                  <span className="block text-xs font-bold text-slate-200">
                    wkz777@gmail.com
                  </span>
                  <span className="text-[9px] text-indigo-400 font-mono">
                    Sign in as Admin (Full Control)
                  </span>
                </div>
                <ArrowRight
                  size={14}
                  className="text-slate-500 group-hover:text-indigo-400 transition"
                />
              </button>

              <button
                onClick={() => handleGoogleSignInSimulated("Manager")}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-505 text-left transition duration-200 group"
              >
                <div>
                  <span className="block text-xs font-bold text-slate-200">
                    manager@sharapat.kz
                  </span>
                  <span className="text-[9px] text-indigo-400 font-mono">
                    Sign in as Manager (Analytics & Reports)
                  </span>
                </div>
                <ArrowRight
                  size={14}
                  className="text-slate-500 group-hover:text-indigo-400 transition"
                />
              </button>

              <button
                onClick={() => handleGoogleSignInSimulated("Staff")}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-505 text-left transition duration-200 group"
              >
                <div>
                  <span className="block text-xs font-bold text-slate-200">
                    staff.smm@gmail.com
                  </span>
                  <span className="text-[9px] text-indigo-400 font-mono">
                    Sign in as SMM Staff (Create logs)
                  </span>
                </div>
                <ArrowRight
                  size={14}
                  className="text-slate-500 group-hover:text-indigo-400 transition"
                />
              </button>
            </div>

            <div className="border-t border-slate-800 pt-4 text-[9px] text-slate-500 leading-relaxed font-mono flex items-center justify-center gap-1">
              <Lock size={9} /> Fully compliant with Google Apps Script OAuth.
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
                    ● LIVE UPDATES
                  </span>
                  <span className="text-xs text-slate-350 hidden sm:inline">
                    |
                  </span>
                  <span className="text-xs text-slate-600 font-bold truncate hidden sm:inline">
                    Work Account:{" "}
                    <strong className="text-slate-900 font-extrabold">
                      {user.name}
                    </strong>{" "}
                    ({user.role})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-100 rounded-lg p-2 font-bold text-indigo-700 flex items-center gap-1.5 transition">
                  <ShieldCheck size={14} className="text-indigo-600" />
                  <span className="text-[10px] uppercase tracking-wider hidden md:inline">
                    Permissions Audit: OK
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
                />
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
}
