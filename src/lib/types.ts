export type Ambience = 'forest' | 'ocean' | 'mountain';

export interface JournalAnalysis {
  emotion: string;
  keywords: string[];
  summary: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  ambience: Ambience;
  text: string;
  analysis: JournalAnalysis | null;
  created_at: string;
}

export interface InsightsData {
  topEmotion: string;
  mostUsedAmbience: Ambience;
  totalEntries: number;
  recentEmotions: { emotion: string; count: number }[];
}
