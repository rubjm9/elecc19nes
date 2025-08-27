import React, { useState } from 'react';
import { Button, Modal, Input, Textarea } from '../components/ui';
import type { AdminDashboardProps } from '../types';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, 
  db, 
  onManageSession, 
  onCreateSession, 
  onManageAdmins, 
  onLogout 
}) => {
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [membersList, setMembersList] = useState('');

  const handleCreateSession = () => {
    if (sessionName.trim() && membersList.trim()) {
      onCreateSession(sessionName.trim(), membersList.trim());
      setSessionName('');
      setMembersList('');
      setShowCreateSession(false);
    }
  };

  const sessions = Object.values(db.sessions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-cyan-600">
                Panel de Administración
              </h1>
              <p className="text-slate-600">
                Bienvenido, {user.name} ({user.role === 'superadmin' ? 'Super Administrador' : 'Administrador'})
              </p>
            </div>
            <div className="flex gap-3">
              {user.role === 'superadmin' && (
                <Button
                  variant="secondary"
                  onClick={onManageAdmins}
                >
                  Gestionar Usuarios
                </Button>
              )}
              <Button
                variant="danger"
                onClick={onLogout}
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">
              Acciones
            </h2>
            <Button
              onClick={() => setShowCreateSession(true)}
            >
              + Crear Nueva Sesión
            </Button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Sesiones ({sessions.length})
          </h2>
          
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">
                No hay sesiones creadas. Crea la primera sesión para comenzar.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => session.id && onManageSession(session.id)}
                >
                  <h3 className="font-bold text-lg text-slate-800 mb-2">
                    {session.name}
                  </h3>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>Miembros: {session.members.length}</p>
                    <p>Elecciones: {Object.keys(session.elections).length}</p>
                    <p>Estado: Activa</p>
                  </div>
                  <div className="mt-3">
                    <span className="inline-block bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded-full">
                      Click para gestionar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      <Modal
        isOpen={showCreateSession}
        onClose={() => setShowCreateSession(false)}
        title="Crear Nueva Sesión"
      >
        <div className="space-y-4">
          <Input
            label="Nombre de la Sesión"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Ej: Asamblea General 2024"
            required
          />
          
          <Textarea
            label="Lista de Miembros"
            value={membersList}
            onChange={(e) => setMembersList(e.target.value)}
            placeholder="Un nombre por línea. Opcional: nombre,email"
            rows={8}
            required
          />
          
          <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Formato:</p>
            <p>Juan Pérez</p>
            <p>María García, maria@email.com</p>
            <p>Carlos López</p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCreateSession(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateSession}
              disabled={!sessionName.trim() || !membersList.trim()}
              className="flex-1"
            >
              Crear Sesión
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
