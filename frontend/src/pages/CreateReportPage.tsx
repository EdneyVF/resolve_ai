import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import {
  Add as AddIcon,
  Save as SaveIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Report as ReportIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { useCategories } from '../hooks/useCategories';
import { ReportCreateData, ReportUpdateData } from '../services/reportService';
import { useAuth } from '../hooks/useAuth';

interface ReportFormData {
  title: string;
  description: string;
  date: Date | null;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  category: string;
  imageUrl: string;
  tags: string[];
}

const CreateReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const { 
    createReport, 
    updateReport, 
    fetchReportById, 
    report, 
    loading:reportLoading, 
    error:reportError 
  } = useReports();
  const { categories, loading: categoriesLoading, error: categoriesError, fetchCategories } = useCategories();
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === 'admin';

  useEffect(() => {
    fetchCategories().catch(err => {
      console.error('Erro ao carregar categorias:', err);
    });
  }, [fetchCategories]);

  const [formData, setFormData] = useState<ReportFormData>({
    title: '',
    description: '',
    date: null,
    location: {
      address: '',
      city: '',
      state: '',
      country: 'Brasil'
    },
    category: '',
    imageUrl: '',
    tags: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (isEditMode && id) {
      fetchReportById(id)
        .then(() => setInitialLoad(false))
        .catch(err => {
          console.error('Erro ao carregar relato:', err);
          setAlert({
            type: 'error',
            message: err instanceof Error ? err.message : 'Erro ao carregar relato'
          });
          setInitialLoad(false);
        });
    } else {
      setInitialLoad(false);
    }
  }, [isEditMode, id, fetchReportById]);

  useEffect(() => {
    if (isEditMode && report && !initialLoad) {
      setFormData({
        title: report.title,
        description: report.description,
        date: report.date ? new Date(report.date) : null,
        location: {
          address: report.location.address,
          city: report.location.city,
          state: report.location.state,
          country: report.location.country
        },
        category: report.category._id,
        imageUrl: report.imageUrl || '',
        tags: report.tags || []
      });
    }
  }, [report, isEditMode, initialLoad]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as string;
    const value = e.target.value as string;

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {

    if (errors.date) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.date;
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      date: date ? date.toDate() : null
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'O título é obrigatório';
    } else if (formData.title.length < 3) {
      newErrors.title = 'O título deve ter pelo menos 3 caracteres';
    } else if (formData.title.length > 100) {
      newErrors.title = 'O título deve ter no máximo 100 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'A descrição é obrigatória';
    } else if (formData.description.length < 10) {
      newErrors.description = 'A descrição deve ter pelo menos 10 caracteres';
    }

    if (!formData.date) {
      newErrors.date = 'A data e hora são obrigatórias';
    }

    if (!formData.location.address.trim()) {
      newErrors['location.address'] = 'O endereço é obrigatório';
    }
    
    if (!formData.location.city.trim()) {
      newErrors['location.city'] = 'A cidade é obrigatória';
    }
    
    if (!formData.location.state.trim()) {
      newErrors['location.state'] = 'O estado é obrigatório';
    }

    if (!formData.category) {
      newErrors.category = 'A categoria é obrigatória';
    }

    if (formData.imageUrl.trim() !== '') {
      const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
      if (!urlPattern.test(formData.imageUrl)) {
        newErrors.imageUrl = 'URL de imagem inválida. Deve começar com http:// ou https://';
      }
    }

    if (formData.tags.length > 10) {
      newErrors.tags = 'Máximo de 10 tags permitidas';
    }
    
    formData.tags.forEach((tag, index) => {
      if (tag.length < 3 || tag.length > 30) {
        newErrors[`tags[${index}]`] = 'Cada tag deve ter entre 3 e 30 caracteres';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareSubmitData = (): ReportCreateData | ReportUpdateData => {

    const data: ReportUpdateData = {
      title: formData.title,
      description: formData.description,
      date: formData.date ? formData.date.toISOString() : '',
      location: {
        address: formData.location.address,
        city: formData.location.city,
        state: formData.location.state,
        country: formData.location.country
      },
      category: formData.category,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    };


    if (isEditMode) {
      data.imageUrl = formData.imageUrl.trim() !== '' ? formData.imageUrl : null;
    } else if (formData.imageUrl.trim() !== '') {

      data.imageUrl = formData.imageUrl;
    }
    
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const reportData = prepareSubmitData();
      let result;
      
      if (isEditMode && id) {
        result = await updateReport(id,reportData);
      } else {
        result = await createReport(reportData as ReportCreateData);
      }
      
      setAlert({
        type: 'success',
        message: result.message || (isEditMode ? 'Relato atualizado com sucesso!' : 'Relato criado com sucesso!')
      });

      setTimeout(() => {
        navigate('/my-reports');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao ' + (isEditMode ? 'atualizar' : 'criar') + ' relato:', error);
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao ' + (isEditMode ? 'atualizar' : 'criar') + ' relato. Tente novamente.'
      });
    }
  };

  if (isEditMode && initialLoad) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Alerta de sucesso ou erro */}
        {(alert ||reportError) && (
          <Alert 
            severity={alert?.type || 'error'} 
            sx={{ mb: 3 }}
            onClose={() => setAlert(null)}
          >
            {alert?.message ||reportError}
          </Alert>
        )}

        {/* Cabeçalho da página */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ReportIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
            <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
              {isEditMode ? 'Editar Relato' : 'Criar Novo Relato'}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            {isEditMode 
              ? 'Atualize as informações do seu relato. Os campos obrigatórios estão marcados.' 
              : 'Preencha os detalhes do seu relato sobre algo que já ocorreu ou está ocorrendo. Os campos obrigatórios estão marcados.'}
          </Typography>
          
          {isEditMode && (
            <Alert severity={isAdmin ? "success" : "info"} sx={{ mt: 2 }}>
              {isAdmin 
                ? 'Como administrador, suas edições serão aplicadas imediatamente e o relato permanecerá aprovado e ativo.'
                : 'Quando um relato é editado, ele volta para o estado de aprovação pendente e fica inativo até ser aprovado novamente.'}
            </Alert>
          )}
        </Paper>

        {/* Formulário de criação de relato */}
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Informações básicas */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Informações Básicas
                </Typography>
              </Grid>
              
              {/* Título */}
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Título do Relato"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ReportIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Descrição */}
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Descrição"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  multiline
                  minRows={4}
                  error={!!errors.description}
                  helperText={errors.description}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Categoria */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.category} required>
                  <InputLabel id="category-label">Categoria</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={formData.category}
                    onChange={handleSelectChange}
                    label="Categoria"
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon color="action" />
                      </InputAdornment>
                    }
                    disabled={categoriesLoading}
                  >
                    {categoriesLoading ? (
                      <MenuItem value="">Carregando categorias...</MenuItem>
                    ) : (
                      categories.map(category => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.category && (
                    <Typography color="error" variant="caption">
                      {errors.category}
                    </Typography>
                  )}
                  {categoriesError && (
                    <Typography color="error" variant="caption">
                      Erro ao carregar categorias. Por favor, tente novamente.
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              {/* Data e Horário */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Data e Horário do Ocorrido
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="Data e Hora do Ocorrido"
                      value={formData.date ? dayjs(formData.date) : null}
                      onChange={handleDateChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!errors.date,
                          helperText: errors.date || 'Informe quando o fato relatado ocorreu'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              {/* Localização e Limites */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Localização e Limites
                </Typography>
              </Grid>
              
              {/* Endereço */}
              <Grid item xs={12}>
                <TextField
                  name="location.address"
                  label="Endereço"
                  value={formData.location.address}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  error={!!errors['location.address']}
                  helperText={errors['location.address']}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Cidade e Estado */}
              <Grid item xs={12} sm={6}>
                <TextField
                  name="location.city"
                  label="Cidade"
                  value={formData.location.city}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  error={!!errors['location.city']}
                  helperText={errors['location.city']}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="location.state"
                  label="Estado"
                  value={formData.location.state}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  error={!!errors['location.state']}
                  helperText={errors['location.state']}
                  required
                />
              </Grid>
              
              {/* País */}
              <Grid item xs={12} sm={6}>
                <TextField
                  name="location.country"
                  label="País"
                  value={formData.location.country}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  helperText="Se não informado, será considerado 'Brasil'"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              {/* Imagem */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Imagem do Relato
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="imageUrl"
                  label="URL da Imagem"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  error={!!errors.imageUrl}
                  helperText={errors.imageUrl || "Cole o endereço (URL) de uma imagem online ou deixe em branco para usar a imagem padrão do sistema"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ImageIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                {formData.imageUrl && !errors.imageUrl && (
                  <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Typography variant="caption" display="block" gutterBottom>
                      Pré-visualização:
                    </Typography>
                    <Box 
                      component="img"
                      sx={{
                        height: 100,
                        maxWidth: '100%',
                        objectFit: 'contain'
                      }}
                      src={formData.imageUrl}
                      alt="Pré-visualização da imagem"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';

                        const parent = target.parentElement;
                        if (parent) {
                          const errorMsg = document.createElement('p');
                          errorMsg.textContent = 'Não foi possível carregar a imagem. Verifique se a URL está correta.';
                          errorMsg.style.color = 'red';
                          parent.appendChild(errorMsg);
                        }
                      }}
                    />
                  </Box>
                )}
              </Grid>

              {/* Botões de ação */}
              <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={() => navigate('/my-reports')}
                  disabled={reportLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  disabled={reportLoading}
                  startIcon={reportLoading ? <CircularProgress size={20} /> : (isEditMode ? <SaveIcon /> : <AddIcon />)}
                >
                  {reportLoading ? (isEditMode ? 'Atualizando...' : 'Criando...') : (isEditMode ? 'Salvar Alterações' : 'Criar Relato')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateReportPage; 