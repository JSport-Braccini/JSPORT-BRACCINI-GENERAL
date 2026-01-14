
import React, { useState } from 'react';
import { Match, Player, Team, OverlayType } from '../types';

interface MatchConsoleProps {
  match: Match;
  onUpdateMatch: (match: Match) => void;
  onGoToLive: () => void;
}

export const MatchConsole: React.FC<MatchConsoleProps> = ({ match, onUpdateMatch, onGoToLive }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const handleScore = (team: 'A' | 'B', type: 'ATTACK' | 'BLOCK' | 'SERVE' | 'ERROR', specificPlayer?: Player) => {
    const updatedMatch = { ...match };
    const setIdx = updatedMatch.currentSet - 1;
    
    if (!updatedMatch.sets[setIdx]) {
      updatedMatch.sets[setIdx] = { teamAScore: 0, teamBScore: 0 };
    }

    if (team === 'A') updatedMatch.sets[setIdx].teamAScore += 1;
    else updatedMatch.sets[setIdx].teamBScore += 1;

    updatedMatch.lastPointType = type;
    updatedMatch.lastPointTeam = team;

    const playerToCredit = specificPlayer || selectedPlayer;
    if (playerToCredit) {
      const activeTeam = team === 'A' ? updatedMatch.teamA : updatedMatch.teamB;
      const player = activeTeam.players.find(p => p.id === playerToCredit.id);
      if (player) {
        if (type === 'ATTACK') player.stats.attacks++;
        if (type === 'BLOCK') player.stats.blocks++;
        if (type === 'SERVE') player.stats.aces++;
        if (type === 'ERROR') player.stats.errors++;
        player.stats.totalPoints++;
      }
    }

    onUpdateMatch({ ...updatedMatch });
    setSelectedPlayer(null);
  };

  const handleTimeout = (team: 'A' | 'B') => {
    const updated = { ...match };
    if (team === 'A' && updated.timeoutsA > 0) updated.timeoutsA--;
    else if (team === 'B' && updated.timeoutsB > 0) updated.timeoutsB--;
    onUpdateMatch(updated);
  };

  const handleSubstitution = (team: 'A' | 'B') => {
    const updated = { ...match };
    if (team === 'A' && updated.subsA > 0) updated.subsA--;
    else if (team === 'B' && updated.subsB > 0) updated.subsB--;
    onUpdateMatch(updated);
  };

  const setOverlay = (overlay: OverlayType) => {
    const updated = { ...match, activeOverlay: overlay };
    onUpdateMatch(updated);
    
    if (overlay.startsWith('HAWK_EYE') || overlay.includes('_POINT')) {
      setTimeout(() => {
        onUpdateMatch({ ...updated, activeOverlay: 'NONE' });
      }, 5000);
    }
  };

  const renderRotationGrid = (team: Team, rotationIds: string[]) => (
    <div className="grid grid-cols-3 gap-1.5 bg-slate-900/40 p-2 rounded-xl border border-white/5">
       {[1, 6, 5, 2, 3, 4].map((pos, idx) => {
         const pId = rotationIds[idx];
         const p = team.players.find(pl => pl.id === pId);
         const isSelected = selectedPlayer?.id === p?.id;
         return (
           <button 
             key={pos} 
             onClick={() => p && setSelectedPlayer(p)}
             className={`relative aspect-square rounded-xl flex flex-col items-center justify-center border transition-all active:scale-95 ${
               p ? (isSelected ? 'bg-indigo-600 border-white shadow-lg' : 'bg-slate-950 border-white/5') : 'bg-slate-950/20'
             }`}
           >
              {p ? (
                <>
                  <img src={p.imageUrl} crossOrigin="anonymous" className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover mb-0.5" />
                  <span className="text-[7px] md:text-[8px] uppercase text-white font-black truncate w-full px-1">{p.name.split(' ')[0]}</span>
                </>
              ) : <span className="text-[8px] text-slate-800">P{pos}</span>}
           </button>
         );
       })}
    </div>
  );

  return (
    <div className="bg-[#020617] min-h-full p-3 md:p-4 flex flex-col gap-3 md:gap-4 overflow-x-hidden">
      {/* Marcador Horizontal Optimizado para Móvil */}
      <div className="bg-[#101a6b] rounded-2xl md:rounded-[2rem] p-3 md:p-4 flex items-center justify-between shadow-2xl border border-white/10 relative overflow-hidden h-24 md:h-32">
          <div className="flex flex-col items-center flex-1">
             <div className="flex items-center gap-1 md:gap-2 mb-1">
                <img src={match.teamA.logoUrl} crossOrigin="anonymous" className="w-6 h-6 md:w-8 md:h-8 object-contain bg-white p-0.5 rounded shadow-sm" />
                <h2 className="text-[10px] md:text-sm font-black italic uppercase text-white leading-none truncate max-w-[60px] md:max-w-none">{match.teamA.name}</h2>
             </div>
             <div className="text-4xl md:text-6xl font-black italic tabular-nums text-white leading-none">{match.sets[match.currentSet - 1]?.teamAScore || 0}</div>
          </div>

          <div className="flex flex-col items-center px-4 md:px-6 border-x border-white/10 gap-1 shrink-0 bg-black/20 backdrop-blur-sm py-2 rounded-xl">
             <div className="bg-[#ff4d4d] px-2 md:px-3 py-0.5 rounded text-white font-black text-[7px] md:text-[8px] uppercase italic tracking-widest leading-none">SET {match.currentSet}</div>
             <div className="text-xs font-black text-white/20 italic">VS</div>
             <div className="flex gap-2">
                <button onClick={() => match.currentSet > 1 && onUpdateMatch({...match, currentSet: match.currentSet - 1})} className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-white active:bg-white/20">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button onClick={() => {
                  const updated = { ...match, currentSet: match.currentSet + 1 };
                  if (!updated.sets[updated.currentSet - 1]) updated.sets.push({ teamAScore: 0, teamBScore: 0 });
                  onUpdateMatch(updated);
                }} className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-white active:bg-white/20">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 5l7 7-7 7"/></svg>
                </button>
             </div>
          </div>

          <div className="flex flex-col items-center flex-1">
             <div className="flex items-center gap-1 md:gap-2 mb-1 text-right">
                <h2 className="text-[10px] md:text-sm font-black italic uppercase text-white leading-none truncate max-w-[60px] md:max-w-none">{match.teamB.name}</h2>
                <img src={match.teamB.logoUrl} crossOrigin="anonymous" className="w-6 h-6 md:w-8 md:h-8 object-contain bg-white p-0.5 rounded shadow-sm" />
             </div>
             <div className="text-4xl md:text-6xl font-black italic tabular-nums text-white leading-none">{match.sets[match.currentSet - 1]?.teamBScore || 0}</div>
          </div>
      </div>

      {/* Paneles de Acción */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 flex-1">
        
        {/* Lado Equipo A */}
        <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 flex flex-col gap-3 shadow-xl">
           <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[9px] font-black text-indigo-400 uppercase italic tracking-widest">EQUIPO A</span>
              <div className="flex gap-2">
                 <button onClick={() => handleTimeout('A')} disabled={match.timeoutsA === 0} className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all active:scale-95 ${match.timeoutsA > 0 ? 'bg-yellow-600 shadow-lg shadow-yellow-600/20' : 'bg-slate-800 text-slate-600 opacity-50'}`}>T.O ({match.timeoutsA})</button>
                 <button onClick={() => handleSubstitution('A')} disabled={match.subsA === 0} className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all active:scale-95 ${match.subsA > 0 ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-slate-800 text-slate-600 opacity-50'}`}>CAMBIO ({match.subsA})</button>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleScore('A', 'SERVE')} className="py-3 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase active:bg-emerald-600 active:text-white transition-all">SAQUE</button>
              <button onClick={() => handleScore('A', 'ATTACK')} className="py-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[9px] font-black uppercase active:bg-indigo-600 active:text-white transition-all">ATAQUE</button>
              <button onClick={() => handleScore('A', 'BLOCK')} className="py-3 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl text-[9px] font-black uppercase active:bg-blue-600 active:text-white transition-all">BLOQUEO</button>
              <button onClick={() => handleScore('B', 'ERROR')} className="py-3 bg-red-600/10 text-red-400 border border-red-500/20 rounded-xl text-[9px] font-black uppercase active:bg-red-600 active:text-white transition-all">ERROR OP.</button>
           </div>
           {renderRotationGrid(match.teamA, match.rotationA)}
        </div>

        {/* Lado Equipo B */}
        <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 flex flex-col gap-3 shadow-xl">
           <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[9px] font-black text-slate-500 uppercase italic tracking-widest">EQUIPO B</span>
              <div className="flex gap-2">
                 <button onClick={() => handleSubstitution('B')} disabled={match.subsB === 0} className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all active:scale-95 ${match.subsB > 0 ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-slate-800 text-slate-600 opacity-50'}`}>CAMBIO ({match.subsB})</button>
                 <button onClick={() => handleTimeout('B')} disabled={match.timeoutsB === 0} className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all active:scale-95 ${match.timeoutsB > 0 ? 'bg-yellow-600 shadow-lg shadow-yellow-600/20' : 'bg-slate-800 text-slate-600 opacity-50'}`}>T.O ({match.timeoutsB})</button>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleScore('B', 'SERVE')} className="py-3 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase active:bg-emerald-600 active:text-white transition-all">SAQUE</button>
              <button onClick={() => handleScore('B', 'ATTACK')} className="py-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[9px] font-black uppercase active:bg-indigo-600 active:text-white transition-all">ATAQUE</button>
              <button onClick={() => handleScore('B', 'BLOCK')} className="py-3 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl text-[9px] font-black uppercase active:bg-blue-600 active:text-white transition-all">BLOQUEO</button>
              <button onClick={() => handleScore('A', 'ERROR')} className="py-3 bg-red-600/10 text-red-400 border border-red-500/20 rounded-xl text-[9px] font-black uppercase active:bg-red-600 active:text-white transition-all">ERROR OP.</button>
           </div>
           {renderRotationGrid(match.teamB, match.rotationB)}
        </div>

        {/* Visuales / Broadcast - Movido al final en móvil */}
        <div className="bg-slate-900/80 p-4 rounded-[2rem] border border-white/10 flex flex-col gap-3 md:col-span-2 lg:col-span-1 shadow-2xl">
           <h4 className="text-[10px] font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">BROADCAST OVERLAYS</h4>
           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
              <button onClick={() => setOverlay('MINIBUG')} className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all active:scale-95 ${match.activeOverlay === 'MINIBUG' ? 'bg-indigo-600 border-white shadow-lg shadow-indigo-600/30' : 'bg-slate-950 border-white/10 text-white/60'}`}>MINIBUG</button>
              <button onClick={() => setOverlay('STATS_MATCH')} className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all active:scale-95 ${match.activeOverlay === 'STATS_MATCH' ? 'bg-indigo-600 border-white shadow-lg shadow-indigo-600/30' : 'bg-slate-950 border-white/10 text-white/60'}`}>STATS</button>
              <button onClick={() => setOverlay('HAWK_EYE_IN')} className="py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase active:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-600/20">HALCÓN IN</button>
              <button onClick={() => setOverlay('HAWK_EYE_OUT')} className="py-3 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase active:bg-red-500 transition-all active:scale-95 shadow-lg shadow-red-600/20">HALCÓN OUT</button>
              <button onClick={() => setOverlay('SET_POINT')} className="py-3 bg-yellow-500 text-black rounded-xl text-[9px] font-black uppercase active:bg-yellow-400 transition-all active:scale-95">SET POINT</button>
              <button onClick={() => setOverlay('MATCH_POINT')} className="py-3 bg-orange-600 text-white rounded-xl text-[9px] font-black uppercase active:bg-orange-500 transition-all active:scale-95">MATCH PT</button>
              <button onClick={() => setOverlay('NONE')} className="col-span-full py-3 bg-slate-950 text-red-500 border border-red-500/20 rounded-xl text-[9px] font-black uppercase active:bg-red-900 transition-all">OCULTAR TODOS</button>
           </div>
           <button onClick={onGoToLive} className="mt-2 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase shadow-2xl active:scale-95 transition-all">ABRIR VISTA PREVIA VIVO</button>
        </div>

      </div>
    </div>
  );
};
