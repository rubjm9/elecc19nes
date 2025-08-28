import { create } from 'zustand';
import { FirestoreService } from '../firebase/firestoreService';
import type { Database, User, Session, Election } from '../types';
import { initialDb } from '../constants';
import { ERROR_MESSAGES } from '../constants';

interface AppState {
  // Estado de la aplicación
  currentPage: 'home' | 'adminLogin' | 'adminDashboard' | 'superAdminPanel' | 'sessionManagement' | 'voterSession' | 'ballot' | 'voteSuccess' | 'results';
  currentUser: User | null;
  currentSession: Session | null;
  currentElection: Election | null;
  voterKey: string | null;
  
  // Base de datos
  db: Database;
  
  // Estados de carga y error
  loading: boolean;
  error: string;
  
  // Acciones de autenticación
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Acciones de sesión
  createSession: (sessionName: string, membersList: string) => Promise<boolean>;
  manageSession: (sessionId: string) => void;
  backToDashboard: () => void;
  
  // Acciones de elección
  createElection: (electionData: Omit<Election, 'id'>) => Promise<boolean>;
  updateElectionStatus: (electionId: string, status: Election['status']) => Promise<boolean>;
  
  // Acciones de miembro
  accreditMember: (memberId: string) => Promise<boolean>;
  toggleMemberEligibility: (memberId: string) => Promise<boolean>;
  
  // Acciones de voto
  submitVote: (electionId: string, selections: string[]) => Promise<boolean>;
  loadVotes: () => Promise<void>;
  
  // Acciones de administrador
  addAdmin: (username: string, password: string, name: string) => Promise<boolean>;
  deleteAdmin: (adminId: string) => Promise<boolean>;
  
  // Navegación
  goToPage: (page: AppState['currentPage']) => void;
  goToAdminLogin: () => void;
  goToSuperAdmin: () => void;
  
  // Utilidades
  clearError: () => void;
  setError: (error: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Estado inicial
  currentPage: 'home',
  currentUser: null,
  currentSession: null,
  currentElection: null,
  voterKey: null,
  db: initialDb,
  loading: false,
  error: '',

  // Acciones de autenticación
  login: async (username: string, password: string) => {
    set({ loading: true, error: '' });
    
    try {
      const admin = await FirestoreService.getAdminByCredentials(username, password);
      if (admin) {
        const userData: User = {
          username: admin.username,
          name: admin.name,
          pass: admin.pass,
          role: admin.role
        };
        
        set({ 
          currentUser: userData, 
          currentPage: 'adminDashboard',
          loading: false 
        });
        return true;
      } else {
        set({ error: ERROR_MESSAGES.INVALID_CREDENTIALS, loading: false });
        return false;
      }
    } catch (err) {
      set({ error: ERROR_MESSAGES.INVALID_CREDENTIALS, loading: false });
      return false;
    }
  },

  logout: () => {
    set({ 
      currentUser: null, 
      currentSession: null, 
      currentElection: null,
      currentPage: 'home',
      error: '' 
    });
  },

  // Acciones de sesión
  createSession: async (sessionName: string, _membersList: string) => {
    set({ loading: true, error: '' });
    
    try {
      const sessionId = await FirestoreService.createSession({
        name: sessionName,
        createdBy: get().currentUser?.username || 'admin'
      });
      
      if (sessionId) {
        // Recargar la base de datos
        await get().loadVotes();
        set({ loading: false });
        return true;
      } else {
        set({ error: ERROR_MESSAGES.SESSION_CREATION_ERROR, loading: false });
        return false;
      }
    } catch (err) {
      set({ error: ERROR_MESSAGES.SESSION_CREATION_ERROR, loading: false });
      return false;
    }
  },

  manageSession: (sessionId: string) => {
    const session = get().db.sessions[sessionId];
    if (session) {
      set({ 
        currentSession: session, 
        currentPage: 'sessionManagement' 
      });
    }
  },

  backToDashboard: () => {
    set({ 
      currentSession: null, 
      currentElection: null,
      currentPage: 'adminDashboard' 
    });
  },

  // Acciones de elección
  createElection: async (electionData: Omit<Election, 'id'>) => {
    const { currentSession } = get();
    if (!currentSession?.id) return false;
    
    set({ loading: true, error: '' });
    
    try {
      const electionId = await FirestoreService.createElection({
        ...electionData,
        sessionId: currentSession.id
      });
      
      if (electionId) {
        await get().loadVotes();
        set({ loading: false });
        return true;
      } else {
        set({ error: ERROR_MESSAGES.ELECTION_CREATION_ERROR, loading: false });
        return false;
      }
    } catch (err) {
      set({ error: ERROR_MESSAGES.ELECTION_CREATION_ERROR, loading: false });
      return false;
    }
  },

  updateElectionStatus: async (electionId: string, status: Election['status']) => {
    set({ loading: true, error: '' });
    
    try {
      await FirestoreService.updateElection(electionId, { status });
      await get().loadVotes();
      set({ loading: false });
      return true;
    } catch (err) {
      set({ error: ERROR_MESSAGES.ELECTION_STATUS_UPDATE_ERROR, loading: false });
      return false;
    }
  },

  // Acciones de miembro
  accreditMember: async (memberId: string) => {
    const { currentSession } = get();
    if (!currentSession?.id) return false;
    
    set({ loading: true, error: '' });
    
    try {
      const newKey = Math.random().toString(36).substring(2, 7).toUpperCase();
      await FirestoreService.updateMember(memberId, {
        status: 'Presente',
        key: newKey
      });
      
      await get().loadVotes();
      set({ loading: false });
      return true;
    } catch (err) {
      set({ error: ERROR_MESSAGES.MEMBER_ACCREDITATION_ERROR, loading: false });
      return false;
    }
  },

  toggleMemberEligibility: async (memberId: string) => {
    set({ loading: true, error: '' });
    
    try {
      const member = get().db.sessions[get().currentSession?.id || '']?.members.find(m => m.id === memberId);
      if (member) {
        await FirestoreService.updateMember(memberId, {
          isEligible: !member.isEligible
        });
        
        await get().loadVotes();
        set({ loading: false });
        return true;
      }
      return false;
    } catch (err) {
      set({ error: ERROR_MESSAGES.ELIGIBILITY_UPDATE_ERROR, loading: false });
      return false;
    }
  },

  // Acciones de voto
  submitVote: async (electionId: string, selections: string[]) => {
    const { currentSession, voterKey } = get();
    if (!currentSession?.id || !voterKey) return false;
    
    set({ loading: true, error: '' });
    
    try {
      await FirestoreService.castVote({
        voterKey,
        sessionId: currentSession.id,
        electionId,
        selections
      });
      
      await get().loadVotes();
      set({ loading: false });
      return true;
    } catch (err) {
      set({ error: ERROR_MESSAGES.VOTE_ERROR, loading: false });
      return false;
    }
  },

  loadVotes: async () => {
    try {
      const allVotes = await FirestoreService.getAllVotes();
      const sessions = await FirestoreService.getSessions();
      const admins = await FirestoreService.getAdmins();
      
      // Convertir FirestoreSession a Session con miembros y elecciones
      const convertedSessions: { [key: string]: Session } = {};
      
      for (const [sessionId, firestoreSession] of Object.entries(sessions)) {
        const members = await FirestoreService.getMembersBySession(sessionId);
        const elections = await FirestoreService.getElectionsBySession(sessionId);
        
        convertedSessions[sessionId] = {
          ...firestoreSession,
          members,
          elections
        };
      }
      
      set({ 
        db: { 
          votes: allVotes, 
          sessions: convertedSessions, 
          admins 
        } 
      });
    } catch (err) {
      console.error('Error loading votes:', err);
    }
  },

  // Acciones de administrador
  addAdmin: async (username: string, password: string, name: string) => {
    set({ loading: true, error: '' });
    
    try {
      await FirestoreService.createAdmin({
        username,
        pass: password,
        name,
        role: 'manager'
      });
      
      await get().loadVotes();
      set({ loading: false });
      return true;
    } catch (err) {
      set({ error: ERROR_MESSAGES.ADMIN_CREATION_ERROR, loading: false });
      return false;
    }
  },

  deleteAdmin: async (adminId: string) => {
    set({ loading: true, error: '' });
    
    try {
      await FirestoreService.deleteAdmin(adminId);
      await get().loadVotes();
      set({ loading: false });
      return true;
    } catch (err) {
      set({ error: ERROR_MESSAGES.ADMIN_DELETION_ERROR, loading: false });
      return false;
    }
  },

  // Navegación
  goToPage: (page) => {
    set({ currentPage: page });
  },

  goToAdminLogin: () => {
    set({ currentPage: 'adminLogin' });
  },

  goToSuperAdmin: () => {
    set({ currentPage: 'superAdminPanel' });
  },

  // Utilidades
  clearError: () => {
    set({ error: '' });
  },

  setError: (error) => {
    set({ error });
  }
}));
