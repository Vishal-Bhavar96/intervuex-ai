const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('intervuex_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (e: any) {
    throw new ApiError('Cannot connect to backend server. Please verify the backend service is running on http://127.0.0.1:8000.', 0);
  }

  if (!response.ok) {
    let errorDetail = `Server error (${response.status})`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch (e) {
      if (response.status === 500 || response.status === 502 || response.status === 504) {
        errorDetail = `Backend server unavailable (${response.status}). Please check if the FastAPI backend is running on port 8000.`;
      }
    }
    throw new ApiError(errorDetail, response.status);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),

  // Profile
  getProfile: () => request<any>('/profile'),
  updateProfile: (data: any) => request<any>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  addEducation: (data: any) => request<any>('/profile/education', { method: 'POST', body: JSON.stringify(data) }),
  addSkill: (data: any) => request<any>('/profile/skill', { method: 'POST', body: JSON.stringify(data) }),
  deleteSkill: (skillId: number) => request<any>(`/profile/skill/${skillId}`, { method: 'DELETE' }),
  addProject: (data: any) => request<any>('/profile/project', { method: 'POST', body: JSON.stringify(data) }),
  deleteProject: (projectId: number) => request<any>(`/profile/project/${projectId}`, { method: 'DELETE' }),

  // Resume
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('intervuex_token');

    const res = await fetch(`${API_BASE}/resume/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new ApiError(err.detail || 'Resume upload failed', res.status);
    }
    return res.json();
  },
  getLatestResumeAnalysis: () => request<any>('/resume/latest'),

  // Job
  analyzeJob: (data: { title: string; raw_text: string }) =>
    request<any>('/job/analyze', { method: 'POST', body: JSON.stringify(data) }),
  matchJob: (jobId: number) => request<any>(`/job/${jobId}/match`, { method: 'POST' }),

  // Interview
  createInterview: (data: any) => request<any>('/interview/create', { method: 'POST', body: JSON.stringify(data) }),
  getInterview: (id: number) => request<any>(`/interview/${id}`),
  listInterviews: () => request<any>('/interview/list'),
  submitAnswer: (interviewId: number, data: any) =>
    request<any>(`/interview/${interviewId}/answer`, { method: 'POST', body: JSON.stringify(data) }),

  // Coding Sandbox
  runCode: (data: { code: string; language?: string; test_cases?: any[] }) =>
    request<any>('/coding/run', { method: 'POST', body: JSON.stringify(data) }),

  // Analytics
  getDashboard: () => request<any>('/analytics/dashboard'),
  getDashboardMetrics: () => request<any>('/analytics/dashboard'),
  getAdminAnalytics: () => request<any>('/analytics/admin'),

  // Admin
  getAdminUsers: () => request<any>('/admin/users'),
  toggleUserStatus: (userId: number, active: boolean) =>
    request<any>(`/admin/users/${userId}/status?active=${active}`, { method: 'PUT' }),
  getAuditLogs: () => request<any>('/admin/audit-logs'),

  // Aptitude Assessment & Proctoring
  startAptitudeTest: (data: { company_pattern?: string; difficulty_mode?: string; total_questions?: number; duration_minutes?: number }) =>
    request<any>('/aptitude/tests/start', { method: 'POST', body: JSON.stringify(data) }),
  getAptitudeAttemptState: (attemptId: number) =>
    request<any>(`/aptitude/attempts/${attemptId}`),
  saveAptitudeAnswer: (attemptId: number, data: { question_id: number; selected_option?: number | null; is_marked_for_review?: boolean; time_spent_seconds?: number }) =>
    request<any>(`/aptitude/attempts/${attemptId}/answer`, { method: 'POST', body: JSON.stringify(data) }),
  submitAptitudeAttempt: (attemptId: number, data?: any) =>
    request<any>(`/aptitude/attempts/${attemptId}/submit`, { method: 'POST', body: JSON.stringify(data || {}) }),
  getAptitudeResult: (attemptId: number) =>
    request<any>(`/aptitude/results/${attemptId}`),
  getAptitudeHistory: () =>
    request<any>('/aptitude/history'),
  getAptitudeRecommendations: () =>
    request<any>('/aptitude/recommendations'),
  recordAptitudeMonitoringEvent: (data: { attempt_id: number; event_type: string; metadata?: any }) =>
    request<any>('/aptitude/monitoring-event', { method: 'POST', body: JSON.stringify(data) }),
  
  // Admin Aptitude
  getAdminAptitudeQuestions: () =>
    request<any>('/aptitude/admin/questions'),
  createAdminAptitudeQuestion: (data: any) =>
    request<any>('/aptitude/admin/questions', { method: 'POST', body: JSON.stringify(data) }),
  deleteAdminAptitudeQuestion: (questionId: number) =>
    request<any>(`/aptitude/admin/questions/${questionId}`, { method: 'DELETE' }),
};
