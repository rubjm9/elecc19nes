import { useEffect, useState } from 'react';
import { FirestoreService } from '../firebase/firestoreService';
import type { 
  FirestoreSession, 
  FirestoreMember, 
  FirestoreElection, 
  FirestoreAdmin
} from '../firebase/firestoreService';
import type { Unsubscribe } from 'firebase/firestore';

// Hook para escuchar cambios en todas las sesiones
export const useRealtimeSessions = () => {
  const [sessions, setSessions] = useState<{ [key: string]: FirestoreSession }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = FirestoreService.subscribeToSessions((updatedSessions) => {
      setSessions(updatedSessions);
      setLoading(false);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { sessions, loading, error };
};

// Hook para escuchar cambios en una sesión específica (incluyendo miembros y elecciones)
export const useRealtimeSession = (sessionId: string | null) => {
  const [session, setSession] = useState<FirestoreSession | null>(null);
  const [members, setMembers] = useState<FirestoreMember[]>([]);
  const [elections, setElections] = useState<{ [key: string]: FirestoreElection }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      setMembers([]);
      setElections({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribes: Unsubscribe[] = [];

    // Suscribirse a la sesión
    const unsubscribeSession = FirestoreService.subscribeToSession(sessionId, (updatedSession) => {
      setSession(updatedSession);
    });
    unsubscribes.push(unsubscribeSession);

    // Suscribirse a los miembros
    const unsubscribeMembers = FirestoreService.subscribeToMembers(sessionId, (updatedMembers) => {
      setMembers(updatedMembers);
    });
    unsubscribes.push(unsubscribeMembers);

    // Suscribirse a las elecciones
    const unsubscribeElections = FirestoreService.subscribeToElections(sessionId, (updatedElections) => {
      setElections(updatedElections);
      setLoading(false);
      setError(null);
    });
    unsubscribes.push(unsubscribeElections);

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [sessionId]);

  return { session, members, elections, loading, error };
};

// Hook para escuchar cambios en votos
export const useRealtimeVotes = (sessionId: string | null, electionId?: string | null) => {
  const [votes, setVotes] = useState<{ [voterKey: string]: { [electionId: string]: string[] } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setVotes({});
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe: Unsubscribe;

    if (electionId) {
      // Suscribirse solo a votos de una elección específica
      unsubscribe = FirestoreService.subscribeToVotesByElection(electionId, (electionVotes) => {
        // Convertir el formato para mantener compatibilidad
        const formattedVotes: { [voterKey: string]: { [electionId: string]: string[] } } = {};
        Object.entries(electionVotes).forEach(([voterKey, selections]) => {
          formattedVotes[voterKey] = { [electionId]: selections };
        });
        setVotes(formattedVotes);
        setLoading(false);
        setError(null);
      });
    } else {
      // Suscribirse a todos los votos de la sesión
      unsubscribe = FirestoreService.subscribeToVotes(sessionId, (updatedVotes) => {
        setVotes(updatedVotes);
        setLoading(false);
        setError(null);
      });
    }

    return () => {
      unsubscribe();
    };
  }, [sessionId, electionId]);

  return { votes, loading, error };
};

// Hook para escuchar cambios en administradores
export const useRealtimeAdmins = () => {
  const [admins, setAdmins] = useState<{ [key: string]: FirestoreAdmin }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = FirestoreService.subscribeToAdmins((updatedAdmins) => {
      setAdmins(updatedAdmins);
      setLoading(false);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { admins, loading, error };
};

// Hook para escuchar cambios en elecciones de una sesión
export const useRealtimeElections = (sessionId: string | null) => {
  const [elections, setElections] = useState<{ [key: string]: FirestoreElection }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setElections({});
      setLoading(false);
      setIsSubscribed(false);
      return;
    }

    setLoading(true);
    setIsSubscribed(false);
    
    try {
      const unsubscribe = FirestoreService.subscribeToElections(sessionId, (updatedElections) => {
        setElections(updatedElections);
        setLoading(false);
        setIsSubscribed(true);
        setError(null);
      });

      return () => {
        unsubscribe();
        setIsSubscribed(false);
      };
    } catch (err) {
      console.error('useRealtimeElections - Error al establecer suscripción:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
    }
  }, [sessionId]);

  return { elections, loading, error, isSubscribed };
};
