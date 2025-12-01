import { useState, useCallback } from 'react';
import * as userService from '../services/userService';
import { 
  User,
  UserUpdateData 
} from '../services/userService';

interface UseUsersState {
  users: User[];
  user: User | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
}

interface UserParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

export const useUsers = () => {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    user: null,
    loading: false,
    error: null,
    success: false,
    pagination: {
      page: 1,
      pages: 1,
      total: 0
    }
  });

  const fetchUsers = useCallback(async (params: UserParams = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await userService.getUsers(params);
      setState(prev => ({
        ...prev,
        users: response.users,
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
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar usuários';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  const fetchUserById = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const user = await userService.getUserById(id);
      setState(prev => ({
        ...prev,
        user,
        loading: false,
        success: true
      }));
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar usuário';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (id: string, userData: UserUpdateData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const user = await userService.updateUser(id, userData);
      setState(prev => ({
        ...prev,
        user,
        loading: false,
        success: true,

        users: prev.users.map(u => u._id === id ? user : u)
      }));
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await userService.deleteUser(id);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,

        users: prev.users.filter(u => u._id !== id),
        user: prev.user?._id === id ? null : prev.user
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir usuário';
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
      users: [],
      user: null,
      loading: false,
      error: null,
      success: false,
      pagination: {
        page: 1,
        pages: 1,
        total: 0
      }
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchUsers,
    fetchUserById,
    updateUser,
    deleteUser,
    clearState,
    clearError
  };
}; 