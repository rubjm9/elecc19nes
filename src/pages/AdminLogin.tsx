import React, { useState } from 'react';
import { Button, Input } from '../components/ui';
import type { AdminLoginProps } from '../types';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack, error, loading = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onLogin(username.trim(), password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-cyan-600 mb-2">
            Elecc19nes
          </h1>
          <p className="text-slate-600 text-lg">
            Acceso Administrativo
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-slate-600">
              Ingresa tus credenciales de administrador
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
              disabled={loading}
              required
            />

            <Input
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              disabled={loading}
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!username.trim() || !password.trim() || loading}
              loading={loading}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={onBack}
              className="text-cyan-600 hover:text-cyan-700 font-medium text-sm underline"
              disabled={loading}
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
