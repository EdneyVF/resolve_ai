import React, { createContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { AuthState, AuthContextType, LoginCredentials, RegisterData, User } from '../types/auth';
import * as authService from '../services/authService';

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  success: false
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ActionType = 
  | { type: 'AUTH_REQUEST' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

const authReducer = (state: AuthState, action: ActionType): AuthState => {
  switch (action.type) {
    case 'AUTH_REQUEST':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload, 
        error: null,
        success: true 
      };
    case 'AUTH_FAILURE':
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        success: false 
      };
    case 'LOGOUT':
      return { 
        ...initialState,
        success: false 
      };
    case 'CLEAR_ERROR':
      return { 
        ...state, 
        error: null 
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');

      if (token && authService.isTokenValid(token)) {
        try {
          dispatch({ type: 'AUTH_REQUEST' });
          const userData = await authService.getMe();
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { ...userData, token }
          });
        } catch {

          try {
            const newToken = await authService.refreshToken();
            
            if (newToken) {

              const userData = await authService.getMe();
              dispatch({ 
                type: 'AUTH_SUCCESS', 
                payload: { ...userData, token: newToken }
              });
            } else {

              authService.clearTokens();
              dispatch({ 
                type: 'AUTH_FAILURE', 
                payload: 'Sessão expirada. Por favor, faça login novamente.' 
              });
            }
          } catch {

            authService.clearTokens();
            dispatch({ 
              type: 'AUTH_FAILURE', 
              payload: 'Sessão expirada. Por favor, faça login novamente.' 
            });
          }
        }
      } else if (token) {

        authService.clearTokens();
        dispatch({ 
          type: 'AUTH_FAILURE', 
          payload: 'Sessão inválida. Por favor, faça login novamente.' 
        });
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_REQUEST' });
      const user = await authService.login(credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (err) {
      const errorMessage = 
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 
        'Erro ao fazer login. Verifique suas credenciais.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_REQUEST' });
      const user = await authService.register(data);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (err) {
      const errorMessage = 
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 
        'Erro ao registrar. Verifique os dados informados.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const updateUserData = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_REQUEST' });
      const userData = await authService.getMe();

      const token = authState.user?.token || '';
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { ...userData, token }
      });
      return userData;
    } catch (err) {
      const errorMessage = 
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 
        'Erro ao atualizar dados do usuário.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw err;
    }
  }, [authState.user]);

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        clearError,
        updateUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 