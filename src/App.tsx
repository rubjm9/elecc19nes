import React, { useState, useEffect } from 'react';

// --- Iconos SVG ---
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;

// --- Base de Datos Simulada ---
const initialDb = {
  admins: { 'admin': { pass: '1234', role: 'manager', name: 'Admin General' }, 'superadmin': { pass: 'super', role: 'superadmin', name: 'Super Admin' } },
  sessions: {
    'sess01': {
      id: 'sess01', name: 'Asamblea Anual 2025', createdBy: 'admin',
      members: [
        { id: 'mem01', name: 'Ana García', email: 'ana@email.com', key: 'AG2X5', status: 'Presente', isEligible: true },
        { id: 'mem02', name: 'Luis Fernández', email: 'luis@email.com', key: 'LF9Y1', status: 'Invitado', isEligible: true },
        { id: 'mem03', name: 'Elena Rodríguez', email: 'elena@email.com', key: 'ER4Z8', status: 'Presente', isEligible: true },
        { id: 'mem04', name: 'Carlos Pérez', email: null, key: 'CP6W3', status: 'Invitado', isEligible: true },
        { id: 'mem05', name: 'Sofía Martínez', email: 'sofia@email.com', key: 'SM1V7', status: 'Presente', isEligible: true },
      ],
      elections: {
        'elec01': { id: 'elec01', name: 'Elección de Coordinador', description: 'Elegir a una persona para el puesto de coordinador general.', positionsToElect: 1, status: 'Abierta' },
        'elec02': { id: 'elec02', name: 'Elección de Secretario', description: 'Elegir a una persona para el puesto de secretario.', positionsToElect: 1, status: 'Prevista' },
      }
    }
  },
  votes: { 'AG2X5': { 'elec01': ['Elena Rodríguez'] }, 'ER4Z8': { 'elec01': ['Ana García'] } }
};

// --- Componente de Modal Genérico ---
function Modal({ isOpen, onClose, title, children }) { if (!isOpen) return null; return ( <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4" onClick={onClose}> <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}> <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4"> <h3 className="text-xl font-bold text-slate-800">{title}</h3> <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button> </div> <div>{children}</div> </div> </div> ); }

// --- Componente Principal: App ---
export default function App() {
  const [db, setDb] = useState(initialDb);
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentElectionId, setCurrentElectionId] = useState(null);
  const [voterKey, setVoterKey] = useState(null);
  const [isXlsxLoaded, setIsXlsxLoaded] = useState(false);

  useEffect(() => { const script = document.createElement('script'); script.src = "https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"; script.async = true; script.onload = () => setIsXlsxLoaded(true); document.body.appendChild(script); return () => { document.body.removeChild(script); }; }, []);
  useEffect(() => { if (error) { const timer = setTimeout(() => setError(''), 4000); return () => clearTimeout(timer); } }, [error]);
  
  const findMemberByKey = (key) => { for (const sessId in db.sessions) { const member = db.sessions[sessId].members.find(m => m.key.toLowerCase() === key.toLowerCase()); if (member) return { ...member, sessionId: sessId }; } return null; };
  const handleVoterLogin = (key) => { const memberData = findMemberByKey(key); if (memberData && memberData.status === 'Presente') { setVoterKey(memberData.key); setCurrentSessionId(memberData.sessionId); setPage('voterSession'); setError(''); } else if (memberData) { setError('Aún no has sido acreditado. Acércate al punto de registro.'); } else { setError('Clave de acceso no válida.'); } };
  const handleAdminLogin = (username, password) => { const adminUser = db.admins[username]; if (adminUser && adminUser.pass === password) { setUser({ username, ...adminUser }); setPage('adminDashboard'); setError(''); } else { setError('Usuario o contraseña incorrectos.'); } };
  const handleLogout = () => { setUser(null); setPage('home'); };
  
  const createSession = (sessionName, membersList) => {
    const generateKey = () => Math.random().toString(36).substring(2, 7).toUpperCase();
    const names = new Set();
    let duplicates = [];
    const members = membersList.split('\n').filter(line => line.trim() !== '').map((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        const name = parts[0];
        if (names.has(name.toLowerCase())) {
            duplicates.push(name);
            return null;
        }
        names.add(name.toLowerCase());
        return { id: `mem${Date.now()}${index}`, name, email: parts.length > 1 ? parts[1] : null, key: generateKey(), status: 'Invitado', isEligible: true };
    }).filter(Boolean);
    if (duplicates.length > 0) { alert(`Los siguientes miembros estaban duplicados y no se han añadido: ${duplicates.join(', ')}`); }
    if (members.length === 0) return;
    const newSessionId = `sess${Date.now()}`;
    const newSession = { id: newSessionId, name: sessionName, createdBy: user.username, members, elections: {} };
    setDb(prev => ({ ...prev, sessions: { ...prev.sessions, [newSessionId]: newSession } }));
  };
  const addMembersToSession = (sessionId, membersList) => {
    const generateKey = () => Math.random().toString(36).substring(2, 7).toUpperCase();
    const existingNames = new Set(db.sessions[sessionId].members.map(m => m.name.toLowerCase()));
    let duplicates = [];
    const newMembers = membersList.split('\n').filter(line => line.trim() !== '').map((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        const name = parts[0];
        if (existingNames.has(name.toLowerCase())) { duplicates.push(name); return null; }
        return { id: `mem${Date.now()}${index}`, name, email: parts.length > 1 ? parts[1] : null, key: generateKey(), status: 'Invitado', isEligible: true };
    }).filter(Boolean);
    if (duplicates.length > 0) { alert(`Los siguientes miembros ya existen: ${duplicates.join(', ')}`); }
    if (newMembers.length === 0) return;
    setDb(prev => { const newDb = JSON.parse(JSON.stringify(prev)); newDb.sessions[sessionId].members.push(...newMembers); return newDb; });
  };
  const accreditMember = (sessionId, memberId) => { setDb(prev => { const newDb = JSON.parse(JSON.stringify(prev)); const member = newDb.sessions[sessionId].members.find(m => m.id === memberId); if (member) member.status = 'Presente'; return newDb; }); };
  const toggleMemberEligibility = (sessionId, memberId) => { setDb(prev => { const newDb = JSON.parse(JSON.stringify(prev)); const member = newDb.sessions[sessionId].members.find(m => m.id === memberId); if (member) member.isEligible = !member.isEligible; return newDb; }); };
  const changeElectionStatus = (sessionId, electionId, status) => { setDb(prev => { const newDb = JSON.parse(JSON.stringify(prev)); newDb.sessions[sessionId].elections[electionId].status = status; return newDb; }); };
  const addElectionToSession = (sessionId, electionData) => { setDb(prev => { const newDb = JSON.parse(JSON.stringify(prev)); const newElectionId = `elec${Date.now()}`; newDb.sessions[sessionId].elections[newElectionId] = { id: newElectionId, ...electionData }; return newDb; }); };
  
  const castVote = (key, sessionId, electionId, selections) => {
    setDb(prev => { const newDb = JSON.parse(JSON.stringify(prev)); if (!newDb.votes[key]) newDb.votes[key] = {}; newDb.votes[key][electionId] = selections; return newDb; });
    setPage('voteSuccess');
  };
  const addAdmin = (username, password, name) => { if (db.admins[username]) { alert('El nombre de usuario ya existe.'); return; } const newAdmin = { pass: password, role: 'manager', name }; setDb(prevDb => ({ ...prevDb, admins: { ...prevDb.admins, [username]: newAdmin } })); };

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage onLogin={handleVoterLogin} onAdminClick={() => setPage('adminLogin')} error={error} />;
      case 'adminLogin': return <AdminLogin onLogin={handleAdminLogin} onBack={() => setPage('home')} error={error} />;
      case 'adminDashboard': return <AdminDashboard user={user} db={db} onManageSession={(id) => { setCurrentSessionId(id); setPage('sessionManagement'); }} onCreateSession={createSession} onManageAdmins={() => setPage('superAdminPanel')} onLogout={handleLogout} />;
      case 'superAdminPanel': return <SuperAdminPanel admins={db.admins} onAddAdmin={addAdmin} onBack={() => setPage('adminDashboard')} />;
      case 'sessionManagement': return <SessionManagement session={db.sessions[currentSessionId]} votes={db.votes} onAccredit={accreditMember} onToggleEligibility={toggleMemberEligibility} onChangeElectionStatus={changeElectionStatus} onAddElection={addElectionToSession} onAddMembers={addMembersToSession} onBack={() => setPage('adminDashboard')} onViewResults={(elecId) => { setCurrentElectionId(elecId); setPage('results'); }} isXlsxLoaded={isXlsxLoaded}/>;
      case 'voterSession': return <VoterSessionView session={db.sessions[currentSessionId]} votes={db.votes[voterKey] || {}} onVoteClick={(elecId) => { setCurrentElectionId(elecId); setPage('ballot'); }} onExit={() => { setVoterKey(null); setCurrentSessionId(null); setPage('home'); }} />;
      case 'ballot':
        const sessionForBallot = db.sessions[currentSessionId];
        const electionForBallot = sessionForBallot.elections[currentElectionId];
        const votesForVoter = db.votes[voterKey] || {};
        const previousVotesForElection = votesForVoter[currentElectionId] || [];
        return <BallotPage session={sessionForBallot} election={electionForBallot} voterKey={voterKey} previousVotes={previousVotesForElection} onVote={castVote} onBack={() => setPage('voterSession')} />;
      case 'voteSuccess': return <VoteSuccessPage onBackToSession={() => { setCurrentElectionId(null); setPage('voterSession'); }} onExit={() => { setVoterKey(null); setCurrentSessionId(null); setPage('home'); }} />;
      case 'results': return <ResultsPage session={db.sessions[currentSessionId]} election={db.sessions[currentSessionId].elections[currentElectionId]} votes={db.votes} onBack={() => setPage('sessionManagement')} onAddElection={addElectionToSession}/>;
      default: return <HomePage onLogin={handleVoterLogin} onAdminClick={() => setPage('adminLogin')} error={error} />;
    }
  };

  return ( <> <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,700;9..40,900&display=swap');`}</style> <div className="bg-gradient-to-br from-slate-50 to-slate-200 text-slate-800 min-h-screen font-sans flex items-center justify-center p-4" style={{ fontFamily: "'DM Sans', sans-serif" }}> <div className="w-full max-w-md">{renderPage()}</div> </div> </> );
}

// --- Componentes de Página ---
function HomePage({ onLogin, onAdminClick, error }) {
  const [key, setKey] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); if (key) onLogin(key); };
  return ( <div className="text-center"> <h1 className="text-5xl tracking-wider text-cyan-600 mb-2" style={{fontWeight: 900}}>ELECC19NES</h1> <p className="text-slate-500 mb-8">Introduce tu clave de sesión para participar</p> <form onSubmit={handleSubmit} className="flex flex-col gap-4"> <input type="text" value={key} onChange={(e) => setKey(e.target.value.toUpperCase())} maxLength="5" className="bg-white border-2 border-slate-300 rounded-lg text-center text-2xl p-4 tracking-[0.5em] uppercase focus:outline-none focus:border-cyan-500" placeholder="_ _ _ _ _" /> <button type="submit" className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-md">Acceder a la sesión</button> </form> {error && <p className="text-red-500 mt-4">{error}</p>} <div className="mt-12"><a href="#" onClick={(e) => { e.preventDefault(); onAdminClick(); }} className="text-slate-500 hover:text-cyan-600 text-sm">Acceso administrador</a></div> </div> );
}

function AdminLogin({ onLogin, onBack, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); onLogin(username, password); };
  return ( <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200"> <button onClick={onBack} className="flex items-center gap-2 text-cyan-600 mb-4 hover:text-cyan-700 font-bold"><ArrowLeftIcon /> Volver</button> <h2 className="text-2xl font-bold mb-6 text-center text-cyan-700">Acceso administrador</h2> <form onSubmit={handleSubmit} className="flex flex-col gap-4"> <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><UserIcon /></span><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 pl-12 focus:outline-none focus:border-cyan-500" placeholder="Usuario" /></div> <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><LockIcon /></span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 pl-12 focus:outline-none focus:border-cyan-500" placeholder="Contraseña" /></div> <button type="submit" className="mt-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-md">Entrar</button> </form> {error && <p className="text-red-500 mt-4 text-center">{error}</p>} <div className="text-xs text-slate-400 mt-4 text-center"><p>Users: admin (pass: 1234), superadmin (pass: super)</p></div> </div> );
}

function AdminDashboard({ user, db, onManageSession, onCreateSession, onManageAdmins, onLogout }) {
    const [showCreate, setShowCreate] = useState(false);
    const [sessionName, setSessionName] = useState('');
    const [membersList, setMembersList] = useState('');
    const handleCreate = (e) => { e.preventDefault(); onCreateSession(sessionName, membersList); setShowCreate(false); setSessionName(''); setMembersList(''); };
    const userSessions = (user.role === 'superadmin' ? Object.values(db.sessions) : Object.values(db.sessions).filter(s => s.createdBy === user.username));
    
    return ( <>
        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Crear nueva sesión">
            <form onSubmit={handleCreate} className="space-y-4">
                <input type="text" placeholder="Nombre de la sesión" value={sessionName} onChange={e => setSessionName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg" required />
                <textarea placeholder="Lista de miembros (Nombre, email@opcional.com)" value={membersList} onChange={e => setMembersList(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg" rows="5" required></textarea>
                <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowCreate(false)} className="bg-slate-200 hover:bg-slate-300 font-bold py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">Crear</button></div>
            </form>
        </Modal>
        <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 w-full max-w-md"> 
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-cyan-700">Panel de administrador</h2><button onClick={onLogout} className="text-slate-500 hover:text-slate-800"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg></button></div> 
            <p className="text-slate-500 mb-6 -mt-4">Bienvenido, {user.name}</p> 
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button onClick={() => setShowCreate(true)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-3 rounded-lg shadow-md"><PlusIcon /> Crear nueva sesión</button> 
                {user.role === 'superadmin' && <button onClick={onManageAdmins} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 rounded-lg shadow-md"><UsersIcon /> Gestionar admins</button>}
            </div>
            <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-4">Sesiones de votación</h3> 
            <div className="space-y-4 max-h-96 overflow-y-auto"> {userSessions.length > 0 ? userSessions.map(session => ( <div key={session.id} className="bg-slate-50 border border-slate-200 p-4 rounded-lg"> <div className="flex justify-between items-start"> <div><h4 className="font-bold text-slate-800">{session.name}</h4><p className="text-sm text-slate-500">{session.members.length} miembros</p></div> <button onClick={() => onManageSession(session.id)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg text-sm">Gestionar</button> </div> </div> )) : <p className="text-slate-500 text-center py-4">No has creado ninguna sesión.</p>} </div> 
        </div>
    </> );
}

function SessionManagement({ session, votes, onAccredit, onToggleEligibility, onChangeElectionStatus, onAddElection, onAddMembers, onBack, onViewResults, isXlsxLoaded }) {
    const [activeTab, setActiveTab] = useState('acreditacion');
    const [filter, setFilter] = useState('');
    const [showCreateElection, setShowCreateElection] = useState(false);
    const [newElection, setNewElection] = useState({ name: '', description: '', positionsToElect: 1 });
    const [newMembersList, setNewMembersList] = useState('');
    const [isCloseModalOpen, setCloseModalOpen] = useState(false);
    const [electionToManage, setElectionToManage] = useState(null);
    const [isProgressModalOpen, setProgressModalOpen] = useState(false);

    const handleCreateElection = (e) => { e.preventDefault(); onAddElection(session.id, { ...newElection, status: 'Prevista' }); setShowCreateElection(false); setNewElection({ name: '', description: '', positionsToElect: 1 }); };
    const handleAddMembers = (e) => { e.preventDefault(); onAddMembers(session.id, newMembersList); setNewMembersList(''); };
    const filteredMembers = session.members.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()));
    
    const downloadMemberList = () => { if (!isXlsxLoaded) { alert("La librería de exportación no está lista."); return; } const data = session.members.map(({ name, key, email }) => ({ Nombre: name, Clave: key, Email: email || '' })); const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Miembros"); XLSX.writeFile(wb, `miembros_${session.name.replace(/ /g, '_')}.xlsx`); };
    const openCloseModal = (election) => { setElectionToManage(election); setCloseModalOpen(true); };
    const openProgressModal = (election) => { setElectionToManage(election); setProgressModalOpen(true); };

    const TabButton = ({ tabName, label }) => ( <button onClick={() => setActiveTab(tabName)} className={`py-2 px-4 text-sm font-bold rounded-t-lg ${activeTab === tabName ? 'bg-white border-b-0 border border-slate-200' : 'bg-slate-100 border border-slate-200'}`}> {label} </button> );

    const accreditedVoters = session.members.filter(m => m.status === 'Presente');
    const votesForElection = electionToManage ? Object.values(votes).map(v => v[electionToManage.id]).filter(Boolean).length : 0;
    const pendingVoters = accreditedVoters.length - votesForElection;

    return ( <>
        <Modal isOpen={isCloseModalOpen} onClose={() => setCloseModalOpen(false)} title="Confirmar cierre">
            <p className="text-slate-600 mb-4">¿Estás seguro? Una vez cerrada no podrá votar nadie más.</p>
            {pendingVoters > 0 && <p className="font-bold text-orange-600 mb-4">Atención: Todavía {pendingVoters === 1 ? 'falta 1 persona' : `faltan ${pendingVoters} personas`} por votar.</p>}
            <div className="flex justify-end gap-3 mt-4"> <button onClick={() => setCloseModalOpen(false)} className="bg-slate-200 hover:bg-slate-300 font-bold py-2 px-4 rounded-lg">Cancelar</button> <button onClick={() => { onChangeElectionStatus(session.id, electionToManage.id, 'Cerrada'); setCloseModalOpen(false); }} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Cerrar elección</button> </div>
        </Modal>
        {electionToManage && <Modal isOpen={isProgressModalOpen} onClose={() => setProgressModalOpen(false)} title={`Progreso: ${electionToManage?.name}`}>
            <div className="mt-2"> <div className="flex justify-between text-sm text-slate-500 mb-1"><span>Participación</span><span>{votesForElection} / {accreditedVoters.length}</span></div> <div className="w-full bg-slate-200 rounded-full h-2.5"><div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${accreditedVoters.length > 0 ? (votesForElection / accreditedVoters.length) * 100 : 0}%` }}></div></div> </div>
            <h4 className="font-semibold text-slate-700 mt-4 mb-2">Estado de votantes acreditados</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {accreditedVoters.map(member => {
                    const hasVoted = votes[member.key] && votes[member.key][electionToManage.id];
                    return ( <div key={member.id} className="bg-slate-100 p-2 rounded-lg flex items-center justify-between"> <p>{member.name}</p> {hasVoted ? <span className="flex items-center gap-2 text-sm text-green-600"><CheckCircleIcon /> Votó</span> : <span className="flex items-center gap-2 text-sm text-orange-600"><XCircleIcon /> Pendiente</span>} </div>)
                })}
            </div>
        </Modal>}
        <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <button onClick={onBack} className="flex items-center gap-2 text-cyan-600 mb-4 hover:text-cyan-700 font-bold"><ArrowLeftIcon /> Volver al panel</button>
            <h2 className="text-2xl font-bold text-cyan-700 mb-4">{session.name}</h2>
            <div className="border-b border-slate-200 mb-4 flex gap-2"> <TabButton tabName="acreditacion" label="Acreditación" /> <TabButton tabName="elecciones" label="Elecciones" /> </div>
            {activeTab === 'acreditacion' && ( <div> <input type="text" placeholder="Buscar miembro..." value={filter} onChange={e => setFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg mb-4"/> <div className="space-y-2 max-h-64 overflow-y-auto pr-2 mb-4"> {filteredMembers.map(member => ( <div key={member.id} className="bg-slate-100 p-2 rounded-lg flex items-center justify-between"> <div><p className="font-semibold">{member.name}</p><p className={`text-sm ${member.status === 'Presente' ? 'text-green-600' : 'text-slate-500'}`}>{member.status}</p></div> {member.status === 'Invitado' ? <button onClick={() => onAccredit(session.id, member.id)} className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-3 rounded-lg">Acreditar</button> : <div className="flex items-center gap-2"><span className="font-mono bg-slate-200 px-2 py-1 rounded text-sm">{member.key}</span><button onClick={() => onToggleEligibility(session.id, member.id)} className={`text-sm p-1 rounded-full ${member.isEligible ? 'text-green-600' : 'text-red-600'}`}>{member.isEligible ? <CheckCircleIcon/> : <XCircleIcon/>}</button></div>} </div> ))} </div> <div className="border-t border-slate-200 pt-4"> <h4 className="font-semibold text-slate-700 mb-2">Añadir nuevos miembros</h4> <form onSubmit={handleAddMembers} className="space-y-2"> <textarea value={newMembersList} onChange={e => setNewMembersList(e.target.value)} rows="3" className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg" placeholder="Nombre, email@opcional.com"></textarea> <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 rounded-lg">Añadir</button> </form> </div> <button onClick={downloadMemberList} disabled={!isXlsxLoaded} className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg shadow disabled:opacity-50"><DownloadIcon /> Descargar lista</button> </div> )}
            {activeTab === 'elecciones' && ( <div> <div className="space-y-3"> {Object.values(session.elections).map(election => {
                const totalPapeletas = session.members.filter(m => m.status === 'Presente').length;
                const votesCount = Object.values(votes).map(v => v[election.id]).filter(Boolean).length;
                const progress = totalPapeletas > 0 ? (votesCount / totalPapeletas) * 100 : 0;
                return (
                <div key={election.id} className="bg-slate-100 p-3 rounded-lg"> <p className="font-bold">{election.name}</p>
                 {election.status === 'Abierta' && <div className="mt-2"> <div className="flex justify-between text-sm text-slate-500 mb-1"><span>Participación</span><span>{votesCount} / {totalPapeletas}</span></div> <div className="w-full bg-slate-200 rounded-full h-2.5"><div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div> </div>}
                 <div className="flex justify-between items-center mt-2"> <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ election.status === 'Abierta' ? 'bg-green-100 text-green-800' : election.status === 'Cerrada' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800' }`}>{election.status}</span> <div className="flex gap-2"> {election.status === 'Prevista' && <button onClick={() => onChangeElectionStatus(session.id, election.id, 'Abierta')} className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-3 rounded-lg">Abrir</button>} {election.status === 'Abierta' && <button onClick={() => openProgressModal(election)} className="bg-slate-500 hover:bg-slate-600 text-white text-sm font-bold py-1 px-3 rounded-lg">Gestionar</button>} {election.status === 'Abierta' && <button onClick={() => openCloseModal(election)} className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-1 px-3 rounded-lg">Cerrar</button>} {election.status === 'Cerrada' && <button onClick={() => onViewResults(election.id)} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded-lg">Resultados</button>} </div> </div> </div>
            )})} </div> <button onClick={() => setShowCreateElection(true)} className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg"><PlusIcon /> Añadir elección</button> <Modal isOpen={showCreateElection} onClose={() => setShowCreateElection(false)} title="Crear nueva elección"> <form onSubmit={handleCreateElection} className="space-y-4"> <input type="text" placeholder="Nombre de la elección" value={newElection.name} onChange={e => setNewElection({...newElection, name: e.target.value})} className="w-full bg-slate-50 border p-2 rounded-lg" required/> <textarea placeholder="Descripción / Instrucciones" value={newElection.description} onChange={e => setNewElection({...newElection, description: e.target.value})} className="w-full bg-slate-50 border p-2 rounded-lg" rows="3"></textarea> <input type="number" placeholder="Puestos a elegir" value={newElection.positionsToElect} onChange={e => setNewElection({...newElection, positionsToElect: parseInt(e.target.value)})} className="w-full bg-slate-50 border p-2 rounded-lg" min="1" required/> <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowCreateElection(false)} className="bg-slate-200 hover:bg-slate-300 font-bold py-2 px-4 rounded-lg">Cancelar</button><button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">Crear</button></div> </form> </Modal> </div> )}
        </div>
    </> );
}

function VoterSessionView({ session, votes, onVoteClick, onExit }) {
    const getStatusLabel = (election) => {
        switch(election.status) {
            case 'Abierta': return <span className="text-xs font-semibold text-green-600">Votación abierta</span>;
            case 'Cerrada': return <span className="text-xs font-semibold text-red-600">Votación cerrada</span>;
            case 'Prevista': return <span className="text-xs font-semibold text-yellow-600">Aún no abierta</span>;
            default: return null;
        }
    };
    return (
        <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="flex justify-between items-center"> <h2 className="text-2xl font-bold text-cyan-700 mb-2">{session.name}</h2> <button onClick={onExit} className="text-sm text-slate-500 hover:text-cyan-600">Salir</button> </div>
            <p className="text-slate-500 mb-6">Selecciona una votación para participar.</p>
            <div className="space-y-3">
                {Object.values(session.elections).map(election => {
                    const hasVoted = votes[election.id];
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
                                    {election.status === 'Abierta' && <button onClick={() => onVoteClick(election.id)} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-1 px-3 rounded-lg text-sm">{hasVoted ? 'Modificar' : 'Votar'}</button>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function BallotPage({ session, election, voterKey, previousVotes, onVote, onBack }) {
    const [selections, setSelections] = useState(previousVotes);
    const [error, setError] = useState('');
    useEffect(() => { if (selections.length === 0) setSelections(Array(election.positionsToElect).fill('')); }, [election.positionsToElect, selections.length]);
    const handleSubmit = (e) => { e.preventDefault(); setError(''); if (selections.some(s => s === '')) { setError('Debes seleccionar un candidato para cada puesto.'); return; } const uniqueSelections = new Set(selections.filter(s => s !== '')); if (uniqueSelections.size !== selections.filter(s => s !== '').length) { setError('No puedes votar por la misma persona más de una vez.'); return; } onVote(voterKey, session.id, election.id, selections); };
    const candidates = election.candidates ? session.members.filter(m => election.candidates.includes(m.name)) : session.members.filter(m => m.status === 'Presente' && m.isEligible);
    return ( <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200"> <button onClick={onBack} className="flex items-center gap-2 text-cyan-600 mb-4 hover:text-cyan-700 font-bold"><ArrowLeftIcon /> Volver a la sesión</button> <h2 className="text-2xl font-bold mb-2 text-cyan-700">{election.name}</h2> <p className="text-slate-500 mb-4 italic">{election.description}</p> {previousVotes.length > 0 && (<div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-r-lg"><p className="font-bold">Ya has votado en esta elección.</p><p className="text-sm">Puedes modificar tu voto hasta que se cierre la votación.</p></div>)} <p className="text-slate-500 mb-6">Debes elegir a {election.positionsToElect} persona(s).</p> <form onSubmit={handleSubmit} className="flex flex-col gap-4"> {[...Array(election.positionsToElect)].map((_, index) => ( <div key={index}> <label className="block text-sm font-medium text-slate-600 mb-1">Voto {index + 1}</label> <select value={selections[index] || ''} onChange={e => {const newS = [...selections]; newS[index] = e.target.value; setSelections(newS);}} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3"> <option value="" disabled>Selecciona una persona...</option> {candidates.map(c => <option key={c.id} value={c.name}>{c.name}</option>)} </select> </div> ))} {error && <p className="text-red-500 mt-4 text-center">{error}</p>} <button type="submit" className="mt-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-3 rounded-lg shadow-md">{previousVotes.length > 0 ? 'Modificar papeleta' : 'Emitir mi voto'}</button> </form> </div> );
}

function VoteSuccessPage({ onBackToSession, onExit }) { return ( <div className="text-center p-8 bg-white rounded-lg shadow-xl border border-slate-200"> <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" /> <h2 className="text-2xl font-bold text-slate-800">¡Voto registrado con éxito!</h2> <p className="text-slate-500 mt-2 mb-6">Tu voto ha sido guardado.</p> <div className="flex flex-col gap-3"> <button onClick={onBackToSession} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">Volver a la sesión</button> <button onClick={onExit} className="text-slate-500 hover:text-cyan-600 text-sm">Salir (votar como otro usuario)</button> </div> </div> ); }

function ResultsPage({ session, election, votes, onBack, onAddElection }) {
    const electionVoterKeys = new Set(session.members.map(v => v.key));
    const electionVotes = Object.entries(votes).filter(([key]) => electionVoterKeys.has(key)).map(([, userVotes]) => userVotes[election.id]).filter(Boolean);
    const papeletasEmitidas = electionVotes.length;
    const totalPapeletas = session.members.filter(m => m.status === 'Presente').length;
    
    const candidatesForResults = election.candidates || session.members.filter(m => m.status === 'Presente').map(m => m.name);
    const results = {};
    candidatesForResults.forEach(name => { results[name] = 0; });
    
    electionVotes.forEach(voteList => { if(Array.isArray(voteList)) { voteList.forEach(name => { if (results.hasOwnProperty(name)) results[name]++; }); } });
    
    const sortedResults = Object.entries(results).sort(([, a], [, b]) => b - a);
    const maxVotes = sortedResults.length > 0 ? sortedResults[0][1] : 0;
    const getVoteText = (count) => count === 1 ? '1 voto' : `${count} votos`;

    const winners = sortedResults.filter(([,count]) => count === maxVotes && maxVotes > 0);
    const tiedCandidates = winners.length > election.positionsToElect ? winners.map(([name]) => name) : [];

    const createTiebreaker = () => {
        const tiebreakerElection = { name: `Desempate: ${election.name}`, description: `Votación de desempate. Candidatos: ${tiedCandidates.join(', ')}.`, positionsToElect: election.positionsToElect, status: 'Prevista', candidates: tiedCandidates };
        onAddElection(session.id, tiebreakerElection);
        onBack();
    };

    return ( <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 w-full max-w-md"> <button onClick={onBack} className="flex items-center gap-2 text-cyan-600 mb-4 hover:text-cyan-700 font-bold"><ArrowLeftIcon /> Volver a gestión</button> <h2 className="text-2xl font-bold text-cyan-700 mb-2">Resultados: {election.name}</h2> <div className="flex gap-4 text-center border-b border-slate-200 pb-4 mb-4"> <div className="flex-1"> <div className="text-2xl font-bold text-slate-700">{papeletasEmitidas}<span className="text-lg text-slate-400">/{totalPapeletas}</span></div> <div className="text-sm text-slate-500">Papeletas emitidas</div> </div> </div> {tiedCandidates.length > 0 && <div className="my-4"><button onClick={createTiebreaker} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg">Crear votación de desempate</button></div>} <div className="space-y-3"> {sortedResults.map(([name, count], index) => ( <div key={name} className="bg-slate-50 p-3 rounded-lg border border-slate-200"> <div className="flex justify-between items-center text-slate-800"><span className="font-semibold">{index + 1}. {name}</span><span className="font-bold text-cyan-600">{getVoteText(count)}</span></div> <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2"><div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: maxVotes > 0 ? `${(count / maxVotes) * 100}%` : '0%' }}></div></div> </div> ))} </div> </div> );
}

function SuperAdminPanel({ admins, onAddAdmin, onBack }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); if (!username || !password || !name) { alert('Por favor, completa todos los campos.'); return; } onAddAdmin(username, password, name); setUsername(''); setPassword(''); setName(''); };
    const managerAdmins = Object.entries(admins).filter(([, details]) => details.role === 'manager');
    return ( <div className="bg-white p-6 rounded-lg shadow-xl border border-slate-200 w-full max-w-md"> <button onClick={onBack} className="flex items-center gap-2 text-cyan-600 mb-4 hover:text-cyan-700 font-bold"><ArrowLeftIcon /> Volver al panel</button> <h2 className="text-2xl font-bold text-cyan-700 mb-4">Gestionar administradores</h2> <div className="mb-6 border-t border-slate-200 pt-4"> <h3 className="text-lg font-semibold text-slate-700 mb-2">Crear nuevo administrador</h3> <form onSubmit={handleSubmit} className="space-y-3"> <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg" placeholder="Nombre completo" /> <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg" placeholder="Nombre de usuario" /> <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg" placeholder="Contraseña" /> <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 rounded-lg shadow">Crear administrador</button> </form> </div> <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-4">Lista de administradores</h3> <div className="space-y-2 max-h-60 overflow-y-auto pr-2"> {managerAdmins.map(([username, details]) => ( <div key={username} className="bg-slate-100 p-3 rounded-lg"> <p className="font-semibold text-slate-800">{details.name}</p> <p className="text-sm text-slate-500">Usuario: {username}</p> </div> ))} </div> </div> );
}
