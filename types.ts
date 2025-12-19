export enum ReferenceStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export interface SurveyResponse {
  questionId: string;
  questionText: string;
  answer: string | number;
  type: 'rating' | 'text';
}

export interface Reference {
  id: string;
  candidateId: string;
  refereeName: string;
  refereeEmail: string;
  relationship: string;
  status: ReferenceStatus;
  sentDate: string;
  completedDate?: string;
  responses: SurveyResponse[];
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'Active' | 'Hired' | 'Rejected';
  aiSummary?: string;
  aiScore?: number; // 0-100
  createdAt: string;
}

export interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  discrepancies: string;
  score: number;
}
