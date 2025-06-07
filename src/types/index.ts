export interface ScamScenario {
  id: string;
  title: string;
  type: 'call' | 'text';
  content: string;
  audioUrl?: string;
  tips: string[];
  goodResponseKeywords: string[];
}

export interface UserProgress {
  scenarioId: string;
  completed: boolean;
  successRate: number;
  lastPracticed: Date;
}