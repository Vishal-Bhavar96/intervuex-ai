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

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch (e) {
      // ignore
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
  addProject: (data: any) => request<any>('/profile/project', { method: 'POST', body: JSON.stringify(data) }),

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
  getAdminAnalytics: () => request<any>('/analytics/admin'),

  // Admin
  getAdminUsers: () => request<any>('/admin/users'),
  toggleUserStatus: (userId: number, active: boolean) =>
    request<any>(`/admin/users/${userId}/status?active=${active}`, { method: 'PUT' }),
  getAuditLogs: () => request<any>('/admin/audit-logs'),
};
