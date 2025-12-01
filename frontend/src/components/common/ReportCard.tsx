import React, { useState, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Box, 
  Typography, 
  Chip, 
  Button, 
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Report as ReportIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Report } from '../../services/reportService';

interface ReportCardProps {
  report: Report;
  showEditButton?: boolean;
  showCancelButton?: boolean;
  onEdit?: (reportId: string) => void;
  onCancel?: (reportId: string) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  showEditButton = false,
  showCancelButton = false,
  onEdit,
  onCancel,
}) => {
  const navigate = useNavigate();
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const handleOpenCancelDialog = () => {
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };

  const handleConfirmCancel = () => {
    onCancel?.(report._id);
    setOpenCancelDialog(false);
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

  const formatLocation = (location: { city: string; state: string }) => {
    return `${location.city}, ${location.state}`;
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      opacity: report.status === 'canceled' ? 0.7 : 1,
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      borderRadius: 2,
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6
      }
    }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={report.imageUrl || '/images/default-report.svg'}
          alt={report.title}
          style={{
            width: '100%',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
        {report.status === 'canceled' && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }}>
            <Chip 
              label="CANCELADO" 
              color="error" 
              sx={{ 
                fontWeight: 'bold', 
                fontSize: '1rem',
                backgroundColor: 'rgba(211, 47, 47, 0.9)',
                color: 'white'
              }}
            />
          </Box>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ 
            fontWeight: 'bold',
            fontSize: '1.1rem',
            lineHeight: 1.3,
            flex: 1,
            mr: 2
          }}>
            {report.title}
          </Typography>
          <Chip 
            label={report.category.name} 
            size="small" 
            color="primary" 
            sx={{ 
              ml: 1,
              backgroundColor: 'primary.main',
              color: 'white'
            }}
          />
        </Box>
        
        {/* Descrição do relato com limite de 2 linhas e efeito de fade */}
        <Box sx={{ position: 'relative', mb: 2, height: '3em' }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: '1.5em',
              height: '3em',
              mb: 0
            }}
            ref={descriptionRef}
          >
            {report.description}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ReportIcon color="action" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(report.date)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon color="action" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {formatLocation(report.location)}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 2
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`${report.approvalStatus === 'approved' ? 'Aprovado' : 
                     report.approvalStatus === 'rejected' ? 'Rejeitado' : 'Pendente'}`} 
              size="small" 
              color={report.approvalStatus === 'approved' ? "success" : 
                     report.approvalStatus === 'rejected' ? "error" : "warning"} 
              sx={{ fontWeight: 'bold' }}
            />
            <Chip 
              label={report.status === 'active' ? 'Ativo' :
                     report.status === 'inactive' ? 'Inativo' :
                     report.status === 'canceled' ? 'Cancelado' : 'Finalizado'}
              size="small"
              color={report.status === 'active' ? "success" :
                     report.status === 'inactive' ? "warning" :
                     report.status === 'canceled' ? "error" : "secondary"}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          <Box sx={{ display: 'flex' }}>
            {showEditButton && report.status !== 'canceled' && (
              <Tooltip title={report.approvalStatus === 'pending' ? "Editar relato pendente" : "Editar relato"} arrow>
                <IconButton 
                  color="primary" 
                  onClick={() => onEdit?.(report._id)}
                  size="small"
                  sx={{ 
                    mr: 1,
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText'
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {showCancelButton && report.status === 'active' && (
              <Tooltip title="Cancelar relato" arrow>
                <IconButton 
                  color="error" 
                  onClick={handleOpenCancelDialog}
                  size="small"
                  sx={{ 
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'error.contrastText'
                    }
                  }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
      <Box sx={{ p: 3, pt: 0, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate(`/reports/${report._id}`)}
          fullWidth
          sx={{ 
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: 2,
            py: 1
          }}
        >
          Ver Detalhes
        </Button>
      </Box>

      {/* Confirmation Dialog for Canceling Report */}
      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">
          Cancelar Relato
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Tem certeza que deseja cancelar o relato "{report.title}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="primary">
            Voltar
          </Button>
          <Button 
            onClick={handleConfirmCancel} 
            color="error"
            variant="contained"
            startIcon={<CancelIcon />}
          >
            Confirmar Cancelamento
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ReportCard; 