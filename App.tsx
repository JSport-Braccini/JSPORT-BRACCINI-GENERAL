
import React, { useState, useEffect } from 'react';
import { UserRole, Match, User, Tournament, Team } from './types';
import { Navbar } from './components/Navbar';
import { MatchConsole } from './components/MatchConsole';
import { CoachRotation } from './components/CoachRotation';
import { LiveView } from './components/LiveView';
import { AdminDashboard } from './views/AdminDashboard';
import { Login } from './views/Login';
import { HomeMenu } from './views/HomeMenu';
import { StatsView } from './views/StatsView';
import { UsersManagement } from './views/UsersManagement';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'error' | 'success'} | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const savedSession = localStorage.getItem('jsport_session');
    const savedData = localStorage.getItem('jsport_db');
    const urlParams = new URLSearchParams(window.location.search);
    const cloudId = urlParams.get('cid');

    if (savedSession && !cloudId) {
      try { 
        setCurrentUser(JSON.parse(savedSession)); 
      } catch (e) {
        localStorage.removeItem('jsport_session');
      }
    }
    
    if (savedData) {
      try {
        const db = JSON.parse(savedData);
        setTournaments(Array.isArray(db.tournaments) ? db.tournaments : []);
        setTeams(Array.isArray(db.teams) ? db.teams : []);
        setUsers(Array.isArray(db.users) ? db.users : []);
      } catch (e) {
        localStorage.removeItem('jsport_db');
      }
    }

    if (cloudId) { handleJoinCloud(cloudId); }
  }, []);

  useEffect(() => {
    if (teams.length === 0 && tournaments.length === 0 && users.length === 0) return;
    try {
      const db = { tournaments, teams, users };
      localStorage.setItem('jsport_db', JSON.stringify(db));
    } catch (err) {}
  }, [tournaments, teams, users]);

  const handleJoinCloud = async (cid: string) => {
    try {
      const res = await fetch(`https://api.npoint.io/${cid}`);
      if (!res.ok) throw new Error("Torneo no encontrado");
      const data = await res.json();
      const spectatorTournament: Tournament = {
        id: 'cloud-' + cid,
        syncId: cid,
        name: data.name || 'TORNEO EN NUBE',
        logoUrl: data.logoUrl || '',
        groups: data.groups || [],
        sponsors: data.sponsors || [],
        startDate: data.startDate,
        location: data.location
      };
      setTournaments([spectatorTournament]);
      setCurrentUser({ id: 'guest', username: 'Espectador', role: UserRole.SPECTATOR });
      setCurrentModule('LIVE_SPECTATOR');
      setNotification({ msg: "Conectado a la señal JSPORT", type: 'success' });
    } catch (err) { alert("No se pudo conectar."); }
  };

  const updateMatchState = (updatedMatch: Match) => {
    setActiveMatch({ ...updatedMatch });
    setTournaments(tournaments.map(t => {
      const containsMatch = t.groups?.some(g => g.matches?.some(m => m.id === updatedMatch.id));
      if (containsMatch) {
        return { 
          ...t, 
          groups: t.groups.map(g => ({ 
            ...g, 
            matches: g.matches.map(m => m.id === updatedMatch.id ? { ...updatedMatch } : m) 
          })) 
        };
      }
      return t;
    }));
  };

  const renderContent = () => {
    if (!currentModule) return <HomeMenu role={currentUser?.role || UserRole.SPECTATOR} onSelectModule={setCurrentModule} />;

    switch (currentModule) {
      case 'ADMIN_DASHBOARD':
        return <AdminDashboard tournaments={tournaments} setTournaments={setTournaments} teams={teams} setTeams={setTeams} users={users} setUsers={setUsers} onSelectMatch={(m) => { setActiveMatch(m); setCurrentModule('ADMIN_CONSOLE'); }} />;
      case 'ADMIN_CONSOLE':
      case 'REFEREE_CONSOLE':
        if (!activeMatch) {
          const allMatches = tournaments.flatMap(t => t.groups?.flatMap(g => g.matches) || []);
          return (
            <div className="p-8 max-w-4xl mx-auto space-y-6">
               <h2 className="text-2xl font-black italic uppercase text-white text-center">SELECCIONAR PARTIDO PARA DIRIGIR</h2>
               <div className="grid grid-cols-1 gap-4">
                  {allMatches.map(m => (
                    <button key={m.id} onClick={() => { setActiveMatch({ ...m, maxSets: m.maxSets || 3, pointsPerSet: m.pointsPerSet || 25, decidingSetPoints: m.decidingSetPoints || 15 }); }} className="bg-slate-900 border border-white/5 p-6 rounded-3xl flex items-center justify-between hover:border-indigo-500 transition-all text-left">
                       <div className="flex items-center gap-4">
                          <img src={m.teamA.logoUrl} className="w-8 h-8 object-contain bg-white rounded p-0.5" /><span className="font-black text-xs text-white/80 italic uppercase">{m.teamA.name} vs {m.teamB.name}</span><img src={m.teamB.logoUrl} className="w-8 h-8 object-contain bg-white rounded p-0.5" />
                       </div>
                       <span className="text-[10px] font-black text-indigo-500 uppercase">{m.time} HS</span>
                    </button>
                  ))}
                  {allMatches.length === 0 && <div className="text-center py-20 text-slate-800 font-black uppercase italic tracking-widest">NO HAY PARTIDOS PROGRAMADOS</div>}
               </div>
            </div>
          );
        }
        return <MatchConsole match={activeMatch} onUpdateMatch={updateMatchState} onGoToLive={() => setCurrentModule('LIVE_SPECTATOR')} />;
      case 'LIVE_SPECTATOR':
        const activeTournament = tournaments.find(t => t.groups?.some(g => g.matches?.some(m => m.id === activeMatch?.id)));
        if (!activeMatch) {
          const allMatches = tournaments.flatMap(t => t.groups?.flatMap(g => g.matches) || []);
          return (
            <div className="p-8 max-w-4xl mx-auto space-y-8 animate-pop">
               <h2 className="text-3xl font-black italic uppercase text-center text-white leading-none tracking-tighter">CENTRO DE TRANSMISIÓN</h2>
               <div className="grid grid-cols-1 gap-4">
                  {allMatches.map(m => (
                    <div key={m.id} className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] flex items-center justify-between shadow-xl gap-6">
                       <div className="flex items-center gap-8"><div className="flex flex-col items-center gap-2"><img src={m.teamA.logoUrl} className="w-12 h-12 object-contain bg-white rounded-lg p-1" /><span className="text-sm font-black italic uppercase text-white/80">{m.teamA.name}</span></div><span className="text-2xl font-black italic text-indigo-500">VS</span><div className="flex flex-col items-center gap-2"><img src={m.teamB.logoUrl} className="w-12 h-12 object-contain bg-white rounded-lg p-1" /><span className="text-sm font-black italic uppercase text-white/80">{m.teamB.name}</span></div></div>
                       <button onClick={() => setActiveMatch(m)} className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all">VER SEÑAL</button>
                    </div>
                  ))}
                  {allMatches.length === 0 && <div className="text-center py-20 text-slate-800 font-black uppercase italic tracking-widest">SIN SEÑALES ACTIVAS</div>}
               </div>
            </div>
          );
        }
        return (
          <LiveView 
            match={activeMatch} 
            tournamentLogo={activeTournament?.logoUrl} 
            userRole={currentUser?.role} 
            tournament={activeTournament} 
            onUpdateMatch={updateMatchState}
            onGoToConsole={() => setCurrentModule(currentUser?.role === UserRole.ADMIN ? 'ADMIN_CONSOLE' : 'REFEREE_CONSOLE')} 
            onFinishLive={() => { setActiveMatch(null); if (currentUser?.role === UserRole.SPECTATOR) setCurrentModule(null); }} 
          />
        );
      case 'COACH_ROTATION':
        const coachTeam = teams.find(t => t.id === currentUser?.teamId) || teams[0];
        if (!coachTeam) return <div className="p-10 text-center text-slate-700 font-black italic uppercase">DEBE REGISTRAR EQUIPOS PRIMERO</div>;
        return <CoachRotation team={coachTeam} currentRotation={activeMatch?.rotationA || []} onUpdateRotation={(rot) => { if (activeMatch) updateMatchState({...activeMatch, rotationA: rot}); }} />;
      case 'GLOBAL_STATS':
        return <StatsView teams={teams} tournaments={tournaments} />;
      case 'USERS_MANAGEMENT':
        return <UsersManagement users={users} setUsers={setUsers} />;
      default:
        return <HomeMenu role={currentUser?.role || UserRole.SPECTATOR} onSelectModule={setCurrentModule} />;
    }
  };

  if (!currentUser) return <Login onLogin={(u) => { setCurrentUser(u); localStorage.setItem('jsport_session', JSON.stringify(u)); }} onJoinCloud={handleJoinCloud} />;

  const hideNav = currentModule === 'LIVE_SPECTATOR' && activeMatch;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white selection:bg-indigo-500/30 overflow-hidden">
      {!hideNav && <Navbar currentRole={currentUser.role} username={currentUser.username} onGoHome={() => { setCurrentModule(null); setActiveMatch(null); window.history.replaceState({}, document.title, "/"); }} isAtHome={currentModule === null} />}
      <div className="flex-1 overflow-y-auto relative bg-[#020617] custom-scrollbar">
        {notification && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[3000] ${notification.type === 'error' ? 'bg-red-600' : 'bg-indigo-600'} px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pop shadow-2xl border border-white/20 text-center max-w-[90vw]`}>
            {notification.msg}
          </div>
        )}
        <main className="h-full">{renderContent()}</main>
      </div>
      {!hideNav && (
        <div className="flex-none bg-slate-900 border-t border-white/10 p-4 z-[300] backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto flex justify-end gap-4">
            <button onClick={() => setShowConfigMenu(!showConfigMenu)} className="bg-indigo-600 px-7 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all">MENÚ</button>
            {showConfigMenu && (
              <div className="absolute bottom-full right-4 mb-4 w-60 bg-slate-900 border border-white/10 rounded-[2rem] shadow-3xl p-2 animate-pop flex flex-col gap-1 backdrop-blur-3xl">
                <button onClick={() => { setCurrentUser(null); setCurrentModule(null); setActiveMatch(null); localStorage.removeItem('jsport_session'); setShowConfigMenu(false); }} className="w-full text-left px-5 py-4 rounded-2xl hover:bg-red-600/20 text-red-500 font-black text-[9px] uppercase tracking-widest">CERRAR SESIÓN</button>
                <button onClick={() => { if(confirm("¿Resetear base de datos local?")){ localStorage.clear(); window.location.reload(); } }} className="w-full text-left px-5 py-4 rounded-2xl hover:bg-white/5 text-slate-400 font-black text-[9px] uppercase tracking-widest">LIMPIAR DATOS</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
