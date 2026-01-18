
import React, { useState } from 'react';
import { Match, Player, OverlayType } from '../types';

interface MatchConsoleProps {
  match: Match;
  onUpdateMatch: (match: Match) => void;
  onGoToLive: () => void;
}

export const MatchConsole: React.FC<MatchConsoleProps> = ({ match, onUpdateMatch, onGoToLive }) => {
  const [scoringTeam, setScoringTeam] = useState<'A' | 'B' | null>(null);
  const [selectedAction, setSelectedAction] = useState<'ATTACK' | 'BLOCK' | 'SERVE' | 'ERROR' | null>(null);

  const handleScore = (team: 'A' | 'B', playerId: string, type: 'ATTACK' | 'BLOCK' | 'SERVE' | 'ERROR') => {
    const updatedMatch = { ...match };
    const setIdx = updatedMatch.currentSet - 1;
    if (!updatedMatch.sets[setIdx]) updatedMatch.sets[setIdx] = { teamAScore: 0, teamBScore: 0 };

    // El punto se suma al equipo que hizo la acción (o al rival si fue error)
    if (type !== 'ERROR') {
      if (team === 'A') updatedMatch.sets[setIdx].teamAScore += 1;
      else updatedMatch.sets[setIdx].teamBScore += 1;
    } else {
      // Si el equipo "team" cometió un error, el punto va al otro
      if (team === 'A') updatedMatch.sets[setIdx].teamBScore += 1;
      else updatedMatch.sets[setIdx].teamAScore += 1;
    }

    const targetTeam = team === 'A' ? updatedMatch.teamA : updatedMatch.teamB;
    const player = targetTeam.players.find(p => p.id === playerId);
    
    if (player) {
      if (type === 'ATTACK') player.stats.attacks += 1;
      if (type === 'BLOCK') player.stats.blocks += 1;
      if (type === 'SERVE') player.stats.aces += 1;
      if (type === 'ERROR') player.stats.errors += 1;
      if (type !== 'ERROR') player.stats.totalPoints += 1;
    }

    updatedMatch.lastPointType = type;
    updatedMatch.lastPointTeam = type === 'ERROR' ? (team === 'A' ? 'B' : 'A') : team;
    updatedMatch.lastPointPlayerId = playerId;
    
    onUpdateMatch(updatedMatch);
    resetScoring();
  };

  const resetScoring = () => {
    setScoringTeam(null);
    setSelectedAction(null);
  };

  const setOverlay = (overlay: OverlayType) => {
    onUpdateMatch({ ...match, activeOverlay: overlay === match.activeOverlay ? 'NONE' : overlay });
  };

  const getRotationPlayers = (team: 'A' | 'B') => {
    const ids = team === 'A' ? match.rotationA : match.rotationB;
    const players = team === 'A' ? match.teamA.players : match.teamB.players;
    if (!ids || ids.length === 0) return players.slice(0, 6);
    return ids.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
  };

  return (
    <div className="bg-[#020617] min-h-full p-4 md:p-6 flex flex-col gap-6 overflow-y-auto pb-32">
      
      {/* Configuración de Partido y Horario */}
      <div className="bg-slate-900/80 p-6 rounded-[2rem] border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-6 shadow-xl">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">FECHA</label>
          <input 
            type="date" 
            value={match.date} 
            onChange={(e) => onUpdateMatch({...match, date: e.target.value})}
            className="bg-black text-white p-3.5 rounded-2xl text-xs font-bold border border-white/10 outline-none focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">HORA</label>
          <input 
            type="time" 
            value={match.time} 
            onChange={(e) => onUpdateMatch({...match, time: e.target.value})}
            className="bg-black text-white p-3.5 rounded-2xl text-xs font-bold border border-white/10 outline-none focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">FORMATO SETS</label>
          <select 
            value={match.maxSets} 
            onChange={(e) => onUpdateMatch({...match, maxSets: parseInt(e.target.value)})}
            className="bg-black text-white p-3.5 rounded-2xl text-xs font-bold border border-white/10 outline-none focus:border-indigo-500 transition-all appearance-none"
          >
            <option value={1}>1 SET</option>
            <option value={3}>MEJOR DE 3</option>
            <option value={5}>MEJOR DE 5</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">PUNTOS / TIE-BREAK</label>
          <div className="flex gap-2">
            <input type="number" value={match.pointsPerSet} onChange={(e) => onUpdateMatch({...match, pointsPerSet: parseInt(e.target.value)})} className="w-1/2 bg-black text-white p-3.5 rounded-2xl text-xs font-bold border border-white/10 outline-none focus:border-indigo-500" />
            <input type="number" value={match.decidingSetPoints} onChange={(e) => onUpdateMatch({...match, decidingSetPoints: parseInt(e.target.value)})} className="w-1/2 bg-black text-white p-3.5 rounded-2xl text-xs font-bold border border-white/10 outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>

      {/* Marcador Principal */}
      <div className="bg-[#101a6b] rounded-[3rem] p-8 md:p-12 flex items-center justify-between shadow-2xl border border-white/10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="text-center flex-1 z-10">
          <img src={match.teamA.logoUrl} className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl mx-auto mb-4 p-2 shadow-xl" />
          <p className="text-white font-black uppercase text-xs md:text-sm tracking-widest truncate">{match.teamA.name}</p>
          <div className="text-7xl md:text-9xl font-black italic text-white mt-2 drop-shadow-2xl">{match.sets[match.currentSet - 1]?.teamAScore || 0}</div>
        </div>
        
        <div className="px-6 md:px-16 flex flex-col items-center gap-8 z-10">
           <div className="bg-red-600 px-8 py-2 rounded-full text-xs md:text-sm font-black italic shadow-xl border border-white/30">SET {match.currentSet}</div>
           <div className="flex gap-4">
              <button onClick={() => { setScoringTeam('A'); setSelectedAction(null); }} className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] text-4xl font-black bg-white text-indigo-900 shadow-2xl active:scale-90 hover:scale-105 transition-all flex items-center justify-center ${scoringTeam === 'A' ? 'ring-4 ring-indigo-400 scale-110' : ''}`}>+</button>
              <button onClick={() => { setScoringTeam('B'); setSelectedAction(null); }} className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] text-4xl font-black bg-white text-indigo-900 shadow-2xl active:scale-90 hover:scale-105 transition-all flex items-center justify-center ${scoringTeam === 'B' ? 'ring-4 ring-indigo-400 scale-110' : ''}`}>+</button>
           </div>
           <div className="flex gap-2">
              <button onClick={() => onUpdateMatch({...match, currentSet: Math.max(1, match.currentSet - 1)})} className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => onUpdateMatch({...match, currentSet: match.currentSet + 1})} className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              </button>
           </div>
        </div>

        <div className="text-center flex-1 z-10">
          <img src={match.teamB.logoUrl} className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl mx-auto mb-4 p-2 shadow-xl" />
          <p className="text-white font-black uppercase text-xs md:text-sm tracking-widest truncate">{match.teamB.name}</p>
          <div className="text-7xl md:text-9xl font-black italic text-white mt-2 drop-shadow-2xl">{match.sets[match.currentSet - 1]?.teamBScore || 0}</div>
        </div>
      </div>

      {/* Panel de Anotación Detallada */}
      {scoringTeam && (
        <div className="bg-slate-900 p-8 rounded-[3rem] border-4 border-indigo-600 animate-pop shadow-3xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black italic uppercase text-indigo-400 text-sm tracking-[0.2em]">PUNTO PARA {scoringTeam === 'A' ? match.teamA.name : match.teamB.name}</h3>
            <button onClick={resetScoring} className="bg-black/50 text-slate-500 hover:text-white px-6 py-2 rounded-full text-[10px] font-black uppercase transition-all">CANCELAR</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Paso 1: Acción */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">1. SELECCIONA LA ACCIÓN</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'ATTACK', label: 'ATAQUE', color: 'bg-indigo-600' },
                  { id: 'BLOCK', label: 'BLOQUEO', color: 'bg-emerald-600' },
                  { id: 'SERVE', label: 'SAQUE ACE', color: 'bg-amber-500' },
                  { id: 'ERROR', label: 'ERROR RIVAL', color: 'bg-red-600' }
                ].map(action => (
                  <button 
                    key={action.id} 
                    onClick={() => setSelectedAction(action.id as any)}
                    className={`p-5 rounded-[1.5rem] font-black italic text-xs uppercase tracking-widest transition-all shadow-lg border-2 ${selectedAction === action.id ? `${action.color} border-white scale-105` : 'bg-black/50 border-white/5 text-slate-400 hover:border-white/20'}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Paso 2: Jugador */}
            <div className={`space-y-4 transition-opacity duration-300 ${!selectedAction ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">2. RESPONSABLE</p>
              <div className="grid grid-cols-3 gap-3">
                {getRotationPlayers(scoringTeam).map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => selectedAction && handleScore(scoringTeam, p.id, selectedAction)}
                    className="bg-black/40 border border-white/5 p-3 rounded-2xl flex flex-col items-center gap-2 hover:bg-indigo-600 hover:border-white transition-all group"
                  >
                    <img src={p.imageUrl} className="w-12 h-12 rounded-full object-cover border-2 border-white/10 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black text-white italic truncate w-full text-center">#{p.number} {p.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control de Transmisión */}
      <div className="bg-slate-900/80 p-8 rounded-[3rem] border border-white/5 flex flex-col gap-8 shadow-xl">
           <header className="flex justify-between items-center border-b border-white/5 pb-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">HERRAMIENTAS DE TRANSMISIÓN PRO</h4>
           </header>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'MINIBUG', label: 'MINIBUG TV', icon: 'M' },
                { id: 'TICKER_BOTTOM', label: 'TICKER INF.', icon: '—' },
                { id: 'STATS_MATCH', label: 'PRO STATS', icon: '📊' },
                { id: 'ROTATION_VIEW', label: 'ROTACIONES', icon: '🔄' }
              ].map(ov => (
                <button 
                  key={ov.id}
                  onClick={() => setOverlay(ov.id as OverlayType)} 
                  className={`flex flex-col items-center justify-center gap-4 p-6 rounded-[2rem] border transition-all ${match.activeOverlay === ov.id ? 'bg-indigo-600 border-white scale-105 shadow-2xl' : 'bg-black border-white/5 hover:bg-slate-800'}`}
                >
                   <span className="text-3xl">{ov.icon}</span>
                   <span className="text-[10px] font-black uppercase tracking-widest">{ov.label}</span>
                </button>
              ))}
           </div>
           
           <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => {
                   onUpdateMatch({...match, activeOverlay: 'HAWK_EYE_SCAN'});
                   setTimeout(() => onUpdateMatch({...match, activeOverlay: 'HAWK_EYE_RESULT', hawkEyeResult: Math.random() > 0.5 ? 'IN' : 'OUT'}), 2500);
                   setTimeout(() => onUpdateMatch({...match, activeOverlay: 'NONE'}), 6000);
                }} 
                className="bg-yellow-600 p-5 rounded-[1.5rem] text-[11px] font-black uppercase italic shadow-xl hover:bg-yellow-500 active:scale-95 transition-all tracking-widest"
              >
                HAWK EYE SCAN
              </button>
              <button onClick={() => setOverlay('SET_POINT')} className={`p-5 rounded-[1.5rem] text-[11px] font-black uppercase italic shadow-xl transition-all ${match.activeOverlay === 'SET_POINT' ? 'bg-orange-600 border-white' : 'bg-orange-600/20 border-orange-500/30 text-orange-500'}`}>SET POINT</button>
              <button onClick={() => setOverlay('MATCH_POINT')} className={`p-5 rounded-[1.5rem] text-[11px] font-black uppercase italic shadow-xl transition-all ${match.activeOverlay === 'MATCH_POINT' ? 'bg-red-700 border-white' : 'bg-red-700/20 border-red-500/30 text-red-500'}`}>MATCH POINT</button>
           </div>

           <button onClick={onGoToLive} className="w-full bg-white text-indigo-950 rounded-[2rem] py-6 flex items-center justify-center gap-6 shadow-3xl hover:bg-indigo-50 font-black text-xs md:text-sm uppercase tracking-[0.3em] transition-all group">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-125 transition-transform animate-pulse">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </div>
              VISTA PREVIA DE TRANSMISIÓN
           </button>
      </div>
    </div>
  );
};
