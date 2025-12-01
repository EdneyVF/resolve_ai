import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon,
  PendingActions as PendingActionsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useReports } from '../hooks/useReports';
import { Report } from '../services/reportService';
import AdminNavigation from '../components/admin/AdminNavigation';

interface ApiResponse {
  success: boolean;
  message: string;
  report: Report;
}

const AdminPendingPage: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { user } = authState;
  const { 
    reports, 
    loading, 
    error,
    fetchPendingReports,
    approveReport,
    rejectReport
  } = useReports();

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchPendingReports();
  }, [fetchPendingReports]);

  const handleApproveReport = async (id?: string) => {
    const reportId = id || selectedReportId;
    if (!reportId) return;
    
    try {
      const response = await approveReport(reportId) as unknown as ApiResponse;
      setSnackbar({
        open: true,
        message: response.message || 'Relato aprovado com sucesso!',
        severity: 'success'
      });

      fetchPendingReports();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao aprovar relato';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleOpenRejectDialog = (id?: string) => {
    if (id) {
      setSelectedReportId(id);
    }
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectionReason('');
  };

  const handleRejectReport = async () => {
    if (!selectedReportId || rejectionReason.trim() === '') return;
    
    try {
      const response = await rejectReport(selectedReportId, rejectionReason) as unknown as ApiResponse;
      setRejectionReason('');
      handleCloseRejectDialog();
      setSnackbar({
        open: true,
        message: response.message || 'Relato rejeitado com sucesso!',
        severity: 'success'
      });

      fetchPendingReports();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao rejeitar relato';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return '-';
      }
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  const renderOrganizer = (organizer: { name: string; email: string }) => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" fontWeight="medium">
          {organizer.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {organizer.email}
        </Typography>
      </Box>
    );
  };

  const renderCategory = (category: { name: string }) => {
    return (
      <Chip
        label={category.name}
        size="small"
        color="primary"
        variant="outlined"
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          Relatos Pendentes
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Gerencie os relatos que aguardam aprovação na plataforma.
          {reports.length > 0 && ` (${reports.length} relatos pendentes)`}
        </Typography>
      </Paper>

      <AdminNavigation />

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" component="h2">
            Lista de Relatos Pendentes
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Pendentes
            <PendingActionsIcon color="primary" />
            <Typography variant="h6" color="primary">
              {reports.length}
            </Typography>
          </Box>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Título</TableCell>
                  <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Organizador</TableCell>
                  <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Categoria</TableCell>
                  <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Data do Relato</TableCell>
                  <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Última Atualização</TableCell>
                  <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }} align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Nenhum relato pendente de aprovação.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report, index) => (
                    <TableRow 
                      key={report._id} 
                      hover
                      sx={{ 
                        bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover',
                        '&:hover': {
                          bgcolor: 'action.selected',
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" fontWeight="medium">
                            {report.title}
                          </Typography>
                          {report.date && (
                            <Typography variant="caption" color="text.secondary">
                              Relato: {formatDate(report.date)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{renderOrganizer(report.organizer)}</TableCell>
                      <TableCell>{renderCategory(report.category)}</TableCell>
                      <TableCell>{report.date ? formatDate(report.date) : '-'}</TableCell>
                      <TableCell>{report.updatedAt ? formatDate(report.updatedAt) : '-'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Aprovar relato">
                            <IconButton 
                              color="success" 
                              size="small"
                              onClick={() => handleApproveReport(report._id)}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rejeitar relato">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleOpenRejectDialog(report._id)}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Visualizar relato">
                            <IconButton 
                              size="small"
                              onClick={() => navigate(`/reports/${report._id}`)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Diálogo de Rejeição */}
        <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog} fullWidth maxWidth="sm">
          <DialogTitle sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            Rejeitar Relato
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
              <InfoIcon color="info" sx={{ mr: 1, mt: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                Por favor, forneça um motivo para a rejeição deste relato. Este motivo será enviado ao organizador.
              </Typography>
            </Box>
            <TextField
              autoFocus
              margin="dense"
              label="Motivo da rejeição"
              fullWidth
              multiline
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              variant="outlined"
              required
              error={rejectionReason.trim() === ''}
              helperText={rejectionReason.trim() === '' && "O motivo é obrigatório."}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button onClick={handleCloseRejectDialog} color="inherit">
              Cancelar
            </Button>
            <Button 
              onClick={handleRejectReport} 
              color="error"
              variant="contained"
              disabled={rejectionReason.trim() === ''}
            >
              Rejeitar Relato
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para mensagens */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default AdminPendingPage; 