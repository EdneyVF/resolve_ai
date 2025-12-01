import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Event as EventIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useReports } from '../hooks/useReports';
import { useCategories } from '../hooks/useCategories';
import ReportCard from '../components/common/ReportCard';

interface ReportParams {
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
  category?: string;
  status?: string;
  free?: boolean;
  hasAvailability?: boolean;
  location?: string;
  sort?: string;
}

const ReportsPage: React.FC = () => {

  const { 
    reports, 
    loading, 
    error, 
    pagination,
    fetchReports
  } = useReports();

  const { 
    categories, 
    loading: loadingCategories, 
    fetchCategories 
  } = useCategories();

  const [page, setPage] = useState(1);
  const [limit] = useState(9); // 9 cards por página (grid 3x3)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [sortOrder, setSortOrder] = useState<string>('date_asc');
  const [freeOnly, setFreeOnly] = useState(false);
  const [hasAvailability, setHasAvailability] = useState(false);
  const [location, setLocation] = useState('');

  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    fetchCategories().catch(err => console.error('Erro ao carregar categorias:', err));
  }, [fetchCategories]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const params: ReportParams = {
          page,
          limit,
          status: filterStatus,
          sort: sortOrder
        };

        if (searchQuery) {
          params.q = searchQuery;
        }
        
        if (selectedCategory) {
          params.category = selectedCategory;
        }
        
        if (freeOnly) {
          params.free = true;
        }
        
        if (hasAvailability) {
          params.hasAvailability = true;
        }
        
        if (location) {
          params.location = location;
        }
        
        await fetchReports(params);
      } catch (err) {
        console.error('Erro ao carregar relatos:', err);
        setAlert({
          type: 'error',
          message: err instanceof Error ? err.message : 'Erro ao carregar relatos'
        });
      }
    };
    
    loadReports();
  }, [fetchReports, page, limit, searchQuery, selectedCategory, filterStatus, sortOrder, freeOnly, hasAvailability, location]);

  const handleSearch = (report: React.FormEvent) => {
    report.preventDefault();
    setPage(1); // Reiniciar paginação ao pesquisar
  };

  const handleSearchInputChange = (report: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(report.target.value);
  };

  const handleCategoryChange = (report: SelectChangeEvent) => {
    setSelectedCategory(report.target.value);
    setPage(1);
  };

  const handleSortChange = (report: SelectChangeEvent) => {
    setSortOrder(report.target.value);
    setPage(1);
  };

  const handleLocationChange = (report: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(report.target.value);
  };

  const handlePageChange = (_report: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setFilterStatus('active');
    setSortOrder('date_asc');
    setFreeOnly(false);
    setHasAvailability(false);
    setLocation('');
    setPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Alerta de sucesso ou erro */}
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
          Relatos Disponíveis
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Descubra e participe dos relatos mais interessantes na plataforma Resolve Aí.
        </Typography>
      </Paper>

      {/* Filtros e pesquisa */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSearch}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
            <TextField
              placeholder="Pesquisar relatos..."
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchInputChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <TextField
              placeholder="Localização..."
              variant="outlined"
              value={location}
              onChange={handleLocationChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', md: '30%' } }}
            />
            <Button 
              variant="contained" 
              color="primary"
              type="submit"
              sx={{ minWidth: '120px' }}
            >
              Buscar
            </Button>
          </Box>
        </form>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between',
          gap: 2
        }}>
          {/* Dropdowns para filtros */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2,
            flexGrow: 1
          }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={selectedCategory}
                label="Categoria"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">Todas</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortOrder}
                label="Ordenar por"
                onChange={handleSortChange}
              >
                <MenuItem value="date_asc">Data (Próximos)</MenuItem>
                <MenuItem value="date_desc">Data (Antigos)</MenuItem>
                <MenuItem value="price_asc">Preço (Menor)</MenuItem>
                <MenuItem value="price_desc">Preço (Maior)</MenuItem>
                <MenuItem value="recent">Recém adicionados</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* Switches para filtros adicionais */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2
          }}>
            <Button 
              color="secondary" 
              variant="outlined" 
              size="small" 
              onClick={clearFilters}
              sx={{ alignSelf: 'center' }}
            >
              Limpar filtros
            </Button>
          </Box>
        </Box>
        
        {!loadingCategories && categories.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label="Todos" 
              variant={selectedCategory === '' ? "filled" : "outlined"} 
              color="primary" 
              onClick={() => handleCategoryClick('')} 
            />
            {categories.map((category) => (
              <Chip 
                key={category._id}
                label={category.name} 
                variant={selectedCategory === category._id ? "filled" : "outlined"} 
                color="primary"
                onClick={() => handleCategoryClick(category._id)} 
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Lista de relatos */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : reports.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {reports.map((report) => (
              <Grid item xs={12} sm={6} md={4} key={report._id}>
                <ReportCard report={report} />
              </Grid>
            ))}
          </Grid>
          
          {/* Paginação */}
          {pagination.pages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              mt: 4,
              gap: 2
            }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {reports.length} de {pagination.total} relatos
              </Typography>
              <Pagination 
                count={pagination.pages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                showFirstButton
                showLastButton
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: '1rem',
                    minWidth: '40px',
                    height: '40px'
                  }
                }}
              />
            </Box>
          )}
        </>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum relato encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Tente ajustar seus filtros ou crie um novo relato
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ReportsPage; 