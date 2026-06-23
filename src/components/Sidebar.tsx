import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  TrendingUp, 
  Users, 
  Wallet, 
  Settings, 
  Menu, 
  X,
  Award,
  BookOpen
} from 'lucide-react';
import { UserSession, UserRole } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: UserSession;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  isOpen, 
  setIsOpen,
  onLogout 
}: SidebarProps) {
  const { t } = useLanguage();
  const tabs = [
    { id: 'dashboard', name: t('nav.dashboard'), icon: LayoutDashboard, roles: ['Admin'] as UserRole[] },
    { id: 'daily-report', name: t('nav.dailyReport'), icon: FileSpreadsheet, roles: ['Admin', 'Manager', 'Staff'] as UserRole[] },
    { id: 'account-analytics', name: t('nav.accountAnalytics'), icon: TrendingUp, roles: ['Admin', 'Manager'] as UserRole[] },
    { id: 'leaderboard', name: t('nav.leaderboard'), icon: Award, roles: ['Admin', 'Manager'] as UserRole[] },
    { id: 'revenue', name: t('nav.revenue'), icon: Wallet, roles: ['Admin', 'Manager'] as UserRole[] },
    { id: 'export-settings', name: t('nav.exportSettings'), icon: Settings, roles: ['Admin'] as UserRole[] },
  ];

  const visibleTabs = tabs.filter(tab => tab.roles.includes(user.role));

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-slate-900 text-white rounded-md shadow-md hover:bg-slate-800 transition"
          id="mobile-sidebar-toggle-btn"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between z-40 transition-transform duration-300 transform 
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex flex-col flex-1">
          {/* Logo Heading block (from high density HTML design specs: bg-slate-900 text-white p-6 flex items-center gap-3) */}
          <div className="p-5 flex items-center gap-3 bg-slate-900 text-white">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white font-display text-base">S</div>
            <div>
              <span className="font-bold tracking-tight text-base font-display block leading-tight">{t("nav.brand")}</span>
              <span className="text-[9px] font-mono text-slate-450 block uppercase tracking-wider">{t("nav.subtitle")}</span>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            {/* User Profile Summary - styled more cleanly and compactly */}
            <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8.5 h-8.5 rounded-full bg-slate-200 flex items-center justify-center font-extrabold text-indigo-650 text-xs uppercase shrink-0">
                  {user.name.substring(0, 2)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-xs font-bold truncate text-slate-800">{user.name}</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {t(`role.${user.role}`)}
                    </span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Items (matched closely to the custom High Density designs) */}
            <nav className="space-y-1 flex-1">
              {visibleTabs.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setIsOpen(false); // Close mobile sidebar after navigate
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition duration-200 group text-left
                      ${isActive 
                        ? 'bg-slate-100 text-indigo-600 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}
                  >
                    <Icon 
                      size={16} 
                      className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} 
                    />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-bold border border-slate-200/60 transition"
            id="sidebar-signout-btn"
          >
            <span>{t("nav.switchSignOut")}</span>
          </button>
          <div className="mt-2.5 text-center">
            <p className="text-[9px] font-mono text-slate-400">{t("nav.version")}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
