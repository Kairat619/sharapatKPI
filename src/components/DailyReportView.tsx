import { useState, useEffect, FormEvent } from 'react';
import { useLanguage } from "../i18n/LanguageContext";
import { 
  FileSpreadsheet, 
  Trash2, 
  Copy, 
  Save, 
  HelpCircle, 
  Sparkles,
  RefreshCw,
  Clock,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Users,
  Eye,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { DailyReport, KpiTargets, AccountAssignment, UserSession } from '../types';
import { calculateReportFields, DEFAULT_TARGETS, DEFAULT_ASSIGNMENTS } from '../utils';

interface DailyReportViewProps {
  onSaveReport: (report: DailyReport) => void;
  lastReport: DailyReport | null;
  targets: KpiTargets;
  assignments: AccountAssignment[];
  currentUser: UserSession;
}

export default function DailyReportView({ 
  onSaveReport, 
  lastReport, 
  targets, 
  assignments,
  currentUser
}: DailyReportViewProps) {
  const { t } = useLanguage();
  const formatCompact = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  // Key state hooks
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [platform, setPlatform] = useState<'Instagram' | 'TikTok'>('Instagram');
  const [account, setAccount] = useState('Шарапат күмістері');
  const [marketer, setMarketer] = useState('Aidana');
  const [smm, setSmm] = useState('Aruzhan');
  const [videographer, setVideographer] = useState('Erlan');
  const [postingTime, setPostingTime] = useState('18:00');
  
  // Metrics state
  const [reach, setReach] = useState<number>(0);
  const [views, setViews] = useState<number>(0);
  const [likes, setLikes] = useState<number>(0);
  const [comments, setComments] = useState<number>(0);
  const [saves, setSaves] = useState<number>(0);
  const [leads, setLeads] = useState<number>(0);
  
  // Post volumes
  const [stories, setStories] = useState<number>(0);
  const [posts, setPosts] = useState<number>(0);
  const [reels, setReels] = useState<number>(0);
  
  // Followers
  const [followersStart, setFollowersStart] = useState<number>(0);
  const [followersEnd, setFollowersEnd] = useState<number>(0);
  
  // Financial & Content
  const [contentHours, setContentHours] = useState<number>(1);
  const [adCost, setAdCost] = useState<number>(0);
  const [orders, setOrders] = useState<number>(0);
  const [salesAmount, setSalesAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Alerts & UI feedback
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Auto-Fill Staff when Account changes
  useEffect(() => {
    const matched = assignments.find(item => item.accountName === account);
    if (matched) {
      setMarketer(matched.marketer);
      setSmm(matched.smm);
      setVideographer(matched.videographer);
    }
  }, [account, assignments]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('sharapat_daily_report_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.date) setDate(draft.date);
        if (draft.platform) setPlatform(draft.platform);
        if (draft.account) setAccount(draft.account);
        if (draft.reach) setReach(Number(draft.reach));
        if (draft.views) setViews(Number(draft.views));
        if (draft.likes) setLikes(Number(draft.likes));
        if (draft.comments) setComments(Number(draft.comments));
        if (draft.saves) setSaves(Number(draft.saves));
        if (draft.leads) setLeads(Number(draft.leads));
        if (draft.stories) setStories(Number(draft.stories));
        if (draft.posts) setPosts(Number(draft.posts));
        if (draft.reels) setReels(Number(draft.reels));
        if (draft.followersStart) setFollowersStart(Number(draft.followersStart));
        if (draft.followersEnd) setFollowersEnd(Number(draft.followersEnd));
        if (draft.contentHours) setContentHours(Number(draft.contentHours));
        if (draft.adCost) setAdCost(Number(draft.adCost));
        if (draft.orders) setOrders(Number(draft.orders));
        if (draft.salesAmount) setSalesAmount(Number(draft.salesAmount));
        if (draft.notes) setNotes(draft.notes);
        if (draft.postingTime) setPostingTime(draft.postingTime);
      } catch (e) {
        console.error("Draft parsing failed", e);
      }
    }
  }, []);

  // Auto-save draft changes to localStorage
  useEffect(() => {
    const currentFormState = {
      date, platform, account, reach, views, likes, comments, saves, leads,
      stories, posts, reels, followersStart, followersEnd, contentHours, adCost,
      orders, salesAmount, notes, postingTime
    };
    localStorage.setItem('sharapat_daily_report_draft', JSON.stringify(currentFormState));
  }, [
    date, platform, account, reach, views, likes, comments, saves, leads,
    stories, posts, reels, followersStart, followersEnd, contentHours, adCost,
    orders, salesAmount, notes, postingTime
  ]);

  // Clear Form handler
  const handleClear = () => {
    if (window.confirm(t("dr.clearConfirm"))) {
      setReach(0);
      setViews(0);
      setLikes(0);
      setComments(0);
      setSaves(0);
      setLeads(0);
      setStories(0);
      setPosts(0);
      setReels(0);
      setFollowersStart(0);
      setFollowersEnd(0);
      setContentHours(1);
      setAdCost(0);
      setOrders(0);
      setSalesAmount(0);
      setNotes('');
      setPostingTime('18:00');
      
      localStorage.removeItem('sharapat_daily_report_draft');
    }
  };

  // Duplicate Yesterday's Data (Loads the last submitted report as baseline)
  const handleDuplicateYesterday = () => {
    if (!lastReport) {
      alert(t("dr.noPriorReport"));
      return;
    }
    
    if (window.confirm(t("dr.loadLastConfirm", { account: lastReport.account, date: lastReport.date }))) {
      setPlatform(lastReport.platform);
      setAccount(lastReport.account);
      setReach(lastReport.reach);
      setViews(lastReport.views);
      setLikes(lastReport.likes);
      setComments(lastReport.comments);
      setSaves(lastReport.saves);
      setLeads(lastReport.leads);
      setStories(lastReport.stories);
      setPosts(lastReport.posts);
      setReels(lastReport.reels);
      setFollowersStart(lastReport.followersStart);
      setFollowersEnd(lastReport.followersEnd);
      setContentHours(lastReport.contentHours);
      setAdCost(lastReport.adCost);
      setOrders(lastReport.orders);
      setSalesAmount(lastReport.salesAmount);
      setNotes(`Duplicated baseline from: ${lastReport.date}. ${lastReport.notes || ''}`);
      setPostingTime(lastReport.postingTime || '18:00');
    }
  };

  // Real-time calculated fields and preview report model
  const partialReport = {
    id: 'placeholder',
    date,
    platform,
    account,
    marketer,
    smm,
    videographer,
    postingTime,
    reach,
    views,
    likes,
    comments,
    saves,
    leads,
    stories,
    posts,
    reels,
    followersStart,
    followersEnd,
    contentHours,
    adCost,
    orders,
    salesAmount,
    notes,
  };

  const calculatedPreview = calculateReportFields(partialReport, targets);

  // Submit report handler
  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!account) {
      alert(t("dr.selectAccountAlert"));
      return;
    }

    const compiledReport = {
      ...calculatedPreview,
      id: `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    } as DailyReport;

    onSaveReport(compiledReport);

    // Clear saved draft state
    localStorage.removeItem('sharapat_daily_report_draft');
    
    // Clear dynamic metrics, maintaining base staff settings for next entry
    setReach(0);
    setViews(0);
    setLikes(0);
    setComments(0);
    setSaves(0);
    setLeads(0);
    setStories(0);
    setPosts(0);
    setReels(0);
    setOrders(0);
    setSalesAmount(0);
    
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 4000);
  };

  // Real-time KPI score styling
  let badgeColor = 'bg-rose-100 text-rose-700 border-rose-200';
  if (calculatedPreview.kpiStatus === 'Excellent') badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-250';
  else if (calculatedPreview.kpiStatus === 'Good') badgeColor = 'bg-amber-100 text-amber-800 border-amber-250';
  else if (calculatedPreview.kpiStatus === 'Average') badgeColor = 'bg-sky-100 text-sky-800 border-sky-200';

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-650">{t("dr.badge")}</span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5 font-display">{t("dr.title")}</h2>
          <p className="text-xs text-slate-500">
            {t("dr.desc")}
          </p>
        </div>
        
        <div className="flex items-center gap-1.5 flex-wrap font-sans">
          {lastReport && (
            <button
              type="button"
              onClick={handleDuplicateYesterday}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-lg shadow-sm transition cursor-pointer"
              id="btn-duplicate-yesterday"
            >
              <Copy size={12} />
              <span>{t("dr.copyLast")}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-white hover:bg-slate-50 text-rose-650 font-bold text-xs rounded-lg border border-slate-300 transition cursor-pointer"
            id="btn-clear-form"
          >
            <Trash2 size={12} />
            <span>{t("dr.resetForm")}</span>
          </button>
        </div>
      </div>

      {showSaveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5 animate-fade-in shadow-sm font-sans">
          <Sparkles className="text-emerald-500 flex-shrink-0" size={16} />
          <div>
            <h4 className="font-bold text-xs text-slate-900">{t("dr.savedTitle")}</h4>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              {t("dr.savedDesc")}
            </p>
          </div>
        </div>
      )}

      {/* Main split grid UI (Form & Auto KPIs) */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-sans">
        
        {/* Left Form blocks */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Card 1: Channel Meta */}
          <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display border-b border-slate-100 pb-1.5">{t("dr.sectionChannel")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.entryDate")}</label>
                <input 
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.platform")}</label>
                <select
                  required
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as 'Instagram' | 'TikTok')}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                >
                  <option value="Instagram">{t("dr.instagram")}</option>
                  <option value="TikTok">{t("dr.tiktok")}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.accountChannel")}</label>
                <select
                  required
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-100 font-semibold text-slate-900"
                >
                  {assignments.map(a => (
                    <option key={a.accountName} value={a.accountName}>{a.accountName}</option>
                  ))}
                </select>
                <p className="text-[9px] text-indigo-600 mt-1 font-bold flex items-center gap-1">
                  <AlertCircle size={10} /> {t("dr.staffHint")}
                </p>
              </div>
            </div>

            {/* Auto-filled Staff View */}
            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl grid grid-cols-3 gap-2">
              <div>
                <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-bold">{t("dr.marketer")}</span>
                <span className="text-xs font-extrabold text-slate-700">{marketer || t("dr.notAssigned")}</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-bold">{t("dr.smm")}</span>
                <span className="text-xs font-extrabold text-slate-700">{smm || t("dr.notAssigned")}</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-bold">{t("dr.videographer")}</span>
                <span className="text-xs font-extrabold text-slate-700">{videographer || t("dr.notAssigned")}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Marketing & Audience Reach */}
          <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display border-b border-slate-100 pb-1.5">{t("dr.sectionGrowth")}</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.reach")}</label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={reach || ''}
                  onChange={(e) => setReach(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 font-sans"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.views")}</label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={views || ''}
                  onChange={(e) => setViews(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 font-sans"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.leads")}</label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={leads || ''}
                  onChange={(e) => setLeads(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 font-sans"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.saves")}</label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={saves || ''}
                  onChange={(e) => setSaves(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none focus:border-indigo-550 focus:ring-1 font-sans"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.likes")}</label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={likes || ''}
                  onChange={(e) => setLikes(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none focus:border-indigo-550 focus:ring-1 font-sans"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.comments")}</label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={comments || ''}
                  onChange={(e) => setComments(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none focus:border-indigo-550 focus:ring-1 font-sans"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Volumes Produced */}
          <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display border-b border-slate-100 pb-1.5">{t("dr.sectionContent")}</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.stories")}</label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={stories || ''}
                  onChange={(e) => setStories(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none focus:border-indigo-500 focus:ring-1"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.posts")}</label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={posts || ''}
                  onChange={(e) => setPosts(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none focus:border-indigo-500 focus:ring-1"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.reels")}</label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={reels || ''}
                  onChange={(e) => setReels(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none focus:border-indigo-500 focus:ring-1"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.postingTime")}</label>
                <input 
                  type="text"
                  required
                  value={postingTime}
                  onChange={(e) => setPostingTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none focus:border-indigo-500 focus:ring-1"
                  placeholder={t("dr.postingTimePlaceholder")}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.followersStart")}</label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={followersStart || ''}
                  onChange={(e) => setFollowersStart(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none focus:border-indigo-500 focus:ring-1"
                  placeholder={t("dr.followersStartPlaceholder")}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.followersEnd")}</label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={followersEnd || ''}
                  onChange={(e) => setFollowersEnd(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none focus:border-indigo-500 focus:ring-1"
                  placeholder={t("dr.followersEndPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Marketing Financials & Hours */}
          <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display border-b border-slate-100 pb-1.5">{t("dr.sectionOps")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.adBudget")}</label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={adCost || ''}
                  onChange={(e) => setAdCost(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none"
                  placeholder={t("dr.adBudgetPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.orders")}</label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={orders || ''}
                  onChange={(e) => setOrders(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none"
                  placeholder={t("dr.ordersPlaceholder")}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.salesAmount")}</label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={salesAmount || ''}
                  onChange={(e) => setSalesAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none"
                  placeholder={t("dr.salesAmountPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.workingHours")}</label>
                <input 
                  type="number"
                  step="0.5"
                  required
                  value={contentHours || ''}
                  onChange={(e) => setContentHours(Math.max(0.5, Number(e.target.value)))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-205 focus:outline-none"
                  placeholder={t("dr.workingHoursPlaceholder")}
                />
              </div>

              <div className="col-span-3">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">{t("dr.notes")}</label>
                <input 
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-205 focus:outline-none"
                  placeholder={t("dr.notesPlaceholder")}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Live KPI Engine & Score Preview */}
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 sticky top-4 font-sans">
            <span className="text-[9px] font-bold text-indigo-400 tracking-wider uppercase block">{t("dr.calcBadge")}</span>
            <h3 className="text-sm font-bold tracking-tight mt-0.5 flex items-center gap-1.5 border-b border-slate-800 pb-2 font-display">
              <RefreshCw size={12} className="text-indigo-400 animate-spin" />
              {t("dr.calcTitle")}
            </h3>

            {/* Huge KPI Score */}
            <div className="text-center py-4">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("dr.kpiScore")}</span>
              <h2 className="text-4xl font-extrabold text-white tracking-tight mt-0.5">
                {t("dr.scoreFormat", { score: calculatedPreview.kpiScore })}
              </h2>
              <div className="mt-1.5 inline-block">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${badgeColor}`}>
                  {t(`dr.${calculatedPreview.kpiStatus.toLowerCase()}`)}
                </span>
              </div>
            </div>

            {/* Formula weighting explanation card */}
            <div className="space-y-1.5 mt-2">
              <span className="block text-[9px] font-bold text-slate-450 text-slate-400 tracking-wider uppercase">{t("dr.weightedFactors")}</span>
              
              <div className="space-y-1 text-xs text-slate-350 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">{t("dr.factorLeads")}</span>
                  <span className="font-bold text-slate-100">{leads} / {targets.leads}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">{t("dr.factorReach")}</span>
                  <span className="font-bold text-slate-100">{formatCompact(reach)} / {formatCompact(targets.reach)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">{t("dr.factorViews")}</span>
                  <span className="font-bold text-slate-100">{formatCompact(views)} / {formatCompact(targets.views)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">{t("dr.factorGrowth")}</span>
                  <span className="font-bold text-slate-100">
                    {calculatedPreview.followerGrowth > 0 ? `+${calculatedPreview.followerGrowth}` : calculatedPreview.followerGrowth} / {targets.followerGrowth}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">{t("dr.factorStories")}</span>
                  <span className="font-bold text-slate-100">{stories} / {targets.stories}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">{t("dr.factorPR")}</span>
                  <span className="font-bold text-slate-100">{posts + reels} / {targets.postsAndReels}</span>
                </div>
              </div>
            </div>

            {/* Auto calculations */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
              <span className="block text-[9px] font-bold text-slate-400 tracking-wider uppercase">{t("dr.autoStats")}</span>
              
              <div className="grid grid-cols-2 gap-1.5 text-center text-xs font-mono">
                <div className="bg-slate-800/20 p-1.5 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-450 block font-sans">{t("dr.conversion")}</span>
                  <span className="font-bold block text-white mt-0.5">
                    {calculatedPreview.conversionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="bg-slate-800/20 p-1.5 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-450 block font-sans">{t("dr.costPerLead")}</span>
                  <span className="font-bold block text-white mt-0.5">
                    {calculatedPreview.costPerLead.toFixed(0)} 〒
                  </span>
                </div>
                <div className="bg-slate-800/20 p-1.5 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-450 block font-sans">{t("dr.roas")}</span>
                  <span className="font-bold block text-indigo-400 mt-0.5">
                    {calculatedPreview.roas.toFixed(1)}x
                  </span>
                </div>
                <div className="bg-slate-800/20 p-1.5 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-450 block font-sans">{t("dr.status")}</span>
                  <span className="font-bold block text-indigo-305 mt-0.5 text-indigo-300">{t("dr.factorOk")}</span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="mt-4">
              {currentUser.role === 'Viewer' ? (
                <div className="p-2 bg-slate-800/60 text-slate-400 border border-slate-700/50 rounded-lg text-center text-[10px]">
                  {t("dr.viewerRestricted")}
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg font-bold text-xs text-white shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                  id="btn-save-daily-report"
                >
                  <Save size={13} />
                  <span>{t("dr.submitButton")}</span>
                </button>
              )}
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
