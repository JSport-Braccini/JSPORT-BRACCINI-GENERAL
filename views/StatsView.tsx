
import React, { useMemo, useState } from 'react';
import { Team, Player, Tournament, Position } from '../types';

interface StatsViewProps {
  teams: Team[];
  tournaments: Tournament[];
}

const POSITION_LABELS: Record<Position, string> = {
  OH: 'Punta Receptor',
  OP: 'Opuesto',
  MB: 'Central',
  S: 'Armador',
  L: 'Líbero'
};

export const StatsView: React.FC<StatsViewProps> = ({ teams, tournaments }) => {
  const [selectedPosition, setSelectedPosition] = useState<Position | 'ALL'>('ALL');

  // Jugadores aplanados con info de equipo y filtrados por posición
  const filteredPlayers = useMemo(() => {
    const players: (Player & { teamName: string; teamLogo: string })[] = [];
    teams.forEach(t => {
      t.players.forEach(p => {
        players.push({ ...p, teamName: t.name, teamLogo: t.logoUrl });
      });
    });

    let result = players;
    if (selectedPosition !== 'ALL') {
      result = players.filter(p => p.position === selectedPosition);
    }

    return result.sort((a, b) => {
      // Si es Líbero, priorizamos menos errores
      if (selectedPosition === 'L') return a.stats.errors - b.stats.errors;
      // Si es Central, priorizamos bloqueos
      if (selectedPosition === 'MB') return b.stats.blocks - a.stats.blocks;
      // Por defecto puntos totales
      return b.stats.totalPoints - a.stats.totalPoints;
    });
  }, [teams, selectedPosition]);

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 animate-pop">
      <header className="text-center space-y-4">
        <h2 className="text-4xl md:text-7xl font-black uppercase italic text-white tracking-tighter leading-none">
          INSIGHTS <span className="text-indigo-500">PRO</span>
        </h2>
        <p className="text-slate-500 font-black text-[10px] md:text-xs uppercase tracking-[0.8em]">Análisis de Rendimiento JSPORT</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LÍDERES POR POSICIÓN */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
             <div>
                <h3 className="text-white font-black italic uppercase text-2xl tracking-tighter">ELITE PLAYERS</h3>
                <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest">Ranking por especialidad</p>
             </div>
             <div className="flex flex-wrap gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                {(['ALL', 'OH', 'OP', 'MB', 'S', 'L'] as const).map(pos => (
                  <button 
                    key={pos} 
                    onClick={() => setSelectedPosition(pos)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedPosition === pos ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    {pos === 'ALL' ? 'TODOS' : pos}
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {filteredPlayers.slice(0, 12).map((p, idx) => (
               <div key={p.id} className="bg-slate-900/60 p-5 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-indigo-500/50 transition-all shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={p.imageUrl} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 group-hover:scale-105 transition-transform" />
                      <span className="absolute -top-2 -left-2 bg-indigo-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black italic shadow-lg">#{idx + 1}</span>
                    </div>
                    <div>
                      <p className="text-white font-black uppercase text-sm leading-tight">{p.name}</p>
                      <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mt-1">{p.teamName}</p>
                      <span className="text-[8px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-md mt-2 inline-block font-bold">
                        {POSITION_LABELS[p.position]}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-3xl italic leading-none">
                      {selectedPosition === 'MB' ? p.stats.blocks : selectedPosition === 'L' ? p.stats.errors : p.stats.totalPoints}
                    </p>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                      {selectedPosition === 'MB' ? 'BLOCKS' : selectedPosition === 'L' ? 'ERRORS' : 'POINTS'}
                    </p>
                  </div>
               </div>
             ))}
             {filteredPlayers.length === 0 && <div className="col-span-full py-20 text-center text-slate-800 font-black uppercase italic tracking-widest border-2 border-dashed border-white/5 rounded-[3rem]">NO SE HAN REGISTRADO ESTADÍSTICAS</div>}
          </div>
        </section>

        {/* EQUIPOS POR GRUPO */}
        <section className="space-y-8">
          <div className="border-b border-white/10 pb-6">
             <h3 className="text-white font-black italic uppercase text-2xl tracking-tighter">TEAM STANDINGS</h3>
             <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Puntos totales por grupo</p>
          </div>

          <div className="space-y-10">
            {tournaments.map(tournament => (
              <div key={tournament.id} className="space-y-6">
                <div className="flex items-center gap-3">
                  <img src={tournament.logoUrl} className="w-8 h-8 object-contain bg-white rounded-lg p-1" />
                  <h4 className="text-white font-black uppercase text-xs tracking-widest">{tournament.name}</h4>
                </div>
                
                {tournament.groups.map(group => (
                  <div key={group.id} className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="bg-emerald-600/10 px-6 py-3 border-b border-white/5">
                      <span className="text-emerald-500 font-black italic uppercase text-[10px] tracking-[0.3em]">{group.name}</span>
                    </div>
                    <div className="p-4 space-y-4">
                      {group.teams.map((t) => {
                        const totalPoints = t.players.reduce((sum, p) => sum + p.stats.totalPoints, 0);
                        return (
                          <div key={t.id} className="flex items-center justify-between gap-4">
                             <div className="flex items-center gap-3 flex-1">
                               <img src={t.logoUrl} className="w-8 h-8 object-contain bg-white rounded-lg p-1 shrink-0" />
                               <span className="text-white font-black uppercase text-[10px] italic truncate">{t.name}</span>
                             </div>
                             <div className="flex items-center gap-3 w-32">
                                <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (totalPoints / 200) * 100)}%` }}></div>
                                </div>
                                <span className="text-white font-black italic text-xs w-6 text-right">{totalPoints}</span>
                             </div>
                          </div>
                        );
                      })}
                      {group.teams.length === 0 && <p className="text-[9px] text-slate-700 font-black uppercase text-center py-4">SIN EQUIPOS ASIGNADOS</p>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {tournaments.length === 0 && <div className="text-center py-10 text-slate-800 font-black uppercase italic tracking-widest">SIN TORNEOS ACTIVOS</div>}
          </div>
        </section>

      </div>
    </div>
  );
};
