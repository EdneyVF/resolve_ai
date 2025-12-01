import { useState, useCallback } from 'react';
import * as reportService from '../services/reportService';
import { 
  Report, 
  ReportCreateData, 
  ReportUpdateData,
  ReportQueryParams,
  ReportOrganizer,
  updateReport as apiUpdateReport, 
  deleteReport as apiDeleteReport,
  approveReport as apiApproveReport,
  rejectReport as apiRejectReport,
  activateReport as apiActivateReport,
  deactivateReport as apiDeactivateReport,
  getApprovalStatus as apiGetApprovalStatus,
  listPendingReports,
  getReportById,
  getAllReportsAdmin
} from '../services/reportService';

interface UseReportsState {
  reports: Report[];
  report: Report | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
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
  approvalInfo: {
    approvalStatus: 'pending' | 'approved' | 'rejected';
    approvedBy?: {
      name: string;
    };
    approvalDate?: Date;
    rejectionReason?: string;
  } | null;
}

export interface ApiError {
  message: string;
  status?: number;
}

export const useReports = () => {
  const [state, setState] = useState<UseReportsState>({
    reports: [],
    report: null,
    loading: false,
    error: null,
    success: false,
    pagination: {
      page: 1,
      pages: 1,
      total: 0
    },
    counts: {
      total: 0,
      active: 0,
      inactive: 0,
      canceled: 0,
      finished: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    },
    approvalInfo: null
  });

  const fetchReports = useCallback(async (params: ReportQueryParams = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await reportService.getReports(params);
      setState(prev => ({
        ...prev,
        reports: response.reports,
        loading: false,
        success: true,
        pagination: {
          page: response.page,
          pages: response.pages,
          total: response.total
        }
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar relatos';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  const fetchPendingReports = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await listPendingReports();

      const mappedReports = response.reports.map(report => ({
        _id: report._id,
        title: report.title,
        organizer: report.organizer as ReportOrganizer,
        category: {
          _id: report.category._id || 'unknown',
          name: report.category.name
        },
        description: report.description || '',
        date: report.date || new Date().toISOString(),
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        status: report.status || 'inactive',
        approvalStatus: report.approvalStatus || 'pending',
        location: report.location || { address: '', city: '', state: '', country: '' }
      })) as Report[];

      setState(prev => ({
        ...prev,
        reports: mappedReports,
        loading: false,
        success: true
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (err as ApiError)?.message || 'Erro ao carregar relatos pendentes';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
    }
  }, []);

  const fetchReportById = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const report = await getReportById(id);
      setState(prev => ({
        ...prev,
        report,
        loading: false,
        success: true
      }));
      return report;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar relato';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  const createReport = useCallback(async (data: ReportCreateData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await reportService.createReport(data);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        reports: response.report ? [response.report, ...prev.reports] : prev.reports
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar relato';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  const updateReport = useCallback(async (id: string, data: ReportUpdateData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await apiUpdateReport(id, data);

      setState(prev => ({
        ...prev,
        loading: false,
        success: true,


        reports: prev.reports.map(e => 
          e._id === id ? { ...e, ...result.report } : e
        ),

        report: prev.report?._id === id ? { ...prev.report, ...result.report } : prev.report
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar relato';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  const deleteReport = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await apiDeleteReport(id);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,

        reports: prev.reports.filter(e => e._id !== id),
        report: prev.report?._id === id ? null : prev.report
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir relato';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  const handleApproveReport = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiApproveReport(id);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true
      }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (err as ApiError)?.message || 'Erro ao aprovar relato';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw err;
    }
  }, []);

  const handleRejectReport = useCallback(async (id: string, reason: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiRejectReport(id, reason);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true
      }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (err as ApiError)?.message || 'Erro ao rejeitar relato';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw err;
    }
  }, []);

  const handleActivateReport = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiActivateReport(id);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,

        reports: prev.reports.map(e => 
          e._id === id ? { ...e, status: 'active' } : e
        ),
        report: prev.report?._id === id 
          ? { ...prev.report, status: 'active' } 
          : prev.report
      }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (err as ApiError)?.message || 'Erro ao ativar relato';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw err;
    }
  }, []);

  const handleDeactivateReport = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiDeactivateReport(id);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,

        reports: prev.reports.map(e => 
          e._id === id ? { ...e, status: 'inactive' } : e
        ),
        report: prev.report?._id === id 
          ? { ...prev.report, status: 'inactive' } 
          : prev.report
      }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (err as ApiError)?.message || 'Erro ao inativar relato';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw err;
    }
  }, []);

  const fetchApprovalStatus = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiGetApprovalStatus(id);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        approvalInfo: result.data
      }));
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (err as ApiError)?.message || 'Erro ao obter informações de aprovação';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw err;
    }
  }, []);

  const fetchMyReports = useCallback(async (params: ReportQueryParams = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await reportService.getMyReports(params);
      setState(prev => ({
        ...prev,
        reports: response.reports,
        loading: false,
        success: true,
        pagination: {
          page: response.page,
          pages: response.pages,
          total: response.total
        },
        counts: response.counts || {}
      }));
      return response.reports;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar meus relatos';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  const cancelReport = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await reportService.cancelReport(id);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,

        reports: prev.reports.map(e => 
          e._id === id ? { ...e, status: 'canceled' } : e
        ),
        report: prev.report?._id === id 
          ? { ...prev.report, status: 'canceled' } 
          : prev.report
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao cancelar relato';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  const clearState = useCallback(() => {
    setState({
      reports: [],
      report: null,
      loading: false,
      error: null,
      success: false,
      pagination: {
        page: 1,
        pages: 1,
        total: 0
      },
      counts: {
        total: 0,
        active: 0,
        inactive: 0,
        canceled: 0,
        finished: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      },
      approvalInfo: null
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const fetchAllReports = useCallback(async (params: ReportQueryParams = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await getAllReportsAdmin(params);
      setState(prev => ({
        ...prev,
        reports: response.reports,
        loading: false,
        success: true,
        pagination: {
          page: response.page,
          pages: response.pages,
          total: response.total
        },
        counts: response.counts
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar relatos';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    fetchReports,
    fetchPendingReports,
    fetchAllReports,
    fetchReportById,
    createReport,
    updateReport,
    deleteReport,
    approveReport: handleApproveReport,
    rejectReport: handleRejectReport,
    fetchMyReports,
    cancelReport,
    activateReport: handleActivateReport,
    deactivateReport: handleDeactivateReport,
    fetchApprovalStatus,
    clearState,
    clearError
  };
};

export default useReports; 