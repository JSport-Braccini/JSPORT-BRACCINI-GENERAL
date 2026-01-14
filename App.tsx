
import React, { useState, useEffect } from 'react';
import { UserRole, Match, User, Tournament, Team } from './types';
import { Navbar } from './components/Navbar';
import { MatchConsole } from './components/MatchConsole';
import { CoachRotation } from './components/CoachRotation';
import { LiveView } from './components/LiveView';
import { AdminDashboard } from './views/AdminDashboard';
import { Login } from './views/Login';
import { HomeMenu } from './views/HomeMenu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [showConfigMenu, setShowConfigMenu] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    const savedSession = localStorage.getItem('voleypro_session');
    const savedData = localStorage.getItem('voleypro_db');
    
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch (e) {
        console.error("Error al cargar sesión:", e);
      }
    }
    
    if (savedData) {
      try {
        const db = JSON.parse(savedData);
        setTournaments(db.tournaments || []);
        setTeams(db.teams || []);
        setUsers(db.users || []);
      } catch (e) {
        console.error("Error al cargar DB:", e);
      }
    }
  }, []);

  // Guardar datos ante cualquier cambio
  useEffect(() => {
    const db = { tournaments, teams, users };
    localStorage.setItem('voleypro_db', JSON.stringify(db));
  }, [tournaments, teams, users]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('voleypro_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentModule(null);
    localStorage.removeItem('voleypro_session');
    setShowConfigMenu(false);
  };

  const updateMatchState = (updatedMatch: Match) => {
    setActiveMatch({ ...updatedMatch });
    setTournaments(prevTournaments => prevTournaments.map(t => ({
      ...t,
      groups: t.groups.map(g => ({
        ...g,
        matches: g.matches.map(m => m.id === updatedMatch.id ? { ...updatedMatch } : m)
      }))
    })));
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const renderContent = () => {
    if (!currentModule) {
      return <HomeMenu role={currentUser.role} onSelectModule={setCurrentModule} />;
    }

    switch (currentModule) {
      case 'ADMIN_DASHBOARD':
        return (
          <AdminDashboard 
            tournaments={tournaments}
            setTournaments={setTournaments}
            teams={teams}
            setTeams={setTeams}
            users={users}
            setUsers={setUsers}
            onSelectMatch={(m) => {
              setActiveMatch(m);
              setCurrentModule('ADMIN_CONSOLE');
            }}
          />
        );

      case 'ADMIN_CONSOLE':
      case 'REFEREE_CONSOLE':
        if (!activeMatch) {
          const allMatches = tournaments.flatMap(t => t.groups.flatMap(g => g.matches));
          return (
            <div className="p-8 max-w-4xl mx-auto space-y-6">
               <h2 className="text-2xl font-black italic uppercase tracking-widest text-white">SELECTOR DE PARTIDO</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allMatches.map(m => (
                    <button key={m.id} onClick={() => setActiveMatch(m)} className="bg-slate-900 border border-white/5 p-6 rounded-2xl flex items-center justify-between hover:border-indigo-500 transition-all">
                       <div className="flex items-center gap-4">
                          <img src={m.teamA.logoUrl} className="w-8 h-8 object-contain" />
                          <span className="font-black italic uppercase text-xs">{m.teamA.name.slice(0,3)} vs {m.teamB.name.slice(0,3)}</span>
                          <img src={m.teamB.logoUrl} className="w-8 h-8 object-contain" />
                       </div>
                       <span className="text-[10px] font-black text-indigo-500">{m.time}</span>
                    </button>
                  ))}
                  {allMatches.length === 0 && <p className="text-slate-500 font-bold">No hay fixtures generados en el Dashboard.</p>}
               </div>
            </div>
          );
        }
        return (
          <MatchConsole 
            match={activeMatch} 
            onUpdateMatch={updateMatchState}
            onGoToLive={() => setCurrentModule('LIVE_SPECTATOR')}
          />
        );

      case 'LIVE_SPECTATOR':
        if (!activeMatch) {
          const allMatches = tournaments.flatMap(t => t.groups.flatMap(g => g.matches));
          return (
            <div className="p-8 max-w-4xl mx-auto space-y-8 animate-pop">
               <div className="text-center">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">FIXTURE DE TRANSMISIÓN</h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Selecciona un encuentro para iniciar la señal</p>
               </div>
               <div className="grid grid-cols-1 gap-4">
                  {allMatches.map(m => (
                    <div key={m.id} className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] flex items-center justify-between shadow-xl">
                       <div className="flex items-center gap-8">
                          <div className="flex flex-col items-center gap-2">
                             <img src={m.teamA.logoUrl} className="w-12 h-12 object-contain" />
                             <span className="text-sm font-black italic uppercase">{m.teamA.name}</span>
                          </div>
                          <span className="text-2xl font-black italic text-indigo-500">VS</span>
                          <div className="flex flex-col items-center gap-2">
                             <img src={m.teamB.logoUrl} className="w-12 h-12 object-contain" />
                             <span className="text-sm font-black italic uppercase">{m.teamB.name}</span>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-3">
                          <span className="bg-white/5 px-4 py-1 rounded text-white font-black text-xl italic">{m.time}</span>
                          <button 
                            onClick={() => {
                              const updatedMatch = { ...m, status: 'LIVE' as any };
                              updateMatchState(updatedMatch);
                              setCurrentModule('LIVE_SPECTATOR');
                            }} 
                            className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all"
                          >
                             INICIAR VIVO
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          );
        }
        const activeTournament = tournaments.find(t => 
          t.groups.some(g => g.matches.some(m => m.id === activeMatch.id))
        );
        return (
          <LiveView 
            match={activeMatch} 
            tournamentLogo={activeTournament?.logoUrl}
            userRole={currentUser.role}
            onGoToConsole={
              (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.REFEREE) 
                ? () => setCurrentModule(currentUser.role === UserRole.ADMIN ? 'ADMIN_CONSOLE' : 'REFEREE_CONSOLE') 
                : undefined
            }
            onFinishLive={() => {
              const finishedMatch = { ...activeMatch, status: 'FINISHED' as any };
              updateMatchState(finishedMatch);
              setActiveMatch(null);
            }}
          />
        );

      case 'COACH_ROTATION':
        const coachTeam = teams.find(t => t.id === currentUser.teamId) || teams[0];
        if (!coachTeam) return <div className="p-20 text-center font-black uppercase text-slate-500">NO TIENES UN EQUIPO ASIGNADO</div>;
        return (
          <CoachRotation 
            team={coachTeam}
            currentRotation={activeMatch?.rotationA || []}
            onUpdateRotation={(rot) => {
              if (activeMatch) updateMatchState({...activeMatch, rotationA: rot});
            }}
          />
        );

      case 'STATS':
        return (
          <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-pop">
            <h3 className="text-4xl font-black italic uppercase tracking-tighter">Ranking de Goleadores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teams.flatMap(t => t.players).sort((a,b) => b.stats.totalPoints - a.stats.totalPoints).slice(0,5).map(p => ({ name: p.name.split(' ')[0], pts: p.stats.totalPoints }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={8} fontWeight="bold" />
                      <YAxis stroke="#475569" fontSize={8} fontWeight="bold" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                      <Bar dataKey="pts" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
               <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">TOP PERFORMANCE</h4>
                  <div className="space-y-4">
                     {teams.flatMap(t => t.players).sort((a,b) => b.stats.totalPoints - a.stats.totalPoints).slice(0,5).map((p, i) => (
                       <div key={p.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-4">
                             <span className="text-2xl font-black italic text-indigo-500">#{i+1}</span>
                             <img src={p.imageUrl} className="w-10 h-10 rounded-full object-cover" />
                             <div>
                                <p className="font-bold text-sm">{p.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">{p.position}</p>
                             </div>
                          </div>
                          <span className="text-xl font-black">{p.stats.totalPoints} <span className="text-[10px] text-slate-500">PTS</span></span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        );

      default:
        return <HomeMenu role={currentUser.role} onSelectModule={setCurrentModule} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white selection:bg-indigo-500/30 overflow-hidden">
      <div className="flex-none z-[300]">
        <Navbar 
          currentRole={currentUser.role} 
          username={currentUser.username}
          onGoHome={() => {
            setCurrentModule(null);
            setActiveMatch(null);
          }}
          isAtHome={currentModule === null}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto relative bg-[#020617] scroll-smooth custom-scrollbar">
        <main className="transition-all duration-300">
          {renderContent()}
        </main>
      </div>

      <div className="flex-none bg-slate-900/95 border-t border-white/10 p-4 z-[300] backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex justify-end items-center gap-4">
          <button 
            onClick={() => setShowConfigMenu(!showConfigMenu)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-3 animate-pop border border-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            CONFIGURACIÓN
          </button>

          {showConfigMenu && (
            <div className="absolute bottom-full right-0 mb-4 w-60 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-3 animate-pop flex flex-col gap-1.5">
               <button onClick={handleLogout} className="w-full text-left px-5 py-3 rounded-2xl hover:bg-red-600/20 text-red-500 font-black text-[10px] uppercase">SALIR</button>
               <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full text-left px-5 py-3 rounded-2xl hover:bg-white/5 text-slate-400 font-black text-[10px] uppercase">RESETEAR SISTEMA</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
