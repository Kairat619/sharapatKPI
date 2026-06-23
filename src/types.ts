export type UserRole = 'Admin' | 'Manager' | 'Staff';

export interface UserSession {
  email: string;
  name: string;
  role: UserRole;
}

export interface RolePasswords {
  Admin: string;
  Manager: string;
  Staff: string;
}

export interface KpiTargets {
  leads: number;
  reach: number;
  views: number;
  followerGrowth: number;
  stories: number;
  postsAndReels: number;
}

export interface AccountAssignment {
  accountName: string;
  marketer: string;
  smm: string;
  videographer: string;
}

export interface DailyReport {
  id: string;
  date: string; // YYYY-MM-DD
  platform: 'Instagram' | 'TikTok';
  account: string;
  marketer: string;
  smm: string;
  videographer: string;
  postingTime?: string;
  reach: number;
  views: number;
  likes: number;
  comments: number;
  saves: number;
  leads: number;
  stories: number;
  posts: number;
  reels: number;
  followersStart: number;
  followersEnd: number;
  followerGrowth: number; // calculated: followersEnd - followersStart
  contentHours: number;
  adCost: number;
  orders: number;
  salesAmount: number;
  notes: string;
  
  // Auto-calculated fields
  conversionRate: number; // calculated: leads > 0 ? (orders / leads) * 100 : 0
  costPerLead: number;    // calculated: leads > 0 ? (adCost / leads) : 0
  roas: number;           // calculated: adCost > 0 ? (salesAmount / adCost) : 0
  kpiScore: number;       // calculated KPI (0-100)
  kpiStatus: 'Excellent' | 'Good' | 'Average' | 'Poor';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  details: string;
}
