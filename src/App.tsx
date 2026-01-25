import { useState, useEffect, useRef } from 'react';
import { FirestoreService } from './firebase/firestoreService';
import type { 
  FirestoreAdmin, 
  FirestoreMember, 
  FirestoreElection, 
  FirestoreSession 
} from './firebase/firestoreService';

// --- Iconos SVG ---
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12"></path><path d="m6 6 12 12"></path></svg>;

// --- Tipos TypeScript (usando tipos de Firestore) ---
interface Admin extends FirestoreAdmin {}
interface Member extends FirestoreMember {}
interface Election extends FirestoreElection {}
interface Session extends FirestoreSession {
  members: Member[];
  elections: { [key: string]: Election };
}

interface Database {
  admins: { [key: string]: Admin };
  sessions: { [key: string]: Session };
  votes: { [key: string]: { [electionId: string]: string[] } };
}

interface User {
  username: string;
  pass: string;
  role: 'manager' | 'superadmin';
  name: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface HomePageProps {
  onLogin: (key: string) => void;
  onAdminClick: () => void;
  error: string;
  loading?: boolean;
}

interface AdminLoginProps {
  onLogin: (username: string, password: string) => void;
  onBack: () => void;
  error: string;
  loading?: boolean;
}

interface AdminDashboardProps {
  user: User;
  db: Database;
  onManageSession: (id: string) => void;
  onCreateSession: (sessionName: string, membersList: string) => void;
  onManageAdmins: () => void;
  onLogout: () => void;
}

interface SessionManagementProps {
  session: Session;
  votes: Database['votes'];
  onAccredit: (sessionId: string, memberId: string) => void;
  onToggleEligibility: (sessionId: string, memberId: string) => void;
  onChangeElectionStatus: (sessionId: string, electionId: string, status: Election['status']) => void;
  onAddElection: (sessionId: string, electionData: Omit<Election, 'id'>) => void;
  onAddMembers: (sessionId: string, membersList: string) => void;
  onBack: () => void;
  onViewResults: (electionId: string) => void;
  isXlsxLoaded: boolean;
}

interface VoterSessionViewProps {
  session: Session;
  votes: { [electionId: string]: string[] };
  onVoteClick: (electionId: string) => void;
  onExit: () => void;
}

interface BallotPageProps {
  session: Session;
  election: Election;
  voterKey: string;
  previousVotes: string[];
  onVote: (key: string, sessionId: string, electionId: string, selections: string[]) => void;
  onBack: () => void;
}

interface VoteSuccessPageProps {
  onBackToSession: () => void;
  onExit: () => void;
}

interface ResultsPageProps {
  session: Session;
  election: Election;
  votes: Database['votes'];
  onBack: () => void;
  onAddElection: (sessionId: string, electionData: Omit<Election, 'id'>) => void;
}

interface SuperAdminPanelProps {
  admins: Database['admins'];
  onAddAdmin: (username: string, password: string, name: string) => void;
  onDeleteAdmin: (adminId: string, adminName: string) => void;
  onBack: () => void;
}

// Declaración global para XLSX
declare global {
  interface Window {
    XLSX: any;
  }
}

const XLSX = (window as any).XLSX;

// --- Base de Datos Simulada (inicial vacía, se carga desde Firestore) ---
const initialDb: Database = {
  admins: {},
  sessions: {},
  votes: {}
};

// --- Componente de Modal Genérico ---
function Modal({ isOpen, onClose, title, children }: ModalProps) { 
  if (!isOpen) return null; 
  return ( 
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4" onClick={onClose}> 
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e: React.MouseEvent) => e.stopPropagation()}> 
        <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4"> 
          <h3 className="text-xl font-bold text-slate-800">{title}</h3> 
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button> 
        </div> 
        <div>{children}</div> 
      </div> 
    </div> 
  ); 
}

// --- Componente Principal: App ---
export default function App() {
  const [db, setDb] = useState<Database>(initialDb);
  const [page, setPage] = useState<string>('home');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentElectionId, setCurrentElectionId] = useState<string | null>(null);
  const [voterKey, setVoterKey] = useState<string | null>(null);
  const [isXlsxLoaded, setIsXlsxLoaded] = useState<boolean>(false);
  
  // Estados de carga para Firestore
  const [loading, setLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);

  // Inicialización
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setInitializing(true);
        // Inicializar admins por defecto
        await FirestoreService.initializeDefaultAdmins();
        // Cargar datos iniciales
        await loadInitialData();
      } catch (error) {
        console.error('Error initializing app:', error);
        setError('Error al inicializar la aplicación');
      } finally {
        setInitializing(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => { const script = document.createElement('script'); script.src = "https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"; script.async = true; script.onload = () => setIsXlsxLoaded(true); document.body.appendChild(script); return () => { document.body.removeChild(script); }; }, []);
  useEffect(() => { if (error) { const timer = setTimeout(() => setError(''), 4000); return () => clearTimeout(timer); } }, [error]);
  
  // Cargar datos iniciales
  const loadInitialData = async () => {
    try {
      const [admins, sessions] = await Promise.all([
        FirestoreService.getAdmins(),
        FirestoreService.getSessions()
      ]);

      // Cargar miembros y elecciones para cada sesión
      const sessionsWithData: { [key: string]: Session } = {};
      
      for (const [sessionId, session] of Object.entries(sessions)) {
        const [members, elections] = await Promise.all([
          FirestoreService.getMembersBySession(sessionId),
          FirestoreService.getElectionsBySession(sessionId)
        ]);

        sessionsWithData[sessionId] = {
          ...session,
          members,
          elections
        };
      }

      // Cargar todos los votos
      const allVotes = await FirestoreService.getAllVotes();

      setDb({
        admins,
        sessions: sessionsWithData,
        votes: allVotes
      });
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Error al cargar los datos');
    }
  };
  
  const findMemberByKey = async (key: string): Promise<(Member & { sessionId: string }) | null> => {
    try {
      const member = await FirestoreService.findMemberByKey(key);
      if (member && member.sessionId) {
        return { ...member, sessionId: member.sessionId };
      }
      return null;
    } catch (error) {
      console.error('Error finding member by key:', error);
      return null;
    }
  };

  const handleVoterLogin = async (key: string) => { 
    try {
      setLoading(true);
      const memberData = await findMemberByKey(key); 
      if (memberData && memberData.status === 'Presente') { 
        setVoterKey(memberData.key); 
        setCurrentSessionId(memberData.sessionId); 
        
        // Cargar votos del votante
        const voterVotes = await FirestoreService.getVotesByVoter(key);
        setDb(prev => ({
          ...prev,
          votes: { ...prev.votes, [key]: voterVotes }
        }));
        
        setPage('voterSession'); 
        setError(''); 
      } else if (memberData) { 
        setError('Aún no has sido acreditado. Acércate al punto de registro.'); 
      } else { 
        setError('Clave de acceso no válida.'); 
      } 
    } catch (error) {
      console.error('Error during voter login:', error);
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (username: string, password: string) => { 
    try {
      setLoading(true);
      const adminUser = await FirestoreService.getAdminByCredentials(username, password);
      if (adminUser) { 
        setUser(adminUser); 
        setPage('adminDashboard'); 
        setError(''); 
      } else { 
        setError('Usuario o contraseña incorrectos.'); 
      } 
    } catch (error) {
      console.error('Error during admin login:', error);
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => { setUser(null); setPage('home'); };
  
  const createSession = async (sessionName: string, membersList: string) => {
    try {
      setLoading(true);
      const generateKey = (): string => Math.random().toString(36).substring(2, 7).toUpperCase();
      const names = new Set<string>();
      let duplicates: string[] = [];
      
      const memberData = membersList.split('\n').filter((line: string) => line.trim() !== '').map((line: string) => {
        const parts = line.split(',').map((p: string) => p.trim());
        const name = parts[0];
        if (names.has(name.toLowerCase())) {
            duplicates.push(name);
            return null;
        }
        names.add(name.toLowerCase());
        return { 
          name, 
          email: parts.length > 1 ? parts[1] : null, 
          key: generateKey(), 
          status: 'Invitado' as const, 
          isEligible: true 
        };
    }).filter(Boolean);

      if (duplicates.length > 0) { 
        alert(`Los siguientes miembros estaban duplicados y no se han añadido: ${duplicates.join(', ')}`); 
      }
      
      if (memberData.length === 0) return;

      // Crear sesión en Firestore
      const sessionId = await FirestoreService.createSession({
        name: sessionName,
        createdBy: user!.username
      });

      // Crear miembros con referencia a la sesión
      const membersWithSession = memberData.map(member => ({
        name: member?.name || '',
        email: member?.email || '',
        key: member?.key || '',
        status: member?.status || 'Invitado' as const,
        isEligible: member?.isEligible || false,
        sessionId
      }));

      await FirestoreService.createMembers(membersWithSession);

      // Recargar datos
      await loadInitialData();
      
      setError('');
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Error al crear la sesión');
    } finally {
      setLoading(false);
    }
  };
  const addMembersToSession = (sessionId: string, membersList: string) => {
    const generateKey = (): string => Math.random().toString(36).substring(2, 7).toUpperCase();
    const existingNames = new Set(db.sessions[sessionId].members.map((m: Member) => m.name.toLowerCase()));
    let duplicates: string[] = [];
    const newMembers = membersList.split('\n').filter((line: string) => line.trim() !== '').map((line: string, index: number) => {
        const parts = line.split(',').map((p: string) => p.trim());
        const name = parts[0];
        if (existingNames.has(name.toLowerCase())) { duplicates.push(name); return null; }
        return { 
          id: `mem${Date.now()}${index}`, 
          name, 
          email: parts.length > 1 ? parts[1] : null, 
          key: generateKey(), 
          status: 'Invitado' as const, 
          isEligible: true 
        };
    }).filter(Boolean) as Member[];
    if (duplicates.length > 0) { alert(`Los siguientes miembros ya existen: ${duplicates.join(', ')}`); }
    if (newMembers.length === 0) return;
    setDb((prev: Database) => { const newDb = JSON.parse(JSON.stringify(prev)); newDb.sessions[sessionId].members.push(...newMembers); return newDb; });
  };
  const accreditMember = async (sessionId: string, memberId: string) => { 
    try {
      setLoading(true);
      
      const member = db.sessions[sessionId].members.find(m => m.id === memberId);
      if (!member) return;
      
      const generateKey = (): string => Math.random().toString(36).substring(2, 7).toUpperCase();
      const newKey = generateKey();
      
      // Actualizar en Firestore
      await FirestoreService.updateMember(memberId, { 
        status: 'Presente', 
        key: newKey 
      });
      
      // Actualizar estado local
      setDb((prev: Database) => { 
        const newDb = JSON.parse(JSON.stringify(prev)); 
        const member = newDb.sessions[sessionId].members.find((m: Member) => m.id === memberId); 
        if (member) { 
          member.status = 'Presente'; 
          member.key = newKey; 
        } 
        return newDb; 
      });
      
      console.log('Miembro acreditado:', member.name, 'Clave:', newKey);
    } catch (error) {
      console.error('Error accrediting member:', error);
      setError('Error al acreditar al miembro');
    } finally {
      setLoading(false);
    }
  };
  const toggleMemberEligibility = async (sessionId: string, memberId: string) => { 
    try {
      setLoading(true);
      
      const member = db.sessions[sessionId].members.find(m => m.id === memberId);
      if (!member) return;
      
      const newEligibility = !member.isEligible;
      
      // Actualizar en Firestore
      await FirestoreService.updateMember(memberId, { 
        isEligible: newEligibility 
      });
      
      // Actualizar estado local
      setDb((prev: Database) => { 
        const newDb = JSON.parse(JSON.stringify(prev)); 
        const member = newDb.sessions[sessionId].members.find((m: Member) => m.id === memberId); 
        if (member) member.isEligible = newEligibility; 
        return newDb; 
      });
      
      console.log('Elegibilidad actualizada:', member.name, newEligibility);
    } catch (error) {
      console.error('Error updating member eligibility:', error);
      setError('Error al actualizar la elegibilidad');
    } finally {
      setLoading(false);
    }
  };
  const changeElectionStatus = async (sessionId: string, electionId: string, status: Election['status']) => { 
    try {
      setLoading(true);
      
      // Actualizar en Firestore
      await FirestoreService.updateElection(electionId, { status });
      
      // Actualizar estado local
      setDb((prev: Database) => { 
        const newDb = JSON.parse(JSON.stringify(prev)); 
        newDb.sessions[sessionId].elections[electionId].status = status; 
        return newDb; 
      });
      
      console.log('Estado de elección actualizado:', status);
    } catch (error) {
      console.error('Error updating election status:', error);
      setError('Error al actualizar el estado de la elección');
    } finally {
      setLoading(false);
    }
  };
  const addElectionToSession = async (sessionId: string, electionData: Omit<Election, 'id'>) => { 
    try {
      setLoading(true);
      
      // Crear elección en Firestore
      const electionId = await FirestoreService.createElection(electionData);
      
      // Actualizar estado local
      setDb((prev: Database) => { 
        const newDb = JSON.parse(JSON.stringify(prev)); 
        newDb.sessions[sessionId].elections[electionId] = { id: electionId, ...electionData }; 
        return newDb; 
      });
      
      console.log('Elección creada exitosamente:', electionId);
    } catch (error) {
      console.error('Error creating election:', error);
      setError('Error al crear la elección');
    } finally {
      setLoading(false);
    }
  };
  
  const castVote = async (key: string, sessionId: string, electionId: string, selections: string[]) => {
    try {
      setLoading(true);
      await FirestoreService.castVote({
        voterKey: key,
        electionId,
        sessionId,
        selections
      });

      // Actualizar estado local
      setDb((prev: Database) => { 
        const newDb = JSON.parse(JSON.stringify(prev)); 
        if (!newDb.votes[key]) newDb.votes[key] = {}; 
        newDb.votes[key][electionId] = selections; 
        return newDb; 
      });

    setPage('voteSuccess');
    } catch (error) {
      console.error('Error casting vote:', error);
      setError('Error al emitir el voto');
    } finally {
      setLoading(false);
    }
  };
  const addAdmin = async (username: string, password: string, name: string) => { 
    try {
      setLoading(true);
      
      if (db.admins[username]) { 
        alert('El nombre de usuario ya existe.'); 
        return; 
      } 

      await FirestoreService.createAdmin({
        username,
        pass: password,
        role: 'manager',
        name
      });

      // Recargar admins
      const admins = await FirestoreService.getAdmins();
      setDb(prev => ({ ...prev, admins }));
      
    } catch (error) {
      console.error('Error adding admin:', error);
      setError('Error al crear administrador');
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (adminId: string, adminName: string) => {
    try {
      console.log('Iniciando eliminación de administrador:', { adminId, adminName });
      console.log('Estado actual de admins:', db.admins);
      
      // Confirmar eliminación
      const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar al administrador "${adminName}"?\n\nEsta acción no se puede deshacer.`);
      if (!confirmed) {
        console.log('Eliminación cancelada por el usuario');
        return;
      }

      console.log('Confirmación aceptada, procediendo con la eliminación...');
      setLoading(true);
      
      // Verificar que el adminId existe en el estado local
      if (!db.admins[adminId]) {
        console.error('No se encontró el administrador en el estado local con la clave:', adminId);
        console.log('Claves disponibles:', Object.keys(db.admins));
        setError('Error: No se pudo identificar el administrador');
        return;
      }
      
      console.log('Administrador encontrado en estado local:', db.admins[adminId]);
      
      // Obtener el ID del documento de Firestore
      const firestoreId = db.admins[adminId].id;
      if (!firestoreId) {
        console.error('No se encontró el ID de Firestore para el administrador');
        setError('Error: No se pudo identificar el administrador en la base de datos');
        return;
      }
      
      console.log('ID de Firestore encontrado:', firestoreId);
      
      // Llamar al servicio con el ID del documento de Firestore
      console.log('Llamando a FirestoreService.deleteAdmin...');
      await FirestoreService.deleteAdmin(firestoreId);
      console.log('Administrador eliminado exitosamente en Firestore');

      // Actualizar el estado local directamente
      console.log('Actualizando estado local...');
      setDb(prev => {
        const newAdmins = { ...prev.admins };
        delete newAdmins[adminId];
        console.log('Estado local actualizado, admins restantes:', Object.keys(newAdmins));
        return { ...prev, admins: newAdmins };
      });
      
      alert('Administrador eliminado correctamente');
      
    } catch (error) {
      console.error('Error deleting admin:', error);
      setError('Error al eliminar administrador');
    } finally {
      setLoading(false);
    }
  };

  const renderPage = () => {
    // Mostrar pantalla de carga durante la inicialización
    if (initializing) {
      return (
        <div className="text-center p-8 bg-white rounded-lg shadow-xl border border-slate-200">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Inicializando aplicación...</h2>
          <p className="text-slate-500">Conectando con Firebase</p>
        </div>
      );
    }

    switch (page) {
      case 'home': return <HomePage onLogin={handleVoterLogin} onAdminClick={() => setPage('adminLogin')} error={error} loading={loading} />;
      case 'adminLogin': return <AdminLogin onLogin={handleAdminLogin} onBack={() => setPage('home')} error={error} loading={loading} />;
      case 'adminDashboard': 
        if (!user) return <HomePage onLogin={handleVoterLogin} onAdminClick={() => setPage('adminLogin')} error={error} />;
        return <AdminDashboard user={user} db={db} onManageSession={(id: string) => { setCurrentSessionId(id); setPage('sessionManagement'); }} onCreateSession={createSession} onManageAdmins={() => setPage('superAdminPanel')} onLogout={handleLogout} />;
      case 'superAdminPanel': return <SuperAdminPanel admins={db.admins} onAddAdmin={addAdmin} onDeleteAdmin={deleteAdmin} onBack={() => setPage('adminDashboard')} />;
      case 'sessionManagement': 
        if (!currentSessionId || !db.sessions[currentSessionId]) return <HomePage onLogin={handleVoterLogin} onAdminClick={() => setPage('adminLogin')} error={error} />;
        return <SessionManagement session={db.sessions[currentSessionId]} votes={db.votes} onAccredit={accreditMember} onToggleEligibility={toggleMemberEligibility} onChangeElectionStatus={changeElectionStatus} onAddElection={addElectionToSession} onAddMembers={addMembersToSession} onBack={() => setPage('adminDashboard')} onViewResults={(elecId: string) => { setCurrentElectionId(elecId); setPage('results'); }} isXlsxLoaded={isXlsxLoaded}/>;
      case 'voterSession': 
        if (!currentSessionId || !voterKey || !db.sessions[currentSessionId]) return <HomePage onLogin={handleVoterLogin} onAdminClick={() => setPage('adminLogin')} error={error} />;
        return <VoterSessionView session={db.sessions[currentSessionId]} votes={db.votes[voterKey] || {}} onVoteClick={(elecId: string) => { setCurrentElectionId(elecId); setPage('ballot'); }} onExit={() => { setVoterKey(null); setCurrentSessionId(null); setPage('home'); }} />;
      case 'ballot':
        if (!currentSessionId || !currentElectionId || !voterKey || !db.sessions[currentSessionId]) return <HomePage onLogin={handleVoterLogin} onAdminClick={() => setPage('adminLogin')} error={error} />;
        const sessionForBallot = db.sessions[currentSessionId];
        const electionForBallot = sessionForBallot.elections[currentElectionId];
        if (!electionForBallot) return <HomePage onLogin={handleVoterLogin} onAdminClick={() => setPage('adminLogin')} error={error} />;
        const votesForVoter = db.votes[voterKey] || {};
        const previousVotesForElection = votesForVoter[currentElectionId] || [];
        return <BallotPage session={sessionForBallot} election={electionForBallot} voterKey={voterKey} previousVotes={previousVotesForElection} onVote={castVote} onBack={() => setPage('voterSession')} />;
      case 'voteSuccess': return <VoteSuccessPage onBackToSession={() => { setCurrentElectionId(null); setPage('voterSession'); }} onExit={() => { setVoterKey(null); setCurrentSessionId(null); setPage('home'); }} />;
      case 'results': 
        if (!currentSessionId || !currentElectionId || !db.sessions[currentSessionId]) return <HomePage onLogin={handleVoterLogin} onAdminClick={() => setPage('adminLogin')} error={error} />;
        const sessionForResults = db.sessions[currentSessionId];
        const electionForResults = sessionForResults.elections[currentElectionId];
        if (!electionForResults) return <HomePage onLogin={handleVoterLogin} onAdminClick={() => setPage('adminLogin')} error={error} />;
        return <ResultsPage session={sessionForResults} election={electionForResults} votes={db.votes} onBack={() => setPage('sessionManagement')} onAddElection={addElectionToSession}/>;
      default: return <HomePage onLogin={handleVoterLogin} onAdminClick={() => setPage('adminLogin')} error={error} />;
    }
  };

  return ( <> <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,700;9..40,900&display=swap');

    @keyframes gradientShift {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    .animated-gradient {
      background: linear-gradient(135deg,rgb(213, 252, 254) 0%,rgb(244, 253, 253) 50%,rgb(187, 247, 252) 100%);
      background-size: 200% 200%;
      animation: gradientShift 12s ease-in-out infinite;
    }
  `}</style> <div className="min-h-screen animated-gradient flex flex-col font-sans" style={{ fontFamily: "'DM Sans', sans-serif" }}> 
    {/* Contenido principal centrado con H1 integrado */}
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      {/* H1 integrado en el contenido principal */}
      <h1 
        onClick={() => setPage('home')} 
        className="text-5xl tracking-wider text-cyan-600 cursor-pointer hover:text-cyan-700 transition-colors mb-6" 
        style={{fontWeight: 900}}
        title="Haz clic para volver a la portada"
      >
        ELECC19NES
      </h1>
      
      {/* Contenido de la página */}
      <div className="w-full max-w-md">
        {renderPage()}
      </div>
    </div>
  </div> </> );
}

// --- Componentes de Página ---
function HomePage({ onLogin, onAdminClick, error, loading = false }: HomePageProps) {
  const [key, setKey] = useState<string>('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (key && !loading) onLogin(key); };
  return ( 
    <div className="text-center"> 
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso de votantes</h2>
        <p className="text-slate-500 mb-8">Introduce tu clave de sesión para participar</p> 
        <form onSubmit={handleSubmit} className="flex flex-col gap-4"> 
          <input 
            type="text" 
            value={key} 
            onChange={(e) => setKey(e.target.value.toUpperCase())} 
            maxLength={5} 
            className="bg-slate-50 border-2 border-slate-300 rounded-lg text-center text-2xl p-4 tracking-[0.5em] uppercase focus:outline-none focus:border-cyan-500" 
            placeholder="_ _ _ _ _"
            disabled={loading}
          /> 
          <button 
            type="submit" 
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Conectando...
              </div>
            ) : (
              'Acceder a la sesión'
            )}
          </button> 
        </form> 
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-600 text-sm text-center">{error}</p></div>} 
        <div className="mt-12">
          <a href="#" onClick={(e) => { e.preventDefault(); if (!loading) onAdminClick(); }} className="text-slate-500 hover:text-cyan-600 text-sm">
            Acceso administrador
          </a>
        </div> 
      </div> 
    </div>
  );
}

function AdminLogin({ onLogin, onBack, error, loading = false }: AdminLoginProps) {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const usernameInputRef = useRef<HTMLInputElement>(null);
  
  // Foco automático en el input del nombre de usuario
  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!loading) onLogin(username, password); };
  return ( 
    <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200"> 
      <NavigationButton onClick={() => !loading && onBack()} variant="back" className="mb-4" disabled={loading}>
        Volver
      </NavigationButton> 
      <h2 className="text-2xl font-bold mb-6 text-center text-cyan-700">Acceso administrador</h2> 
      <form onSubmit={handleSubmit} className="flex flex-col gap-4"> 
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><UserIcon /></span>
          <input 
            ref={usernameInputRef}
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 pl-12 focus:outline-none focus:border-cyan-500" 
            placeholder="Usuario"
            disabled={loading}
          />
        </div> 
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><LockIcon /></span>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 pl-12 focus:outline-none focus:border-cyan-500" 
            placeholder="Contraseña"
            disabled={loading}
          />
        </div> 
        <button 
          type="submit" 
          className="mt-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Conectando...
            </div>
          ) : (
            'Iniciar sesión'
          )}
        </button> 
      </form> 
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>} 
      <div className="text-xs text-slate-400 mt-4 text-center">
        <p>Users: admin (pass: 1234), superadmin (pass: super)</p>
      </div> 
    </div> 
  );
}

function AdminDashboard({ user, db, onManageSession, onCreateSession, onManageAdmins, onLogout }: AdminDashboardProps) {
    const [showCreate, setShowCreate] = useState<boolean>(false);
    const [sessionName, setSessionName] = useState<string>('');
    const [membersList, setMembersList] = useState<string>('');
    const handleCreate = (e: React.FormEvent) => { e.preventDefault(); onCreateSession(sessionName, membersList); setShowCreate(false); setSessionName(''); setMembersList(''); };
    const userSessions = (user.role === 'superadmin' ? Object.values(db.sessions) : Object.values(db.sessions).filter((s: Session) => s.createdBy === user.username));
    
    return ( <>
        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nueva sesión">
            <form onSubmit={handleCreate} className="space-y-4">
                <input type="text" placeholder="Nombre de la sesión" value={sessionName} onChange={e => setSessionName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg" required />
                <textarea placeholder="Lista de miembros (Nombre, email@opcional.com) Agrega una única persona por línea." value={membersList} onChange={e => setMembersList(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg" rows={5} required></textarea>
                <div className="flex gap-3"><button type="button" onClick={() => setShowCreate(false)} className="bg-slate-200 hover:bg-slate-300 font-bold py-2 px-4 rounded-lg flex-1">Cancelar</button><button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex-1">Crear</button></div>
            </form>
        </Modal>
        <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 w-full max-w-md"> 
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-cyan-700">Panel de administración</h2><NavigationButton onClick={onLogout} variant="exit">Cerrar sesión</NavigationButton></div> 
            <p className="text-slate-500 mb-6 -mt-4"><strong>¡Bienvenido, {user.name}!</strong> Para crear elecciones primero debes crear una sesión de votaciones, en la cual podrás añadir votantes y elecciones.</p> 
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button onClick={() => setShowCreate(true)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-3 rounded-lg shadow-md"><PlusIcon /> Nueva sesión</button> 
                {user.role === 'superadmin' && <button onClick={onManageAdmins} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 rounded-lg shadow-md"><UsersIcon /> Gestionar admins</button>}
            </div>
            <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-4">Sesiones de votación</h3> 
            <div className="space-y-4 max-h-96 overflow-y-auto"> {userSessions.length > 0 ? userSessions.map(session => ( <div key={session.id} className="bg-slate-50 border border-slate-200 p-4 rounded-lg"> <div className="flex justify-between items-start"> <div><h4 className="font-bold text-slate-800">{session.name}</h4><p className="text-sm text-slate-500">{session.members.length} miembros</p></div> <button onClick={() => session.id && onManageSession(session.id)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg text-sm">Gestionar</button> </div> </div> )) : <p className="text-slate-500 text-center py-4">No has creado ninguna sesión.</p>} </div> 
        </div>
    </> );
}

function SessionManagement({ session, votes, onAccredit, onToggleEligibility, onChangeElectionStatus, onAddElection, onAddMembers, onBack, onViewResults, isXlsxLoaded }: SessionManagementProps) {
    const [activeTab, setActiveTab] = useState<string>('acreditacion');
    const [filter, setFilter] = useState<string>('');
    const [showCreateElection, setShowCreateElection] = useState<boolean>(false);
    const [newElection, setNewElection] = useState({ name: '', description: '', positionsToElect: 1 });
    const [newMembersList, setNewMembersList] = useState<string>('');
    const [isCloseModalOpen, setCloseModalOpen] = useState<boolean>(false);
    const [electionToManage, setElectionToManage] = useState<Election | null>(null);
    const [isProgressModalOpen, setProgressModalOpen] = useState<boolean>(false);

    const handleCreateElection = (e: React.FormEvent) => { e.preventDefault(); if (session.id) { onAddElection(session.id, { ...newElection, status: 'Prevista' as const, sessionId: session.id }); setShowCreateElection(false); setNewElection({ name: '', description: '', positionsToElect: 1 }); } };
    const handleAddMembers = (e: React.FormEvent) => { e.preventDefault(); onAddMembers(session.id!, newMembersList); setNewMembersList(''); };
    const filteredMembers = session.members.filter((m: Member) => m.name.toLowerCase().includes(filter.toLowerCase()));
    
    const downloadMemberList = () => { if (!isXlsxLoaded) { alert("La librería de exportación no está lista."); return; } const data = session.members.map(({ name, key, email }) => ({ Nombre: name, Clave: key, Email: email || '' })); const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Miembros"); XLSX.writeFile(wb, `miembros_${session.name.replace(/ /g, '_')}.xlsx`); };
    const openCloseModal = (election: Election) => { setElectionToManage(election); setCloseModalOpen(true); };
    const openProgressModal = (election: Election) => { setElectionToManage(election); setProgressModalOpen(true); };

    const TabButton = ({ tabName, label }: { tabName: string; label: string }) => ( <button onClick={() => setActiveTab(tabName)} className={`py-2 px-4 text-sm font-bold rounded-t-lg ${activeTab === tabName ? 'bg-white border-b-0 border border-slate-200' : 'bg-slate-100 border border-slate-200'}`}> {label} </button> );

    const accreditedVoters = session.members.filter((m: Member) => m.status === 'Presente');
    const votesForElection = electionToManage ? Object.values(votes).map((v: { [electionId: string]: string[] }) => v[electionToManage.id!]).filter(Boolean).length : 0;
    const pendingVoters = accreditedVoters.length - votesForElection;

    return ( <>
        <Modal isOpen={isCloseModalOpen} onClose={() => setCloseModalOpen(false)} title="Confirmar cierre">
            <p className="text-slate-600 mb-4">¿Estás seguro? Una vez cerrada no podrá votar nadie más.</p>
            {pendingVoters > 0 && <p className="font-bold text-orange-600 mb-4">Atención: Todavía {pendingVoters === 1 ? 'falta 1 persona' : `faltan ${pendingVoters} personas`} por votar.</p>}
            <div className="flex justify-end gap-3 mt-4"> <button onClick={() => setCloseModalOpen(false)} className="bg-slate-200 hover:bg-slate-300 font-bold py-2 px-4 rounded-lg">Cancelar</button> <button onClick={() => { if (electionToManage) onChangeElectionStatus(session.id!, electionToManage.id!, 'Cerrada'); setCloseModalOpen(false); }} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Cerrar elección</button> </div>
        </Modal>
        {electionToManage && <Modal isOpen={isProgressModalOpen} onClose={() => setProgressModalOpen(false)} title={`Progreso: ${electionToManage?.name}`}>
            <div className="mt-2"> <div className="flex justify-between text-sm text-slate-500 mb-1"><span>Participación</span><span>{votesForElection} / {accreditedVoters.length}</span></div> <div className="w-full bg-slate-200 rounded-full h-2.5"><div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${accreditedVoters.length > 0 ? (votesForElection / accreditedVoters.length) * 100 : 0}%` }}></div></div> </div>
            <h4 className="font-semibold text-slate-700 mt-4 mb-2">Estado de votantes acreditados</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {accreditedVoters.map(member => {
                    const hasVoted = votes[member.key] && electionToManage?.id && votes[member.key][electionToManage.id];
                    return ( <div key={member.id} className="bg-slate-100 p-2 rounded-lg flex items-center justify-between"> <p>{member.name}</p> {hasVoted ? <span className="flex items-center gap-2 text-sm text-green-600"><CheckCircleIcon /> Votó</span> : <span className="flex items-center gap-2 text-sm text-orange-600"><XCircleIcon /> Pendiente</span>} </div>)
                })}
            </div>
        </Modal>}
        <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <NavigationButton onClick={onBack} variant="back" className="mb-4">Volver al panel</NavigationButton>
            <h2 className="text-2xl font-bold text-cyan-700 mb-4">{session.name}</h2>
            <div className="border-b border-slate-200 mb-4 flex gap-2"> <TabButton tabName="acreditacion" label="Acreditación" /> <TabButton tabName="elecciones" label="Elecciones" /> </div>
            {activeTab === 'acreditacion' && ( <div> <input type="text" placeholder="Buscar miembro..." value={filter} onChange={e => setFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg mb-4"/> <div className="space-y-2 max-h-64 overflow-y-auto pr-2 mb-4"> {filteredMembers.map(member => ( <div key={member.id} className="bg-slate-100 p-2 rounded-lg flex items-center justify-between"> <div><p className="font-semibold">{member.name}</p><p className={`text-sm ${member.status === 'Presente' ? 'text-green-600' : 'text-slate-500'}`}>{member.status}</p></div> {member.status === 'Invitado' ? <button onClick={() => session.id && member.id && onAccredit(session.id, member.id)} className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-3 rounded-lg">Acreditar</button> : <div className="flex items-center gap-2"><span className="font-mono bg-slate-200 px-2 py-1 rounded text-sm">{member.key}</span><button onClick={() => session.id && member.id && onToggleEligibility(session.id, member.id)} className={`text-sm p-1 rounded-full ${member.isEligible ? 'text-green-600' : 'text-red-600'}`}>{member.isEligible ? <CheckCircleIcon/> : <XCircleIcon/>}</button></div>} </div> ))} </div> <div className="border-t border-slate-200 pt-4"> <h4 className="font-semibold text-slate-700 mb-2">Añadir nuevos miembros</h4> <form onSubmit={handleAddMembers} className="space-y-2"> <textarea value={newMembersList} onChange={e => setNewMembersList(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg" placeholder="Nombre, email@opcional.com - Solo una persona por línea"></textarea> <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 rounded-lg">Añadir</button> </form> </div> <button onClick={downloadMemberList} disabled={!isXlsxLoaded} className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg shadow disabled:opacity-50"><DownloadIcon /> Descargar lista</button> </div> )}
            {activeTab === 'elecciones' && ( <div> <div className="space-y-3"> {Object.values(session.elections).map(election => {
                const totalPapeletas = session.members.filter(m => m.status === 'Presente').length;
                const votesCount = Object.values(votes).map(v => election.id ? v[election.id] : undefined).filter(Boolean).length;
                const progress = totalPapeletas > 0 ? (votesCount / totalPapeletas) * 100 : 0;
                return (
                <div key={election.id} className="bg-slate-100 p-3 rounded-lg"> <p className="font-bold">{election.name}</p>
                 {election.status === 'Abierta' && <div className="mt-2"> <div className="flex justify-between text-sm text-slate-500 mb-1"><span>Participación</span><span>{votesCount} / {totalPapeletas}</span></div> <div className="w-full bg-slate-200 rounded-full h-2.5"><div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div> </div>}
                 <div className="flex justify-between items-center mt-2"> <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ election.status === 'Abierta' ? 'bg-green-100 text-green-800' : election.status === 'Cerrada' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800' }`}>{election.status}</span> <div className="flex gap-2"> {election.status === 'Prevista' && <button onClick={() => session.id && election.id && onChangeElectionStatus(session.id, election.id, 'Abierta')} className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-3 rounded-lg">Abrir</button>} {election.status === 'Abierta' && <button onClick={() => openProgressModal(election)} className="bg-slate-500 hover:bg-slate-600 text-white text-sm font-bold py-1 px-3 rounded-lg">Gestionar</button>} {election.status === 'Abierta' && <button onClick={() => openCloseModal(election)} className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-1 px-3 rounded-lg">Cerrar</button>} {election.status === 'Cerrada' && election.id && <button onClick={() => onViewResults(election.id!)} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded-lg">Resultados</button>} </div> </div> </div>
            )})} </div> <button onClick={() => setShowCreateElection(true)} className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg"><PlusIcon /> Añadir elección</button> <Modal isOpen={showCreateElection} onClose={() => setShowCreateElection(false)} title="Crear nueva elección"> <form onSubmit={handleCreateElection} className="space-y-4"> <input type="text" placeholder="Nombre de la elección" value={newElection.name} onChange={e => setNewElection({...newElection, name: e.target.value})} className="w-full bg-slate-50 border p-2 rounded-lg" required/> <textarea placeholder="Descripción / Instrucciones" value={newElection.description} onChange={e => setNewElection({...newElection, description: e.target.value})} className="w-full bg-slate-50 border p-2 rounded-lg" rows={3}></textarea> <input type="number" placeholder="Puestos a elegir" value={newElection.positionsToElect} onChange={e => setNewElection({...newElection, positionsToElect: parseInt(e.target.value)})} className="w-full bg-slate-50 border p-2 rounded-lg" min="1" required/> <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowCreateElection(false)} className="bg-slate-200 hover:bg-slate-300 font-bold py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">Crear</button></div> </form> </Modal> </div> )}
        </div>
    </> );
}

function VoterSessionView({ session, votes, onVoteClick, onExit }: VoterSessionViewProps) {
    const getStatusLabel = (election: Election) => {
        switch(election.status) {
            case 'Abierta': return <span className="text-xs font-semibold text-green-600">Votación abierta</span>;
            case 'Cerrada': return <span className="text-xs font-semibold text-red-600">Votación cerrada</span>;
            case 'Prevista': return <span className="text-xs font-semibold text-yellow-600">Aún no abierta</span>;
            default: return null;
        }
    };
    return (
        <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="flex justify-between items-center"> <h2 className="text-2xl font-bold text-cyan-700 mb-2">{session.name}</h2> <NavigationButton onClick={onExit} variant="exit" className="text-sm">Salir</NavigationButton> </div>
            <p className="text-slate-500 mb-6">Selecciona una votación para participar.</p>
            <div className="space-y-3">
                {Object.values(session.elections).map(election => {
                    const hasVoted = election.id ? votes[election.id] : false;
                    let statusText = 'Pendiente de voto';
                    let statusColor = 'text-slate-500';
                    if (hasVoted) { statusText = 'Ya has votado'; statusColor = 'text-green-600'; }
                    else if (election.status === 'Cerrada') { statusText = 'No has votado'; statusColor = 'text-red-600'; }
                    return (
                        <div key={election.id} className={`p-4 rounded-lg border border-slate-200 ${hasVoted || election.status === 'Cerrada' ? 'bg-slate-100' : 'bg-white'}`}>
                            <div className="flex justify-between items-center">
                                <div><p className="font-bold">{election.name}</p><p className={`text-sm ${statusColor}`}>{statusText}</p></div>
                                <div className="flex flex-col items-end gap-2">
                                    {getStatusLabel(election)}
                                    {election.status === 'Abierta' && election.id && <button onClick={() => onVoteClick(election.id!)} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-1 px-3 rounded-lg text-sm">{hasVoted ? 'Modificar' : 'Votar'}</button>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function BallotPage({ session, election, voterKey, previousVotes, onVote, onBack }: BallotPageProps) {
    const [selections, setSelections] = useState<string[]>(previousVotes);
    const [error, setError] = useState<string>('');
    useEffect(() => { if (selections.length === 0) setSelections(Array(election.positionsToElect).fill('')); }, [election.positionsToElect, selections.length]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setError(''); if (selections.some((s: string) => s === '')) { setError('Debes seleccionar un candidato para cada puesto.'); return; } const uniqueSelections = new Set(selections.filter((s: string) => s !== '')); if (uniqueSelections.size !== selections.filter((s: string) => s !== '').length) { setError('No puedes votar por la misma persona más de una vez.'); return; } if (session.id && election.id) onVote(voterKey, session.id, election.id, selections); };
    const candidates = election.candidates ? session.members.filter((m: Member) => election.candidates!.includes(m.name)) : session.members.filter((m: Member) => m.status === 'Presente' && m.isEligible);
    return ( <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200"> <NavigationButton onClick={onBack} variant="back" className="mb-4">Volver a la sesión</NavigationButton> <h2 className="text-2xl font-bold mb-2 text-cyan-700">{election.name}</h2> <p className="text-slate-500 mb-4 italic">{election.description}</p> {previousVotes.length > 0 && (<div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-r-lg"><p className="font-bold">Ya has votado en esta elección.</p><p className="text-sm">Puedes modificar tu voto hasta que se cierre la votación.</p></div>)} <p className="text-slate-500 mb-6">Debes elegir a {election.positionsToElect} persona(s).</p> <form onSubmit={handleSubmit} className="flex flex-col gap-4"> {[...Array(election.positionsToElect)].map((_, index) => ( <div key={index}> <label className="block text-sm font-medium text-slate-600 mb-1">Voto {index + 1}</label> <select value={selections[index] || ''} onChange={e => {const newS = [...selections]; newS[index] = e.target.value; setSelections(newS);}} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3"> <option value="" disabled>Selecciona una persona...</option> {candidates.map(c => <option key={c.id} value={c.name}>{c.name}</option>)} </select> </div> ))} {error && <p className="text-red-500 mt-4 text-center">{error}</p>} <button type="submit" className="mt-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-3 rounded-lg shadow-md">{previousVotes.length > 0 ? 'Modificar papeleta' : 'Emitir mi voto'}</button> </form> </div> );
}

function VoteSuccessPage({ onBackToSession, onExit }: VoteSuccessPageProps) { 
  return ( 
    <div className="text-center p-8 bg-white rounded-lg shadow-xl border border-slate-200"> 
      <div className="w-16 h-16 text-green-500 mx-auto mb-4"><CheckCircleIcon /></div> 
      <h2 className="text-2xl font-bold text-slate-800">¡Voto registrado con éxito!</h2> 
      <p className="text-slate-500 mt-2 mb-6">Tu voto ha sido guardado.</p> 
      <div className="flex flex-col gap-3"> 
        <NavigationButton onClick={onBackToSession} variant="back" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">Volver a la sesión</NavigationButton> 
        <NavigationButton onClick={onExit} variant="exit" className="text-sm">Salir (votar como otro usuario)</NavigationButton> 
      </div> 
    </div> 
  ); 
}

function ResultsPage({ session, election, votes, onBack, onAddElection }: ResultsPageProps) {
    const electionVoterKeys = new Set(session.members.map((v: Member) => v.key));
    const electionVotes = Object.entries(votes).filter(([key]) => electionVoterKeys.has(key)).map(([, userVotes]: [string, { [electionId: string]: string[] }]) => election.id ? userVotes[election.id] : undefined).filter(Boolean);
    const papeletasEmitidas = electionVotes.length;
    const totalPapeletas = session.members.filter((m: Member) => m.status === 'Presente').length;
    
    const candidatesForResults = election.candidates || session.members.filter((m: Member) => m.status === 'Presente').map((m: Member) => m.name);
    const results: { [name: string]: number } = {};
    candidatesForResults.forEach((name: string) => { results[name] = 0; });
    
    electionVotes.forEach((voteList) => { if(Array.isArray(voteList)) { voteList.forEach((name: string) => { if (results.hasOwnProperty(name)) results[name]++; }); } });
    
    const sortedResults = Object.entries(results).sort(([, a], [, b]) => (b as number) - (a as number));
    const maxVotes = sortedResults.length > 0 ? (sortedResults[0][1] as number) : 0;
    const getVoteText = (count: number) => count === 1 ? '1 voto' : `${count} votos`;

    const winners = sortedResults.filter(([,count]) => (count as number) === maxVotes && maxVotes > 0);
    const tiedCandidates = winners.length > election.positionsToElect ? winners.map(([name]) => name) : [];

    const createTiebreaker = () => {
        const tiebreakerElection = { name: `Desempate: ${election.name}`, description: `Votación de desempate. Candidatos: ${tiedCandidates.join(', ')}.`, positionsToElect: election.positionsToElect, status: 'Prevista' as const, candidates: tiedCandidates, sessionId: session.id! };
        if (session.id) onAddElection(session.id, tiebreakerElection);
        onBack();
    };

    return ( <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 w-full max-w-md"> <NavigationButton onClick={onBack} variant="back" className="mb-4">Volver a gestión</NavigationButton> <h2 className="text-2xl font-bold text-cyan-700 mb-2">Resultados: {election.name}</h2> <div className="flex gap-4 text-center border-b border-slate-200 pb-4 mb-4"> <div className="flex-1"> <div className="text-2xl font-bold text-slate-700">{papeletasEmitidas}<span className="text-lg text-slate-400">/{totalPapeletas}</span></div> <div className="text-sm text-slate-500">Papeletas emitidas</div> </div> </div> {tiedCandidates.length > 0 && <div className="my-4"><button onClick={createTiebreaker} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg">Crear votación de desempate</button></div>} <div className="space-y-3"> {sortedResults.map(([name, count], index) => ( <div key={name} className="bg-slate-50 p-3 rounded-lg border border-slate-200"> <div className="flex justify-between items-center text-slate-800"><span className="font-semibold">{index + 1}. {name}</span><span className="font-bold text-cyan-600">{getVoteText(count)}</span></div> <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2"><div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: maxVotes > 0 ? `${(count / maxVotes) * 100}%` : '0%' }}></div></div> </div> ))} </div> </div> );
}

function SuperAdminPanel({ admins, onAddAdmin, onDeleteAdmin, onBack }: SuperAdminPanelProps) {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [name, setName] = useState<string>('');
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!username || !password || !name) { alert('Por favor, completa todos los campos.'); return; } onAddAdmin(username, password, name); setUsername(''); setPassword(''); setName(''); };
    const managerAdmins = Object.entries(admins).filter(([, details]: [string, Admin]) => details.role === 'manager');
    return ( <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 w-full max-w-md"> <NavigationButton onClick={onBack} variant="back" className="mb-4">Volver al panel</NavigationButton> <h2 className="text-2xl font-bold text-cyan-700 mb-4">Gestionar administradores</h2> <div className="mb-6 border-t border-slate-200 pt-4"> <h3 className="text-lg font-semibold text-slate-700 mb-2">Crear nuevo administrador</h3> <form onSubmit={handleSubmit} className="space-y-3"> <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg" placeholder="Nombre completo" /> <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg" placeholder="Nombre de usuario" /> <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg" placeholder="Contraseña" /> <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 rounded-lg shadow">Crear administrador</button> </form> </div> <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-4">Lista de administradores</h3> <div className="space-y-2 max-h-60 overflow-y-auto pr-2"> {managerAdmins.map(([adminId, details]) => ( <div key={adminId} className="bg-slate-100 p-3 rounded-lg flex justify-between items-center"> <div> <p className="font-semibold text-slate-800">{details.name}</p> <p className="text-sm text-slate-500">Usuario: {details.username}</p> </div> <button onClick={() => onDeleteAdmin(adminId, details.name)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg text-sm flex items-center gap-1 transition-colors"> <XIcon /> Eliminar </button> </div> ))} </div> </div> );
}



// Componente de navegación unificado (para volver y salir)
const NavigationButton = ({ 
  onClick, 
  children, 
  variant = "back", 
  className = "", 
  disabled = false 
}: { 
  onClick: () => void, 
  children: React.ReactNode, 
  variant?: "back" | "exit", 
  className?: string, 
  disabled?: boolean 
}) => {
  const baseClasses = "flex items-center gap-2 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = variant === "back" 
    ? "text-cyan-600 hover:text-cyan-700" 
    : "text-slate-500 hover:text-cyan-600";
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {variant === "back" ? <ArrowLeftIcon /> : null}
      {children}
    </button>
  );
};
