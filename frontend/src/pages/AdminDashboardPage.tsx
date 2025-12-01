import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useReports } from '../hooks/useReports';
import AdminNavigation from '../components/admin/AdminNavigation';

const AdminDashboardPage: React.FC = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const navigate = useNavigate();

  const { 
    reports, 
    loading, 
    error, 
    pagination, 
    fetchAllReports, 
    approveReport, 
    rejectReport, 
    deleteReport,
    activateReport,
    deactivateReport,
    counts 
  } = useReports();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterApproval, setFilterApproval] = useState<string>('all');

  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openActivateDialog, setOpenActivateDialog] = useState(false);
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
    const loadReports = async () => {
      try {
        await fetchAllReports({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          approvalStatus: filterApproval !== 'all' ? filterApproval : undefined
        });
      } catch (error) {
        console.error('Erro ao carregar relatos:', error);
      }
    };
    
    loadReports();
  }, [fetchAllReports, page, rowsPerPage, searchQuery, filterStatus, filterApproval]);

  const handleChangePage = (_report: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (report: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(report.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (report: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(report.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (report: SelectChangeEvent) => {
    setFilterStatus(report.target.value);
    setPage(0);
  };

  const handleApprovalFilterChange = (report: SelectChangeEvent) => {
    setFilterApproval(report.target.value);
    setPage(0);
  };

  const handleMenuOpen = (report: React.MouseEvent<HTMLElement>,reportId: string) => {
    setAnchorEl(report.currentTarget);
    setSelectedReportId(reportId);
  };

  const handleMenuClose = () => {

    if (!openApproveDialog && !openRejectDialog && !openDeleteDialog && 
        !openActivateDialog && !openDeactivateDialog) {
      setSelectedReportId(null);
    }
    setAnchorEl(null);
  };

  const handleViewReport = () => {
    if (selectedReportId) {
      navigate(`/reports/${selectedReportId}`);
    }
    handleMenuClose();
  };

  const handleEditReport = () => {
    if (selectedReportId) {
      navigate(`/reports/edit/${selectedReportId}`);
    }
    handleMenuClose();
  };

  const handleApproveReport = async () => {

    setOpenApproveDialog(true);

    setAnchorEl(null);
  };

  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);

    if (!openRejectDialog && !openDeleteDialog && !openActivateDialog && !openDeactivateDialog) {
      setSelectedReportId(null);
    }
  };

  const handleOpenRejectDialog = () => {

    setOpenRejectDialog(true);

    setAnchorEl(null);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectionReason('');

    if (!openApproveDialog && !openDeleteDialog && !openActivateDialog && !openDeactivateDialog) {
      setSelectedReportId(null);
    }
  };

  const handleDeleteReport = async () => {

    setOpenDeleteDialog(true);

    setAnchorEl(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);

    if (!openApproveDialog && !openRejectDialog && !openActivateDialog && !openDeactivateDialog) {
      setSelectedReportId(null);
    }
  };

  const handleActivateReport = async () => {

    setOpenActivateDialog(true);

    setAnchorEl(null);
  };

  const handleCloseActivateDialog = () => {
    setOpenActivateDialog(false);

    if (!openApproveDialog && !openRejectDialog && !openDeleteDialog && !openDeactivateDialog) {
      setSelectedReportId(null);
    }
  };

  const handleDeactivateReport = async () => {

    setOpenDeactivateDialog(true);

    setAnchorEl(null);
  };

  const handleCloseDeactivateDialog = () => {
    setOpenDeactivateDialog(false);

    if (!openApproveDialog && !openRejectDialog && !openDeleteDialog && !openActivateDialog) {
      setSelectedReportId(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip size="small" label="Ativo" color="success" />;
      case 'inactive':
        return <Chip size="small" label="Inativo" color="warning" />;
      case 'canceled':
        return <Chip size="small" label="Cancelado" color="error" />;
      case 'finished':
        return <Chip size="small" label="Finalizado" color="secondary" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  const renderApprovalStatusChip = (status: string) => {
    switch (status) {
      case 'approved':
        return <Chip size="small" label="Aprovado" color="success" icon={<CheckIcon />} />;
      case 'rejected':
        return <Chip size="small" label="Rejeitado" color="error" icon={<CloseIcon />} />;
      case 'pending':
        return <Chip size="small" label="Pendente" color="warning" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  const Approve = () => {

    const dialogReportId = selectedReportId;

    const confirmApprove = async () => {
      if (!dialogReportId) {
        return;
      }
      
      try {
        await approveReport(dialogReportId);
        setOpenApproveDialog(false);
        setSnackbar({
          open: true,
          message: 'Relato aprovado com sucesso!',
          severity: 'success'
        });

        fetchAllReports({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          approvalStatus: filterApproval !== 'all' ? filterApproval : undefined
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Erro ao aprovar relato',
          severity: 'error'
        });
      }
    };
    
    return (
      <Dialog open={openApproveDialog} onClose={handleCloseApproveDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
          Aprovar Relato
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {dialogReportId && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {reports.find(e => e._id === dialogReportId)?.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">
                  <strong>Organizador:</strong> {reports.find(e => e._id === dialogReportId)?.organizer.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Categoria:</strong> {reports.find(e => e._id === dialogReportId)?.category.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Data:</strong> {reports.find(e => e._id === dialogReportId)?.date ? formatDate(reports.find(e => e._id === dialogReportId)?.date || '') : '-'}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
            <InfoIcon color="info" sx={{ mr: 1, mt: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              Ao aprovar este relato, ele ficará visível para todos os usuários e poderá receber inscrições imediatamente.
            </Typography>
          </Box>
          <Typography variant="body2">
            Deseja aprovar este relato?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleCloseApproveDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              confirmApprove();
            }} 
            color="success"
            variant="contained"
          >
            Aprovar Relato
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const Reject = () => {

    const dialogReportId = selectedReportId;

    const confirmReject = async () => {
      if (!dialogReportId) {
        return;
      }
      if (rejectionReason.trim() === '') {
        return;
      }
      
      try {
        await rejectReport(dialogReportId, rejectionReason);
        setRejectionReason('');
        handleCloseRejectDialog();
        setSnackbar({
          open: true,
          message: 'Relato rejeitado com sucesso!',
          severity: 'success'
        });

        fetchAllReports({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          approvalStatus: filterApproval !== 'all' ? filterApproval : undefined
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Erro ao rejeitar relato',
          severity: 'error'
        });
      }
    };
    
    return (
      <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
          Rejeitar Relato
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {dialogReportId && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {reports.find(e => e._id === dialogReportId)?.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">
                  <strong>Organizador:</strong> {reports.find(e => e._id === dialogReportId)?.organizer.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Categoria:</strong> {reports.find(e => e._id === dialogReportId)?.category.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Data:</strong> {reports.find(e => e._id === dialogReportId)?.date ? formatDate(reports.find(e => e._id === dialogReportId)?.date || '') : '-'}
                </Typography>
              </Box>
            </Box>
          )}
          
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
            onClick={() => {
              confirmReject();
            }} 
            color="error"
            variant="contained"
            disabled={rejectionReason.trim() === ''}
          >
            Rejeitar Relato
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const Delete = () => {

    const dialogReportId = selectedReportId;

    const confirmDelete = async () => {
      if (!dialogReportId) {
        return;
      }
      
      try {
        await deleteReport(dialogReportId);
        setOpenDeleteDialog(false);
        setSnackbar({
          open: true,
          message: 'Relato excluído com sucesso!',
          severity: 'success'
        });

        fetchAllReports({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          approvalStatus: filterApproval !== 'all' ? filterApproval : undefined
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Erro ao excluir relato',
          severity: 'error'
        });
      }
    };
    
    return (
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: 'error.dark', color: 'error.contrastText' }}>
          Excluir Relato
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {dialogReportId && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {reports.find(e => e._id === dialogReportId)?.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">
                  <strong>Organizador:</strong> {reports.find(e => e._id === dialogReportId)?.organizer.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Categoria:</strong> {reports.find(e => e._id === dialogReportId)?.category.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Data:</strong> {reports.find(e => e._id === dialogReportId)?.date ? formatDate(reports.find(e => e._id === dialogReportId)?.date || '') : '-'}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {reports.find(e => e._id === dialogReportId)?.status}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
            <InfoIcon color="warning" sx={{ mr: 1, mt: 0.5 }} />
            <Typography variant="body2" color="error">
              <strong>Atenção:</strong> Esta ação é irreversível. O relato será permanentemente excluído do sistema.
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Tem certeza que deseja excluir este relato?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              confirmDelete();
            }} 
            color="error"
            variant="contained"
          >
            Excluir Permanentemente
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const Activate = () => {

    const dialogReportId = selectedReportId;

    const confirmActivate = async () => {
      if (!dialogReportId) {
        return;
      }
      
      try {
        await activateReport(dialogReportId);
        setOpenActivateDialog(false);
        setSnackbar({
          open: true,
          message: 'Relato ativado com sucesso!',
          severity: 'success'
        });

        fetchAllReports({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          approvalStatus: filterApproval !== 'all' ? filterApproval : undefined
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Erro ao ativar relato',
          severity: 'error'
        });
      }
    };
    
    return (
      <Dialog open={openActivateDialog} onClose={handleCloseActivateDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
          Ativar Relato
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {dialogReportId && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {reports.find(e => e._id === dialogReportId)?.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">
                  <strong>Organizador:</strong> {reports.find(e => e._id === dialogReportId)?.organizer.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Categoria:</strong> {reports.find(e => e._id === dialogReportId)?.category.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Data:</strong> {reports.find(e => e._id === dialogReportId)?.date ? formatDate(reports.find(e => e._id === dialogReportId)?.date || '') : '-'}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
            <InfoIcon color="info" sx={{ mr: 1, mt: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              Ao ativar este relato, ele ficará visível para todos os usuários da plataforma e poderá receber inscrições.
            </Typography>
          </Box>
          <Typography variant="body2">
            Deseja ativar este relato?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleCloseActivateDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              confirmActivate();
            }} 
            color="success"
            variant="contained"
          >
            Ativar Relato
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const Deactivate = () => {


    const dialogReportId = selectedReportId;

    const confirmDeactivate = async () => {
      if (!dialogReportId) {
        return;
      }
      
      try {
        await deactivateReport(dialogReportId);
        setOpenDeactivateDialog(false);
        setSnackbar({
          open: true,
          message: 'Relato inativado com sucesso!',
          severity: 'success'
        });

        fetchAllReports({
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          approvalStatus: filterApproval !== 'all' ? filterApproval : undefined
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Erro ao inativar relato',
          severity: 'error'
        });
      }
    };
    
    return (
      <Dialog open={openDeactivateDialog} onClose={handleCloseDeactivateDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          Inativar Relato
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {dialogReportId && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {reports.find(e => e._id === dialogReportId)?.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">
                  <strong>Organizador:</strong> {reports.find(e => e._id === dialogReportId)?.organizer.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Categoria:</strong> {reports.find(e => e._id === dialogReportId)?.category.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Data:</strong> {reports.find(e => e._id === dialogReportId)?.date ? formatDate(reports.find(e => e._id === dialogReportId)?.date || '') : '-'}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
            <InfoIcon color="warning" sx={{ mr: 1, mt: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              Ao inativar este relato, ele ficará oculto para usuários não-administrativos e não poderá receber inscrições.
            </Typography>
          </Box>
          <Typography variant="body2">
            Deseja inativar este relato?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleCloseDeactivateDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              confirmDeactivate();
            }} 
            color="warning"
            variant="contained"
          >
            Inativar Relato
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          Gerenciamento de Relatos
        </Typography>
        
        <AdminNavigation />
        
        {/* Seção de estatísticas */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Estatísticas de Relatos
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Chip 
              label={`Total: ${counts.total}`} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={`Ativos: ${counts.active}`} 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              label={`Inativos: ${counts.inactive}`} 
              color="default" 
              variant="outlined" 
            />
            <Chip 
              label={`Cancelados: ${counts.canceled}`} 
              color="error" 
              variant="outlined" 
            />
            <Chip 
              label={`Finalizados: ${counts.finished}`} 
              color="secondary" 
              variant="outlined" 
            />
            <Chip 
              label={`Pendentes: ${counts.pending}`} 
              color="warning" 
              variant="outlined" 
            />
            <Chip 
              label={`Aprovados: ${counts.approved}`} 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              label={`Rejeitados: ${counts.rejected}`} 
              color="error" 
              variant="outlined" 
            />
          </Box>
        </Paper>
        
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Todos os Relatos
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <TextField
              label="Buscar relatos"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={filterStatus}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Ativos</MenuItem>
                <MenuItem value="inactive">Inativos</MenuItem>
                <MenuItem value="canceled">Cancelados</MenuItem>
                <MenuItem value="finished">Finalizados</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="approval-filter-label">Aprovação</InputLabel>
              <Select
                labelId="approval-filter-label"
                id="approval-filter"
                value={filterApproval}
                label="Aprovação"
                onChange={handleApprovalFilterChange}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="pending">Pendentes</MenuItem>
                <MenuItem value="approved">Aprovados</MenuItem>
                <MenuItem value="rejected">Rejeitados</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/reports/create')}
              size="small"
              sx={{ marginLeft: 'auto' }}
            >
              Criar Relato
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Título</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Organizador</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Categoria</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Data</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Status</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }}>Aprovação</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'medium' }} align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          Nenhum relato encontrado
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
                          <TableCell>{report.title}</TableCell>
                          <TableCell>{report.organizer.name}</TableCell>
                          <TableCell>{report.category.name}</TableCell>
                          <TableCell>{formatDate(report.date)}</TableCell>
                          <TableCell>{renderStatusChip(report.status)}</TableCell>
                          <TableCell>{renderApprovalStatusChip(report.approvalStatus)}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Mais ações">
                              <IconButton
                                aria-label="ações"
                                aria-controls={`menu-${report._id}`}
                                aria-haspopup="true"
                                onClick={(e) => handleMenuOpen(e, report._id)}
                                size="small"
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            
              <TablePagination
                component="div"
                count={pagination.total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Relatos por página:"
              />
            </>
          )}

          {/* Menu de Ações */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleViewReport}>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
              Visualizar
            </MenuItem>
            <MenuItem onClick={handleEditReport}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Editar
            </MenuItem>
            
            {/* Opção para Aprovar - apenas se o relato estiver pendente */}
            {reports.find(e => e._id === selectedReportId)?.approvalStatus === 'pending' && (
              <MenuItem onClick={handleApproveReport}>
                <CheckIcon fontSize="small" sx={{ mr: 1 }} color="success" />
                Aprovar
              </MenuItem>
            )}
            
            {/* Opção para Rejeitar - apenas se o relato estiver pendente */}
            {reports.find(e => e._id === selectedReportId)?.approvalStatus === 'pending' && (
              <MenuItem onClick={handleOpenRejectDialog}>
                <CloseIcon fontSize="small" sx={{ mr: 1 }} color="error" />
                Rejeitar
              </MenuItem>
            )}
            
            {/* Opção para Ativar - apenas se o relato estiver inativo e aprovado */}
            {reports.find(e => e._id === selectedReportId)?.status === 'inactive' && 
             reports.find(e => e._id === selectedReportId)?.approvalStatus === 'approved' && (
              <MenuItem onClick={handleActivateReport}>
                <CheckIcon fontSize="small" sx={{ mr: 1 }} color="success" />
                Ativar
              </MenuItem>
            )}
            
            {/* Opção para Inativar - apenas se o relato estiver ativo */}
            {reports.find(e => e._id === selectedReportId)?.status === 'active' && (
              <MenuItem onClick={handleDeactivateReport}>
                <CloseIcon fontSize="small" sx={{ mr: 1 }} color="warning" />
                Inativar
              </MenuItem>
            )}
            
            <MenuItem onClick={handleDeleteReport} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Excluir
            </MenuItem>
          </Menu>

          {/* Diálogo de Rejeição */}
          {Reject()}

          {/* Diálogo de Exclusão */}
          {Delete()}

          {/* Diálogo de Ativação */}
          {Activate()}

          {/* Diálogo de Inativação */}
          {Deactivate()}

          {/* Diálogo de Aprovação */}
          {Approve()}

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
      </Box>
    </Container>
  );
};

export default AdminDashboardPage; 