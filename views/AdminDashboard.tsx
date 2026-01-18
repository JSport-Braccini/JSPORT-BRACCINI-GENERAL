
import React, { useState, useRef, useMemo } from 'react';
import { Team, Tournament, Player, Position, Group, Match, User, Sponsor } from '../types';
import { VersusPoster } from '../components/VersusPoster';
import { GroupPoster } from '../components/GroupPoster';
import { TournamentPoster } from '../components/TournamentPoster';
import { FixturePoster } from '../components/FixturePoster';
import { ParticipantsPoster } from '../components/ParticipantsPoster';

const ModalContainer: React.FC<{ children: React.ReactNode; onClose: () => void; title: string }> = ({ children, onClose, title }) => (
  <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-pop">
    <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50 shrink-0">
        <h3 className="text-lg font-black italic uppercase text-white tracking-tighter">{title}</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  </div>
);

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
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  
  const [posterMatch, setPosterMatch] = useState<Match | null>(null);
  const [posterGroup, setPosterGroup] = useState<Group | null>(null);
  const [posterTournament, setPosterTournament] = useState<Tournament | null>(null);
  const [posterFixture, setPosterTournamentFixture] = useState<Tournament | null>(null);
  const [posterParticipants, setPosterParticipants] = useState<Tournament | null>(null);

  const [editingItem, setEditingItem] = useState<{ type: 'TOURNAMENT' | 'TEAM' | 'PLAYER' | 'SPONSOR', data: any } | null>(null);
  const [tempImage, setTempImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedTeam = useMemo(() => teams.find(t => t.id === selectedTeamId) || null, [teams, selectedTeamId]);
  const selectedTournament = useMemo(() => tournaments.find(t => t.id === selectedTournamentId) || null, [tournaments, selectedTournamentId]);

  const processImage = (file: File, maxWidth: number) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleSize = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setTempImage(canvas.toDataURL('image/png', 0.9));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTournament = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const startDate = formData.get('startDate') as string;
    const location = formData.get('location') as string;

    if (!name.trim()) return;

    if (editingItem?.type === 'TOURNAMENT') {
      setTournaments(prev => prev.map(t => t.id === editingItem.data.id ? { ...t, name: name.toUpperCase(), startDate, location, logoUrl: tempImage || t.logoUrl } : t));
    } else {
      const newTour: Tournament = { id: 't-' + Math.random().toString(36).substring(2, 9), name: name.toUpperCase(), logoUrl: tempImage || `https://picsum.photos/seed/${Math.random()}/200`, startDate, location, groups: [], sponsors: [] };
      setTournaments(prev => [...prev, newTour]);
    }
    setShowTournamentModal(false);
    setEditingItem(null);
    setTempImage('');
  };

  const handleSaveSponsor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTournamentId) return;
    const name = new FormData(e.currentTarget).get('name') as string;
    if (!name.trim() || !tempImage) return;

    const newSponsor: Sponsor = {
      id: 'sp-' + Math.random().toString(36).substring(2, 9),
      name: name.toUpperCase(),
      logoUrl: tempImage
    };

    setTournaments(prev => prev.map(t => t.id === selectedTournamentId ? { ...t, sponsors: [...t.sponsors, newSponsor] } : t));
    setShowSponsorModal(false);
    setTempImage('');
  };

  const handleSaveTeam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const delegate = formData.get('delegate') as string;

    if (!name.trim()) return;

    if (editingItem?.type === 'TEAM') {
      setTeams(prev => prev.map(t => t.id === editingItem.data.id ? { ...t, name: name.toUpperCase(), delegate, logoUrl: tempImage || t.logoUrl } : t));
    } else {
      const newTeam: Team = { id: 'team-' + Math.random().toString(36).substring(2, 9), name: name.toUpperCase(), delegate, logoUrl: tempImage || `https://picsum.photos/seed/${Math.random()}/200`, players: [], captainId: '' };
      setTeams(prev => [...prev, newTeam]);
    }
    setShowTeamModal(false);
    setEditingItem(null);
    setTempImage('');
  };

  const handleSavePlayer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeamId) return;
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const number = parseInt(formData.get('number') as string) || 0;
    const position = formData.get('position') as Position;

    if (!name.trim()) return;

    if (editingItem?.type === 'PLAYER') {
      setTeams(prev => prev.map(t => t.id === selectedTeamId ? {
        ...t,
        players: t.players.map(p => p.id === editingItem.data.id ? { ...p, name: name.toUpperCase(), number, position, imageUrl: tempImage || p.imageUrl } : p)
      } : t));
    } else {
      const newPlayer: Player = { id: 'p-' + Math.random().toString(36).substring(2, 9), name: name.toUpperCase(), number, position, imageUrl: tempImage || `https://picsum.photos/seed/${Math.random()}/150`, stats: { attacks: 0, blocks: 0, aces: 0, errors: 0, totalPoints: 0 } };
      setTeams(prev => prev.map(t => t.id === selectedTeamId ? { ...t, players: [...t.players, newPlayer] } : t));
    }
    
    setTempImage('');
    setEditingItem(null);
    e.currentTarget.reset();
  };

  return (
    <div className="p-4 md:p-8 pb-32">
      {posterMatch && selectedTournament && <VersusPoster match={posterMatch} tournament={selectedTournament} onClose={() => setPosterMatch(null)} />}
      {posterGroup && selectedTournament && <GroupPoster group={posterGroup} tournament={selectedTournament} onClose={() => setPosterGroup(null)} />}
      {posterTournament && <TournamentPoster tournament={posterTournament} onClose={() => setPosterTournament(null)} />}
      {posterFixture && <FixturePoster tournament={posterFixture} onClose={() => setPosterTournamentFixture(null)} />}
      {posterParticipants && <ParticipantsPoster tournament={posterParticipants} onClose={() => setPosterParticipants(null)} />}

      <header className="flex justify-between items-end mb-8">
        <div>
           <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white leading-none">
             {selectedTournament ? selectedTournament.name : 'PANEL DE CONTROL'}
           </h2>
        </div>
        {!selectedTournament && (
          <div className="flex bg-slate-900 border border-white/5 p-1 rounded-xl">
             {['torneos', 'equipos'].map(t => (
               <button key={t} onClick={() => setActiveTab(t as any)} className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{t}</button>
             ))}
          </div>
        )}
      </header>

      {selectedTournament ? (
        <div className="space-y-6">
           <div className="bg-slate-900/60 p-5 rounded-[2rem] border border-white/5 flex items-center justify-between gap-4 flex-wrap">
              <button onClick={() => setSelectedTournamentId(null)} className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" /></svg> VOLVER
              </button>
              <div className="flex flex-wrap gap-2">
                 <button onClick={() => setShowSponsorModal(true)} className="bg-white/10 px-3 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-white/20">PATROCINADORES ({selectedTournament.sponsors.length})</button>
                 <button onClick={() => setPosterParticipants(selectedTournament)} className="bg-white/5 px-3 py-2 rounded-lg text-[9px] font-black uppercase">PARTICIPANTES</button>
                 <button onClick={() => setPosterTournament(selectedTournament)} className="bg-white/5 px-3 py-2 rounded-lg text-[9px] font-black uppercase">GRUPOS</button>
                 <button onClick={() => setPosterTournamentFixture(selectedTournament)} className="bg-white/5 px-3 py-2 rounded-lg text-[9px] font-black uppercase">FIXTURE</button>
                 <button onClick={() => setShowGroupModal(true)} className="bg-indigo-600 px-4 py-2 rounded-lg text-[9px] font-black uppercase shadow-lg">+ GRUPO</button>
              </div>
           </div>

           <div className="flex overflow-x-auto gap-6 pb-6 custom-scrollbar">
              {selectedTournament.groups.map(g => (
                <div key={g.id} className="w-[320px] shrink-0 bg-slate-900 p-5 rounded-[2rem] border border-white/5 flex flex-col gap-4">
                   <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <h4 className="font-black italic text-white uppercase">{g.name}</h4>
                      <div className="flex gap-2">
                        <button onClick={() => setPosterGroup(g)} className="text-indigo-400 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" strokeWidth="2"/></svg></button>
                        <button onClick={() => setTournaments(prev => prev.map(t => t.id === selectedTournamentId ? { ...t, groups: t.groups.filter(gr => gr.id !== g.id) } : t))} className="text-red-500 hover:text-red-400 transition-colors">×</button>
                      </div>
                   </div>
                   
                   <select onChange={(e) => {
                     const team = teams.find(t => t.id === e.target.value);
                     if (!team || g.teams.some(it => it.id === team.id)) return;
                     setTournaments(prev => prev.map(t => t.id === selectedTournamentId ? { ...t, groups: t.groups.map(gr => gr.id === g.id ? { ...gr, teams: [...gr.teams, team] } : gr) } : t));
                     e.target.value = "";
                   }} className="w-full bg-black border border-white/5 p-2 rounded-lg text-[9px] font-black uppercase text-white">
                      <option value="">+ VINCULAR EQUIPO</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                   </select>

                   <div className="grid grid-cols-2 gap-2">
                      {g.teams.map(t => (
                        <div key={t.id} className="bg-black/50 p-2 rounded-lg text-[8px] font-black uppercase flex items-center justify-between border border-white/5">
                           <span className="truncate">{t.name}</span>
                           <button onClick={() => setTournaments(prev => prev.map(tour => tour.id === selectedTournamentId ? { ...tour, groups: tour.groups.map(gr => gr.id === g.id ? { ...gr, teams: gr.teams.filter(it => it.id !== t.id) } : gr) } : tour))} className="text-red-500">×</button>
                        </div>
                      ))}
                   </div>

                   <button onClick={() => {
                     if (g.teams.length < 2) return;
                     const matches: Match[] = [];
                     for(let i=0; i<g.teams.length; i++) { 
                       for(let j=i+1; j<g.teams.length; j++) { 
                         matches.push({ 
                           id: 'm-' + Math.random().toString(36).substring(2, 9), 
                           teamA: g.teams[i], teamB: g.teams[j], currentSet: 1, 
                           sets: [{teamAScore:0, teamBScore:0}], status: 'SCHEDULED', 
                           date: selectedTournament.startDate || '2024-01-01', time: '18:00', 
                           rotationA: g.teams[i].players.slice(0,6).map(p => p.id), 
                           rotationB: g.teams[j].players.slice(0,6).map(p => p.id), 
                           timeoutsA: 2, timeoutsB: 2, subsA: 6, subsB: 6, activeOverlay: 'NONE',
                           maxSets: 3, pointsPerSet: 25, decidingSetPoints: 15
                         }); 
                       } 
                     }
                     setTournaments(prev => prev.map(t => t.id === selectedTournamentId ? { ...t, groups: t.groups.map(gr => gr.id === g.id ? { ...gr, matches } : gr) } : t));
                   }} className="bg-indigo-600 py-2 rounded-lg text-[8px] font-black uppercase">GENERAR FIXTURE</button>

                   <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {g.matches.map(m => (
                        <div key={m.id} className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                           <div className="flex items-center justify-between text-[8px] font-black text-white italic">
                              <span>{m.teamA.name.slice(0,10)}</span>
                              <span className="text-indigo-500">VS</span>
                              <span>{m.teamB.name.slice(0,10)}</span>
                           </div>
                           <div className="flex gap-1">
                             <button onClick={() => onSelectMatch(m)} className="flex-1 bg-white text-black py-1.5 rounded-md text-[7px] font-black uppercase">CONTROL</button>
                             <button onClick={() => setPosterMatch(m)} className="bg-indigo-600/20 text-indigo-400 px-2 rounded-md text-[7px] font-black">POSTER</button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {activeTab === 'torneos' && (
             <>
               <button onClick={() => { setEditingItem(null); setTempImage(''); setShowTournamentModal(true); }} className="h-48 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-indigo-500 hover:text-indigo-400 transition-all">
                  <span className="text-3xl">+</span>
                  <span className="text-[9px] font-black uppercase tracking-widest italic">NUEVO TORNEO</span>
               </button>
               {tournaments.map(t => (
                 <div key={t.id} className="bg-slate-900/60 p-5 rounded-[2rem] border border-white/5 flex flex-col items-center gap-3 relative group">
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingItem({ type: 'TOURNAMENT', data: t }); setTempImage(t.logoUrl); setShowTournamentModal(true); }} className="p-1.5 bg-slate-800 rounded-lg text-indigo-400">✎</button>
                      <button onClick={() => { if(confirm("¿Eliminar?")) setTournaments(prev => prev.filter(it => it.id !== t.id)) }} className="p-1.5 bg-slate-800 rounded-lg text-red-500">×</button>
                    </div>
                    <img src={t.logoUrl} className="w-20 h-20 object-contain drop-shadow-xl" />
                    <h4 className="font-black text-white italic uppercase text-center text-sm">{t.name}</h4>
                    <button onClick={() => setSelectedTournamentId(t.id)} className="w-full bg-indigo-600 py-2.5 rounded-xl text-[9px] font-black uppercase">GESTIONAR</button>
                 </div>
               ))}
             </>
           )}
           {activeTab === 'equipos' && (
             <>
               <button onClick={() => { setEditingItem(null); setTempImage(''); setShowTeamModal(true); }} className="h-48 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-indigo-500 hover:text-indigo-400 transition-all">
                  <span className="text-3xl">+</span>
                  <span className="text-[9px] font-black uppercase tracking-widest italic">NUEVO EQUIPO</span>
               </button>
               {teams.map(t => (
                 <div key={t.id} className="bg-slate-900/60 p-5 rounded-[2rem] border border-white/5 flex flex-col items-center gap-3 relative group">
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingItem({ type: 'TEAM', data: t }); setTempImage(t.logoUrl); setShowTeamModal(true); }} className="p-1.5 bg-slate-800 rounded-lg text-indigo-400">✎</button>
                      <button onClick={() => { if(confirm("¿Eliminar?")) setTeams(prev => prev.filter(it => it.id !== t.id)) }} className="p-1.5 bg-slate-800 rounded-lg text-red-500">×</button>
                    </div>
                    <img src={t.logoUrl} className="w-16 h-16 object-contain drop-shadow-lg" />
                    <h4 className="font-black text-white italic uppercase text-center text-sm">{t.name}</h4>
                    <button onClick={() => { setSelectedTeamId(t.id); setTempImage(''); setShowPlayerModal(true); }} className="w-full bg-slate-950 py-2.5 rounded-xl text-[9px] font-black uppercase text-indigo-400 border border-indigo-900/50">PLANTILLA ({t.players.length})</button>
                 </div>
               ))}
             </>
           )}
        </div>
      )}

      {showSponsorModal && selectedTournament && (
        <ModalContainer title="Gestión de Auspiciadores" onClose={() => setShowSponsorModal(false)}>
          <form onSubmit={handleSaveSponsor} className="space-y-4 mb-6">
            <div className="flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
              <div className="w-16 h-16 bg-slate-950 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                {tempImage ? <img src={tempImage} className="w-full h-full object-contain" /> : <span className="text-slate-800 text-[9px] font-black uppercase">LOGO</span>}
              </div>
              <input type="file" accept="image/*" onChange={(e) => e.target.files && processImage(e.target.files[0], 200)} className="hidden" id="sp-img" />
              <label htmlFor="sp-img" className="bg-white text-indigo-950 px-4 py-2 rounded-lg text-[9px] font-black cursor-pointer uppercase">Cargar Logo</label>
            </div>
            <input name="name" required className="w-full bg-slate-950 p-3 rounded-xl border border-white/10 outline-none text-xs font-black uppercase text-white" placeholder="NOMBRE DE LA EMPRESA" />
            <button type="submit" className="w-full bg-indigo-600 py-4 rounded-xl font-black text-[10px] uppercase shadow-lg tracking-widest">AÑADIR PATROCINADOR</button>
          </form>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
            {selectedTournament.sponsors.map(s => (
              <div key={s.id} className="bg-black/40 p-3 rounded-xl flex items-center justify-between border border-white/5">
                <img src={s.logoUrl} className="h-6 w-auto object-contain" />
                <button onClick={() => setTournaments(prev => prev.map(t => t.id === selectedTournamentId ? { ...t, sponsors: t.sponsors.filter(it => it.id !== s.id) } : t))} className="text-red-500 font-black">×</button>
              </div>
            ))}
          </div>
        </ModalContainer>
      )}

      {showTournamentModal && (
        <ModalContainer title={editingItem ? "Editar Torneo" : "Nuevo Torneo"} onClose={() => setShowTournamentModal(false)}>
          <form onSubmit={handleSaveTournament} className="space-y-4">
            <div className="flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
              <div className="w-16 h-16 bg-slate-950 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                {tempImage ? <img src={tempImage} className="w-full h-full object-contain" /> : <span className="text-slate-800 text-[9px] font-black uppercase">LOGO</span>}
              </div>
              <input type="file" accept="image/*" onChange={(e) => e.target.files && processImage(e.target.files[0], 200)} className="hidden" id="tour-img" />
              <label htmlFor="tour-img" className="bg-white text-indigo-950 px-4 py-2 rounded-lg text-[9px] font-black cursor-pointer uppercase">Cargar Imagen</label>
            </div>
            <input name="name" defaultValue={editingItem?.data.name} required className="w-full bg-slate-950 p-3 rounded-xl border border-white/10 outline-none text-xs font-black uppercase text-white" placeholder="NOMBRE DEL TORNEO" />
            <div className="grid grid-cols-2 gap-3">
               <input name="startDate" type="date" defaultValue={editingItem?.data.startDate} className="bg-slate-950 p-3 rounded-xl border border-white/10 text-xs font-bold text-white" />
               <input name="location" defaultValue={editingItem?.data.location} className="bg-slate-950 p-3 rounded-xl border border-white/10 text-xs font-black uppercase text-white" placeholder="SEDE" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 py-4 rounded-xl font-black text-[10px] uppercase shadow-lg tracking-widest">GUARDAR TORNEO</button>
          </form>
        </ModalContainer>
      )}

      {showTeamModal && (
        <ModalContainer title={editingItem ? "Editar Equipo" : "Nuevo Equipo"} onClose={() => setShowTeamModal(false)}>
          <form onSubmit={handleSaveTeam} className="space-y-4">
            <div className="flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
              <div className="w-16 h-16 bg-slate-950 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                {tempImage ? <img src={tempImage} className="w-full h-full object-contain" /> : <span className="text-slate-800 text-[9px] font-black uppercase">ESCUDO</span>}
              </div>
              <input type="file" accept="image/*" onChange={(e) => e.target.files && processImage(e.target.files[0], 200)} className="hidden" id="team-img" />
              <label htmlFor="team-img" className="bg-white text-indigo-950 px-4 py-2 rounded-lg text-[9px] font-black cursor-pointer uppercase">Cargar Escudo</label>
            </div>
            <input name="name" defaultValue={editingItem?.data.name} required className="w-full bg-slate-950 p-3 rounded-xl border border-white/10 outline-none text-xs font-black uppercase text-white" placeholder="NOMBRE DEL EQUIPO" />
            <input name="delegate" defaultValue={editingItem?.data.delegate} className="w-full bg-slate-950 p-3 rounded-xl border border-white/10 outline-none text-xs font-black uppercase text-white" placeholder="DELEGADO" />
            <button type="submit" className="w-full bg-indigo-600 py-4 rounded-xl font-black text-[10px] uppercase shadow-lg tracking-widest">REGISTRAR EQUIPO</button>
          </form>
        </ModalContainer>
      )}

      {showPlayerModal && selectedTeam && (
        <ModalContainer title={`Jugadores - ${selectedTeam.name}`} onClose={() => { setShowPlayerModal(false); setEditingItem(null); setSelectedTeamId(null); }}>
          <form onSubmit={handleSavePlayer} className="space-y-4 mb-8 pb-6 border-b border-white/10">
            <div className="grid grid-cols-2 gap-3">
              <input name="name" defaultValue={editingItem?.type === 'PLAYER' ? editingItem.data.name : ''} required className="bg-slate-950 p-3 rounded-xl border border-white/10 text-xs font-black uppercase text-white" placeholder="NOMBRE" />
              <input name="number" type="number" defaultValue={editingItem?.type === 'PLAYER' ? editingItem.data.number : ''} required className="bg-slate-950 p-3 rounded-xl border border-white/10 text-xs font-black text-white" placeholder="Nº" />
            </div>
            <select name="position" defaultValue={editingItem?.type === 'PLAYER' ? editingItem.data.position : 'OH'} className="w-full bg-slate-950 p-3 rounded-xl border border-white/10 text-xs font-black uppercase text-white">
              <option value="OH">OH - PUNTA</option>
              <option value="OP">OP - OPUESTO</option>
              <option value="MB">MB - CENTRAL</option>
              <option value="S">S - ARMADOR</option>
              <option value="L">L - LÍBERO</option>
            </select>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={(e) => e.target.files && processImage(e.target.files[0], 200)} className="hidden" id="p-img" ref={fileInputRef} />
              <label htmlFor="p-img" className="bg-slate-800 text-white px-4 py-1.5 rounded-lg text-[8px] font-black cursor-pointer uppercase">Cargar Foto</label>
              {tempImage && <img src={tempImage} className="w-8 h-8 rounded-full object-cover" />}
            </div>
            <button type="submit" className="w-full bg-white text-indigo-950 py-3 rounded-xl font-black text-[9px] uppercase shadow-lg">
              {editingItem ? 'ACTUALIZAR JUGADOR' : '+ AÑADIR JUGADOR'}
            </button>
            {editingItem && <button type="button" onClick={() => { setEditingItem(null); setTempImage(''); }} className="w-full text-red-500 text-[8px] font-black uppercase">CANCELAR EDICIÓN</button>}
          </form>

          <div className="space-y-2">
            {selectedTeam.players.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 group">
                <div className="flex items-center gap-3">
                  <img src={p.imageUrl} className="w-9 h-9 rounded-full object-cover border border-white/10" />
                  <div>
                    <p className="text-white text-[10px] font-black uppercase tracking-tight">#{p.number} {p.name}</p>
                    <p className="text-[8px] text-indigo-400 font-bold uppercase tracking-widest">{p.position}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => { setEditingItem({ type: 'PLAYER', data: p }); setTempImage(p.imageUrl); }} className="p-1.5 bg-slate-800 rounded-lg text-indigo-400">✎</button>
                   <button onClick={() => { if(confirm("¿Eliminar jugador?")) setTeams(prev => prev.map(t => t.id === selectedTeamId ? { ...t, players: t.players.filter(it => it.id !== p.id) } : t)) }} className="p-1.5 bg-slate-800 rounded-lg text-red-500">×</button>
                </div>
              </div>
            ))}
          </div>
        </ModalContainer>
      )}

      {showGroupModal && (
        <ModalContainer title="Nuevo Grupo" onClose={() => setShowGroupModal(false)}>
           <form onSubmit={(e) => {
             e.preventDefault();
             const name = new FormData(e.currentTarget).get('name') as string;
             const newGr: Group = { id: 'g-' + Math.random().toString(36).substring(2, 9), name: name.toUpperCase(), teams: [], matches: [] };
             setTournaments(prev => prev.map(t => t.id === selectedTournamentId ? { ...t, groups: [...t.groups, newGr] } : t));
             setShowGroupModal(false);
           }} className="space-y-4">
              <input name="name" required className="w-full bg-slate-950 p-4 rounded-xl border border-white/10 outline-none font-black uppercase text-center text-lg text-white" placeholder="GRUPO A" />
              <button type="submit" className="w-full bg-indigo-600 py-4 rounded-xl text-white font-black text-[10px] uppercase">CREAR GRUPO</button>
           </form>
        </ModalContainer>
      )}
    </div>
  );
};
