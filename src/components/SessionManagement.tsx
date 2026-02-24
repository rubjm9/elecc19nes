import React, { useState, useEffect, useMemo } from 'react';
import { Button, Modal, Input, Textarea, Select } from '../components/ui';
import type { SessionManagementProps } from '../types';
import { ELECTION_STATUSES, MEMBER_STATUSES } from '../constants';
import { getStatusColor, calculateVoteProgress, getVoteText } from '../utils';
import { useRealtimeSession, useRealtimeVotes } from '../hooks/useRealtimeData';
import type { Session, Election } from '../types';

export const SessionManagement: React.FC<SessionManagementProps> = ({
  session: initialSession,
  votes: initialVotes,
  onAccredit,
  onToggleEligibility,
  onChangeElectionStatus,
  onAddElection,
  onAddMembers,
  onBack,
  onViewResults
}) => {
  // Usar suscripciones en tiempo real
  const { session: realtimeSession, members, elections: electionsMap, loading: sessionLoading } = useRealtimeSession(initialSession?.id || null);
  const { votes: realtimeVotes, loading: _votesLoading } = useRealtimeVotes(initialSession?.id || null);

  // Combinar datos de tiempo real con la sesión inicial
  const session: Session = useMemo(() => {
    if (!realtimeSession && !initialSession) return null as any;
    
    const baseSession = realtimeSession || initialSession;
    return {
      ...baseSession,
      members: members.length > 0 ? members : (initialSession?.members || []),
      elections: Object.keys(electionsMap).length > 0 ? electionsMap : (initialSession?.elections || {})
    };
  }, [realtimeSession, initialSession, members, electionsMap]);

  // Usar votos en tiempo real si están disponibles
  const votes = useMemo(() => {
    return Object.keys(realtimeVotes).length > 0 ? realtimeVotes : initialVotes;
  }, [realtimeVotes, initialVotes]);
  const [showAddElection, setShowAddElection] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [electionName, setElectionName] = useState('');
  const [positionsToElect, setPositionsToElect] = useState(1);
  const [candidates, setCandidates] = useState(['']);
  const [membersList, setMembersList] = useState('');

  useEffect(() => {
    if (showAddElection) {
      setCandidates(['']);
      setPositionsToElect(1);
    }
  }, [showAddElection]);

  const handleAddElection = () => {
    if (electionName.trim() && candidates.every(c => c.trim())) {
      const electionData = {
        name: electionName.trim(),
        positionsToElect,
        candidates: candidates.filter(c => c.trim()),
        status: ELECTION_STATUSES.PREVISTA,
        sessionId: session.id!,
        description: ''
      };
      
      onAddElection(session.id!, electionData);
      setElectionName('');
      setCandidates(['']);
      setPositionsToElect(1);
      setShowAddElection(false);
    }
  };

  const handleAddMembers = () => {
    if (membersList.trim()) {
      onAddMembers(session.id!, membersList.trim());
      setMembersList('');
      setShowAddMembers(false);
    }
  };

  const addCandidate = () => {
    setCandidates([...candidates, '']);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length > 1) {
      setCandidates(candidates.filter((_, i) => i !== index));
    }
  };

  const updateCandidate = (index: number, value: string) => {
    const newCandidates = [...candidates];
    newCandidates[index] = value;
    setCandidates(newCandidates);
  };

  const electionsList = Object.values(session?.elections || {});
  const accreditedMembers = (session?.members || []).filter(m => m.status === MEMBER_STATUSES.PRESENTE);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-500 text-lg">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-cyan-600">
                Gestión de Sesión
              </h1>
              <p className="text-slate-600">
                {session.name}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowAddMembers(true)}
              >
                + Agregar Miembros
              </Button>
              <Button
                onClick={() => setShowAddElection(true)}
              >
                + Crear Elección
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Members Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Miembros ({session.members.length})
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(sessionLoading && session.members.length === 0) ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                  <p className="text-slate-500 text-sm">Cargando miembros...</p>
                </div>
              ) : (
                [...session.members].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })).map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between items-center p-3 border border-slate-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-800">
                        {member.name}
                      </h3>
                      {member.email && (
                        <span className="text-xs text-slate-500">
                          ({member.email})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                      {member.key && (
                        <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-mono">
                          {member.key}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded ${member.isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {member.isEligible ? 'Elegible' : 'No Elegible'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {member.status === MEMBER_STATUSES.INVITADO && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => member.id && onAccredit(session.id!, member.id)}
                      >
                        Acreditar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={member.isEligible ? "warning" : "success"}
                      onClick={() => member.id && onToggleEligibility(session.id!, member.id)}
                    >
                      {member.isEligible ? 'Deshabilitar' : 'Habilitar'}
                    </Button>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Elections Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Elecciones ({electionsList.length})
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(sessionLoading && electionsList.length === 0) ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                  <p className="text-slate-500 text-sm">Cargando elecciones...</p>
                </div>
              ) : (
                electionsList.map((election: Election) => {
                  // Contar votos de esta elección
                  const voteCount = Object.values(votes).reduce((count, voterVotes) => {
                    return count + (election.id && voterVotes[election.id] ? 1 : 0);
                  }, 0);
                  const progress = calculateVoteProgress(voteCount, accreditedMembers.length);
                
                return (
                  <div
                    key={election.id}
                    className="border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-800">
                          {election.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {election.positionsToElect} puesto(s) a elegir
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={election.status}
                          onChange={(status) => onChangeElectionStatus(session.id!, election.id!, status as Election['status'])}
                          options={Object.entries(ELECTION_STATUSES).map(([, value]) => ({
                            value,
                            label: value
                          }))}
                          className="w-32"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onViewResults(election.id!)}
                        >
                          Ver Resultados
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso de votación:</span>
                        <span>{voteCount} / {accreditedMembers.length}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500">
                        {getVoteText(voteCount)} de {accreditedMembers.length} miembros acreditados
                      </p>
                    </div>
                  </div>
                );
              })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Election Modal */}
      <Modal
        isOpen={showAddElection}
        onClose={() => setShowAddElection(false)}
        title="Crear Nueva Elección"
      >
        <div className="space-y-4">
          <Input
            label="Nombre de la Elección"
            value={electionName}
            onChange={(e) => setElectionName(e.target.value)}
            placeholder="Ej: Presidente del Comité"
            required
          />
          
          <Input
            type="number"
            label="Puestos a Elegir"
            value={positionsToElect}
            onChange={(e) => setPositionsToElect(parseInt(e.target.value) || 1)}
            min={1}
            max={10}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Candidatos
            </label>
            <div className="space-y-2">
              {candidates.map((candidate, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={candidate}
                    onChange={(e) => updateCandidate(index, e.target.value)}
                    placeholder={`Candidato ${index + 1}`}
                    required
                    className="flex-1"
                  />
                  {candidates.length > 1 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeCandidate(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={addCandidate}
                className="w-full"
              >
                + Agregar Candidato
              </Button>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowAddElection(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddElection}
              disabled={!electionName.trim() || candidates.some(c => !c.trim())}
              className="flex-1"
            >
              Crear Elección
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Members Modal */}
      <Modal
        isOpen={showAddMembers}
        onClose={() => setShowAddMembers(false)}
        title="Agregar Miembros"
      >
        <div className="space-y-4">
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
              onClick={() => setShowAddMembers(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddMembers}
              disabled={!membersList.trim()}
              className="flex-1"
            >
              Agregar Miembros
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
