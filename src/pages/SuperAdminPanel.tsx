import React, { useState, useMemo } from 'react';
import { Button, Modal, Input } from '../components/ui';
import type { SuperAdminPanelProps } from '../types';
import { useRealtimeAdmins } from '../hooks/useRealtimeData';

// Icono X para el botón de eliminar
const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ 
  admins: initialAdmins, 
  onAddAdmin, 
  onDeleteAdmin, 
  onBack 
}) => {
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Usar suscripción en tiempo real
  const { admins: realtimeAdmins, loading: adminsLoading } = useRealtimeAdmins();
  
  // Usar admins en tiempo real si están disponibles, sino usar los iniciales
  const admins = useMemo(() => {
    return Object.keys(realtimeAdmins).length > 0 ? realtimeAdmins : initialAdmins;
  }, [realtimeAdmins, initialAdmins]);

  const handleAddAdmin = () => {
    if (username.trim() && password.trim() && name.trim()) {
      onAddAdmin(username.trim(), password.trim(), name.trim());
      setUsername('');
      setPassword('');
      setName('');
      setShowAddAdmin(false);
    }
  };

  const handleDeleteAdmin = (adminId: string, adminName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al administrador "${adminName}"?`)) {
      onDeleteAdmin(adminId, adminName);
    }
  };

  const adminsList = Object.entries(admins);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-cyan-600">
                Panel de Super Administrador
              </h1>
              <p className="text-slate-600">
                Gestión de Usuarios Administrativos
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowAddAdmin(true)}
              >
                + Agregar Administrador
              </Button>
              <Button
                variant="secondary"
                onClick={onBack}
              >
                ← Volver
              </Button>
            </div>
          </div>
        </div>

        {/* Admins List */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Administradores ({adminsList.length})
          </h2>
          
          {adminsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-slate-500 text-lg">Cargando administradores...</p>
            </div>
          ) : adminsList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">
                No hay administradores registrados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {adminsList.map(([adminId, admin]) => (
                <div
                  key={adminId}
                  className="flex justify-between items-center p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      {admin.name}
                    </h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>Usuario: {admin.username}</p>
                      <p>Rol: {admin.role === 'superadmin' ? 'Super Administrador' : 'Administrador'}</p>
                      <p>Creado: {admin.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {admin.role !== 'superadmin' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteAdmin(adminId, admin.name)}
                      className="flex items-center gap-2"
                    >
                      <XIcon />
                      Eliminar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Admin Modal */}
      <Modal
        isOpen={showAddAdmin}
        onClose={() => setShowAddAdmin(false)}
        title="Agregar Nuevo Administrador"
      >
        <div className="space-y-4">
          <Input
            label="Nombre Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Juan Pérez"
            required
          />
          
          <Input
            label="Nombre de Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ej: juan.perez"
            required
          />
          
          <Input
            type="password"
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña segura"
            required
          />
          
          <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Nota:</p>
            <p>• El nombre de usuario debe ser único</p>
            <p>• La contraseña será encriptada automáticamente</p>
            <p>• El nuevo administrador tendrá rol de "manager"</p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowAddAdmin(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddAdmin}
              disabled={!username.trim() || !password.trim() || !name.trim()}
              className="flex-1"
            >
              Agregar Administrador
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
