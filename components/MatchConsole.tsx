
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
    <div className="grid grid-cols-3 gap-1 bg-slate-900/40 p-1.5 rounded-lg border border-white/5">
       {[1, 6, 5, 2, 3, 4].map((pos, idx) => {
         const pId = rotationIds[idx];
         const p = team.players.find(pl => pl.id === pId);
         const isSelected = selectedPlayer?.id === p?.id;
         return (
           <button 
             key={pos} 
             onClick={() => p && setSelectedPlayer(p)}
             className={`relative aspect-square rounded-md flex flex-col items-center justify-center border transition-all ${
               p ? (isSelected ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-950 border-white/5') : 'bg-slate-950/20'
             }`}
           >
              {p ? (
                <>
                  <img src={p.imageUrl} crossOrigin="anonymous" className="w-6 h-6 rounded-full object-cover mb-0.5" />
                  <span className="text-[6px] uppercase text-white font-black truncate w-full px-0.5">{p.name.split(' ')[0]}</span>
                </>
              ) : <span className="text-[6px] text-slate-800">P{pos}</span>}
           </button>
         );
       })}
    </div>
  );

  return (
    <div className="bg-[#020617] h-full p-4 flex flex-col gap-4">
      {/* Marcador Horizontal */}
      <div className="bg-[#101a6b] rounded-2xl p-4 flex items-center justify-between shadow-2xl border border-white/10 relative overflow-hidden h-28">
          <div className="flex flex-col items-center flex-1">
             <div className="flex items-center gap-2 mb-1">
                <img src={match.teamA.logoUrl} crossOrigin="anonymous" className="w-8 h-8 object-contain bg-white p-0.5 rounded" />
                <h2 className="text-sm font-black italic uppercase text-white">{match.teamA.name.slice(0,10)}</h2>
             </div>
             <div className="text-6xl font-black italic tabular-nums text-white leading-none">{match.sets[match.currentSet - 1]?.teamAScore || 0}</div>
          </div>

          <div className="flex flex-col items-center px-6 border-x border-white/10 gap-1 shrink-0 bg-black/20 backdrop-blur-sm py-2 rounded-lg">
             <div className="bg-[#ff4d4d] px-3 py-0.5 rounded text-white font-black text-[8px] uppercase italic tracking-widest">SET {match.currentSet}</div>
             <div className="text-base font-black text-white/20 italic">VS</div>
             <div className="flex gap-1">
                <button onClick={() => match.currentSet > 1 && onUpdateMatch({...match, currentSet: match.currentSet - 1})} className="p-1 bg-white/5 border border-white/10 rounded text-white hover:bg-white/20">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button onClick={() => {
                  const updated = { ...match, currentSet: match.currentSet + 1 };
                  if (!updated.sets[updated.currentSet - 1]) updated.sets.push({ teamAScore: 0, teamBScore: 0 });
                  onUpdateMatch(updated);
                }} className="p-1 bg-white/5 border border-white/10 rounded text-white hover:bg-white/20">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
                </button>
             </div>
          </div>

          <div className="flex flex-col items-center flex-1">
             <div className="flex items-center gap-2 mb-1 text-right">
                <h2 className="text-sm font-black italic uppercase text-white">{match.teamB.name.slice(0,10)}</h2>
                <img src={match.teamB.logoUrl} crossOrigin="anonymous" className="w-8 h-8 object-contain bg-white p-0.5 rounded" />
             </div>
             <div className="text-6xl font-black italic tabular-nums text-white leading-none">{match.sets[match.currentSet - 1]?.teamBScore || 0}</div>
          </div>
      </div>

      {/* Paneles de Acción (Horizontalmente distribuidos) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        
        {/* Lado Equipo A */}
        <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex flex-col gap-3">
           <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="text-[10px] font-black text-indigo-400 uppercase italic">EQUIPO A</span>
              <div className="flex gap-2">
                 <button onClick={() => handleTimeout('A')} disabled={match.timeoutsA === 0} className={`px-2 py-1 rounded text-[8px] font-black uppercase ${match.timeoutsA > 0 ? 'bg-yellow-600' : 'bg-slate-800 text-slate-600'}`}>T.O ({match.timeoutsA})</button>
                 <button onClick={() => handleSubstitution('A')} disabled={match.subsA === 0} className={`px-2 py-1 rounded text-[8px] font-black uppercase ${match.subsA > 0 ? 'bg-white text-black' : 'bg-slate-800 text-slate-600'}`}>CAMBIO ({match.subsA})</button>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => handleScore('A', 'SERVE')} className="py-2 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[8px] font-black uppercase">SAQUE</button>
              <button onClick={() => handleScore('A', 'ATTACK')} className="py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[8px] font-black uppercase">ATAQUE</button>
              <button onClick={() => handleScore('A', 'BLOCK')} className="py-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg text-[8px] font-black uppercase">BLOQ.</button>
              <button onClick={() => handleScore('B', 'ERROR')} className="py-2 bg-red-600/10 text-red-400 border border-red-500/20 rounded-lg text-[8px] font-black uppercase">ERROR OP.</button>
           </div>
           {renderRotationGrid(match.teamA, match.rotationA)}
        </div>

        {/* Lado Equipo B */}
        <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex flex-col gap-3">
           <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="text-[10px] font-black text-slate-500 uppercase italic">EQUIPO B</span>
              <div className="flex gap-2">
                 <button onClick={() => handleSubstitution('B')} disabled={match.subsB === 0} className={`px-2 py-1 rounded text-[8px] font-black uppercase ${match.subsB > 0 ? 'bg-white text-black' : 'bg-slate-800 text-slate-600'}`}>CAMBIO ({match.subsB})</button>
                 <button onClick={() => handleTimeout('B')} disabled={match.timeoutsB === 0} className={`px-2 py-1 rounded text-[8px] font-black uppercase ${match.timeoutsB > 0 ? 'bg-yellow-600' : 'bg-slate-800 text-slate-600'}`}>T.O ({match.timeoutsB})</button>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => handleScore('B', 'SERVE')} className="py-2 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[8px] font-black uppercase">SAQUE</button>
              <button onClick={() => handleScore('B', 'ATTACK')} className="py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[8px] font-black uppercase">ATAQUE</button>
              <button onClick={() => handleScore('B', 'BLOCK')} className="py-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg text-[8px] font-black uppercase">BLOQ.</button>
              <button onClick={() => handleScore('A', 'ERROR')} className="py-2 bg-red-600/10 text-red-400 border border-red-500/20 rounded-lg text-[8px] font-black uppercase">ERROR OP.</button>
           </div>
           {renderRotationGrid(match.teamB, match.rotationB)}
        </div>

        {/* Visuales / Broadcast */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10 flex flex-col gap-3">
           <h4 className="text-[9px] font-black text-white uppercase tracking-widest border-b border-white/5 pb-1">BROADCAST</h4>
           <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setOverlay('MINIBUG')} className={`py-2 rounded-lg text-[8px] font-black uppercase border transition-all ${match.activeOverlay === 'MINIBUG' ? 'bg-indigo-600 border-white' : 'bg-slate-950 border-white/10'}`}>MINIBUG</button>
              <button onClick={() => setOverlay('STATS_MATCH')} className={`py-2 rounded-lg text-[8px] font-black uppercase border transition-all ${match.activeOverlay === 'STATS_MATCH' ? 'bg-indigo-600 border-white' : 'bg-slate-950 border-white/10'}`}>ESTADISTICAS</button>
              <button onClick={() => setOverlay('HAWK_EYE_IN')} className="py-2 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase">HALCÓN IN</button>
              <button onClick={() => setOverlay('HAWK_EYE_OUT')} className="py-2 bg-red-600 text-white rounded-lg text-[8px] font-black uppercase">HALCÓN OUT</button>
              <button onClick={() => setOverlay('SET_POINT')} className="py-2 bg-yellow-500 text-black rounded-lg text-[8px] font-black uppercase">SET POINT</button>
              <button onClick={() => setOverlay('MATCH_POINT')} className="py-2 bg-orange-600 text-white rounded-lg text-[8px] font-black uppercase">MATCH POINT</button>
              <button onClick={() => setOverlay('NONE')} className="col-span-2 py-2 bg-slate-950 text-red-500 border border-red-500/20 rounded-lg text-[8px] font-black uppercase">OCULTAR TODO</button>
           </div>
           <button onClick={onGoToLive} className="mt-auto py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase shadow-lg">VISTA PREVIA</button>
        </div>

      </div>
    </div>
  );
};
