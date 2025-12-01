import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import {
  Event as EventIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { Report, ReportQueryParams } from '../services/reportService';
import ReportCard from '../components/common/ReportCard';
import { useAuth } from '../hooks/useAuth';

const MyReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === 'admin';

  const [page, setPage] = useState(1);
  const limit = 6;

  const [createdReports, setCreatedReports] = useState<Report[]>([]);

  const { 
    loading, 
    error,
    pagination,
    fetchMyReports,
    cancelReport
  } = useReports();

  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    const params: ReportQueryParams = { page, limit };
      
      fetchMyReports(params)
        .then(data => {
          setCreatedReports(data);
        })
        .catch(err => {
          console.error('Erro ao buscar relatos criados:', err);
          setAlert({
            type: 'error',
            message: err instanceof Error ? err.message : 'Erro ao buscar relatos'
          });
        });
  }, [page, limit, fetchMyReports]);

  const handleEditReport = (reportId: string) => {
    navigate(`/reports/edit/${reportId}`);
  };

  const handleCancelReport = async (reportId: string) => {
    try {
      await cancelReport(reportId);
      setAlert({
        type: 'success',
        message: 'Relato cancelado com sucesso!'
      });

      const params: ReportQueryParams = { page, limit };
      const data = await fetchMyReports(params);
      setCreatedReports(data);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao cancelar relato. Tente novamente.'
      });
    }
  };

  const handlePageChange = (_report: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const renderCreatedReports = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      );
    }
    
    if (createdReports.length === 0) {
      return (
        <Paper sx={{ 
          py: 6, 
          px: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2
        }}>
          <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Você ainda não criou nenhum relato
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crie seu primeiro relato e comece a organizar!
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/reports/create')}
          >
            Criar Relato
          </Button>
        </Paper>
      );
    }
    
    return (
      <>
        {/* Informação sobre relatos pendentes */}
        {createdReports.some(report => report.approvalStatus === 'pending') && !isAdmin && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Relatos editados voltam para o estado de aprovação pendente e ficam inativos até serem aprovados novamente.
          </Alert>
        )}
        
        {/* Informação para administradores */}
        {isAdmin && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Como administrador, suas edições em relatos são aprovadas automaticamente.
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {createdReports.map(report => (
            <Grid item xs={12} sm={6} md={4} key={report._id}>
              <ReportCard 
                report={report}
                showEditButton={report.status !== 'canceled'}
                showCancelButton={report.status === 'active'}
                onEdit={handleEditReport}
                onCancel={handleCancelReport}
              />
            </Grid>
          ))}
        </Grid>
        
        {pagination.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={pagination.pages} 
              page={page} 
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Alert message */}
      {alert && (
        <Alert 
          severity={alert.type} 
          sx={{ mb: 3 }}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      {/* Cabeçalho da página */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          Meus Relatos
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Gerencie seus relatos.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/reports/create')}
          startIcon={<EventIcon />}
        >
          Criar Novo Relato
        </Button>
      </Paper>

      {/* Tab panel para relatos criados pelo usuário */}
      <Paper sx={{ p: 2 }}>
          {renderCreatedReports()}
      </Paper>
    </Container>
  );
};

export default MyReportsPage; 