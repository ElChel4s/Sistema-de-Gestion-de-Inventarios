import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { Lock, LogIn, User } from 'lucide-react';
import { authAtom, login } from '../store/auth';
import { Input } from './ui/input';
import { Button } from './ui/button';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [auth, setAuth] = useAtom(authAtom);
  const { isLoading, error } = auth;
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password, setAuth);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema de Gestión de Almacenes
            </h1>
            <p className="mt-2 text-gray-600">
              Inicia sesión para continuar
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            <Input
              label="Nombre de Usuario"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User size={18} />}
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                  Recordarme
                </label>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-500"
                  onClick={() => setShowForgotModal(true)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              leftIcon={<LogIn size={18} />}
            >
              Iniciar Sesión
            </Button>
          </form>
          {/* Modal para olvidaste tu contraseña */}
          {showForgotModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-lg font-bold mb-4">¿Olvidaste tu contraseña?</h2>
                <p className="mb-4">Por favor, contacta con el administrador del sistema para restablecer tu contraseña.</p>
                <Button className="w-full" onClick={() => setShowForgotModal(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};