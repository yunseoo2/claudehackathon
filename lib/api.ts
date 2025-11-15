// API client for Continuum backend
// Base URL - update this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Type definitions matching your API responses
export interface Document {
  id: number;
  title: string;
  risk_score: number;
  owners_count: number;
  staleness_days: number;
  critical?: boolean;
  topic?: string;
  owners?: string[];
  busFactor?: number;
  daysSinceUpdate?: number;
}

export interface TopicStat {
  topic_id: number;
  topic: string;
  docs_count: number;
  owners_count: number;
  staleness_days: number;
  risk_score?: number;
  risk_level?: 'low' | 'medium' | 'high';
}

export interface RiskAnalysisResponse {
  topic_stats: TopicStat[];
  documents: Document[];
  team_resilience_score: number;
  recommendations?: string;
}

export interface QueryResponse {
  answer: string;
  referenced_docs: Array<{ id: number; title: string }>;
  people_to_contact: number[];
}

export interface SimulateDepartureResponse {
  person: { id: number; name: string };
  orphaned_docs: Array<{ id: number; title: string }>;
  impacted_topics: Array<{ topic_id: number; name: string; reason: string }>;
  under_documented_systems: Array<{ system_id: number; name: string }>;
  claude_handoff: string;
}

export interface OnboardingResponse {
  plan: string;
}

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Get risk analysis for all documents and topics
 * @param recommend - Whether to include Claude recommendations
 */
export async function getRiskAnalysis(recommend: boolean = false): Promise<RiskAnalysisResponse> {
  const url = `${API_BASE_URL}/api/documents/at-risk${recommend ? '?recommend=true' : ''}`;
  const response = await fetch(url);
  return handleResponse<RiskAnalysisResponse>(response);
}

/**
 * Query documents using RAG (Retrieval-Augmented Generation)
 * @param question - The question to ask
 */
export async function queryDocuments(question: string): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  return handleResponse<QueryResponse>(response);
}

/**
 * Simulate a person leaving the organization
 * @param personId - ID of the person leaving
 */
export async function simulateDeparture(personId: number): Promise<SimulateDepartureResponse> {
  const response = await fetch(`${API_BASE_URL}/api/simulate-departure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ person_id: personId }),
  });
  return handleResponse<SimulateDepartureResponse>(response);
}

/**
 * Generate onboarding recommendations
 * @param mode - Either "team" or "handoff"
 * @param params - Team name or person IDs depending on mode
 */
export async function getOnboardingPlan(
  mode: 'team' | 'handoff',
  params: { team?: string; person_leaving?: number; person_joining?: number }
): Promise<OnboardingResponse> {
  const response = await fetch(`${API_BASE_URL}/api/recommend-onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, ...params }),
  });
  return handleResponse<OnboardingResponse>(response);
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; service: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
}

/**
 * Transform API topic stats to dashboard format
 */
export function transformTopicStats(topicStats: TopicStat[]): Array<{
  id: string;
  name: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  documentCount: number;
  avgBusFactor: number;
  avgDaysSinceUpdate: number;
  criticalDocs: number;
}> {
  return topicStats.map((stat) => {
    // Calculate risk score if not provided
    let riskScore = stat.risk_score || 0;
    if (!stat.risk_score) {
      // Simple heuristic: low owners = high risk, high staleness = high risk
      if (stat.owners_count <= 1) riskScore += 40;
      riskScore += Math.min(30, stat.staleness_days / 7);
      riskScore = Math.min(100, riskScore);
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskScore >= 70) riskLevel = 'high';
    else if (riskScore >= 40) riskLevel = 'medium';

    return {
      id: String(stat.topic_id),
      name: stat.topic,
      riskLevel: stat.risk_level || riskLevel,
      riskScore: Math.round(riskScore),
      documentCount: stat.docs_count,
      avgBusFactor: stat.owners_count,
      avgDaysSinceUpdate: stat.staleness_days,
      criticalDocs: 0, // You may need to calculate this from documents
    };
  });
}

/**
 * Transform API documents to dashboard format
 */
export function transformDocuments(documents: Document[]): Array<{
  id: string;
  title: string;
  topic: string;
  riskScore: number;
  busFactor: number;
  owners: string[];
  daysSinceUpdate: number;
  critical: boolean;
}> {
  return documents.map((doc) => ({
    id: String(doc.id),
    title: doc.title,
    topic: doc.topic || 'Unknown',
    riskScore: doc.risk_score,
    busFactor: doc.busFactor || doc.owners_count,
    owners: doc.owners || [],
    daysSinceUpdate: doc.daysSinceUpdate || doc.staleness_days,
    critical: doc.critical || false,
  }));
}
