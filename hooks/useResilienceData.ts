import { useState, useEffect } from 'react';
import { getRiskAnalysis, transformTopicStats, transformDocuments } from '@/lib/api';

export interface DashboardTopic {
  id: string;
  name: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  documentCount: number;
  avgBusFactor: number;
  avgDaysSinceUpdate: number;
  criticalDocs: number;
}

export interface DashboardDocument {
  id: string;
  title: string;
  topic: string;
  riskScore: number;
  busFactor: number;
  owners: string[];
  daysSinceUpdate: number;
  critical: boolean;
  lastEditor: string;
  pageViews: number;
}

export interface UseResilienceDataResult {
  topics: DashboardTopic[];
  documents: DashboardDocument[];
  recommendations: string;
  teamResilienceScore: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useResilienceData(): UseResilienceDataResult {
  const [topics, setTopics] = useState<DashboardTopic[]>([]);
  const [documents, setDocuments] = useState<DashboardDocument[]>([]);
  const [recommendations, setRecommendations] = useState<string>('');
  const [teamResilienceScore, setTeamResilienceScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch risk analysis with recommendations
      const data = await getRiskAnalysis(true);

      // Transform topics
      const transformedTopics = transformTopicStats(data.topic_stats);

      // Calculate critical docs count per topic from documents
      const criticalCountsByTopic = data.documents.reduce((acc, doc) => {
        if (doc.critical && doc.topic) {
          acc[doc.topic] = (acc[doc.topic] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Update topics with critical docs count
      const topicsWithCritical = transformedTopics.map(topic => ({
        ...topic,
        criticalDocs: criticalCountsByTopic[topic.name] || 0,
      }));

      // Transform documents with additional fields
      const transformedDocuments = data.documents.map(doc => ({
        id: String(doc.id),
        title: doc.title,
        topic: doc.topic || 'Unknown',
        riskScore: doc.risk_score,
        busFactor: doc.owners_count,
        owners: doc.owners || generatePlaceholderOwners(doc.owners_count),
        daysSinceUpdate: doc.staleness_days,
        critical: doc.critical || false,
        lastEditor: doc.owners?.[0] || 'Unknown',
        pageViews: Math.floor(Math.random() * 2000) + 100, // Mock page views for now
      }));

      setTopics(topicsWithCritical);
      setDocuments(transformedDocuments);
      setRecommendations(data.recommendations || '');
      setTeamResilienceScore(data.team_resilience_score);
    } catch (err) {
      console.error('Error fetching resilience data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    topics,
    documents,
    recommendations,
    teamResilienceScore,
    loading,
    error,
    refetch: fetchData,
  };
}

// Helper function to generate placeholder owner names when API doesn't provide them
function generatePlaceholderOwners(count: number): string[] {
  const names = [
    'Alice Chen',
    'Bob Smith',
    'Charlie Davis',
    'Diana Lee',
    'Eve Martinez',
    'Frank Wilson',
    'Grace Kim',
    'Henry Zhang',
  ];

  return Array.from({ length: count }, (_, i) => names[i % names.length]);
}
