import React, { useState } from 'react';
import { Button } from '../components/ui';
import type { HomePageProps } from '../types';

export const HomePage: React.FC<HomePageProps> = ({ onLogin, onAdminClick, error, loading = false }) => {
  const [voterKey, setVoterKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (voterKey.trim()) {
      onLogin(voterKey.trim());
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
            Sistema de Votación Digital
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Acceso de Votantes
            </h2>
            <p className="text-slate-600">
              Ingresa tu clave de acceso de 5 dígitos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={voterKey}
                onChange={(e) => setVoterKey(e.target.value)}
                placeholder="Clave de acceso"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-cyan-500 transition-colors"
                maxLength={5}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!voterKey.trim() || loading}
              loading={loading}
            >
              {loading ? 'Verificando...' : 'Acceder'}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={onAdminClick}
              className="text-cyan-600 hover:text-cyan-700 font-medium text-sm underline"
              disabled={loading}
            >
              Acceso Administrativo
            </button>
          </div>
        </div>

        <div className="text-center text-slate-500 text-sm">
          <p>© 2024 Elecc19nes. Sistema de votación digital.</p>
        </div>
      </div>
    </div>
  );
};
