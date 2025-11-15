// Dashboard data types

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Person {
  id: number;
  name: string;
  email: string;
  teamName?: string;
}

export interface Topic {
  id: number;
  name: string;
  riskLevel: RiskLevel;
  documentCount: number;
  averageRisk: number;
  color?: string;
}

export interface Document {
  id: number;
  name: string;
  content?: string;
  busFactor: number;
  lastUpdated: string;
  owners: Person[];
  riskLevel: RiskLevel;
  topicName?: string;
  lastEditor?: string;
  updateHistory?: { date: string; value: number }[];
}

export interface AIRecommendation {
  id: string;
  type: 'add_owner' | 'update_doc' | 'transfer_knowledge';
  priority: RiskLevel;
  topic?: string;
  document?: string;
  message: string;
  actionableSteps?: string[];
}

export interface DashboardFilters {
  team?: string;
  topic?: string;
  searchQuery?: string;
  showOnlyHighRisk: boolean;
  sortBy?: 'risk' | 'recency' | 'busFactor' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface TopicRiskData {
  topic: string;
  riskScore: number;
  documentCount: number;
  avgBusFactor: number;
  color: string;
}

export interface DashboardData {
  topics: TopicRiskData[];
  documents: Document[];
  recommendations: AIRecommendation[];
  teams: string[];
}
