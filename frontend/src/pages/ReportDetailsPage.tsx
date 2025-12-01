import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  Tag as TagIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useReports } from '../hooks/useReports';
import { useAuth } from '../hooks/useAuth';

const ReportDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { user } = authState;

  const {
    report,
    loading,
    error,
    fetchReportById,
    cancelReport,
    fetchApprovalStatus,
    approvalInfo
  } = useReports();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    action: () => {}
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    if (id) {
      fetchReportById(id).catch(err => {
        console.error('Erro ao carregar relato:', err);
      });
    }
  }, [id, fetchReportById]);

  useEffect(() => {
    if (report && report.approvalStatus === 'rejected' && id) {
      fetchApprovalStatus(id).catch(err => {
        console.error('Erro ao buscar informações de aprovação:', err);
      });
    }
  }, [report, id, fetchApprovalStatus]);

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

  const formatLocation = (location: { city: string; state: string; country: string }) => {
    return `${location.city}, ${location.state}, ${location.country}`;
  };

  const isOrganizer = report?.organizer._id === user?._id;

  const handleCancelReport = () => {
    setConfirmDialog({
      open: true,
      title: 'Cancelar Relato',
      message: 'Tem certeza que deseja cancelar este relato? Esta ação não pode ser desfeita.',
      action: confirmCancelReport
    });
  };

  const confirmCancelReport = async () => {
    if (!report?._id) return;

    try {
      await cancelReport(report._id);
      setSnackbar({
        open: true,
        message: 'Relato cancelado com sucesso!',
        severity: 'success'
      });

      fetchReportById(report._id);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Erro ao cancelar relato',
        severity: 'error'
      });
    } finally {
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
  };

  const handleEditReport = () => {
    if (report?._id) {
      navigate(`/reports/edit/${report._id}`);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: report?.title,
        text: report?.description,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSnackbar({
        open: true,
        message: 'Link copiado para a área de transferência!',
        severity: 'success'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleCloseDialog = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !report) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">
          {error || 'Relato não encontrado'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Alerta para relato rejeitado (apenas para o organizador) */}
      {report.approvalStatus === 'rejected' && isOrganizer && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Relato Rejeitado</AlertTitle>
          Este relato foi rejeitado por um administrador. Verifique e faça as alterações necessárias antes de tentar novamente.
        </Alert>
      )}
      
      {/* Imagem do relato */}
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{ 
          position: 'relative', 
          height: 400, 
          boxShadow: 'inset 0px 2px 8px 0px rgba(0, 0, 0, 0.15)'
        }}>
          <CardMedia
            component="img"
            image={report.imageUrl || '/images/default-report.svg'}
            alt={report.title}
            sx={{ height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/default-report.svg';
            }}
          />
          {(report.status === 'canceled' || report.status === 'inactive') && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.5)'
            }}>
              <Chip 
                label={report.status === 'canceled' ? 'CANCELADO' : 'INATIVO'} 
                color={report.status === 'canceled' ? "error" : "warning"} 
                sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}
              />
            </Box>
          )}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Informações principais do relato */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                {report.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Compartilhar">
                  <IconButton onClick={handleShare} color="primary">
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                {isOrganizer && report.status !== 'canceled' && (
                  <>
                    <Tooltip title="Editar">
                      <IconButton onClick={handleEditReport} color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancelar Relato">
                      <IconButton onClick={handleCancelReport} color="error">
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Chip 
                label={report.category.name} 
                color="primary" 
                icon={<CategoryIcon />}
              />
              <Chip 
                label={`${report.approvalStatus === 'approved' ? 'Aprovado' : 
                       report.approvalStatus === 'rejected' ? 'Rejeitado' : 'Pendente'}`} 
                color={report.approvalStatus === 'approved' ? "success" : 
                       report.approvalStatus === 'rejected' ? "error" : "warning"} 
                icon={report.approvalStatus === 'approved' ? <CheckIcon /> : 
                       report.approvalStatus === 'rejected' ? <CloseIcon /> : <TimeIcon />}
              />
              {report.tags && report.tags.map((tag, index) => (
                <Chip 
                  key={index}
                  label={tag} 
                  variant="outlined" 
                  icon={<TagIcon />}
                />
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom fontWeight="bold">
              Sobre o Relato
            </Typography>
            <Typography variant="body1" paragraph>
              {report.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom fontWeight="bold">
              Informações do Organizador
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56,
                  bgcolor: 'primary.main'
                }}
              >
                {report.organizer.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {report.organizer.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {report.organizer.email}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Card lateral com informações e ações */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Data do Ocorrido" 
                    secondary={formatDate(report.date)}
                  />
                </ListItem>
                {report.endDate && (
                  <ListItem>
                    <ListItemIcon>
                      <TimeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Término" 
                      secondary={formatDate(report.endDate)}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Local" 
                    secondary={formatLocation(report.location)}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Status de aprovação para relatos rejeitados */}
              {report.approvalStatus === 'rejected' && (
                <>
                  <Box sx={{ p: 2, mb: 2, borderRadius: 1, border: '1px solid', borderColor: 'error.main'}}>
                    <Typography variant="h6" fontWeight="bold" color="error.dark">
                      Status: Rejeitado
                    </Typography>
                    {isOrganizer && (
                      <>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="error.dark">
                        Motivo da Rejeição
                      </Typography>
                      <Typography variant="body1" color="error.dark">
                        {approvalInfo?.rejectionReason || 'Nenhuma justificativa fornecida.'}
                      </Typography>
                      </>
                    )}
                  </Box>
                  <Divider sx={{ mt: 2 }} />
                  <Box sx={{ mt: 0, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="subtitle1" mb={1} color="error.dark">
                      Você precisa editar e reenviar este relato para aprovação.
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Como proceder:
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      1. Edite seu relato seguindo as orientações fornecidas no motivo da rejeição.
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      2. Ao salvar as alterações, seu relato será automaticamente reenviado para aprovação.
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      3. Um administrador revisará as alterações e aprovará ou rejeitará novamente seu relato.
                    </Typography>
                  </Box>
                </>
              )}

              {isOrganizer && report.status !== 'canceled' && (
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    startIcon={<EditIcon />}
                    onClick={handleEditReport}
                  >
                    Editar Relato
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de confirmação */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={confirmDialog.action} 
            color={confirmDialog.title.includes('Cancelar') ? "error" : "primary"}
            variant="contained"
          >
            Confirmar
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
    </Container>
  );
};

export default ReportDetailsPage; 