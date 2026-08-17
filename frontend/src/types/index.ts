export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'CANDIDATE' | 'ADMIN';
  is_active: boolean;
  created_at: string;
}

export interface Education {
  id?: number;
  degree: string;
  branch?: string;
  college: string;
  graduation_year?: number;
  cgpa?: string;
}

export interface Skill {
  id?: number;
  category: string;
  name: string;
  proficiency?: string;
}

export interface Project {
  id?: number;
  title: string;
  description?: string;
  technologies?: string;
  responsibilities?: string;
  features?: string;
}

export interface Certification {
  id?: number;
  name: string;
  issuer?: string;
  issue_date?: string;
}

export interface CandidateProfile {
  id: number;
  user_id: number;
  phone?: string;
  location?: string;
  target_role?: string;
  experience_level?: string;
  preferred_industry?: string;
  educations: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
}

export interface ResumeAnalysis {
  id: number;
  resume_id: number;
  overall_score: number;
  tech_skills_score: number;
  project_score: number;
  experience_score: number;
  education_score: number;
  relevance_score: number;
  completeness_score: number;
  ats_score?: number;
  ats_formatting_score?: number;
  ats_keyword_score?: number;
  ats_readability_score?: number;
  ats_breakdown?: {
    action_verbs_count?: number;
    found_action_verbs?: string[];
    quantifiable_metrics_count?: number;
    parseability_status?: string;
    contact_info_status?: string;
    ats_recommendations?: string[];
  };
  strengths: string[];
  weaknesses: string[];
  missing_info: string[];
  analyzed_at: string;
}


export interface JobDescription {
  id: number;
  candidate_id: number;
  title: string;
  raw_text: string;
  domain?: string;
  experience_required?: string;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  keywords: string[];
  created_at: string;
}

export interface JobMatchScore {
  id: number;
  resume_id: number;
  job_description_id: number;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  partial_skills: string[];
  explanation: string;
  calculated_at: string;
}

export interface AnswerEvaluation {
  id: number;
  answer_id: number;
  technical_score: number;
  relevance_score: number;
  completeness_score: number;
  communication_score: number;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_concepts: string[];
  recommended_follow_up?: string;
  evaluated_at: string;
}

export interface InterviewQuestion {
  id: number;
  interview_id: number;
  sequence_number: number;
  question_text: string;
  question_type: string;
  difficulty: string;
  context_reason?: string;
  expected_topics: string[];
  follow_up_depth: number;
  code_starter?: string;
  code_language?: string;
  resume_source?: string;
  reasons?: string[];
  answer?: {
    question_id: number;
    answer_text: string;
    audio_url?: string;
    time_taken_seconds?: number;
  };
  evaluation?: AnswerEvaluation;
}

export interface InterviewScore {
  id: number;
  interview_id: number;
  overall_score: number;
  technical_score: number;
  problem_solving_score: number;
  communication_score: number;
  project_knowledge_score: number;
  job_relevance_score: number;
  career_readiness_score: number;
  readiness_category: string;
  calculated_at: string;
}

export interface Interview {
  id: number;
  candidate_id: number;
  job_description_id?: number;
  type: string;
  difficulty: string;
  total_questions: number;
  status: string;
  instant_feedback_enabled: boolean;
  started_at: string;
  completed_at?: string;
  questions: InterviewQuestion[];
  score?: InterviewScore;
}

export interface SkillGap {
  id: number;
  candidate_id: number;
  skill_name: string;
  required_level: number;
  demonstrated_level: number;
  gap_percentage: number;
  status: string;
  identified_at: string;
}

export interface PreparationTask {
  id: number;
  plan_id: number;
  week_number: number;
  topic: string;
  resources: string[];
  is_completed: boolean;
}

export interface PreparationPlan {
  id: number;
  candidate_id: number;
  interview_id?: number;
  title: string;
  overall_progress: number;
  created_at: string;
  tasks: PreparationTask[];
}

export interface DashboardMetrics {
  resume_completed?: boolean;
  resume_score: number;
  job_match_completed?: boolean;
  job_match_score: number;
  interview_completed?: boolean;
  interview_score?: number;
  aptitude_completed?: boolean;
  aptitude_score?: number;
  career_readiness_score: number;
  readiness_category: string;
  last_aptitude_date?: string;
  best_aptitude_score?: number;
  total_aptitude_tests_completed?: number;
  total_interviews_completed: number;
  completed_parameters_count?: number;
  recent_interviews: Interview[];
  top_skill_gaps: SkillGap[];
  active_preparation_plan?: PreparationPlan;
  performance_trends: {
    history?: {
      interview: string;
      overall: number;
      technical: number;
      problem_solving: number;
      communication: number;
      project: number;
    }[];
  };
}
