
import React, { useState, useRef } from 'react';
import { Team, Tournament, Player, Position, Group, Match, User, UserRole, Sponsor } from '../types';
import { VersusPoster } from '../components/VersusPoster';
import { GroupPoster } from '../components/GroupPoster';
import { TournamentPoster } from '../components/TournamentPoster';
import { FixturePoster } from '../components/FixturePoster';
import { ParticipantsPoster } from '../components/ParticipantsPoster';

interface AdminDashboardProps {
  tournaments: Tournament[];
  setTournaments: (t: Tournament[]) => void;
  teams: Team[];
  setTeams: (t: Team[]) => void;
  users: User[];
  setUsers: (u: User[]) => void;
  onSelectMatch: (m: Match) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  tournaments, setTournaments, teams, setTeams, users, setUsers, onSelectMatch 
}) => {
  const [activeTab, setActiveTab] = useState<'torneos' | 'equipos' | 'usuarios'>('torneos');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  // Modals
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [posterMatch, setPosterMatch] = useState<Match | null>(null);
  const [posterGroup, setPosterGroup] = useState<Group | null>(null);
  const [posterTournament, setPosterTournament] = useState<Tournament | null>(null);
  const [posterFixture, setPosterFixture] = useState<Tournament | null>(null);
  const [posterParticipants, setPosterParticipants] = useState<Tournament | null>(null);
  
  const [editingItem, setEditingItem] = useState<{ type: string, data: any } | null>(null);
  const [tempImage, setTempImage] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (base64Str: string, maxWidth = 300, maxHeight = 300): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
        } else {
          if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressed = await compressImage(reader.result as string);
          setTempImage(compressed);
        } catch (err) {
          console.error("Error comprimiendo imagen", err);
          setTempImage(reader.result as string);
        } finally {
          setIsProcessingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const closeModals = () => {
    setShowTeamModal(false);
    setShowTournamentModal(false);
    setShowPlayerModal(false);
    setShowGroupModal(false);
    setShowSponsorModal(false);
    setEditingItem(null);
    setTempImage('');
    setIsProcessingImage(false);
  };

  const updateMatchInfo = (matchId: string, field: 'date' | 'time', value: string) => {
    if (!selectedTournament) return;
    const updatedTournaments = tournaments.map(t => {
      if (t.id === selectedTournament.id) {
        return {
          ...t,
          groups: t.groups.map(g => ({
            ...g,
            matches: g.matches.map(m => m.id === matchId ? { ...m, [field]: value } : m)
          }))
        };
      }
      return t;
    });
    setTournaments(updatedTournaments);
    const updatedSelected = updatedTournaments.find(t => t.id === selectedTournament.id);
    if (updatedSelected) setSelectedTournament(updatedSelected);
  };

  const handleAddTournament = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const startDate = formData.get('startDate') as string;
    const location = formData.get('location') as string;
    if (!name) return alert("El nombre es obligatorio");

    const tourData: Tournament = {
      id: editingItem?.data?.id || Math.random().toString(36).substring(2, 9),
      name: name.toUpperCase(),
      startDate: startDate,
      location: location,
      logoUrl: tempImage || editingItem?.data?.logoUrl || `https://picsum.photos/seed/${Math.random()}/400`,
      groups: editingItem?.data?.groups || [],
      sponsors: editingItem?.data?.sponsors || []
    };

    if (editingItem) {
      setTournaments(tournaments.map(t => t.id === tourData.id ? tourData : t));
    } else {
      setTournaments([...tournaments, tourData]);
    }
    closeModals();
  };

  const handleAddSponsor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTournament) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    if (!name || !tempImage) return alert("Nombre y logo son obligatorios");

    const newSponsor: Sponsor = {
      id: Math.random().toString(36).substring(2, 9),
      name: name,
      logoUrl: tempImage
    };

    const updatedTour = { ...selectedTournament, sponsors: [...(selectedTournament.sponsors || []), newSponsor] };
    setTournaments(tournaments.map(t => t.id === selectedTournament.id ? updatedTour : t));
    setSelectedTournament(updatedTour);
    closeModals();
  };

  const removeSponsor = (sponsorId: string) => {
    if (!selectedTournament) return;
    const updatedSponsors = selectedTournament.sponsors.filter(s => s.id !== sponsorId);
    const updatedTour = { ...selectedTournament, sponsors: updatedSponsors };
    setTournaments(tournaments.map(t => t.id === selectedTournament.id ? updatedTour : t));
    setSelectedTournament(updatedTour);
  };

  const handleAddTeam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const delegate = formData.get('delegate') as string;
    if (!name || !delegate) return alert("Nombre y delegado son obligatorios");

    const teamData: Team = {
      id: editingItem?.data?.id || Math.random().toString(36).substring(2, 9),
      name: name.toUpperCase(),
      delegate: delegate,
      logoUrl: tempImage || editingItem?.data?.logoUrl || `https://picsum.photos/seed/${Math.random()}/300`,
      players: editingItem?.data?.players || [],
      captainId: editingItem?.data?.captainId || ''
    };

    if (editingItem) {
      setTeams(teams.map(t => t.id === teamData.id ? teamData : t));
    } else {
      setTeams([...teams, teamData]);
    }
    closeModals();
  };

  const handleAddPlayer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeam) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const number = parseInt(formData.get('number') as string);
    if (!name || isNaN(number)) return alert("Datos de jugador incompletos");

    const playerData: Player = {
      id: editingItem?.data?.id || Math.random().toString(36).substring(2, 9),
      name: name,
      number: number,
      position: formData.get('position') as Position,
      imageUrl: tempImage || editingItem?.data?.imageUrl || `https://picsum.photos/seed/${Math.random()}/200`,
      stats: editingItem?.data?.stats || { attacks: 0, blocks: 0, aces: 0, errors: 0, totalPoints: 0 }
    };

    const updatedPlayers = editingItem 
      ? selectedTeam.players.map(p => p.id === playerData.id ? playerData : p) 
      : [...selectedTeam.players, playerData];
    
    const updatedTeam = { ...selectedTeam, players: updatedPlayers };
    setTeams(teams.map(t => t.id === selectedTeam.id ? updatedTeam : t));
    setSelectedTeam(updatedTeam);
    closeModals();
  };

  const handleAddGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTournament) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    if (!name) return alert("Nombre de grupo requerido");

    const newGroup: Group = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.toUpperCase(),
      teams: [],
      matches: []
    };

    const updatedTour = { ...selectedTournament, groups: [...selectedTournament.groups, newGroup] };
    setTournaments(tournaments.map(t => t.id === selectedTournament.id ? updatedTour : t));
    setSelectedTournament(updatedTour);
    closeModals();
  };

  const addTeamToGroup = (groupId: string, teamId: string) => {
    if (!selectedTournament) return;
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    const updatedGroups = selectedTournament.groups.map(g => {
      if (g.id === groupId) {
        if (g.teams.find(t => t.id === teamId)) return g;
        return { ...g, teams: [...g.teams, team] };
      }
      return g;
    });
    const updatedTour = { ...selectedTournament, groups: updatedGroups };
    setTournaments(tournaments.map(t => t.id === selectedTournament.id ? updatedTour : t));
    setSelectedTournament(updatedTour);
  };

  const generateFixture = (groupId: string) => {
    if (!selectedTournament) return;
    const group = selectedTournament.groups.find(g => g.id === groupId);
    if (!group || group.teams.length < 2) { alert("Mínimo 2 equipos por grupo para generar encuentros."); return; }
    
    const matches: Match[] = [];
    for (let i = 0; i < group.teams.length; i++) {
      for (let j = i + 1; j < group.teams.length; j++) {
        matches.push({
          id: Math.random().toString(36).substring(2, 9),
          teamA: group.teams[i],
          teamB: group.teams[j],
          currentSet: 1,
          sets: [{ teamAScore: 0, teamBScore: 0 }],
          status: 'SCHEDULED',
          date: new Date().toISOString().split('T')[0],
          time: '18:00',
          rotationA: group.teams[i].players.slice(0, 6).map(p => p.id),
          rotationB: group.teams[j].players.slice(0, 6).map(p => p.id),
          timeoutsA: 3,
          timeoutsB: 3,
          subsA: 3,
          subsB: 3,
          activeOverlay: 'NONE'
        });
      }
    }
    const updatedGroups = selectedTournament.groups.map(g => g.id === groupId ? { ...g, matches } : g);
    const updatedTour = { ...selectedTournament, groups: updatedGroups };
    setTournaments(tournaments.map(t => t.id === selectedTournament.id ? updatedTour : t));
    setSelectedTournament(updatedTour);
  };

  return (
    <div className="p-3 md:p-6 max-w-full mx-auto space-y-4 md:space-y-6 overflow-x-hidden">
      {posterMatch && (
        <VersusPoster 
          match={posterMatch} 
          tournament={selectedTournament!}
          onClose={() => setPosterMatch(null)} 
        />
      )}
      {posterGroup && selectedTournament && (
        <GroupPoster 
          group={posterGroup}
          tournament={selectedTournament}
          onClose={() => setPosterGroup(null)}
        />
      )}
      {posterTournament && (
        <TournamentPoster 
          tournament={posterTournament}
          onClose={() => setPosterTournament(null)}
        />
      )}
      {posterFixture && (
        <FixturePoster 
          tournament={posterFixture}
          onClose={() => setPosterFixture(null)}
        />
      )}
      {posterParticipants && (
        <ParticipantsPoster 
          tournament={posterParticipants}
          onClose={() => setPosterParticipants(null)}
        />
      )}
      
      {/* HEADER DE SECCIÓN */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4 md:px-10">
        <div>
          <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter leading-none animate-pop text-white">
            {selectedTournament ? (
              <button onClick={() => setSelectedTournament(null)} className="flex items-center gap-2 md:gap-3 hover:text-indigo-400 transition-colors">
                <svg className="w-5 h-5 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M15 19l-7-7 7-7" /></svg>
                {selectedTournament.name}
              </button>
            ) : (
              <>ADMIN <span className="text-indigo-500 text-shadow-glow">PRO</span></>
            )}
          </h2>
          <p className="text-slate-500 mt-1 font-black uppercase tracking-widest text-[7px] md:text-[9px] italic">CONSOLA CENTRAL JSPORT</p>
        </div>
        
        {!selectedTournament && (
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/5 shadow-xl backdrop-blur-xl w-full md:w-auto">
            {['torneos', 'equipos', 'usuarios'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab as any)} 
                className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-[8px] md:text-[9px] font-black transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </header>

      {selectedTournament ? (
        <div className="space-y-4 md:space-y-6 animate-pop px-4 md:px-0">
          {/* Barra de control del torneo seleccionado */}
          <div className="bg-slate-900/80 backdrop-blur-md p-4 md:p-5 rounded-[2rem] border border-white/10 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-xl md:mx-10">
             <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="bg-white/5 p-1.5 rounded-xl border border-white/10 shadow-inner">
                  <img src={selectedTournament.logoUrl} className="w-10 h-10 md:w-14 md:h-14 rounded-lg object-contain" />
                </div>
                <div>
                   <h3 className="text-sm md:text-lg font-black uppercase italic tracking-tighter text-white leading-tight">Gestión de Torneo</h3>
                   <div className="flex gap-4 mt-0.5 opacity-60">
                      <span className="font-black text-[7px] md:text-[8px] uppercase tracking-widest text-indigo-400">{selectedTournament.groups.length} GRUPOS ACTIVOS</span>
                   </div>
                </div>
             </div>
             
             {/* Botones de acción del torneo - Stacked on Mobile */}
             <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full lg:w-auto">
                <button 
                  onClick={() => setShowSponsorModal(true)}
                  className="bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 px-3 py-2.5 rounded-xl font-black text-[7px] md:text-[8px] hover:bg-emerald-600 hover:text-white uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-1.5"
                >
                   SPONSORS
                </button>
                <button 
                  onClick={() => setPosterParticipants(selectedTournament)} 
                  className="bg-white/5 text-white/70 border border-white/10 px-3 py-2.5 rounded-xl font-black text-[7px] md:text-[8px] hover:bg-white/20 uppercase tracking-widest shadow-xl flex items-center justify-center"
                >
                   POSTER GRAL
                </button>
                <div className="flex flex-col gap-1 col-span-1">
                  <button 
                    onClick={() => setPosterTournament(selectedTournament)}
                    className="flex-1 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg font-black text-[7px] hover:bg-indigo-600 hover:text-white uppercase tracking-widest transition-all"
                  >
                     POSTER GRUPOS
                  </button>
                  <button 
                    onClick={() => setPosterFixture(selectedTournament)}
                    className="flex-1 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg font-black text-[7px] hover:bg-indigo-600 hover:text-white uppercase tracking-widest transition-all"
                  >
                     POSTER FIXTURE
                  </button>
                </div>
                <button onClick={() => setShowGroupModal(true)} className="bg-indigo-600 px-4 py-2.5 rounded-xl font-black text-[8px] md:text-[9px] hover:bg-indigo-500 uppercase tracking-widest shadow-xl text-white">+ GRUPO</button>
             </div>
          </div>

          {/* LISTA HORIZONTAL DE GRUPOS */}
          <div className="flex flex-nowrap overflow-x-auto gap-4 md:gap-6 pb-6 px-4 md:px-12 custom-scrollbar scroll-smooth">
            <div className="w-1 shrink-0"></div>
            
            {selectedTournament.groups.map(group => (
              <div key={group.id} className="w-[280px] md:w-[340px] shrink-0 bg-slate-900/70 backdrop-blur-2xl rounded-[2.2rem] border border-white/10 overflow-hidden flex flex-col h-[520px] md:h-[640px] shadow-2xl transition-all hover:border-indigo-500/30">
                <div className="bg-slate-900/90 p-4 flex justify-between items-center border-b border-white/5">
                   <div className="flex items-center gap-2">
                      <h4 className="font-black text-xs md:text-base uppercase italic tracking-tighter text-white">{group.name}</h4>
                      <button onClick={() => setPosterGroup(group)} className="p-1.5 bg-indigo-600/10 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                      </button>
                   </div>
                   <button onClick={() => generateFixture(group.id)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors">FIXTURE</button>
                </div>
                
                <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                  {/* Selección de Equipos */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                       <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">EQUIPOS</p>
                       <select 
                          onChange={(e) => { if(e.target.value) addTeamToGroup(group.id, e.target.value); e.target.value = ""; }} 
                          className="bg-slate-950 border border-white/10 text-[7px] font-black rounded px-2 py-1 outline-none uppercase text-white shadow-inner"
                        >
                        <option value="">+ AÑADIR</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {group.teams.map(t => (
                        <div key={t.id} className="bg-slate-950/60 border border-white/5 px-2 py-2 rounded-xl flex items-center justify-between group/titem shadow-inner backdrop-blur-sm">
                          <div className="flex items-center gap-2 overflow-hidden">
                             <img src={t.logoUrl} className="w-4 h-4 rounded object-contain" />
                             <span className="text-[7px] font-black uppercase italic text-white/90 truncate">{t.name}</span>
                          </div>
                          <button onClick={() => {
                            const updatedGroups = selectedTournament.groups.map(g => g.id === group.id ? { ...g, teams: g.teams.filter(it => it.id !== t.id) } : g);
                            const updatedTour = { ...selectedTournament, groups: updatedGroups };
                            setTournaments(tournaments.map(tour => tour.id === selectedTournament.id ? updatedTour : tour));
                            setSelectedTournament(updatedTour);
                          }} className="text-red-500 hover:text-red-400 p-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lista de Partidos */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">PARTIDOS GENERADOS</p>
                    {group.matches.map(m => (
                      <div key={m.id} className="bg-slate-950/50 border border-white/5 p-3 rounded-2xl flex flex-col gap-3 transition-all hover:bg-slate-950 shadow-lg">
                         <div className="flex items-center justify-between px-1">
                            <div className="flex flex-col items-center gap-1 w-20 text-center">
                               <img src={m.teamA.logoUrl} className="w-6 h-6 rounded-lg object-contain bg-white/5 p-1" />
                               <span className="font-black text-[7px] uppercase italic text-white/80 leading-tight truncate w-full">{m.teamA.name}</span>
                            </div>
                            <span className="text-[8px] font-black text-indigo-500 italic">VS</span>
                            <div className="flex flex-col items-center gap-1 w-20 text-center">
                               <img src={m.teamB.logoUrl} className="w-6 h-6 rounded-lg object-contain bg-white/5 p-1" />
                               <span className="font-black text-[7px] uppercase italic text-white/80 leading-tight truncate w-full">{m.teamB.name}</span>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                            <input type="date" value={m.date} onChange={(e) => updateMatchInfo(m.id, 'date', e.target.value)} className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-[7px] font-black text-white outline-none w-full" />
                            <input type="time" value={m.time} onChange={(e) => updateMatchInfo(m.id, 'time', e.target.value)} className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-[7px] font-black text-white outline-none w-full" />
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => setPosterMatch(m)} className="flex-1 bg-white/5 border border-white/5 py-2.5 rounded-xl font-black text-[7px] uppercase tracking-widest hover:bg-indigo-600 transition-all">POSTER</button>
                            <button onClick={() => onSelectMatch(m)} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-black text-[7px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl">DIRIGIR</button>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => setShowGroupModal(true)}
              className="w-[280px] shrink-0 bg-slate-900/20 border-3 border-dashed border-slate-800 rounded-[2.2rem] flex flex-col items-center justify-center gap-3 hover:border-indigo-500/50 hover:bg-slate-900/40 transition-all group p-8"
            >
               <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                  <svg className="w-6 h-6 text-slate-600 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg>
               </div>
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest group-hover:text-white">AÑADIR GRUPO</span>
            </button>

            <div className="w-10 shrink-0"></div>
          </div>
        </div>
      ) : (
        <div className="animate-pop px-4 md:px-10">
          {activeTab === 'torneos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl backdrop-blur-sm gap-4">
                <div className="text-center sm:text-left">
                   <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white leading-none">Torneos Activos</h3>
                   <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Panel de gestión de ligas</p>
                </div>
                <button 
                  onClick={() => { setEditingItem(null); setTempImage(''); setShowTournamentModal(true); }} 
                  className="w-full sm:w-auto bg-indigo-600 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] hover:bg-indigo-500 shadow-2xl text-white uppercase tracking-widest transition-transform hover:scale-105 active:scale-95"
                >
                  + NUEVO TORNEO
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 mt-6">
                {tournaments.map(t => (
                  <div key={t.id} className="bg-slate-900/60 backdrop-blur-sm border border-white/10 p-6 rounded-[2rem] hover:border-indigo-500/50 group relative transition-all shadow-xl hover:-translate-y-1">
                    <div className="absolute top-4 right-4 flex gap-2">
                       <button onClick={(e) => { e.stopPropagation(); setEditingItem({ type: 'tournament', data: t }); setTempImage(t.logoUrl); setShowTournamentModal(true); }} className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600 active:bg-indigo-700 transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                       <button onClick={(e) => { e.stopPropagation(); if(confirm("¿Eliminar torneo?")) setTournaments(tournaments.filter(it => it.id !== t.id)) }} className="p-2 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                    <div className="w-14 h-14 bg-white/5 p-2 rounded-2xl mb-4 flex items-center justify-center shadow-inner">
                       <img src={t.logoUrl} className="w-full h-full object-contain" />
                    </div>
                    <h4 className="text-lg font-black uppercase italic tracking-tighter mb-4 text-white leading-tight">{t.name}</h4>
                    <button onClick={() => setSelectedTournament(t)} className="w-full bg-slate-950/80 border border-white/10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all text-white shadow-xl active:scale-95">ABRIR SISTEMA</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'equipos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-white/5 gap-4">
                <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white leading-none">Plantillas de Equipos</h3>
                <button 
                  onClick={() => { setEditingItem(null); setTempImage(''); setShowTeamModal(true); }} 
                  className="w-full sm:w-auto bg-indigo-600 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] hover:bg-indigo-500 shadow-2xl uppercase tracking-widest text-white transition-transform hover:scale-105 active:scale-95"
                >
                  + NUEVO EQUIPO
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
                {teams.map(team => (
                  <div key={team.id} className="bg-slate-900/50 rounded-[2rem] border border-white/5 overflow-hidden flex flex-col group relative transition-all hover:border-indigo-500 shadow-xl">
                    <div className="h-16 bg-gradient-to-br from-indigo-900/40 to-slate-950 relative">
                       <img src={team.logoUrl} className="w-12 h-12 rounded-2xl absolute -bottom-4 left-5 border-4 border-slate-950 shadow-2xl object-cover bg-transparent p-1 bg-white" />
                    </div>
                    <div className="p-5 pt-8 flex-1 flex flex-col">
                      <h4 className="font-black text-base uppercase italic mb-0.5 text-white leading-none truncate">{team.name}</h4>
                      <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-4 italic truncate">DLG: {team.delegate}</p>
                      <button onClick={() => { setSelectedTeam(team); setEditingItem(null); setTempImage(''); setShowPlayerModal(true); }} className="w-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 py-2.5 rounded-xl text-[8px] font-black uppercase mb-4 hover:bg-indigo-600 hover:text-white transition-all active:scale-95">+ JUGADOR</button>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                        {team.players.map(p => (
                          <div key={p.id} className="flex items-center justify-between bg-slate-950/40 p-2 rounded-xl border border-white/5">
                             <div className="flex items-center gap-2 overflow-hidden">
                                <span className="text-[8px] font-black italic text-indigo-500">#{p.number}</span>
                                <span className="text-[9px] font-bold uppercase truncate text-white/80">{p.name}</span>
                             </div>
                             <button onClick={() => {
                               const updatedPlayers = team.players.filter(it => it.id !== p.id);
                               setTeams(teams.map(it => it.id === team.id ? {...team, players: updatedPlayers} : it));
                             }} className="text-red-500 p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL AUSPICIADORES - Optimizado para Touch */}
      {showSponsorModal && selectedTournament && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 animate-pop shadow-2xl flex flex-col max-h-[95vh]">
            <h3 className="text-xl md:text-2xl font-black mb-6 uppercase italic tracking-tighter text-emerald-500 text-center">GESTIÓN SPONSORS</h3>
            
            <form onSubmit={handleAddSponsor} className="space-y-4 mb-6 bg-slate-950 p-4 rounded-[2rem] border border-white/5">
              <div className="flex items-center gap-3">
                 <div className="w-16 h-16 shrink-0 bg-slate-900 rounded-2xl border border-dashed border-white/20 flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-all" onClick={() => fileInputRef.current?.click()}>
                    {tempImage ? <img src={tempImage} className="w-full h-full object-contain" /> : <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>}
                 </div>
                 <div className="flex-1 space-y-2">
                    <input name="name" required placeholder="NOMBRE MARCA" className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white font-black uppercase outline-none focus:border-emerald-500 shadow-inner" />
                    <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">AÑADIR</button>
                 </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </form>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
               {selectedTournament.sponsors?.map(s => (
                 <div key={s.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                       <img src={s.logoUrl} className="w-10 h-10 object-contain rounded-xl bg-white/5 p-1" />
                       <span className="text-[10px] font-black text-white uppercase italic">{s.name}</span>
                    </div>
                    <button onClick={() => removeSponsor(s.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-xl transition-all">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                 </div>
               ))}
            </div>

            <button onClick={closeModals} className="mt-6 w-full bg-slate-950 py-4 rounded-2xl font-black text-[10px] uppercase text-slate-500 hover:text-white transition-all active:scale-95">CERRAR</button>
          </div>
        </div>
      )}

      {/* Otros Modales (Simplificados para no repetir código innecesariamente pero con ajustes móviles) */}
      {showTournamentModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <form onSubmit={handleAddTournament} className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[2.5rem] p-6 animate-pop shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black mb-6 uppercase italic tracking-tighter text-indigo-500 text-center">CONFIGURAR TORNEO</h3>
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 bg-slate-950 p-4 rounded-[2rem] border border-white/5">
                <div className="w-24 h-24 bg-white rounded-2xl border border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer relative active:scale-95 transition-all" onClick={() => fileInputRef.current?.click()}>
                  {isProcessingImage ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div> : tempImage ? <img src={tempImage} className="w-full h-full object-contain p-2" /> : <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
              </div>
              <input name="name" required placeholder="NOMBRE COMPETICIÓN" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs text-white font-black uppercase outline-none focus:border-indigo-500 shadow-inner" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <input name="startDate" type="text" placeholder="INICIO (EJ: 20 DIC)" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs text-white font-bold outline-none focus:border-indigo-500" />
                 <input name="location" type="text" placeholder="LUGAR / SEDE" className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs text-white font-bold outline-none focus:border-indigo-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModals} className="flex-1 bg-slate-950 py-4 rounded-2xl font-black text-[10px] uppercase text-slate-500 shadow-xl active:scale-95 transition-all">SALIR</button>
                <button type="submit" disabled={isProcessingImage} className="flex-1 bg-indigo-600 py-4 rounded-2xl font-black text-[10px] uppercase text-white shadow-xl hover:bg-indigo-500 active:scale-95 transition-all">GUARDAR</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .text-shadow-glow { text-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
      `}</style>
    </div>
  );
};
