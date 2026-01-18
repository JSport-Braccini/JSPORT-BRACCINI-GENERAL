
import React, { useRef, useState } from 'react';
import { Tournament } from '../types';
import html2canvas from 'html2canvas';

interface FixturePosterProps {
  tournament: Tournament;
  onClose: () => void;
}

export const FixturePoster: React.FC<FixturePosterProps> = ({ tournament, onClose }) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        scale: 3, 
        backgroundColor: '#050a1f',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `JSPORT-CALENDARIO-${tournament.name.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Error al generar el archivo.");
    } finally {
      setIsExporting(false);
    }
  };

  const allPlayers = tournament.groups.flatMap(g => g.teams.flatMap(t => t.players));
  const playerLeft = allPlayers.length > 0 ? allPlayers[0] : { imageUrl: 'https://picsum.photos/seed/p1/400' };
  const playerRight = allPlayers.length > 1 ? allPlayers[allPlayers.length - 1] : { imageUrl: 'https://picsum.photos/seed/p2/400' };

  return (
    <div className="fixed inset-0 z-[500] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-2 md:p-4 overflow-y-auto">
      <div className="flex flex-col gap-4 w-full max-w-2xl animate-pop my-auto pb-4">
        
        <div 
          ref={posterRef} 
          className="relative w-full aspect-[4/5] bg-[#020617] overflow-hidden rounded-[3rem] flex flex-col items-center border border-white/10 shadow-2xl"
        >
          {/* Fondo Mesh High-End */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[100%] bg-blue-600/20 blur-[130px] rounded-full"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[90%] h-[90%] bg-indigo-600/30 blur-[130px] rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
               <h2 className="text-[25rem] font-black italic rotate-[-15deg] uppercase leading-none tracking-tighter">CALENDARIO</h2>
            </div>
          </div>

          <div className="absolute bottom-0 left-[-15%] w-[60%] h-[80%] opacity-60 pointer-events-none z-10">
             <img src={playerLeft.imageUrl} crossOrigin="anonymous" className="h-full w-full object-cover side-mask-left blur-[1px]" alt="Jugador Izquierda" />
          </div>
          <div className="absolute bottom-0 right-[-15%] w-[60%] h-[80%] opacity-60 pointer-events-none z-10">
             <img src={playerRight.imageUrl} crossOrigin="anonymous" className="h-full w-full object-cover side-mask-right blur-[1px]" alt="Jugador Derecha" />
          </div>

          <div className="relative z-20 w-full pt-12 flex flex-col items-center text-center px-10">
             <img src={tournament.logoUrl} crossOrigin="anonymous" className="h-20 md:h-28 w-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]" alt="Logo" />
             <div className="bg-indigo-600/30 backdrop-blur-md px-8 py-1.5 rounded-full border border-white/10 shadow-2xl mt-8">
                <p className="text-white font-black text-[10px] md:text-xs uppercase tracking-[0.5em] italic leading-none">{tournament.name}</p>
             </div>
             <h2 className="text-white font-black italic text-3xl md:text-4xl uppercase tracking-tighter mt-6 drop-shadow-xl">PRÓXIMOS ENCUENTROS</h2>
          </div>

          <div className="relative z-20 flex-1 w-full px-12 md:px-16 py-10 flex flex-col items-center overflow-y-auto custom-scrollbar">
             {tournament.groups.map(group => (
               <div key={group.id} className="w-full mb-12 last:mb-0">
                  <div className="flex items-center justify-center mb-8">
                     <span className="bg-white/5 backdrop-blur-3xl px-12 py-2.5 rounded-2xl text-white font-black text-xs uppercase italic tracking-[0.3em] border border-white/10 shadow-xl">
                       {group.name} | FIXTURE OFICIAL
                     </span>
                  </div>
                  <div className="space-y-6">
                     {group.matches.map(match => (
                       <div key={match.id} className="flex items-center justify-between gap-6 py-4 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] rounded-xl px-4 transition-all">
                          <div className="flex-1 flex items-center justify-end gap-4">
                             <span className="text-white font-black text-xl md:text-2xl italic uppercase tracking-tighter">{match.teamA.name.slice(0,3)}</span>
                             <img src={match.teamA.logoUrl} crossOrigin="anonymous" className="w-10 h-10 object-contain drop-shadow-md transform group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="bg-white px-5 py-2.5 rounded-2xl text-[#1a237e] font-black text-xl italic min-w-[100px] text-center shadow-[0_10px_20px_rgba(255,255,255,0.1)]">
                             {match.time}
                          </div>
                          <div className="flex-1 flex items-center justify-start gap-4">
                             <img src={match.teamB.logoUrl} crossOrigin="anonymous" className="w-10 h-10 object-contain drop-shadow-md transform group-hover:scale-110 transition-transform" />
                             <span className="text-white font-black text-xl md:text-2xl italic uppercase tracking-tighter">{match.teamB.name.slice(0,3)}</span>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
             ))}
             {tournament.groups.length === 0 && <div className="text-center py-20 text-white/20 font-black uppercase italic tracking-widest">DEFINIENDO CALENDARIO...</div>}
          </div>

          <div className="relative z-30 w-full px-12 pb-14 flex flex-col items-center bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent">
             <div className="w-full flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.5em] italic">AUSPICIADO POR</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
             </div>
             <div className="flex flex-wrap justify-center items-center gap-10 md:gap-14">
                {tournament.sponsors?.map(s => (
                  <img key={s.id} src={s.logoUrl} crossOrigin="anonymous" className="h-7 md:h-10 w-auto object-contain brightness-110 drop-shadow-md" alt={s.name} />
                ))}
             </div>
             <div className="mt-10 text-white/10 font-black text-[8px] uppercase tracking-[1.5em] italic">BROADCAST SYSTEM JSPORT v4.2</div>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 bg-slate-900 border border-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">VOLVER</button>
          <button onClick={handleDownload} disabled={isExporting} className="flex-[3] bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3">
            {isExporting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : 'DESCARGAR CALENDARIO PNG'}
          </button>
        </div>
      </div>
      <style>{`
        .side-mask-left {
          -webkit-mask-image: linear-gradient(to right, black 30%, transparent 100%), linear-gradient(to top, black 40%, transparent 100%);
          -webkit-mask-composite: source-in;
          mask-composite: intersect;
        }
        .side-mask-right {
          -webkit-mask-image: linear-gradient(to left, black 30%, transparent 100%), linear-gradient(to top, black 40%, transparent 100%);
          -webkit-mask-composite: source-in;
          mask-composite: intersect;
        }
      `}</style>
    </div>
  );
};
