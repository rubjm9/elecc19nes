import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs, 
  query,
  where,
  onSnapshot,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import bcrypt from 'bcryptjs';

// Tipos actualizados para Firestore
export interface FirestoreAdmin {
  id?: string;
  username: string;
  pass: string;
  role: 'manager' | 'superadmin';
  name: string;
  createdAt?: Timestamp;
}

export interface FirestoreMember {
  id?: string;
  name: string;
  email: string | null;
  key: string;
  status: 'Presente' | 'Invitado';
  isEligible: boolean;
  sessionId: string;
  createdAt?: Timestamp;
}

export interface FirestoreElection {
  id?: string;
  name: string;
  description: string;
  positionsToElect: number;
  status: 'Abierta' | 'Cerrada' | 'Prevista';
  candidates?: string[];
  sessionId: string;
  createdAt?: Timestamp;
}

export interface FirestoreSession {
  id?: string;
  name: string;
  createdBy: string;
  createdAt?: Timestamp;
}

export interface FirestoreVote {
  id?: string;
  voterKey: string;
  electionId: string;
  sessionId: string;
  selections: string[];
  createdAt?: Timestamp;
}

// Servicios de Firestore
export class FirestoreService {
  // === ADMINISTRADORES ===
  static async createAdmin(admin: Omit<FirestoreAdmin, 'id' | 'createdAt'>) {
    try {
      // Cifrar la contraseña antes de guardarla
      const hashedPassword = await bcrypt.hash(admin.pass, 10);
      
      const docRef = await addDoc(collection(db, 'admins'), {
        ...admin,
        pass: hashedPassword,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  }

  static async deleteAdmin(adminId: string) {
    try {
      await deleteDoc(doc(db, 'admins', adminId));
      console.log('Admin deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  }

  static async getAdmins() {
    try {
      const querySnapshot = await getDocs(collection(db, 'admins'));
      const admins: { [key: string]: FirestoreAdmin } = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreAdmin;
        // Usar el nombre como key para mantener compatibilidad
        const adminKey = data.name.toLowerCase().replace(/\s+/g, '');
        admins[adminKey] = { ...data, id: doc.id };
      });
      
      return admins;
    } catch (error) {
      console.error('Error getting admins:', error);
      throw error;
    }
  }

  static async getAdminByCredentials(username: string, password: string) {
    try {
      const admins = await this.getAdmins();
      
      // Buscar admin por username
      let admin = null;
      let adminKey = '';
      
      for (const [key, adminData] of Object.entries(admins)) {
        if (adminData.username === username) {
          admin = adminData;
          adminKey = key;
          break;
        }
      }
      
      if (admin) {
        // Verificar contraseña usando bcrypt
        const isValidPassword = await bcrypt.compare(password, admin.pass);
        if (isValidPassword) {
          return { ...admin, id: adminKey };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting admin by credentials:', error);
      throw error;
    }
  }

  // === SESIONES ===
  static async createSession(session: Omit<FirestoreSession, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'sessions'), {
        ...session,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  static async getSessions() {
    try {
      const querySnapshot = await getDocs(collection(db, 'sessions'));
      const sessions: { [key: string]: FirestoreSession } = {};
      
      querySnapshot.forEach((doc) => {
        sessions[doc.id] = { ...doc.data() as FirestoreSession, id: doc.id };
      });
      
      return sessions;
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }
  }

  static async getSessionsByCreator(createdBy: string) {
    try {
      const q = query(collection(db, 'sessions'), where('createdBy', '==', createdBy));
      const querySnapshot = await getDocs(q);
      const sessions: { [key: string]: FirestoreSession } = {};
      
      querySnapshot.forEach((doc) => {
        sessions[doc.id] = { ...doc.data() as FirestoreSession, id: doc.id };
      });
      
      return sessions;
    } catch (error) {
      console.error('Error getting sessions by creator:', error);
      throw error;
    }
  }

  // === MIEMBROS ===
  static async createMember(member: Omit<FirestoreMember, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'members'), {
        ...member,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  }

  static async createMembers(members: Omit<FirestoreMember, 'id' | 'createdAt'>[]) {
    try {
      const batch = writeBatch(db);
      const memberIds: string[] = [];

      members.forEach((member) => {
        const docRef = doc(collection(db, 'members'));
        batch.set(docRef, { ...member, createdAt: Timestamp.now() });
        memberIds.push(docRef.id);
      });

      await batch.commit();
      return memberIds;
    } catch (error) {
      console.error('Error creating members:', error);
      throw error;
    }
  }

  static async getMembersBySession(sessionId: string) {
    try {
      const q = query(collection(db, 'members'), where('sessionId', '==', sessionId));
      const querySnapshot = await getDocs(q);
      const members: FirestoreMember[] = [];
      
      querySnapshot.forEach((doc) => {
        members.push({ ...doc.data() as FirestoreMember, id: doc.id });
      });
      
      return members;
    } catch (error) {
      console.error('Error getting members by session:', error);
      throw error;
    }
  }

  static async findMemberByKey(key: string) {
    try {
      const q = query(collection(db, 'members'), where('key', '==', key));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { ...doc.data() as FirestoreMember, id: doc.id };
      }
      
      return null;
    } catch (error) {
      console.error('Error finding member by key:', error);
      throw error;
    }
  }

  static async updateMember(memberId: string, updates: Partial<FirestoreMember>) {
    try {
      const memberRef = doc(db, 'members', memberId);
      await updateDoc(memberRef, updates);
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  }

  // === ELECCIONES ===
  static async createElection(election: Omit<FirestoreElection, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'elections'), {
        ...election,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating election:', error);
      throw error;
    }
  }

  static async getElectionsBySession(sessionId: string) {
    try {
      const q = query(collection(db, 'elections'), where('sessionId', '==', sessionId));
      const querySnapshot = await getDocs(q);
      const elections: { [key: string]: FirestoreElection } = {};
      
      querySnapshot.forEach((doc) => {
        elections[doc.id] = { ...doc.data() as FirestoreElection, id: doc.id };
      });
      
      return elections;
    } catch (error) {
      console.error('Error getting elections by session:', error);
      throw error;
    }
  }

  static async updateElection(electionId: string, updates: Partial<FirestoreElection>) {
    try {
      const electionRef = doc(db, 'elections', electionId);
      await updateDoc(electionRef, updates);
    } catch (error) {
      console.error('Error updating election:', error);
      throw error;
    }
  }

  // === VOTOS ===
  static async castVote(vote: Omit<FirestoreVote, 'id' | 'createdAt'>) {
    try {
      // Primero, verificar si ya existe un voto para esta combinación
      const q = query(
        collection(db, 'votes'), 
        where('voterKey', '==', vote.voterKey),
        where('electionId', '==', vote.electionId)
      );
      
      const existingVotes = await getDocs(q);
      
      if (!existingVotes.empty) {
        // Actualizar voto existente
        const existingVoteDoc = existingVotes.docs[0];
        await updateDoc(existingVoteDoc.ref, {
          selections: vote.selections,
          createdAt: Timestamp.now()
        });
        return existingVoteDoc.id;
      } else {
        // Crear nuevo voto
        const docRef = await addDoc(collection(db, 'votes'), {
          ...vote,
          createdAt: Timestamp.now()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      throw error;
    }
  }

  static async getVotesBySession(sessionId: string) {
    try {
      const q = query(collection(db, 'votes'), where('sessionId', '==', sessionId));
      const querySnapshot = await getDocs(q);
      const votes: { [voterKey: string]: { [electionId: string]: string[] } } = {};
      
      querySnapshot.forEach((doc) => {
        const vote = doc.data() as FirestoreVote;
        if (!votes[vote.voterKey]) {
          votes[vote.voterKey] = {};
        }
        votes[vote.voterKey][vote.electionId] = vote.selections;
      });
      
      return votes;
    } catch (error) {
      console.error('Error getting votes by session:', error);
      throw error;
    }
  }

  static async getVotesByVoter(voterKey: string) {
    try {
      const q = query(collection(db, 'votes'), where('voterKey', '==', voterKey));
      const querySnapshot = await getDocs(q);
      const votes: { [electionId: string]: string[] } = {};
      
      querySnapshot.forEach((doc) => {
        const vote = doc.data() as FirestoreVote;
        votes[vote.electionId] = vote.selections;
      });
      
      return votes;
    } catch (error) {
      console.error('Error getting votes by voter:', error);
      throw error;
    }
  }

  static async getAllVotes() {
    try {
      const querySnapshot = await getDocs(collection(db, 'votes'));
      const votes: { [voterKey: string]: { [electionId: string]: string[] } } = {};
      
      querySnapshot.forEach((doc) => {
        const vote = doc.data() as FirestoreVote;
        if (!votes[vote.voterKey]) {
          votes[vote.voterKey] = {};
        }
        votes[vote.voterKey][vote.electionId] = vote.selections;
      });
      
      return votes;
    } catch (error) {
      console.error('Error getting all votes:', error);
      throw error;
    }
  }

  // === UTILIDADES ===
  static async initializeDefaultAdmins() {
    try {
      const admins = await this.getAdmins();
      
      // Verificar si los admins existentes tienen el campo username
      const hasValidAdmins = Object.values(admins).some(admin => admin.username);
      
      // Si no hay admins válidos, limpiar y recrear
      if (Object.keys(admins).length === 0 || !hasValidAdmins) {
        console.log('Recreating default admins with proper structure...');
        
        // Limpiar admins existentes si no tienen la estructura correcta
        if (!hasValidAdmins && Object.keys(admins).length > 0) {
          await this.clearAdmins();
        }
        
        await this.createAdmin({
          username: 'admin',
          pass: '1234',
          role: 'manager',
          name: 'Admin General'
        });
        
        await this.createAdmin({
          username: 'superadmin',
          pass: 'super',
          role: 'superadmin',
          name: 'Super Admin'
        });
        
        console.log('Default admins created successfully');
      } else {
        console.log('Valid admins already exist');
      }
    } catch (error) {
      console.error('Error initializing default admins:', error);
    }
  }

  static async clearAdmins() {
    try {
      const querySnapshot = await getDocs(collection(db, 'admins'));
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
      });
      
      await batch.commit();
      console.log('Existing admins cleared');
    } catch (error) {
      console.error('Error clearing admins:', error);
      throw error;
    }
  }

  // === SUSCRIPCIONES EN TIEMPO REAL ===
  
  // Escuchar cambios en todas las sesiones
  static subscribeToSessions(callback: (sessions: { [key: string]: FirestoreSession }) => void) {
    return onSnapshot(collection(db, 'sessions'), (snapshot) => {
      const sessions: { [key: string]: FirestoreSession } = {};
      snapshot.forEach((doc) => {
        sessions[doc.id] = { ...doc.data() as FirestoreSession, id: doc.id };
      });
      callback(sessions);
    }, (error) => {
      console.error('Error in subscribeToSessions:', error);
    });
  }

  // Escuchar cambios en una sesión específica
  static subscribeToSession(sessionId: string, callback: (session: FirestoreSession | null) => void) {
    return onSnapshot(doc(db, 'sessions', sessionId), (snapshot) => {
      if (snapshot.exists()) {
        callback({ ...snapshot.data() as FirestoreSession, id: snapshot.id });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error in subscribeToSession:', error);
    });
  }

  // Escuchar cambios en miembros de una sesión
  static subscribeToMembers(sessionId: string, callback: (members: FirestoreMember[]) => void) {
    const q = query(collection(db, 'members'), where('sessionId', '==', sessionId));
    return onSnapshot(q, (snapshot) => {
      const members: FirestoreMember[] = [];
      snapshot.forEach((doc) => {
        members.push({ ...doc.data() as FirestoreMember, id: doc.id });
      });
      callback(members);
    }, (error) => {
      console.error('Error in subscribeToMembers:', error);
    });
  }

  // Escuchar cambios en elecciones de una sesión
  static subscribeToElections(sessionId: string, callback: (elections: { [key: string]: FirestoreElection }) => void) {
    const q = query(collection(db, 'elections'), where('sessionId', '==', sessionId));
    return onSnapshot(q, (snapshot) => {
      const elections: { [key: string]: FirestoreElection } = {};
      snapshot.forEach((doc) => {
        elections[doc.id] = { ...doc.data() as FirestoreElection, id: doc.id };
      });
      callback(elections);
    }, (error) => {
      console.error('Error in subscribeToElections:', error);
    });
  }

  // Escuchar cambios en votos de una sesión
  static subscribeToVotes(sessionId: string, callback: (votes: { [voterKey: string]: { [electionId: string]: string[] } }) => void) {
    const q = query(collection(db, 'votes'), where('sessionId', '==', sessionId));
    return onSnapshot(q, (snapshot) => {
      const votes: { [voterKey: string]: { [electionId: string]: string[] } } = {};
      snapshot.forEach((doc) => {
        const vote = doc.data() as FirestoreVote;
        if (!votes[vote.voterKey]) {
          votes[vote.voterKey] = {};
        }
        votes[vote.voterKey][vote.electionId] = vote.selections;
      });
      callback(votes);
    }, (error) => {
      console.error('Error in subscribeToVotes:', error);
    });
  }

  // Escuchar cambios en votos de una elección específica
  static subscribeToVotesByElection(electionId: string, callback: (votes: { [voterKey: string]: string[] }) => void) {
    const q = query(collection(db, 'votes'), where('electionId', '==', electionId));
    return onSnapshot(q, (snapshot) => {
      const votes: { [voterKey: string]: string[] } = {};
      snapshot.forEach((doc) => {
        const vote = doc.data() as FirestoreVote;
        votes[vote.voterKey] = vote.selections;
      });
      callback(votes);
    }, (error) => {
      console.error('Error in subscribeToVotesByElection:', error);
    });
  }

  // Escuchar cambios en administradores
  static subscribeToAdmins(callback: (admins: { [key: string]: FirestoreAdmin }) => void) {
    return onSnapshot(collection(db, 'admins'), (snapshot) => {
      const admins: { [key: string]: FirestoreAdmin } = {};
      snapshot.forEach((doc) => {
        const data = doc.data() as FirestoreAdmin;
        // Usar el nombre como key para mantener compatibilidad
        const adminKey = data.name.toLowerCase().replace(/\s+/g, '');
        admins[adminKey] = { ...data, id: doc.id };
      });
      callback(admins);
    }, (error) => {
      console.error('Error in subscribeToAdmins:', error);
    });
  }
}
