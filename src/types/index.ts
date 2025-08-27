import type { FirestoreAdmin, FirestoreMember, FirestoreElection, FirestoreSession, FirestoreVote } from '../firebase/firestoreService';

// Tipos de la aplicación
export interface Admin extends FirestoreAdmin {}
export interface Member extends FirestoreMember {}
export interface Election extends FirestoreElection {}
export interface Session extends FirestoreSession {
  members: Member[];
  elections: { [key: string]: Election };
}
export interface Vote extends FirestoreVote {}

// Base de datos
export interface Database {
  admins: { [key: string]: Admin };
  sessions: { [key: string]: Session };
  votes: { [voterKey: string]: { [electionId: string]: string[] } };
}

// Usuario autenticado
export interface User {
  username: string;
  name: string;
  pass: string;
  role: 'manager' | 'superadmin';
}

// Props de componentes
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface HomePageProps {
  onLogin: (key: string) => void;
  onAdminClick: () => void;
  error: string;
  loading?: boolean;
}

export interface AdminLoginProps {
  onLogin: (username: string, password: string) => void;
  onBack: () => void;
  error: string;
  loading?: boolean;
}

export interface AdminDashboardProps {
  user: User;
  db: Database;
  onManageSession: (id: string) => void;
  onCreateSession: (sessionName: string, membersList: string) => void;
  onManageAdmins: () => void;
  onLogout: () => void;
}

export interface SessionManagementProps {
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

export interface VoterSessionViewProps {
  session: Session;
  votes: Database['votes'];
  onVoteClick: (electionId: string) => void;
  onExit: () => void;
}

export interface BallotPageProps {
  session: Session;
  votes: Database['votes'];
  election: Election;
  voterKey: string;
  previousVotes: string[];
  onVote: (voterKey: string, sessionId: string, electionId: string, selections: string[]) => void;
  onBack: () => void;
}

export interface VoteSuccessPageProps {
  onBackToSession: () => void;
  onExit: () => void;
}

export interface ResultsPageProps {
  session: Session;
  election: Election;
  votes: Database['votes'];
  onBack: () => void;
  onAddElection: (sessionId: string, electionData: Omit<Election, 'id'>) => void;
}

export interface SuperAdminPanelProps {
  admins: Database['admins'];
  onAddAdmin: (username: string, password: string, name: string) => void;
  onDeleteAdmin: (adminId: string, adminName: string) => void;
  onBack: () => void;
}
