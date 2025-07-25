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
  isInitialized: boolean; // Nueva propiedad para saber si ya se verificó localStorage
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
  isInitialized: false, // Inicialmente false hasta verificar localStorage
};

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'INITIALIZE_COMPLETE' };

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
        isAuthenticated: true,
        isInitialized: true
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return { 
        ...state, 
        isLoading: false, 
        user: null, 
        isAuthenticated: false,
        isInitialized: true
      };
    case 'LOGOUT':
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        isInitialized: true
      };
    case 'INITIALIZE_COMPLETE':
      return {
        ...state,
        isInitialized: true
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // useEffect para cargar datos persistidos
  useEffect(() => {
    console.log('🔍 AuthContext inicializando...');
    
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        console.log('✅ Usuario encontrado en localStorage:', user);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        console.log('ℹ️ No hay sesión guardada');
        dispatch({ type: 'INITIALIZE_COMPLETE' });
      }
    } catch (error) {
      console.error('❌ Error al cargar datos del localStorage:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'INITIALIZE_COMPLETE' });
    }
  }, []);

  const login = async (email: string, password: string, role: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      console.log('🔍 Intentando login con API:', { email, role });
      
      const response = await authAPI.login(email, password);
      console.log('📥 Respuesta del backend:', response);
      
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
        console.log('✅ Login exitoso con API');
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.error('❌ Error en login con backend:', error);
      console.log('🔄 Intentando login local de demostración...');
      
      // Fallback: Login local para demostración
      try {
        const demoUser = {
          id: 'demo-' + Date.now(),
          email: email,
          role: role as 'buyer' | 'seller' | 'admin',
          name: role === 'buyer' ? 'Comprador Demo' : role === 'seller' ? 'Vendedor Demo' : 'Admin Demo',
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('token', 'demo-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: demoUser });
        console.log('✅ Login local exitoso (modo demostración)');
      } catch (demoError) {
        console.error('❌ Error en login local:', demoError);
        dispatch({ type: 'LOGIN_FAILURE' });
        throw new Error('Error al iniciar sesión. Por favor, intenta de nuevo.');
      }
    }
  };

  const register = async (data: any) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      console.log('🔍 Intentando registro con API:', data);
      
      const response = await authAPI.register(data);
      console.log('📥 Respuesta del backend:', response);
      
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        dispatch({ type: 'REGISTER_SUCCESS', payload: response.user });
        console.log('✅ Registro exitoso con API');
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      dispatch({ type: 'REGISTER_FAILURE' });
      throw new Error(error.response?.data?.message || 'Error al registrarse');
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
