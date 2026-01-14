
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
      link.download = `JSPORT-FIXTURE-${tournament.name.replace(/\s+/g, '-')}.png`;
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
      <div className="flex flex-col gap-4 w-full max-w-2xl animate-pop my-auto">
        
        <div 
          ref={posterRef} 
          className="relative w-full aspect-[4/5] bg-[#050a1f] overflow-hidden rounded-[3rem] flex flex-col items-center border border-white/10 shadow-2xl"
        >
          {/* Fondo Abstracto de Voley */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[100%] bg-indigo-600/20 blur-[130px] rounded-full"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[90%] h-[90%] bg-blue-600/10 blur-[130px] rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
               <h2 className="text-[25rem] font-black italic rotate-[-15deg] uppercase leading-none tracking-tighter">VOLLEY</h2>
            </div>
            {/* Red abstracta vertical */}
            <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-white/10"></div>
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-white/10"></div>
          </div>

          {/* Side Players */}
          <div className="absolute bottom-0 left-[-15%] w-[55%] h-[75%] opacity-70 pointer-events-none z-10">
             <img src={playerLeft.imageUrl} crossOrigin="anonymous" className="h-full w-full object-cover side-mask-left" alt="Player Left" />
          </div>
          <div className="absolute bottom-0 right-[-15%] w-[55%] h-[75%] opacity-70 pointer-events-none z-10">
             <img src={playerRight.imageUrl} crossOrigin="anonymous" className="h-full w-full object-cover side-mask-right" alt="Player Right" />
          </div>

          {/* Header */}
          <div className="relative z-20 w-full pt-10 flex flex-col items-center text-center px-10">
             <img src={tournament.logoUrl} crossOrigin="anonymous" className="h-20 md:h-28 w-auto object-contain drop-shadow-2xl mb-4" alt="Logo" />
             <div className="bg-indigo-600 px-8 py-1.5 rounded-full border border-white/20 shadow-xl">
                <p className="text-white font-black text-[10px] md:text-xs uppercase tracking-[0.5em] italic leading-none">{tournament.name}</p>
             </div>
             <h2 className="text-white font-black italic text-xl md:text-2xl uppercase tracking-tighter mt-4">PRÓXIMOS ENCUENTROS</h2>
          </div>

          {/* Match List */}
          <div className="relative z-20 flex-1 w-full px-12 md:px-16 py-8 flex flex-col items-center overflow-y-auto custom-scrollbar">
             {tournament.groups.map(group => (
               <div key={group.id} className="w-full mb-10 last:mb-0">
                  <div className="flex items-center justify-center mb-6">
                     <span className="bg-white/5 backdrop-blur-md px-10 py-2 rounded-xl text-white font-black text-[10px] uppercase italic tracking-[0.2em] border border-white/10">
                       {group.name} | FIXTURE
                     </span>
                  </div>
                  <div className="space-y-4">
                     {group.matches.map(match => (
                       <div key={match.id} className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0 group">
                          <div className="flex-1 flex items-center justify-end gap-3">
                             <span className="text-white font-black text-lg md:text-xl italic uppercase tracking-tighter">{match.teamA.name.slice(0,3)}</span>
                             <div className="w-8 h-6 bg-white rounded-sm p-0.5 shadow-lg overflow-hidden group-hover:scale-110 transition-transform">
                                <img src={match.teamA.logoUrl} crossOrigin="anonymous" className="w-full h-full object-contain" />
                             </div>
                          </div>
                          <div className="bg-white px-4 py-1.5 rounded-lg text-[#1a237e] font-black text-lg italic min-w-[85px] text-center shadow-xl">
                             {match.time}
                          </div>
                          <div className="flex-1 flex items-center justify-start gap-3">
                             <div className="w-8 h-6 bg-white rounded-sm p-0.5 shadow-lg overflow-hidden group-hover:scale-110 transition-transform">
                                <img src={match.teamB.logoUrl} crossOrigin="anonymous" className="w-full h-full object-contain" />
                             </div>
                             <span className="text-white font-black text-lg md:text-xl italic uppercase tracking-tighter">{match.teamB.name.slice(0,3)}</span>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
             ))}
          </div>

          {/* Sponsors Footer */}
          <div className="relative z-30 w-full px-10 pb-10 flex flex-col items-center bg-gradient-to-t from-[#050a1f] to-transparent">
             <div className="flex flex-wrap justify-center items-center gap-8 md:gap-10">
                {tournament.sponsors?.map(s => (
                  <img key={s.id} src={s.logoUrl} crossOrigin="anonymous" className="h-6 md:h-8 w-auto object-contain brightness-200" alt={s.name} />
                ))}
             </div>
             <div className="mt-8 text-white/10 font-black text-[7px] md:text-[8px] uppercase tracking-[1.5em] italic">JSPORT BROADCAST SYSTEM</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 bg-slate-900 border border-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">VOLVER</button>
          <button onClick={handleDownload} disabled={isExporting} className="flex-[3] bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3">
            {isExporting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : 'DESCARGAR PNG'}
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
