
import React from 'react';
import { Player, Team } from '../types';

interface CoachRotationProps {
  team: Team;
  currentRotation: string[];
  onUpdateRotation: (newRotation: string[]) => void;
}

export const CoachRotation: React.FC<CoachRotationProps> = ({ team, currentRotation, onUpdateRotation }) => {
  const togglePlayer = (playerId: string) => {
    let nextRotation = [...currentRotation];
    if (nextRotation.includes(playerId)) {
      nextRotation = nextRotation.filter(id => id !== playerId);
    } else if (nextRotation.length < 6) {
      nextRotation.push(playerId);
    }
    onUpdateRotation(nextRotation);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Gestión de Rotación</h2>
        <p className="text-slate-400">Selecciona los 6 jugadores para la alineación inicial</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 relative aspect-[4/3] flex items-center justify-center">
          <div className="absolute inset-4 border-2 border-slate-600 opacity-20 pointer-events-none rounded"></div>
          
          <div className="grid grid-cols-3 grid-rows-2 gap-6 w-full max-w-sm">
            {[1, 6, 5, 2, 3, 4].map((pos, idx) => {
              const playerId = currentRotation[idx];
              const player = team.players.find(p => p.id === playerId);
              
              return (
                <div key={pos} className="relative group">
                  <div className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${player ? 'bg-indigo-600 border-indigo-400 shadow-lg scale-105' : 'bg-slate-900 border-slate-700 border-dashed opacity-50'}`}>
                    {player ? (
                      <>
                        <img src={player.imageUrl} className="w-12 h-12 rounded-full mb-1 border-2 border-white/20" />
                        <span className="text-xs font-bold">#{player.number}</span>
                        <span className="text-[10px] uppercase font-medium">{player.position}</span>
                      </>
                    ) : (
                      <span className="text-slate-600 text-sm font-bold">POS {pos}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
             Plantilla de Jugadores
             <span className="text-xs bg-indigo-900/50 px-2 py-0.5 rounded-full">{currentRotation.length}/6</span>
          </h3>
          <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {team.players.map(p => (
              <button
                key={p.id}
                onClick={() => togglePlayer(p.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${currentRotation.includes(p.id) ? 'bg-indigo-600 border-white ring-2 ring-indigo-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
              >
                <img src={p.imageUrl} className="w-10 h-10 rounded-full object-cover" />
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-bold truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400">#{p.number} • {p.position}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
