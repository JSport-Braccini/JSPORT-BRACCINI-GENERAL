
import React, { useState, useRef, useEffect } from 'react';
import { Team, Tournament, Player, Position, Group, Match, User, UserRole, Sponsor } from '../types';
import { VersusPoster } from '../components/VersusPoster';
import { GroupPoster } from '../components/GroupPoster';
import { TournamentPoster } from '../components/TournamentPoster';
import { FixturePoster } from '../components/FixturePoster';
import { ParticipantsPoster } from '../components/ParticipantsPoster';

interface AdminDashboardProps {
  tournaments: Tournament[];
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onSelectMatch: (m: Match) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  tournaments, setTournaments, teams, setTeams, users, setUsers, onSelectMatch 
}) => {
  const [activeTab, setActiveTab] = useState<'torneos' | 'equipos' | 'usuarios'>('torneos');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  
  const [posterMatch, setPosterMatch] = useState<Match | null>(null);
  const [posterGroup, setPosterGroup] = useState<Group | null>(null);
  const [posterTournament, setPosterTournament] = useState<Tournament | null>(null);
  const [posterFixture, setPosterTournamentFixture] = useState<Tournament | null>(null);
  const [posterParticipants, setPosterParticipants] = useState<Tournament | null>(null);

  const [editingItem, setEditingItem] = useState<{ type: 'TOURNAMENT' | 'TEAM', data: any } | null>(null);
  const [tempImage, setTempImage] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || null;
  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId) || null;

  const processImage = (file: File, maxWidth: number, quality: number) => {
    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => setIsProcessingImage(false);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleSize = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          setTempImage(dataUrl);
          setIsProcessingImage(false);
        } else {
          setIsProcessingImage(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddTournament = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const startDate = formData.get('startDate') as string;
    const location = formData.get('location') as string;

    if (editingItem?.type === 'TOURNAMENT') {
      setTournaments(prev => prev.map(t => t.id === editingItem.data.id ? {
        ...t,
        name: name.toUpperCase(),
        startDate,
        location,
        logoUrl: tempImage || t.logoUrl
      } : t));
    } else {
      const newTour: Tournament = {
        id: Math.random().toString(36).substring(2, 9),
        name: name.toUpperCase(),
        logoUrl: tempImage || `https://picsum.photos/seed/${Math.random()}/200`,
        startDate,
        location,
        groups: [], sponsors: []
      };
      setTournaments(prev => [...prev, newTour]);
    }
    setShowTournamentModal(false);
    setEditingItem(null);
    setTempImage('');
  };

  const handleAddSponsor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTournamentId) return;
    const name = (new FormData(e.currentTarget)).get('name') as string;
    
    const newSponsor: Sponsor = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.toUpperCase(),
      logoUrl: tempImage || `https://picsum.photos/seed/${Math.random()}/100`
    };

    setTournaments(prev => prev.map(t => t.id === selectedTournamentId ? {
      ...t, sponsors: [...(t.sponsors || []), newSponsor]
    } : t));

    setShowSponsorModal(false);
    setTempImage('');
  };

  const handleAddTeam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const delegate = formData.get('delegate') as string;

    if (!name) return;

    if (editingItem?.type === 'TEAM') {
      setTeams(prev => prev.map(t => t.id === editingItem.data.id ? {
        ...t,
        name: name.toUpperCase(),
        delegate,
        logoUrl: tempImage || t.logoUrl
      } : t));
    } else {
      const newTeam: Team = {
        id: Math.random().toString(36).substring(2, 9),
        name: name.toUpperCase(),
        delegate,
        logoUrl: tempImage || `https://picsum.photos/seed/${Math.random()}/200`,
        players: [], captainId: ''
      };
      setTeams(prev => [...prev, newTeam]);
    }
    setShowTeamModal(false);
    setEditingItem(null);
    setTempImage('');
  };

  const handleAddPlayer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeamId) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const number = parseInt(formData.get('number') as string) || 0;
    const position = formData.get('position') as Position;

    const newPlayer: Player = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.toUpperCase(),
      number,
      position,
      imageUrl: tempImage || `https://picsum.photos/seed/${Math.random()}/100`,
      stats: { attacks: 0, blocks: 0, aces: 0, errors: 0, totalPoints: 0 }
    };

    setTeams(prev => prev.map(t => t.id === selectedTeamId ? {
      ...t,
      players: [...(t.players || []), newPlayer]
    } : t));
    
    setTempImage('');
    (e.target as HTMLFormElement).reset();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTournamentId) return;
    const name = (new FormData(e.currentTarget)).get('name') as string;
    if (!name) return;

    const newGroup: Group = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.toUpperCase(),
      teams: [], matches: []
    };

    setTournaments(prev => prev.map(t => 
      t.id === selectedTournamentId ? { ...t, groups: [...(t.groups || []), newGroup] } : t
    ));
    setShowGroupModal(false);
  };

  return (
    <div className="p-4 md:p-10 pb-32">
      {/* Posters Overlay */}
      {posterMatch && selectedTournament && <VersusPoster match={posterMatch} tournament={selectedTournament} onClose={() => setPosterMatch(null)} />}
      {posterGroup && selectedTournament && <GroupPoster group={posterGroup} tournament={selectedTournament} onClose={() => setPosterGroup(null)} />}
      {posterTournament && <TournamentPoster tournament={posterTournament} onClose={() => setPosterTournament(null)} />}
      {posterFixture && <FixturePoster tournament={posterFixture} onClose={() => setPosterTournamentFixture(null)} />}
      {posterParticipants && <ParticipantsPoster tournament={posterParticipants} onClose={() => setPosterParticipants(null)} />}

      <header className="flex justify-between items-end mb-10">
        <div>
           <h2 className="text-4xl font-black uppercase italic text-white leading-none">
             {selectedTournament ? selectedTournament.name : 'JSPORT MASTER'}
           </h2>
           <p className="text-slate-500 font-black text-[10px] uppercase mt-2 tracking-widest">CONSOLE DASHBOARD</p>
        </div>
        {!selectedTournament && (
          <div className="flex bg-slate-900 border border-white/5 p-1 rounded-2xl">
             {['torneos', 'equipos', 'usuarios'].map(t => <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{t}</button>)}
          </div>
        )}
      </header>

      {selectedTournament ? (
        <div className="animate-pop space-y-6">
           <div className="bg-slate-900/60 p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between gap-4 flex-wrap">
              <button onClick={() => setSelectedTournamentId(null)} className="flex items-center gap-3 text-indigo-400 font-black text-xs uppercase hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg> VOLVER AL PANEL
              </button>
              <div className="flex flex-wrap gap-2">
                 <button onClick={() => setPosterParticipants(selectedTournament)} className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-colors">PARTICIPANTES</button>
                 <button onClick={() => setPosterTournament(selectedTournament)} className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-colors">GRUPOS</button>
                 <button onClick={() => setPosterTournamentFixture(selectedTournament)} className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-colors">FIXTURE</button>
                 <button onClick={() => setShowSponsorModal(true)} className="bg-emerald-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-colors shadow-lg">+ AUSPICIADOR</button>
                 <button onClick={() => setShowGroupModal(true)} className="bg-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-500 transition-colors shadow-lg">+ GRUPO</button>
              </div>
           </div>

           <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {(selectedTournament.sponsors || []).map(s => (
                <div key={s.id} className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 flex items-center gap-3 shrink-0">
                  <img src={s.logoUrl} className="w-8 h-8 object-contain bg-white rounded-lg p-1" />
                  <span className="text-[10px] font-black uppercase text-white/50">{s.name}</span>
                  <button onClick={() => setTournaments(prev => prev.map(t => t.id === selectedTournamentId ? { ...t, sponsors: t.sponsors.filter(it => it.id !== s.id) } : t))} className="text-red-500 font-black px-1 hover:scale-125 transition-transform">×</button>
                </div>
              ))}
           </div>

           <div className="flex overflow-x-auto gap-6 pb-10 custom-scrollbar">
              {(selectedTournament.groups || []).map(g => (
                <div key={g.id} className="w-[340px] shrink-0 bg-slate-900 p-6 rounded-[2.5rem] border border-white/5 flex flex-col gap-4 shadow-xl">
                   <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <h4 className="font-black italic text-white uppercase tracking-tighter">{g.name}</h4>
                      <button onClick={() => setPosterGroup(g)} className="text-indigo-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                      </button>
                   </div>
                   
                   <div className="space-y-2">
                      <select onChange={(e) => {
                        const team = teams.find(t => t.id === e.target.value);
                        if (!team || g.teams.some(it => it.id === team.id)) return;
                        setTournaments(prev => prev.map(t => t.id === selectedTournamentId ? { ...t, groups: t.groups.map(gr => gr.id === g.id ? { ...gr, teams: [...gr.teams, team] } : gr) } : t));
                        e.target.value = "";
                      }} className="w-full bg-black border border-white/5 p-3 rounded-xl text-[10px] font-black uppercase text-white outline-none">
                         <option value="">+ AÑADIR EQUIPO</option>
                         {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      
                      <div className="grid grid-cols-2 gap-2">
                         {g.teams.map(t => (
                           <div key={t.id} className="bg-black/50 p-2 rounded-xl text-[8px] font-black uppercase flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 overflow-hidden">
                                 <img src={t.logoUrl} className="w-5 h-5 object-contain bg-white rounded p-0.5 shrink-0" />
                                 <span className="truncate">{t.name}</span>
                              </div>
                              <button onClick={() => setTournaments(prev => prev.map(tour => tour.id === selectedTournamentId ? { ...tour, groups: tour.groups.map(gr => gr.id === g.id ? { ...gr, teams: gr.teams.filter(it => it.id !== t.id) } : gr) } : tour))} className="text-red-500 font-bold px-1">×</button>
                           </div>
                         ))}
                      </div>
                   </div>

                   <button onClick={() => {
                     if (g.teams.length < 2) { alert("Añade al menos 2 equipos"); return; }
                     const matches: Match[] = [];
                     for(let i=0; i<g.teams.length; i++) { 
                       for(let j=i+1; j<g.teams.length; j++) { 
                         matches.push({ 
                           id: Math.random().toString(36).substring(2, 9), 
                           teamA: g.teams[i], 
                           teamB: g.teams[j], 
                           currentSet: 1, 
                           sets: [{teamAScore:0, teamBScore:0}], 
                           status: 'SCHEDULED', 
                           date: selectedTournament.startDate || '2024-01-01', 
                           time: '18:00', 
                           rotationA: g.teams[i].players.slice(0,6).map(p => p.id), 
                           rotationB: g.teams[j].players.slice(0,6).map(p => p.id), 
                           timeoutsA: 2, 
                           timeoutsB: 2, 
                           subsA: 6, 
                           subsB: 6, 
                           activeOverlay: 'NONE',
                           maxSets: 3,
                           pointsPerSet: 25,
                           decidingSetPoints: 15
                         }); 
                       } 
                     }
                     setTournaments(prev => prev.map(t => t.id === selectedTournamentId ? { ...t, groups: t.groups.map(gr => gr.id === g.id ? { ...gr, matches } : gr) } : t));
                   }} className="bg-indigo-600 py-3 rounded-xl text-[9px] font-black uppercase shadow-lg hover:bg-indigo-500 transition-colors">GENERAR FIXTURE</button>

                   <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                      {(g.matches || []).map(m => (
                        <div key={m.id} className="bg-black/40 p-3 rounded-2xl border border-white/5 flex flex-col gap-3 group relative">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <img src={m.teamA.logoUrl} className="w-5 h-5 bg-white rounded p-0.5 object-contain" />
                                <span className="text-[10px] font-black text-white italic uppercase tracking-tighter">{m.teamA.name.slice(0,8)}</span>
                             </div>
                             <span className="text-[9px] font-black text-indigo-500">VS</span>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-white italic uppercase tracking-tighter">{m.teamB.name.slice(0,8)}</span>
                                <img src={m.teamB.logoUrl} className="w-5 h-5 bg-white rounded p-0.5 object-contain" />
                             </div>
                           </div>
                           <div className="flex gap-2">
                             <button onClick={() => onSelectMatch(m)} className="flex-1 bg-white text-black py-2 rounded-lg text-[8px] font-black uppercase tracking-tighter hover:bg-indigo-500 hover:text-white transition-all">DIRIGIR</button>
                             <button onClick={() => setPosterMatch(m)} className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-2 rounded-lg text-[8px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all">POSTER VS</button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pop">
           {activeTab === 'torneos' && (
             <>
               <button onClick={() => { setEditingItem(null); setShowTournamentModal(true); setTempImage(''); }} className="h-64 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-500 hover:border-indigo-500 hover:text-indigo-400 transition-all group">
                  <span className="text-4xl group-hover:scale-125 transition-transform">+</span>
                  <span className="text-[10px] font-black uppercase tracking-widest italic">NUEVO TORNEO</span>
               </button>
               {tournaments.map(t => <div key={t.id} className="bg-slate-900/60 p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-4 relative group">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => { setEditingItem({ type: 'TOURNAMENT', data: t }); setTempImage(t.logoUrl); setShowTournamentModal(true); }} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-800 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => setTournaments(prev => prev.filter(it => it.id !== t.id))} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-800 rounded-full">×</button>
                  </div>
                  <img src={t.logoUrl} className="w-20 h-20 bg-white rounded-2xl p-2 shadow-xl object-contain" />
                  <h4 className="font-black text-white italic uppercase text-center leading-tight tracking-tighter">{t.name}</h4>
                  <div className="text-[8px] text-slate-500 uppercase font-black">{t.location || 'SIN SEDE'} | {t.startDate || 'SIN FECHA'}</div>
                  <button onClick={() => setSelectedTournamentId(t.id)} className="w-full bg-indigo-600 py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-indigo-500 transition-colors">GESTIONAR</button>
               </div>)}
             </>
           )}
           {activeTab === 'equipos' && (
             <>
               <button onClick={() => { setEditingItem(null); setShowTeamModal(true); setTempImage(''); }} className="h-64 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-500 hover:border-indigo-500 hover:text-indigo-400 transition-all group">
                  <span className="text-4xl group-hover:scale-125 transition-transform">+</span>
                  <span className="text-[10px] font-black uppercase tracking-widest italic">NUEVO EQUIPO</span>
               </button>
               {teams.map(t => <div key={t.id} className="bg-slate-900/60 p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-4 relative group">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => { setEditingItem({ type: 'TEAM', data: t }); setTempImage(t.logoUrl); setShowTeamModal(true); }} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-800 rounded-full shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => setTeams(prev => prev.filter(it => it.id !== t.id))} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-800 rounded-full shadow-lg">×</button>
                  </div>
                  <img src={t.logoUrl} className="w-20 h-20 bg-white rounded-2xl p-2 shadow-xl object-contain" />
                  <h4 className="font-black text-white italic uppercase text-center leading-tight tracking-tighter">{t.name}</h4>
                  <button onClick={() => { setSelectedTeamId(t.id); setShowPlayerModal(true); setTempImage(''); }} className="w-full bg-slate-950 py-4 rounded-2xl text-[10px] font-black uppercase text-indigo-400 border border-indigo-900/50 hover:bg-indigo-900/10 transition-colors">JUGADORES ({t.players?.length || 0})</button>
               </div>)}
             </>
           )}
           {activeTab === 'usuarios' && (
             <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-4">
                {users.map(u => (
                  <div key={u.id} className="bg-slate-900 p-6 rounded-[2.5rem] border border-white/5 flex flex-col gap-2 relative group shadow-lg">
                    <span className="font-black text-xs uppercase text-white tracking-tighter">{u.username}</span>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{u.role}</span>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
};
