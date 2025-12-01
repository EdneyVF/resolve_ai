import api from './api';

const REPORT_ROUTES = {
  list: '/api/reports',
  detail: (id: string) => `/api/reports/${id}`,
  create: '/api/reports',
  update: (id: string) => `/api/reports/${id}`,
  delete: (id: string) => `/api/reports/${id}`,
  approve: (id: string) => `/api/reports/${id}/approve`,
  reject: (id: string) => `/api/reports/${id}/reject`,
  cancelReport: (id: string) => `/api/reports/${id}/cancel`,
  pending: '/api/reports/approval/pending',
  myReports: '/api/reports/my-reports',
  approvalStatus: (id: string) => `/api/reports/${id}/approval-status`,
  adminAll: '/api/reports/admin/all',
  activate: (id: string) => `/api/reports/${id}/activate`,
  deactivate: (id: string) => `/api/reports/${id}/deactivate`,
};

export interface ReportLocation {
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface ReportCategory {
  _id: string;
  name: string;
}

export interface ReportOrganizer {
  _id: string;
  name: string;
  email: string;
}

export interface Report {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: ReportLocation;
  category: ReportCategory;
  organizer: ReportOrganizer;
  status: 'active' | 'inactive' | 'canceled' | 'finished';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  tags?: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportsResponse {
  reports: Report[];
  page: number;
  pages: number;
  total: number;
  filters?: Record<string, unknown>;
}

export interface ReportCreateData {
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: {
    address: string;
    city: string;
    state: string;
    country?: string;
  };
  category: string;
  tags?: string[];
  imageUrl?: string;
}

export interface ReportUpdateData {
  title?: string;
  description?: string;
  date?: string;
  endDate?: string;
  location?: {
    address: string;
    city: string;
    state: string;
    country?: string;
  };
  category?: string;
  tags?: string[];
  imageUrl?: string | null;
}

export interface ReportQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categories?: string;
  status?: string;
  from?: string;
  to?: string;
  sort?: string;
  approvalStatus?: string;
  when?: string;
  organizer?: string;
  all?: boolean;
}

export const getReports = async (params: ReportQueryParams = {}) => {
  const response = await api.get<ReportsResponse>(REPORT_ROUTES.list, { params });
  return response.data;
};

export interface PendingReportsResponse {
  success: boolean;
  count: number;
  reports: Array<{
    _id: string;
    title: string;
    organizer: {
      name: string;
      email: string;
    };
    category: {
      name: string;
      _id?: string;
    };
    description?: string;
    date?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;
    approvalStatus?: string;
    location?: ReportLocation;
  }>;
}

export interface ApprovalStatusResponse {
  success: boolean;
  data: {
    approvalStatus: 'pending' | 'approved' | 'rejected';
    approvedBy?: {
      name: string;
    };
    approvalDate?: Date;
    rejectionReason?: string;
  };
}

export const listPendingReports = async () => {
  const response = await api.get<PendingReportsResponse>(REPORT_ROUTES.pending);
  return response.data;
};

export const getReportById = async (id: string) => {
  const response = await api.get<Report>(REPORT_ROUTES.detail(id));
  return response.data;
};

export const createReport = async (data: ReportCreateData) => {
  const response = await api.post(REPORT_ROUTES.create, data);
  return {
    success: true,
    message: 'Relato criado com sucesso!',
    report: {
      ...response.data,
      approvalStatus: 'pending',
      status: 'inactive'
    }
  };
};

export const updateReport = async (id: string, data: ReportUpdateData) => {
  const response = await api.put(REPORT_ROUTES.update(id), data);
  return {
    success: true,
    message: 'Relato atualizado com sucesso!',
    report: {
      ...response.data,
      approvalStatus: 'pending',
      status: 'inactive'
    }
  };
};

export const deleteReport = async (id: string) => {
  const response = await api.delete(REPORT_ROUTES.delete(id));
  return response.data;
};

export const approveReport = async (id: string) => {
  const response = await api.put<{
    success: boolean;
    message: string;
    report: Report;
  }>(REPORT_ROUTES.approve(id));
  return response.data;
};

export const rejectReport = async (id: string, reason: string) => {
  const response = await api.put<{
    success: boolean;
    message: string;
    report: Report;
  }>(REPORT_ROUTES.reject(id), { reason });
  return response.data;
};

export const cancelReport = async (id: string) => {
  const response = await api.put(REPORT_ROUTES.cancelReport(id));
  return response.data;
};

export interface MyReportsResponse {
  reports: Report[];
  page: number;
  pages: number;
  total: number;
  counts: {
    total: number;
    active: number;
    inactive: number;
    canceled: number;
    finished: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export const getMyReports = async (params: ReportQueryParams = {}) => {
  const response = await api.get<MyReportsResponse>(REPORT_ROUTES.myReports, { params });
  return response.data;
};

export const getApprovalStatus = async (id: string) => {
  const response = await api.get<ApprovalStatusResponse>(REPORT_ROUTES.approvalStatus(id));
  return response.data;
};

export interface AdminReportsResponse {
  reports: Report[];
  page: number;
  pages: number;
  total: number;
  counts: {
    total: number;
    active: number;
    inactive: number;
    canceled: number;
    finished: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export const getAllReportsAdmin = async (params: ReportQueryParams = {}) => {
  const response = await api.get<AdminReportsResponse>(REPORT_ROUTES.adminAll, { params });
  return response.data;
};

export const activateReport = async (id: string) => {
  const response = await api.put<{
    success: boolean;
    message: string;
    report: Report;
  }>(REPORT_ROUTES.activate(id));
  return response.data;
};

export const deactivateReport = async (id: string) => {
  const response = await api.put<{
    success: boolean;
    message: string;
    report: Report;
  }>(REPORT_ROUTES.deactivate(id));
  return response.data;
}; 