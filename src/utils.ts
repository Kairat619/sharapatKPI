import { DailyReport, KpiTargets, AccountAssignment, AuditLog, UserRole } from './types';

// Default targets for KPI calculation
export const DEFAULT_TARGETS: KpiTargets = {
  leads: 30,
  reach: 8000,
  views: 15000,
  followerGrowth: 50,
  stories: 6,
  postsAndReels: 2,
};

// Default account assignments
export const DEFAULT_ASSIGNMENTS: AccountAssignment[] = [
  {
    accountName: 'Шарапат күмістері',
    marketer: 'Aidana',
    smm: 'Aruzhan',
    videographer: 'Erlan',
  },
  {
    accountName: 'Шарапат бренд',
    marketer: 'Dana',
    smm: 'Aigerim',
    videographer: 'Nursultan',
  },
  {
    accountName: 'Қыззат сәуле',
    marketer: 'Aidana',
    smm: 'Aigerim',
    videographer: 'Erlan',
  },
  {
    accountName: 'Насыпхан Рахман',
    marketer: 'Dana',
    smm: 'Aruzhan',
    videographer: 'Nursultan',
  },
];

// Helper to calculate single report calculated fields
export function calculateReportFields(
  report: Omit<DailyReport, 'followerGrowth' | 'conversionRate' | 'costPerLead' | 'roas' | 'kpiScore' | 'kpiStatus'>,
  targets: KpiTargets = DEFAULT_TARGETS
): DailyReport {
  const followerGrowth = report.followersEnd - report.followersStart;
  
  const conversionRate = report.leads > 0 ? (report.orders / report.leads) * 100 : 0;
  const costPerLead = report.leads > 0 ? (report.adCost / report.leads) : 0;
  const roas = report.adCost > 0 ? (report.salesAmount / report.adCost) : 0;

  // KPI Calculations (capped at 1.2 / 120% per metric for exceptional performance, but final is normalized)
  const leadRatio = Math.min(1.2, Math.max(0, report.leads / (targets.leads || 1)));
  const reachRatio = Math.min(1.2, Math.max(0, report.reach / (targets.reach || 1)));
  const viewsRatio = Math.min(1.2, Math.max(0, report.views / (targets.views || 1)));
  const growthRatio = Math.min(1.2, Math.max(0, followerGrowth / (targets.followerGrowth || 1)));
  const storiesRatio = Math.min(1.2, Math.max(0, report.stories / (targets.stories || 1)));
  const contentItems = report.posts + report.reels;
  const prRatio = Math.min(1.2, Math.max(0, contentItems / (targets.postsAndReels || 1)));

  // Weights: Lead=30%, Reach=20%, Views=15%, Follower Growth=15%, Stories=10%, Posts+Reels=10%
  const score = (leadRatio * 30) + (reachRatio * 20) + (viewsRatio * 15) + (growthRatio * 15) + (storiesRatio * 10) + (prRatio * 10);
  
  // Normalizing to 100 max cap
  const kpiScore = Math.min(100, Math.round(score));

  let kpiStatus: 'Excellent' | 'Good' | 'Average' | 'Poor' = 'Poor';
  if (kpiScore >= 90) kpiStatus = 'Excellent';
  else if (kpiScore >= 75) kpiStatus = 'Good';
  else if (kpiScore >= 50) kpiStatus = 'Average';

  return {
    ...report,
    followerGrowth,
    conversionRate,
    costPerLead,
    roas,
    kpiScore,
    kpiStatus,
  } as DailyReport;
}

// Generate last 21 days seed reports up to June 21, 2026
export function generateSeedReports(): DailyReport[] {
  const reports: DailyReport[] = [];
  const platforms = ['Instagram', 'TikTok'] as const;
  const assignments = DEFAULT_ASSIGNMENTS;
  
  const currentDate = new Date('2026-06-21');
  
  // Generate reports for the last 15 days
  for (let i = 14; i >= 0; i--) {
    const dataDate = new Date(currentDate);
    dataDate.setDate(currentDate.getDate() - i);
    const dateStr = dataDate.toISOString().split('T')[0];
    
    assignments.forEach((assign, index) => {
      // Rotate platforms
      const platform = platforms[(index + i) % 2];
      
      // Dynamic base metrics based on account for realistic analytics
      let baseReach = 5000 + (index * 2000) + Math.floor(Math.sin(i) * 1500);
      let baseViews = 10000 + (index * 3000) + Math.floor(Math.cos(i) * 4000);
      let baseLeads = 15 + (index * 10) + Math.floor(Math.sin(i * 2) * 8);
      let baseAdCost = 40 + (index * 20) + Math.floor(Math.cos(i) * 15);
      let baseOrders = Math.round(baseLeads * (0.15 + (index * 0.05)));
      let baseSales = baseOrders * (25000 + Math.floor(Math.sin(i) * 4000)); // in KZT or local currency
      
      if (assign.accountName === 'Шарапат күмістері') {
        baseReach = 11000 + Math.floor(Math.cos(i) * 2000);
        baseViews = 19000 + Math.floor(Math.sin(i) * 3500);
        baseLeads = 35 + Math.floor(Math.sin(i * 1.5) * 10);
        baseSales = baseLeads * 0.22 * 28000;
        baseAdCost = 75;
      } else if (assign.accountName === 'Шарапат бренд') {
        baseReach = 9500 + Math.floor(Math.sin(i) * 1800);
        baseViews = 16000 + Math.floor(Math.cos(i) * 3000);
        baseLeads = 28 + Math.floor(Math.sin(i) * 7);
        baseSales = baseLeads * 0.18 * 32000;
        baseAdCost = 60;
      }
      
      const stFollowers = 45000 + (index * 12000) + (14 - i) * 150;
      const endFollowers = stFollowers + 40 + Math.floor(Math.sin(i) * 35);
      
      const rawReport = {
        id: `seed-${dateStr}-${assign.accountName.substring(0,3)}-${platform}`,
        date: dateStr,
        platform,
        account: assign.accountName,
        marketer: assign.marketer,
        smm: assign.smm,
        videographer: assign.videographer,
        postingTime: `${11 + (index % 3) * 3}:00`,
        reach: Math.max(500, baseReach),
        views: Math.max(1000, baseViews),
        likes: Math.max(50, Math.round(baseReach * 0.08)),
        comments: Math.max(5, Math.round(baseReach * 0.006)),
        saves: Math.max(10, Math.round(baseViews * 0.008)),
        leads: Math.max(1, baseLeads),
        stories: 4 + (i % 4),
        posts: 1 + (i % 2),
        reels: (i % 2 === 0) ? 1 : 0,
        followersStart: stFollowers,
        followersEnd: endFollowers,
        contentHours: 1.5 + (index * 0.5),
        adCost: Math.max(10, baseAdCost),
        orders: Math.max(0, baseOrders),
        salesAmount: Math.max(0, baseSales),
        notes: `Отчет за ${dateStr} - автоматическая симуляция под v2`,
      };
      
      reports.push(calculateReportFields(rawReport, DEFAULT_TARGETS));
    });
  }
  
  return reports;
}

// Generate standard format files for Google Apps Script Code
export function getAppsScriptCode(): string {
  return `/**
 * Sharapat SMM & Marketing KPI Platform v2
 * Google Apps Script Cloud Database Engine
 * Place this in Extensions > Apps Script in your Google Sheet
 */

const DAILY_REPORTS_SHEET = "DailyReports";
const SETTINGS_SHEET = "Settings";
const AUDIT_LOGS_SHEET = "AuditLogs";

/**
 * Handles incoming JSON API requests & defaults to status display
 */
function doGet(e) {
  initializeSheets();
  const action = e && e.parameter && e.parameter.action;
  
  if (action === "getReports") {
    const data = getReports();
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "getTargets") {
    const data = getTargetsFromSheet();
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Default HTML dashboard info for manual checks
  const html = \`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sharapat SMM KPI Connector</title>
      <style>
        body { font-family: -apple-system, sans-serif; padding: 40px; text-align: center; color: #1e293b; background: #f8fafc; }
        .card { max-width: 500px; margin: auto; background: white; padding: 30.5px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        h1 { color: #4f46e5; margin-bottom: 5px; font-size: 24px; font-weight: 800; }
        p { font-size: 14px; color: #64748b; line-height: 1.6; }
        .badge { display: inline-block; padding: 6px 12px; background: #ecfdf5; color: #047857; font-weight: bold; font-size: 11px; border-radius: 100px; text-transform: uppercase; margin-top: 15px; border: 1px solid #a7f3d0; }
        .test-box { margin-top: 20px; font-family: monospace; font-size: 11px; background: #1e293b; color: #f8fafc; padding: 12px; border-radius: 6px; text-align: left; overflow-x: auto; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Sharapat SMM KPI Connector Active</h1>
        <p>Your Google Apps Script database connector is successfully deployed as a Web App and ready to synchronize with our production portal.</p>
        <span class="badge">● Connection Status: ONLINE</span>
        <div class="test-box">
          API Endpoint Test URLs:<br/>
          &bull; Pull Reports: ?action=getReports<br/>
          &bull; Pull Targets: ?action=getTargets
        </div>
      </div>
    </body>
    </html>
  \`;
  return HtmlService.createHtmlOutput(html)
    .setTitle('Sharapat SMM KPI Portal v2')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Handles write and modification operations from React application
 */
function doPost(e) {
  initializeSheets();
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    
    if (action === "submitReport") {
      const result = submitReport(postData.report, postData.userEmail);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "updateTargets") {
      const result = updateTargetsInSheet(postData.targets, postData.userEmail);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: "Invalid action: " + action }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Create sheets under Google Sheets if they don't exist
 */
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Daily Reports Sheet Setup
  let reportsSheet = ss.getSheetByName(DAILY_REPORTS_SHEET);
  if (!reportsSheet) {
    reportsSheet = ss.insertSheet(DAILY_REPORTS_SHEET);
    const headers = [
      "ID", "Date", "Platform", "Account", "Marketer", "SMM Specialist", "Videographer",
      "Posting Time", "Reach", "Views", "Likes", "Comments", "Saves", "Leads", "Stories",
      "Posts", "Reels", "Followers Start", "Followers End", "Follower Growth", "Content Hours",
      "Ad Cost", "Orders", "Sales Amount", "Notes", "Conversion Rate", "Cost Per Lead",
      "ROAS", "KPI Score", "KPI Status"
    ];
    reportsSheet.appendRow(headers);
    reportsSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1e293b").setFontColor("#f8fafc");
  }
  
  // 2. Settings Sheet Setup
  let settingsSheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SETTINGS_SHEET);
    // Write Targets
    settingsSheet.getRange("A1:B1").setValues([["Setting Key", "Setting Value"]]).setFontWeight("bold");
    settingsSheet.appendRow(["TARGET_LEADS", "30"]);
    settingsSheet.appendRow(["TARGET_REACH", "8000"]);
    settingsSheet.appendRow(["TARGET_VIEWS", "15000"]);
    settingsSheet.appendRow(["TARGET_GROWTH", "50"]);
    settingsSheet.appendRow(["TARGET_STORIES", "6"]);
    settingsSheet.appendRow(["TARGET_PR", "2"]);
    
    // Write Default Account-Staff map template
    settingsSheet.getRange("D1:G1").setValues([["Account", "Marketer", "SMM Specialist", "Videographer"]]).setFontWeight("bold");
    settingsSheet.appendRow(["", "", "", ""]); // empty row separator
    const map = [
      ["Шарапат күмістері", "Aidana", "Aruzhan", "Erlan"],
      ["Шарапат бренд", "Dana", "Aigerim", "Nursultan"],
      ["Қыззат сәуле", "Aidana", "Aigerim", "Erlan"],
      ["Насыпхан Рахман", "Dana", "Aruzhan", "Nursultan"]
    ];
    for(let i=0; i<map.length; i++) {
       settingsSheet.getRange(i+9, 4, 1, 4).setValues([map[i]]);
    }
  }

  // 3. Audit Logs Setup
  let auditSheet = ss.getSheetByName(AUDIT_LOGS_SHEET);
  if (!auditSheet) {
    auditSheet = ss.insertSheet(AUDIT_LOGS_SHEET);
    const logHeaders = ["ID", "Timestamp", "User Email", "Action", "Details"];
    auditSheet.appendRow(logHeaders);
    auditSheet.getRange(1,1,1,logHeaders.length).setFontWeight("bold");
  }
}

/**
 * Fetch All Reports
 */
function getReports() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(DAILY_REPORTS_SHEET);
    if (!sheet) return [];
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    if (values.length <= 1) return [];
    
    const headers = values[0];
    const reports = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rep = {};
      headers.forEach((h, idx) => {
        // Clean key formatting to camelCase or direct lowercase matching
        const prop = h.toLowerCase().replace(/\\s+/g, '');
        rep[prop] = row[idx];
      });
      reports.push(rep);
    }
    return reports;
  } catch (err) {
    return { error: err.toString() };
  }
}

/**
 * Save KPI Target configurations
 */
function updateTargetsInSheet(targets, userEmail) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SETTINGS_SHEET);
    if (!sheet) return { error: "Settings sheet not found" };
    
    sheet.getRange("B2").setValue(Number(targets.leads));
    sheet.getRange("B3").setValue(Number(targets.reach));
    sheet.getRange("B4").setValue(Number(targets.views));
    sheet.getRange("B5").setValue(Number(targets.followerGrowth));
    sheet.getRange("B6").setValue(Number(targets.stories));
    sheet.getRange("B7").setValue(Number(targets.postsAndReels));
    
    logActivity("sys-cfg", userEmail || "unknown-manager", "UPDATE_TARGETS", JSON.stringify(targets));
    return { success: true };
  } catch(e) {
    return { error: e.toString() };
  }
}

/**
 * Submit report row
 */
function submitReport(reportData, userEmail) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(DAILY_REPORTS_SHEET);
    if (!sheet) initializeSheets();
    
    const id = "rep-" + Date.now() + Math.floor(Math.random() * 100);
    const dateFormatted = reportData.date || new Date().toISOString().split('T')[0];
    
    // Auto-calculates
    const followerGrowth = Number(reportData.followersEnd) - Number(reportData.followersStart);
    const conversionRate = reportData.leads > 0 ? (reportData.orders / reportData.leads) * 100 : 0;
    const costPerLead = reportData.leads > 0 ? (reportData.adCost / reportData.leads) : 0;
    const roas = reportData.adCost > 0 ? (reportData.salesAmount / reportData.adCost) : 0;
    
    // Targets
    const targets = getTargetsFromSheet();
    const leadRatio = Math.min(1.2, reportData.leads / targets.leads);
    const reachRatio = Math.min(1.2, reportData.reach / targets.reach);
    const viewsRatio = Math.min(1.2, reportData.views / targets.views);
    const growthRatio = Math.min(1.2, Math.max(0, followerGrowth) / targets.followerGrowth);
    const storiesRatio = Math.min(1.2, reportData.stories / targets.stories);
    const prRatio = Math.min(1.2, (reportData.posts + reportData.reels) / targets.postsAndReels);
    
    const kpiScore = Math.min(100, Math.round(
      (leadRatio * 30) + (reachRatio * 20) + (viewsRatio * 15) + (growthRatio * 15) + (storiesRatio * 10) + (prRatio * 10)
    ));
    
    let kpiStatus = "Poor";
    if (kpiScore >= 90) kpiStatus = "Excellent";
    else if (kpiScore >= 75) kpiStatus = "Good";
    else if (kpiScore >= 50) kpiStatus = "Average";
    
    const row = [
      id, dateFormatted, reportData.platform, reportData.account, reportData.marketer, 
      reportData.smm, reportData.videographer, reportData.postingTime || "", 
      Number(reportData.reach), Number(reportData.views), Number(reportData.likes), 
      Number(reportData.comments), Number(reportData.saves), Number(reportData.leads), 
      Number(reportData.stories), Number(reportData.posts), Number(reportData.reels), 
      Number(reportData.followersStart), Number(reportData.followersEnd), followerGrowth, 
      Number(reportData.contentHours), Number(reportData.adCost), Number(reportData.orders), 
      Number(reportData.salesAmount), reportData.notes || "", conversionRate, 
      costPerLead, roas, kpiScore, kpiStatus
    ];
    
    sheet.appendRow(row);
    
    // Log write
    logActivity(id, userEmail || "unknown-staff", "CREATE_REPORT", \`Account \${reportData.account} on \${dateFormatted} with Score: \${kpiScore}\`);
    
    return { success: true, id: id, kpiScore: kpiScore, kpiStatus: kpiStatus, followerGrowth: followerGrowth };
  } catch (err) {
    return { error: err.toString() };
  }
}

function getTargetsFromSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!sheet) return { leads: 30, reach: 8000, views: 15000, followerGrowth: 50, stories: 6, postsAndReels: 2 };
  
  const vals = sheet.getRange("A2:B7").getValues();
  const t = { leads: 30, reach: 8000, views: 15000, followerGrowth: 50, stories: 6, postsAndReels: 2 };
  vals.forEach(row => {
    const key = row[0];
    const val = Number(row[1]);
    if (key === "TARGET_LEADS") t.leads = val;
    if (key === "TARGET_REACH") t.reach = val;
    if (key === "TARGET_VIEWS") t.views = val;
    if (key === "TARGET_GROWTH") t.followerGrowth = val;
    if (key === "TARGET_STORIES") t.stories = val;
    if (key === "TARGET_PR") t.postsAndReels = val;
  });
  return t;
}

function logActivity(id, user, action, remarks) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(AUDIT_LOGS_SHEET);
    if (sheet) {
      sheet.appendRow([
        id, new Date().toISOString(), user, action, remarks
      ]);
    }
  } catch (e) {}
}
`;
}
