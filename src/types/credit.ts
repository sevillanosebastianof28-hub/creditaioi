// Credit Report Types
export interface CreditScore {
  bureau: 'equifax' | 'experian' | 'transunion';
  score: number;
  previousScore?: number;
  date: string;
}

export interface Tradeline {
  id: string;
  creditor: string;
  accountNumber: string;
  accountType: 'credit_card' | 'mortgage' | 'auto' | 'student' | 'personal' | 'collection';
  status: 'open' | 'closed' | 'collection' | 'charged_off';
  balance: number;
  creditLimit?: number;
  paymentStatus: 'current' | 'late_30' | 'late_60' | 'late_90' | 'late_120' | 'collection';
  openDate: string;
  bureaus: ('equifax' | 'experian' | 'transunion')[];
  disputable: boolean;
  disputeReason?: string;
  deletionProbability?: number;
  expectedScoreImpact?: number;
}

export interface Inquiry {
  id: string;
  creditor: string;
  date: string;
  type: 'hard' | 'soft';
  bureau: 'equifax' | 'experian' | 'transunion';
  disputable: boolean;
}

export interface PublicRecord {
  id: string;
  type: 'bankruptcy' | 'judgment' | 'lien' | 'foreclosure';
  filingDate: string;
  court?: string;
  amount?: number;
  status: 'active' | 'satisfied' | 'dismissed';
  bureaus: ('equifax' | 'experian' | 'transunion')[];
}

export interface CreditReport {
  id: string;
  clientId: string;
  uploadDate: string;
  source: 'smartcredit' | 'identityiq' | 'privacyguard' | 'pdf' | 'manual';
  scores: CreditScore[];
  tradelines: Tradeline[];
  inquiries: Inquiry[];
  publicRecords: PublicRecord[];
  personalInfo: {
    name: string;
    addresses: string[];
    employers: string[];
  };
}

// Client Types
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'lead' | 'active' | 'paused' | 'completed' | 'cancelled';
  assignedVA?: string;
  currentScores: CreditScore[];
  targetScore: number;
  startDate: string;
  nextPaymentDate?: string;
  monthlyFee: number;
  totalPaid: number;
  currentRound: number;
  totalItemsDisputed: number;
  itemsDeleted: number;
  lastActivity: string;
  tags: string[];
  notes: string;
}

// Dispute Types
export interface Dispute {
  id: string;
  clientId: string;
  round: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'response_received' | 'closed';
  bureau: 'equifax' | 'experian' | 'transunion';
  tradelineId: string;
  letterType: string;
  letterContent: string;
  reason: string;
  createdDate: string;
  sentDate?: string;
  responseDate?: string;
  outcome?: 'deleted' | 'updated' | 'verified' | 'pending';
  aiRecommendation?: string;
  deletionProbability: number;
  documents: string[];
}

// VA Task Types
export interface VATask {
  id: string;
  clientId: string;
  clientName: string;
  type: 'review_dispute' | 'generate_letters' | 'follow_up' | 'document_request' | 'analysis';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignedTo?: string;
  dueDate: string;
  aiSuggestion?: string;
  createdDate: string;
}

// Analytics Types
export interface AgencyMetrics {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  monthlyRecurring: number;
  averageScoreIncrease: number;
  deletionRate: number;
  clientRetention: number;
  lettersThisMonth: number;
  disputesInProgress: number;
  avgDaysToFirstDeletion: number;
}

export interface VAPerformance {
  id: string;
  name: string;
  avatar?: string;
  clientsManaged: number;
  tasksCompleted: number;
  lettersGenerated: number;
  deletionRate: number;
  avgResponseTime: string;
}
