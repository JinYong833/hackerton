export const JobStatus = {
  QUEUED: 'queued',
  PREPROCESSING: 'preprocessing',
  TRANSCRIBING: 'transcribing',
  POSTPROCESSING: 'postprocessing',
  SUMMARIZING: 'summarizing',
  DONE: 'done',
  FAILED: 'failed',
} as const;

export type JobStatus = typeof JobStatus[keyof typeof JobStatus];

export interface Job {
  job_id: string;
  status: JobStatus;
  progress: number; // 0-100
  created_at: string;
  updated_at: string;
  error?: string | null;
  filename?: string;
}

// API Response Types (from backend)
export interface ApiSegment {
  start: number;
  end: number;
  text: string;
}

export interface ApiJobResult {
  job_id: string;
  transcript: string;
  segments: ApiSegment[];
  summary: {
    tldr: string;
    outline: SectionSummary[];
    key_points: string[];
    action_items: string[];
    quiz_points: ApiQuizPoint[];
  };
  metrics: Record<string, number>;
}

export interface ApiQuizPoint {
  question: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Frontend Display Types (transformed)
export interface TranscriptSegment {
  id: string;
  text: string;
  start: number; // seconds
  end: number; // seconds
}

export interface SectionSummary {
  title: string;
  timestamp: string;
  content: string;
}

export interface QuizPoint {
  id: string;
  question: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[];
  correctAnswer?: number;
}

export interface Summary {
  tldr: string;
  outline: SectionSummary[];
  key_points: string[];
  action_items: string[];
  quiz_points: QuizPoint[];
}

export interface JobResult {
  job_id: string;
  transcript: TranscriptSegment[];
  summary: Summary;
  rawTranscript: string;
}

export interface JobResult {
  job_id: string;
  transcript: TranscriptSegment[];
  summary: Summary;
  rawTranscript: string;
  audioUrl?: string; // Optional - not provided by current API
}
