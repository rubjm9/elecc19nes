import { useState, useCallback } from 'react';
import { FirestoreService } from '../firebase/firestoreService';
import type { Election } from '../types';
import { parseMembersList } from '../utils';
import { ERROR_MESSAGES } from '../constants';

export const useSessions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createSession = useCallback(async (sessionName: string, membersList: string) => {
    setLoading(true);
    setError('');
    
    try {
      const { memberData, duplicates } = parseMembersList(membersList);
      
      if (duplicates.length > 0) {
        setError(`Nombres duplicados encontrados: ${duplicates.join(', ')}`);
        return null;
      }

      const sessionData = {
        name: sessionName,
        status: 'Activa',
        members: memberData.map((member, index) => ({
          id: `member_${Date.now()}_${index}`,
          name: member.name,
          email: member.email,
          key: null,
          status: 'Invitado',
          isEligible: true,
          createdAt: new Date()
        })),
        elections: {},
        createdBy: 'admin' // Campo requerido por FirestoreService
      };

      const sessionId = await FirestoreService.createSession(sessionData);
      if (sessionId) {
        return { id: sessionId, ...sessionData, createdAt: new Date() };
      }
      
      setError(ERROR_MESSAGES.SESSION_CREATION_ERROR);
      return null;
    } catch (err) {
      setError(ERROR_MESSAGES.SESSION_CREATION_ERROR);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addElection = useCallback(async (sessionId: string, electionData: Omit<Election, 'id'>) => {
    setLoading(true);
    setError('');
    
    try {
      const electionId = await FirestoreService.createElection({
        ...electionData,
        sessionId
      });
      
      if (electionId) {
        return electionId;
      }
      
      setError(ERROR_MESSAGES.ELECTION_CREATION_ERROR);
      return null;
    } catch (err) {
      setError(ERROR_MESSAGES.ELECTION_CREATION_ERROR);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateElectionStatus = useCallback(async (_sessionId: string, electionId: string, status: Election['status']) => {
    setLoading(true);
    setError('');
    
    try {
      await FirestoreService.updateElection(electionId, { status });
      return true;
    } catch (err) {
      setError(ERROR_MESSAGES.ELECTION_STATUS_UPDATE_ERROR);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    loading,
    error,
    createSession,
    addElection,
    updateElectionStatus,
    clearError
  };
};
