
import React, { useState } from 'react';
import { Match, Player, OverlayType } from '../types';

interface MatchConsoleProps {
  match: Match;
  onUpdateMatch: (match: Match) => void;
  onGoToLive: () => void;
}

export const MatchConsole: React.FC<MatchConsoleProps> = ({ match, onUpdateMatch, onGoToLive }) => {
  const [scoringTeam, setScoringTeam] = useState<'A' | 'B' | null>(null);

  const handleScore = (team: 'A' | 'B', playerId: string, type: 'ATTACK' | 'BLOCK' | 'SERVE' | 'ERROR') => {
    const updatedMatch = { ...match };
    const setIdx = updatedMatch.currentSet - 1;
    if (!updatedMatch.sets[setIdx]) updatedMatch.sets[setIdx] = { teamAScore: 0, teamBScore: 0 };

    if (type !== 'ERROR') {
      if (team === 'A') updatedMatch.sets[setIdx].teamAScore += 1;
      else updatedMatch.sets[setIdx].teamBScore += 1;
    } else {
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
    setScoringTeam(null);
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

  const handleConfigChange = (key: keyof Match, value: any) => {
    onUpdateMatch({ ...match, [key]: value });
  };

  return (
    <div className="bg-[#020617] min-h-full p-4 flex flex-col gap-4 overflow-y-auto pb-24">
      {/* Configuración de Partido */}
      <div className="bg-slate-900/80 p-4 rounded-3xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">MEJOR DE (SETS)</label>
          <select 
            value={match.maxSets} 
            onChange={(e) => handleConfigChange('maxSets', parseInt(e.target.value))}
            className="bg-black text-white p-3 rounded-xl text-xs font-bold border border-white/10 outline-none focus:border-indigo-500"
          >
            <option value={3}>3 Sets</option>
            <option value={5}>5 Sets</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">PUNTOS POR SET</label>
          <input 
            type="number" 
            value={match.pointsPerSet} 
            onChange={(e) => handleConfigChange('pointsPerSet', parseInt(e.target.value))}
            className="bg-black text-white p-3 rounded-xl text-xs font-bold border border-white/10 outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">PUNTOS TIE-BREAK</label>
          <input 
            type="number" 
            value={match.decidingSetPoints} 
            onChange={(e) => handleConfigChange('decidingSetPoints', parseInt(e.target.value))}
            className="bg-black text-white p-3 rounded-xl text-xs font-bold border border-white/10 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Marcador Principal */}
      <div className="bg-[#101a6b] rounded-[2.5rem] p-6 flex items-center justify-between shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="text-center flex-1">
          <p className="text-white/40 text-[10px] font-black uppercase mb-1 tracking-widest truncate">{match.teamA.name}</p>
          <div className="text-5xl md:text-7xl font-black italic text-white">{match.sets[match.currentSet - 1]?.teamAScore || 0}</div>
        </div>
        
        <div className="px-4 md:px-8 flex flex-col items-center gap-4">
           <div className="bg-red-600 px-5 py-1 rounded-full text-[10px] font-black italic shadow-lg">SET {match.currentSet}</div>
           <div className="flex gap-2">
              <button onClick={() => setScoringTeam('A')} className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl text-2xl font-black bg-white text-indigo-900 shadow-xl active:scale-95 transition-all ${scoringTeam === 'A' ? 'ring-4 ring-indigo-400' : ''}`}>+</button>
              <button onClick={() => setScoringTeam('B')} className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl text-2xl font-black bg-white text-indigo-900 shadow-xl active:scale-95 transition-all ${scoringTeam === 'B' ? 'ring-4 ring-indigo-400' : ''}`}>+</button>
           </div>
        </div>

        <div className="text-center flex-1">
          <p className="text-white/40 text-[10px] font-black uppercase mb-1 tracking-widest truncate">{match.teamB.name}</p>
          <div className="text-5xl md:text-7xl font-black italic text-white">{match.sets[match.currentSet - 1]?.teamBScore || 0}</div>
        </div>
      </div>

      {/* Selector de Jugador para Punto */}
      {scoringTeam && (
        <div className="bg-slate-900 p-5 rounded-[2rem] border-2 border-indigo-500 animate-pop shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black italic uppercase text-indigo-400 text-xs">Punto para {scoringTeam === 'A' ? match.teamA.name : match.teamB.name}</h3>
            <button onClick={() => setScoringTeam(null)} className="text-slate-500 font-black text-xs px-2">CANCELAR</button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {getRotationPlayers(scoringTeam).map(p => (
              <button key={p.id} onClick={() => handleScore(scoringTeam, p.id, 'ATTACK')} className="bg-indigo-600/20 border border-indigo-500/30 p-2 rounded-xl flex flex-col items-center gap-1 hover:bg-indigo-600 transition-all">
                <img src={p.imageUrl} className="w-8 h-8 rounded-full object-cover" />
                <span className="text-[8px] font-black text-white italic truncate w-full text-center">#{p.number}</span>
              </button>
            ))}
            <button onClick={() => handleScore(scoringTeam === 'A' ? 'B' : 'A', 'error', 'ERROR')} className="bg-red-600/20 border border-red-500/30 p-2 rounded-xl flex flex-col items-center justify-center">
              <span className="text-red-500 text-[9px] font-black uppercase">ERROR</span>
            </button>
          </div>
        </div>
      )}

      {/* Control de Transmisión */}
      <div className="bg-slate-900/80 p-6 rounded-[2.5rem] border border-white/5 flex flex-col gap-4 shadow-xl">
           <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">CONSOLA DE TRANSMISIÓN</h4>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'MINIBUG', label: 'MINIBUG', icon: 'M' },
                { id: 'TICKER_BOTTOM', label: 'TICKER INF', icon: '—' },
                { id: 'STATS_MATCH', label: 'ESTADÍSTICA', icon: '📊' },
                { id: 'ROTATION_VIEW', label: 'ROTACIÓN', icon: '🔄' }
              ].map(ov => (
                <button 
                  key={ov.id}
                  onClick={() => setOverlay(ov.id as OverlayType)} 
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${match.activeOverlay === ov.id ? 'bg-indigo-600 border-white scale-105 shadow-lg' : 'bg-black border-white/5 hover:bg-slate-800'}`}
                >
                   <span className="text-xl">{ov.icon}</span>
                   <span className="text-[8px] font-black uppercase tracking-widest">{ov.label}</span>
                </button>
              ))}
           </div>
           
           <div className="grid grid-cols-3 gap-2">
              <button onClick={() => {
                onUpdateMatch({...match, activeOverlay: 'HAWK_EYE_SCAN'});
                setTimeout(() => onUpdateMatch({...match, activeOverlay: 'HAWK_EYE_RESULT', hawkEyeResult: Math.random() > 0.5 ? 'IN' : 'OUT'}), 2000);
                setTimeout(() => onUpdateMatch({...match, activeOverlay: 'NONE'}), 5000);
              }} className="bg-yellow-600 p-3 rounded-xl text-[9px] font-black uppercase italic shadow-lg hover:bg-yellow-500">OJO HALCÓN</button>
              <button onClick={() => setOverlay('SET_POINT')} className={`p-3 rounded-xl text-[9px] font-black uppercase italic shadow-lg transition-all ${match.activeOverlay === 'SET_POINT' ? 'bg-orange-600 border-white' : 'bg-orange-600/20 border-orange-500/30 text-orange-500'}`}>SET POINT</button>
              <button onClick={() => setOverlay('MATCH_POINT')} className={`p-3 rounded-xl text-[9px] font-black uppercase italic shadow-lg transition-all ${match.activeOverlay === 'MATCH_POINT' ? 'bg-red-700 border-white' : 'bg-red-700/20 border-red-500/30 text-red-500'}`}>MATCH POINT</button>
           </div>

           <button onClick={onGoToLive} className="w-full bg-white text-black rounded-2xl py-4 flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </div>
              IR AL VIVO (FULLSCREEN)
           </button>
      </div>
    </div>
  );
};
