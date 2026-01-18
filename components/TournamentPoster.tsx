
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
          className="relative w-full aspect-[4/5] bg-[#020617] overflow-hidden rounded-[3rem] md:rounded-[4rem] flex flex-col items-center border border-white/10 shadow-2xl"
        >
          {/* Fondo Mesh High-End */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[90%] h-[90%] bg-indigo-600/30 blur-[130px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-600/20 blur-[130px] rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] select-none pointer-events-none">
               <h2 className="text-[35rem] font-black italic rotate-[-20deg] uppercase leading-none tracking-tighter">ELITE</h2>
            </div>
            <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")'}}></div>
          </div>

          <div className="relative z-10 w-full pt-12 flex flex-col items-center text-center">
             <img src={tournament.logoUrl} crossOrigin="anonymous" className="h-28 md:h-36 w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]" alt="Logo" />
             <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none mb-3 mt-8 px-4 drop-shadow-xl">GRUPOS MAGISTRALES</h1>
             <div className="bg-white/5 backdrop-blur-md px-10 py-1.5 rounded-full shadow-2xl border border-white/10">
                <p className="text-white font-black text-xs md:text-sm uppercase tracking-[0.6em] italic leading-none">{tournament.name}</p>
             </div>
          </div>

          <div className="relative z-10 flex-1 w-full px-10 md:px-16 py-8 flex items-center">
             <div className={`grid gap-6 md:gap-8 w-full ${tournament.groups.length > 2 ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                {tournament.groups.map((group) => (
                   <div key={group.id} className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 p-6 md:p-8 flex flex-col shadow-2xl group hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
                         <h2 className="text-lg md:text-xl font-black text-white italic uppercase tracking-widest">{group.name}</h2>
                         <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_indigo]"></div>
                            <div className="w-2 h-2 rounded-full bg-indigo-500/20"></div>
                         </div>
                      </div>
                      <div className="space-y-4">
                         {group.teams.map((team) => (
                            <div key={team.id} className="flex items-center gap-4 bg-white/[0.03] p-2.5 rounded-2xl border border-white/[0.03] hover:bg-white/5 transition-colors">
                               <img src={team.logoUrl} crossOrigin="anonymous" className="w-8 h-8 object-contain drop-shadow-md" />
                               <span className="text-[10px] md:text-xs font-black text-white/90 uppercase italic truncate tracking-tight">{team.name}</span>
                            </div>
                         ))}
                         {group.teams.length === 0 && <div className="text-center text-[10px] text-slate-700 font-black uppercase italic py-8 tracking-widest"> DEFINIENDO EQUIPOS...</div>}
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <div className="relative z-10 w-full px-12 pb-14 flex flex-col items-center">
             <div className="w-full flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.5em] italic">AUSPICIADO POR</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
             </div>
             <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
                {tournament.sponsors?.map(s => (
                  <img key={s.id} src={s.logoUrl} crossOrigin="anonymous" className="h-8 md:h-10 w-auto object-contain brightness-110 drop-shadow-md" alt={s.name} />
                ))}
             </div>
             <div className="mt-10 text-white/10 font-black text-[9px] uppercase tracking-[1.5em] italic">JSPORT MASTER SYSTEM PRO</div>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 bg-slate-900 border border-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">SALIR</button>
          <button onClick={handleDownload} disabled={isExporting} className="flex-[3] bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all">
            {isExporting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : 'DESCARGAR MASTER PNG'}
          </button>
        </div>
      </div>
    </div>
  );
};
