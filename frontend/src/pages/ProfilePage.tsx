import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Avatar,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Info as InfoIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../services/authService';
import { Report } from '../services/reportService';
import ReportCard from '../components/common/ReportCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { authState, updateUserData } = useAuth();
  const { user } = authState;
  const { 
    loading: reportsLoading, 
    error: reportsError, 
    reports: userReports, 
    fetchMyReports, 
    cancelReport
  } = useReports();

  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: () => {}
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    bio: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (tabValue === 0) {
      fetchMyReports({ limit: 4 });
    } 
  }, [tabValue, fetchMyReports]);

  const handleTabChange = (_report: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await authService.updateProfile(profileForm);

      await updateUserData();
      
      setEditMode(false);
      setSnackbar({
        open: true,
        message: 'Perfil atualizado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar perfil. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'As senhas não coincidem.',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await authService.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordDialogOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSnackbar({
        open: true,
        message: 'Senha atualizada com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar senha. Verifique se a senha atual está correta.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderEmptyState = (message: string) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      py: 8 
    }}>
      <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );

  const handleCancelReport = async (reportId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Cancelar Relato',
      message: 'Tem certeza que deseja cancelar este relato? Esta ação não pode ser desfeita.',
      action: async () => {
        try {
          await cancelReport(reportId);
          setSnackbar({
            open: true,
            message: 'Relato cancelado com sucesso!',
            severity: 'success'
          });

          fetchMyReports({ limit: 20 });
        } catch {
          setSnackbar({
            open: true,
            message: 'Erro ao cancelar relato. Tente novamente.',
            severity: 'error'
          });
        }
      }
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

  const renderReportCard = (report: Report) => (
    <ReportCard 
      key={report._id}
      report={report}
      showEditButton={report.status !== 'canceled' && report.approvalStatus === 'approved'}
      showCancelButton={report.status !== 'canceled' && report.approvalStatus === 'approved'}
      onEdit={() => navigate(`/reports/edit/${report._id}`)}
      onCancel={() => handleCancelReport(report._id)}
    />
  );

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          Meu Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Visualize e gerencie seus dados pessoais e seus relatos na plataforma Resolve Aí.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Seção de perfil do usuário */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem'
                }}
              >
                {getInitials(user.name)}
              </Avatar>
              
              {!editMode ? (
                <>
                  <Typography variant="h5" fontWeight="medium" align="center">
                    {user.name}
                  </Typography>
                  <Chip 
                    label={user.role === 'admin' ? 'Administrador' : 'Usuário'} 
                    color={user.role === 'admin' ? 'error' : 'primary'} 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                </>
              ) : (
                <TextField
                  fullWidth
                  label="Nome Completo"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  margin="normal"
                  variant="outlined"
                  autoFocus
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <List dense>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <EmailIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Email" 
                  secondary={user.email} 
                />
              </ListItem>

              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <PhoneIcon />
                  </Avatar>
                </ListItemAvatar>
                {!editMode ? (
                  <ListItemText 
                    primary="Telefone" 
                    secondary={user.phone || 'Não informado'} 
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="Telefone"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    margin="dense"
                    variant="outlined"
                    placeholder="(00) 00000-0000"
                  />
                )}
              </ListItem>

              <ListItem alignItems="flex-start" sx={{ display: 'block' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <InfoIcon />
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    Biografia
                  </Typography>
                </Box>
                
                {!editMode ? (
                  <Typography variant="body2" paragraph sx={{ ml: 7 }}>
                    {user.bio || 'Nenhuma biografia informada.'}
                  </Typography>
                ) : (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Biografia"
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    margin="dense"
                    variant="outlined"
                    placeholder="Conte um pouco sobre você..."
                    sx={{ ml: 0 }}
                  />
                )}
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              {!editMode ? (
                <>
                  <Button 
                    variant="contained" 
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                  >
                    Editar Perfil
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    startIcon={<LockIcon />}
                    onClick={handleOpenPasswordDialog}
                  >
                    Alterar Senha
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    Salvar
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setEditMode(false);
                      if (user) {
                        setProfileForm({
                          name: user.name || '',
                          phone: user.phone || '',
                          bio: user.bio || ''
                        });
                      }
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Seção de relatos e atividades */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="Abas do perfil">
                <Tab label="Meus Relatos" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
              </Tabs>
            </Box>

            {/* Conteúdo das abas */}
            <TabPanel value={tabValue} index={0}>
              {/* Relatos criados pelo usuário */}
              {reportsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : reportsError ? (
                <Box sx={{ py: 2 }}>
                  <Alert severity="error">{reportsError}</Alert>
                </Box>
              ) : userReports && userReports.length > 0 ? (
                <Grid container spacing={2}>
                  {userReports.map((report) => (
                    <Grid item xs={12} sm={6} key={report._id}>
                      {renderReportCard(report)}
                    </Grid>
                  ))}
                </Grid>
              ) : (
                renderEmptyState("Você ainda não criou nenhum relato")
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo para alterar senha */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Alterar Senha</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Senha Atual"
              name="currentPassword"
              type="password"
              fullWidth
              variant="outlined"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              autoFocus
            />
            <TextField
              label="Nova Senha"
              name="newPassword"
              type="password"
              fullWidth
              variant="outlined"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
            />
            <TextField
              label="Confirmar Nova Senha"
              name="confirmPassword"
              type="password"
              fullWidth
              variant="outlined"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              error={passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== ''}
              helperText={
                passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== '' 
                  ? "As senhas não coincidem" 
                  : ""
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={handleChangePassword} 
            color="primary" 
            variant="contained"
            disabled={
              loading || 
              !passwordForm.currentPassword || 
              !passwordForm.newPassword || 
              passwordForm.newPassword !== passwordForm.confirmPassword
            }
          >
            {loading ? <CircularProgress size={24} /> : "Alterar Senha"}
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

      {/* Diálogo de confirmação */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography id="confirm-dialog-description">
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              confirmDialog.action();
              handleCloseConfirmDialog();
            }} 
            color={confirmDialog.title.includes('Cancelar') ? "error" : "primary"}
            variant="contained"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage; 