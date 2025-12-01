import React, { useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Info as InfoIcon,
  Report as ReportIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useUsers } from '../hooks/useUsers';
import { useReports } from '../hooks/useReports';
import ReportCard from '../components/common/ReportCard';
import { Report } from '../services/reportService';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading: userLoading, error: userError, fetchUserById } = useUsers();
  const { reports, loading: reportsLoading, error: reportsError, fetchReports } = useReports();

  useEffect(() => {
    if (userId) {
      fetchUserById(userId);

      fetchReports({ 
        status: 'active',
        approvalStatus: 'approved',
        organizer: userId 
      });
    }
  }, [userId, fetchUserById, fetchReports]);

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
      <ReportIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );

  const renderReportCard = (report: Report) => (
    <Grid item xs={12} sm={6} key={report._id}>
      <ReportCard 
        report={report}
        showEditButton={false}
        showCancelButton={false}
      />
    </Grid>
  );

  if (userLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (userError) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">
          {userError}
        </Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">
          Usuário não encontrado
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
              
              <Typography variant="h5" fontWeight="medium" align="center">
                {user.name}
              </Typography>
              <Chip 
                label={user.role === 'admin' ? 'Administrador' : 'Usuário'} 
                color={user.role === 'admin' ? 'error' : 'primary'} 
                size="small" 
                sx={{ mt: 1 }}
              />
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

              {user.phone && (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <PhoneIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Telefone" 
                    secondary={user.phone} 
                  />
                </ListItem>
              )}

              <ListItem alignItems="flex-start" sx={{ display: 'block', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <InfoIcon />
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    Biografia
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    ml: 7, 
                    whiteSpace: 'pre-wrap',
                    color: user.bio ? 'text.primary' : 'text.secondary'
                  }}
                >
                  {user.bio || "Nenhuma biografia informada."}
                </Typography>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Seção de relatos ativos */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Relatos Ativos
            </Typography>

            {reportsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : reportsError ? (
              <Alert severity="error">
                {reportsError}
              </Alert>
            ) : reports && reports.length > 0 ? (
              <Grid container spacing={2}>
                {reports.map(renderReportCard)}
              </Grid>
            ) : (
              renderEmptyState("Este usuário não possui relatos ativos no momento")
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfilePage; 