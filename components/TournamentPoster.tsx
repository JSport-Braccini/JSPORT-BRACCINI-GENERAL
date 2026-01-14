
import React, { useRef, useState } from 'react';
import { Tournament } from '../types';
import html2canvas from 'html2canvas';

interface TournamentPosterProps {
  tournament: Tournament;
  onClose: () => void;
}

export const TournamentPoster: React.FC<TournamentPosterProps> = ({ tournament, onClose }) => {
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
        backgroundColor: '#020617',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `JSPORT-MASTER-GRUPOS-${tournament.name.replace(/\s+/g, '-')}.png`;
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

  return (
    <div className="fixed inset-0 z-[500] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-2 md:p-4 overflow-y-auto">
      <div className="flex flex-col gap-4 w-full max-w-2xl animate-pop my-auto">
        
        <div 
          ref={posterRef} 
          className="relative w-full aspect-[4/5] bg-[#050a1f] overflow-hidden rounded-[3rem] md:rounded-[4rem] flex flex-col items-center border border-white/10 shadow-2xl"
        >
          {/* Fondo Abstracto de Voley */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-indigo-600/20 blur-[130px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-indigo-900/10 blur-[130px] rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none">
               <h2 className="text-[35rem] font-black italic rotate-[-20deg] uppercase leading-none tracking-tighter">VOLEY</h2>
            </div>
            {/* Elemento de balón abstracto */}
            <div className="absolute top-[20%] right-[10%] w-64 h-64 border-4 border-white/5 rounded-full opacity-20"></div>
          </div>

          {/* Header */}
          <div className="relative z-10 w-full pt-12 flex flex-col items-center text-center">
             <img src={tournament.logoUrl} crossOrigin="anonymous" className="h-28 md:h-36 w-auto object-contain drop-shadow-2xl mb-4" alt="Logo" />
             <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">MASTER GRUPOS</h1>
             <div className="bg-indigo-600 px-10 py-1.5 rounded-full shadow-2xl border border-white/20">
                <p className="text-white font-black text-xs md:text-sm uppercase tracking-[0.6em] italic leading-none">{tournament.name}</p>
             </div>
          </div>

          {/* Groups Grid */}
          <div className="relative z-10 flex-1 w-full px-10 md:px-16 py-10 flex items-center">
             <div className={`grid gap-6 md:gap-8 w-full ${tournament.groups.length > 2 ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                {tournament.groups.map((group) => (
                   <div key={group.id} className="bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-5 md:p-8 flex flex-col shadow-2xl transition-all hover:scale-[1.02]">
                      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-3">
                         <h2 className="text-lg md:text-xl font-black text-white italic uppercase tracking-widest">{group.name}</h2>
                         <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-50"></div>
                         </div>
                      </div>
                      <div className="space-y-3">
                         {group.teams.map((team) => (
                            <div key={team.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 group">
                               <div className="w-7 h-7 bg-white rounded-lg p-1 shadow-md group-hover:scale-110 transition-transform">
                                  <img src={team.logoUrl} crossOrigin="anonymous" className="w-full h-full object-contain" />
                               </div>
                               <span className="text-[10px] md:text-xs font-black text-white/90 uppercase italic truncate tracking-tight">{team.name}</span>
                            </div>
                         ))}
                         {group.teams.length === 0 && <div className="text-center text-[10px] text-slate-700 font-black uppercase italic py-6 tracking-widest">DEFINIENDO EQUIPOS</div>}
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Footer Sponsors */}
          <div className="relative z-10 w-full px-10 pb-12 flex flex-col items-center">
             <div className="flex flex-wrap justify-center items-center gap-10 opacity-80 h-10">
                {tournament.sponsors?.map(s => (
                  <img key={s.id} src={s.logoUrl} crossOrigin="anonymous" className="h-7 md:h-10 w-auto object-contain brightness-200" alt={s.name} />
                ))}
             </div>
             <div className="mt-8 text-white/10 font-black text-[9px] uppercase tracking-[1.5em] italic">JSPORT BROADCAST SYSTEM v2.5</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 bg-slate-900 border border-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">SALIR</button>
          <button onClick={handleDownload} disabled={isExporting} className="flex-[3] bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all">
            {isExporting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : 'DESCARGAR MASTER PNG'}
          </button>
        </div>
      </div>
    </div>
  );
};
