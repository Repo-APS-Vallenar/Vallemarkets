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
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE' };

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

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    }
  }, []);

  const login = async (email: string, password: string, role: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.login(email, password);
      const user = response.user;
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' });
      const errorMessage = error.response?.data?.error || 'Error de autenticación';
      throw new Error(errorMessage);
    }
  };

  const register = async (data: any) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const response = await authAPI.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone,
        address: data.address
      });
      
      const user = response.user;
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
    } catch (error: any) {
      dispatch({ type: 'REGISTER_FAILURE' });
      const errorMessage = error.response?.data?.error || 'Error de registro';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};