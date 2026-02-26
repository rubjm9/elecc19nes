import React, { useMemo } from 'react';
import type { VoterSessionViewProps } from '../types';
import { useRealtimeSession, useRealtimeVotes } from '../hooks/useRealtimeData';
import { getElectionsOrdered } from '../utils';
import { NavigationButton } from './ui';
import type { Session, Election } from '../types';

export const VoterSessionView: React.FC<VoterSessionViewProps> = ({
  session: initialSession,
  votes: initialVotes,
  onVoteClick,
  onExit,
  onViewResults
}) => {
  // Asegurar que tenemos el sessionId correcto
  const sessionId = initialSession?.id || null;
  
  // Usar useRealtimeSession para obtener la sesión completa en tiempo real (incluye miembros y elecciones)
  const { session: realtimeSession, members, elections: realtimeElections, loading: sessionLoading } = useRealtimeSession(sessionId);
  const { votes: _allRealtimeVotes } = useRealtimeVotes(sessionId);

  // Combinar sesión en tiempo real con la inicial
  const session: Session = useMemo(() => {
    // Si tenemos sesión en tiempo real y la suscripción está activa, usarla completamente
    // Una vez que sessionLoading es false, confiar en los datos en tiempo real
    if (realtimeSession && !sessionLoading) {
      return {
        ...realtimeSession,
        members: members.length > 0 ? members : (initialSession?.members || []),
        // SIEMPRE usar elecciones en tiempo real una vez que la suscripción está activa
        // Incluso si están vacías, para que se actualicen cuando haya cambios
        elections: realtimeElections
      };
    }
    // Si no, usar la sesión inicial mientras carga
    if (!initialSession) return null as any;
    return initialSession;
  }, [realtimeSession, initialSession, members, realtimeElections, sessionLoading]);

  // Obtener elecciones de la sesión combinada
  // Una vez que la suscripción está activa, usar siempre las elecciones en tiempo real
  const elections = useMemo(() => {
    if (!session) return [];
    const source = !sessionLoading && realtimeSession ? realtimeElections : (session.elections || {});
    return getElectionsOrdered(source, session.electionOrder);
  }, [session, realtimeElections, sessionLoading, realtimeSession]);

  // Los votos del votante ya vienen filtrados en initialVotes
  // Usamos allRealtimeVotes solo para calcular el progreso de votación
  const votes = initialVotes;

  // Función para obtener la etiqueta de estado
  const getStatusLabel = (election: Election) => {
    switch(election.status) {
      case 'Abierta': return <span className="text-xs font-semibold text-green-600">Votación abierta</span>;
      case 'Cerrada': return <span className="text-xs font-semibold text-red-600">Votación cerrada</span>;
      case 'Prevista': return <span className="text-xs font-semibold text-yellow-600">Aún no abierta</span>;
      default: return null;
    }
  };

  if (!session) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-500">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cyan-700 mb-2">{session.name}</h2>
        <NavigationButton onClick={onExit} variant="exit" className="text-sm">Salir</NavigationButton>
      </div>
      <p className="text-slate-500 mb-6">Selecciona una votación para participar.</p>
      <div className="space-y-3">
        {sessionLoading && elections.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
            <p className="text-slate-500 text-sm">Cargando elecciones...</p>
          </div>
        ) : elections.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No hay elecciones disponibles.</p>
        ) : (
          elections.map(election => {
            const hasVoted = election.id ? votes[election.id] : false;
            let statusText = 'Pendiente de voto';
            let statusColor = 'text-slate-500';
            if (hasVoted) { 
              statusText = 'Ya has votado'; 
              statusColor = 'text-green-600'; 
            } else if (election.status === 'Cerrada') { 
              statusText = 'No has votado'; 
              statusColor = 'text-red-600'; 
            }
            return (
              <div key={election.id} className={`p-4 rounded-lg border border-slate-200 ${hasVoted || election.status === 'Cerrada' ? 'bg-slate-100' : 'bg-white'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{election.name}</p>
                    <p className={`text-sm ${statusColor}`}>{statusText}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusLabel(election)}
                    {election.status === 'Abierta' && election.id && (
                      <button 
                        onClick={() => onVoteClick(election.id!)} 
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold min-h-[44px] py-2 px-4 rounded-lg text-sm"
                      >
                        {hasVoted ? 'Modificar' : 'Votar'}
                      </button>
                    )}
                    {election.status === 'Cerrada' && election.id && onViewResults && (
                      <button 
                        onClick={() => onViewResults(election.id!)} 
                        className="bg-slate-500 hover:bg-slate-600 text-white font-bold min-h-[44px] py-2 px-4 rounded-lg text-sm"
                      >
                        Ver resultados
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
