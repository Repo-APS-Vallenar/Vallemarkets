import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Store, User, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'buyer' | 'seller';
}

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: {
      role: 'buyer'
    }
  });

  const selectedRole = watch('role');
  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data);
      navigate(data.role === 'seller' ? '/dashboard/vendedor' : '/');
    } catch (error) {
      console.error('Error al registrarse:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Store className="h-12 w-12 text-emerald-600 mx-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Únete a la comunidad PymeMarket
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de cuenta
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative">
                <input
                  type="radio"
                  value="buyer"
                  {...register('role')}
                  className="sr-only"
                />
                <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedRole === 'buyer' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <ShoppingBag className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900 block text-center">
                    Comprador
                  </span>
                </div>
              </label>
              <label className="relative">
                <input
                  type="radio"
                  value="seller"
                  {...register('role')}
                  className="sr-only"
                />
                <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedRole === 'seller' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <User className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900 block text-center">
                    Vendedor
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { 
                required: 'Este campo es requerido',
                minLength: {
                  value: 2,
                  message: 'El nombre debe tener al menos 2 caracteres'
                }
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Tu nombre completo"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Este campo es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', { 
                  required: 'Este campo es requerido',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                  }
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <div className="mt-1 relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', { 
                  required: 'Este campo es requerido',
                  validate: value => value === password || 'Las contraseñas no coinciden'
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;