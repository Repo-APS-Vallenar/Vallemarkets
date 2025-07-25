import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  avatar?: string;
  phone?: string;
  address?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
};

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE' }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        user: action.payload, 
        isAuthenticated: true 
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return { ...state, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // useEffect más seguro para cargar usuario del localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      if (savedUser && savedToken) {
        const user = JSON.parse(savedUser);
        // Validar que el usuario tenga las propiedades requeridas
        if (user && user.id && user.email && user.role) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          // Limpiar localStorage si los datos están corruptos
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Error al cargar usuario del localStorage:', error);
      // Limpiar localStorage si hay errores de parsing
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const login = async (email: string, password: string, role: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      console.log('🔍 Intentando login con:', { email, role });
      const response = await authAPI.login(email, password);
      const user = response.user;
      
      console.log('✅ Respuesta del servidor:', { user, token: !!response.token });
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      console.log('✅ Login exitoso, usuario guardado:', user);
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' });
      const errorMessage = error.response?.data?.error || 'Error de autenticación';
      console.error('❌ Error en login:', error);
      throw new Error(errorMessage);
    }
  };

  const register = async (data: any) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      console.log('🔍 Registrando usuario:', data);
      const response = await authAPI.register(data);
      const user = response.user;
      
      console.log('✅ Usuario registrado:', user);
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
      console.log('✅ Registro exitoso, usuario guardado:', user);
    } catch (error: any) {
      dispatch({ type: 'REGISTER_FAILURE' });
      const errorMessage = error.response?.data?.error || 'Error en el registro';
      console.error('❌ Error en registro:', error);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    console.log('✅ Logout exitoso');
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
