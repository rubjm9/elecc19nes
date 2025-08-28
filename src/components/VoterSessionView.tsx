import React from 'react';
import { Button } from '../components/ui';
import type { VoterSessionViewProps } from '../types';
import { ELECTION_STATUSES } from '../constants';
import { getStatusColor, calculateVoteProgress, getVoteText } from '../utils';

export const VoterSessionView: React.FC<VoterSessionViewProps> = ({
  session,
  votes,
  onVoteClick,
  onExit
}) => {
  const elections = Object.values(session.elections);
  const openElections = elections.filter(e => e.status === ELECTION_STATUSES.ABIERTA);
  const closedElections = elections.filter(e => e.status === ELECTION_STATUSES.CERRADA);
  const pendingElections = elections.filter(e => e.status === ELECTION_STATUSES.PREVISTA);

  const accreditedMembers = session.members.filter(m => m.status === 'Presente');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-cyan-600">
                Sesión de Votación
              </h1>
              <p className="text-slate-600">
                {session.name}
              </p>
            </div>
            <Button
              variant="danger"
              onClick={onExit}
            >
              Salir
            </Button>
          </div>
        </div>

        {/* Open Elections */}
        {openElections.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              🗳️ Elecciones Abiertas ({openElections.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {openElections.map((election) => {
                const electionVotes = votes[session.id!]?.[election.id!] || [];
                const voteCount = electionVotes.length;
                const progress = calculateVoteProgress(voteCount, accreditedMembers.length);
                
                return (
                  <div
                    key={election.id}
                    className="border-2 border-green-200 rounded-lg p-4 bg-green-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-green-800">
                          {election.name}
                        </h3>
                        <p className="text-sm text-green-600">
                          {election.positionsToElect} puesto(s) a elegir
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(election.status)}`}>
                        {election.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso de votación:</span>
                          <span>{voteCount} / {accreditedMembers.length}</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-green-600">
                          {getVoteText(voteCount)} de {accreditedMembers.length} miembros acreditados
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => onVoteClick(election.id!)}
                        className="w-full"
                        variant="success"
                      >
                        🗳️ Votar Ahora
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Closed Elections */}
        {closedElections.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              🔒 Elecciones Cerradas ({closedElections.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {closedElections.map((election) => {
                const electionVotes = votes[session.id!]?.[election.id!] || [];
                const voteCount = electionVotes.length;
                const progress = calculateVoteProgress(voteCount, accreditedMembers.length);
                
                return (
                  <div
                    key={election.id}
                    className="border border-red-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-red-800">
                          {election.name}
                        </h3>
                        <p className="text-sm text-red-600">
                          {election.positionsToElect} puesto(s) a elegir
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(election.status)}`}>
                        {election.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Votos finales:</span>
                        <span>{voteCount} / {accreditedMembers.length}</span>
                      </div>
                      <div className="w-full bg-red-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-red-600">
                        Votación finalizada
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pending Elections */}
        {pendingElections.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-yellow-600 mb-4">
              ⏳ Elecciones Pendientes ({pendingElections.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pendingElections.map((election) => (
                <div
                  key={election.id}
                  className="border border-yellow-200 rounded-lg p-4 bg-yellow-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-yellow-800">
                        {election.name}
                      </h3>
                      <p className="text-sm text-yellow-600">
                        {election.positionsToElect} puesto(s) a elegir
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(election.status)}`}>
                      {election.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-yellow-700">
                    Esta elección aún no está abierta para votación.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Elections Message */}
        {elections.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🗳️</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              No hay elecciones disponibles
            </h2>
            <p className="text-slate-600">
              Las elecciones aparecerán aquí cuando sean creadas por los administradores.
            </p>
          </div>
        )}

        {/* Session Info */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Información de la Sesión
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-cyan-50 rounded-lg">
              <div className="text-2xl font-bold text-cyan-600">
                {session.members.length}
              </div>
              <div className="text-sm text-cyan-700">
                Miembros Totales
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {accreditedMembers.length}
              </div>
              <div className="text-sm text-green-700">
                Miembros Acreditados
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {elections.length}
              </div>
              <div className="text-sm text-blue-700">
                Elecciones
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
