export interface CandidateAptitudeQuestion {
  id: number;
  question_code: string;
  section: string;
  topic: string;
  difficulty: string;
  question_text: string;
  options: string[];
  time_estimate_seconds: number;
  is_marked_for_review?: boolean;
  selected_option?: number | null;
}

export interface AptitudeAttemptState {
  attempt_id: number;
  company_pattern: string;
  difficulty_mode: string;
  started_at: string;
  expires_at: string;
  remaining_seconds: number;
  status: string;
  total_questions: number;
  duration_minutes: number;
  questions: CandidateAptitudeQuestion[];
}

export interface SectionPerformance {
  section: string;
  total_questions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  percentage: number;
  accuracy: number;
  avg_time_per_question: number;
}

export interface QuestionReview {
  question_id: number;
  question_code: string;
  section: string;
  topic: string;
  difficulty: string;
  question_text: string;
  options: string[];
  candidate_answer: number | null;
  correct_answer: number;
  is_correct: boolean | null;
  explanation: string;
}

export interface AptitudeResult {
  attempt_id: number;
  candidate_name: string;
  company_pattern: string;
  difficulty_mode: string;
  started_at: string;
  submitted_at: string;
  status: string;
  total_questions: number;
  total_score: number;
  max_possible_score: number;
  percentage: number;
  accuracy: number;
  time_taken_seconds: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  performance_level: string;
  section_performances: SectionPerformance[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  question_reviews: QuestionReview[];
}

export interface AptitudeHistoryItem {
  id: number;
  date: string;
  company_pattern: string;
  difficulty_mode: string;
  percentage: number;
  accuracy: number;
  duration_minutes: number;
  performance_level: string;
  status: string;
}

export interface AdminAptitudeQuestion {
  id: number;
  question_code: string;
  section: string;
  topic: string;
  difficulty: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation: string;
  time_estimate_seconds: number;
  tags: string[];
  company_patterns: string[];
  created_at: string;
}
