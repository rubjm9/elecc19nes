import React, { useState, useEffect, useMemo } from 'react';
import { Button, Modal, Input, Textarea } from '../components/ui';
import type { AdminDashboardProps } from '../types';
import { useRealtimeSessions } from '../hooks/useRealtimeData';
import { FirestoreService } from '../firebase/firestoreService';
import type { FirestoreSession, FirestoreMember, FirestoreElection } from '../firebase/firestoreService';
import type { Session } from '../types';

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
  const { sessions: realtimeSessions, loading: sessionsLoading } = useRealtimeSessions();
  
  // Combinar sesiones del db prop (que se actualiza cuando se crea una sesión) con las de tiempo real
  const allSessions = useMemo(() => {
    // Usar sesiones en tiempo real como fuente principal, pero combinar con db.sessions
    const combined: { [key: string]: FirestoreSession } = { ...db.sessions };
    
    // Actualizar/agregar sesiones desde tiempo real
    Object.entries(realtimeSessions).forEach(([sessionId, session]) => {
      combined[sessionId] = session;
    });
    
    return combined;
  }, [realtimeSessions, db.sessions]);

  // Inicializar con las sesiones del db, pero también actualizar cuando cambien
  const [sessionsData, setSessionsData] = useState<{ [key: string]: Session }>(() => {
    console.log('AdminDashboard - Inicializando sessionsData con:', Object.keys(db.sessions || {}));
    return db.sessions || {};
  });
  
  // Actualizar sessionsData cuando db.sessions cambie (por ejemplo, después de crear una sesión)
  useEffect(() => {
    if (Object.keys(db.sessions).length > 0) {
      console.log('AdminDashboard - db.sessions cambió, actualizando sessionsData');
      setSessionsData(prev => {
        const updated = { ...prev, ...db.sessions };
        console.log('AdminDashboard - sessionsData actualizado:', Object.keys(updated));
        return updated;
      });
    }
  }, [db.sessions]);

  // Cargar miembros y elecciones para cada sesión en tiempo real
  useEffect(() => {
    const loadSessionsData = async () => {
      console.log('AdminDashboard - loadSessionsData iniciado');
      console.log('AdminDashboard - allSessions:', allSessions);
      console.log('AdminDashboard - db.sessions:', db.sessions);
      
      const sessionsWithData: { [key: string]: Session } = {};
      
      // Primero, usar las sesiones del db que ya tienen datos completos
      Object.entries(db.sessions).forEach(([sessionId, session]) => {
        sessionsWithData[sessionId] = session;
      });
      
      // Luego, cargar datos para sesiones que no están en db o que necesitan actualización
      const sessionEntries = Object.entries(allSessions);
      console.log('AdminDashboard - sessionEntries a procesar:', sessionEntries.length);
      
      for (const [sessionId, session] of sessionEntries) {
        // Si ya tenemos datos completos del db, solo actualizar si la sesión cambió
        if (sessionsWithData[sessionId] && 
            sessionsWithData[sessionId].name === session.name &&
            sessionsWithData[sessionId].createdBy === session.createdBy) {
          console.log(`AdminDashboard - Sesión ${sessionId} ya tiene datos completos, saltando`);
          continue; // Ya tenemos datos completos, no necesitamos recargar
        }
        
        console.log(`AdminDashboard - Cargando datos para sesión ${sessionId}: ${session.name}`);
        try {
          const [members, elections] = await Promise.all([
            FirestoreService.getMembersBySession(sessionId),
            FirestoreService.getElectionsBySession(sessionId)
          ]);

          sessionsWithData[sessionId] = {
            ...session,
            members,
            elections
          };
          console.log(`AdminDashboard - Sesión ${sessionId} cargada:`, sessionsWithData[sessionId]);
        } catch (error) {
          console.error(`Error loading data for session ${sessionId}:`, error);
          // Si hay error, usar datos del db si existen
          if (db.sessions[sessionId]) {
            sessionsWithData[sessionId] = db.sessions[sessionId];
          } else {
            sessionsWithData[sessionId] = {
              ...session,
              members: [],
              elections: {}
            };
          }
        }
      }
      
      console.log('AdminDashboard - sessionsWithData final:', Object.keys(sessionsWithData));
      setSessionsData(sessionsWithData);
    };

    // Cargar datos siempre que cambien las sesiones
    loadSessionsData();
  }, [allSessions, db.sessions]);

  const handleCreateSession = () => {
    if (sessionName.trim() && membersList.trim()) {
      onCreateSession(sessionName.trim(), membersList.trim());
      setSessionName('');
      setMembersList('');
      setShowCreateSession(false);
    }
  };

  // Filtrar sesiones según el rol del usuario
  const sessions = useMemo(() => {
    const allSessions = Object.values(sessionsData);
    
    // Debug: ver qué sesiones tenemos y qué usuario
    console.log('AdminDashboard - Todas las sesiones:', allSessions);
    console.log('AdminDashboard - Usuario:', user);
    console.log('AdminDashboard - sessionsData keys:', Object.keys(sessionsData));
    
    if (user.role === 'superadmin') {
      return allSessions;
    }
    
    const filtered = allSessions.filter(session => {
      const matches = session.createdBy === user.username;
      console.log(`AdminDashboard - Sesión "${session.name}": createdBy="${session.createdBy}", user.username="${user.username}", matches=${matches}`);
      return matches;
    });
    
    console.log('AdminDashboard - Sesiones filtradas:', filtered);
    return filtered;
  }, [sessionsData, user.role, user.username]);

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
          
          {sessionsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-slate-500 text-lg">Cargando sesiones...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">
                No hay sesiones creadas. Crea la primera sesión para comenzar.
              </p>
              {/* Debug info - remover después */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left text-xs">
                <p className="font-bold mb-2">Información de depuración:</p>
                <p>Total sesiones en sessionsData: {Object.keys(sessionsData).length}</p>
                <p>Total sesiones en allSessions: {Object.keys(allSessions).length}</p>
                <p>Total sesiones en db.sessions: {Object.keys(db.sessions).length}</p>
                <p>Usuario: {user.username} (rol: {user.role})</p>
                {Object.keys(sessionsData).length > 0 && (
                  <div className="mt-2">
                    <p className="font-bold">Sesiones en sessionsData:</p>
                    {Object.entries(sessionsData).map(([id, s]) => (
                      <p key={id}>- {s.name} (createdBy: {s.createdBy})</p>
                    ))}
                  </div>
                )}
              </div>
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
