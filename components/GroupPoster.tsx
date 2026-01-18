
import React, { useRef, useState } from 'react';
import { Group, Tournament } from '../types';
import html2canvas from 'html2canvas';

interface GroupPosterProps {
  group: Group;
  tournament: Tournament;
  onClose: () => void;
}

export const GroupPoster: React.FC<GroupPosterProps> = ({ group, tournament, onClose }) => {
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
      link.download = `JSPORT-GRUPO-${group.name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error(error);
      alert("Error al generar el póster");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-2 md:p-4 overflow-y-auto">
      <div className="flex flex-col gap-4 max-w-2xl w-full animate-pop my-auto pb-4">
        
        <div 
          ref={posterRef} 
          className="relative w-full aspect-square bg-[#050a1f] overflow-hidden rounded-[3rem] flex flex-col items-center border border-white/10 shadow-2xl"
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[100%] bg-indigo-600/20 blur-[130px] rounded-full"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[90%] h-[90%] bg-blue-600/10 blur-[130px] rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
               <h2 className="text-[25rem] font-black italic rotate-[20deg] uppercase leading-none tracking-tighter">VOLLEY</h2>
            </div>
            <div className="absolute top-1/2 left-0 w-full h-24 bg-white/5 border-y border-white/10 flex items-center justify-center">
               <div className="w-full h-full opacity-20" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            </div>
          </div>

          <div className="relative z-10 w-full pt-10 flex flex-col items-center px-6">
            <img src={tournament.logoUrl} crossOrigin="anonymous" className="h-14 md:h-20 w-auto object-contain mb-4 drop-shadow-2xl" alt="Logo" />
            <div className="bg-indigo-600 px-8 py-1 rounded-full border border-white/20 shadow-xl mb-2">
               <p className="text-white font-black text-[10px] uppercase tracking-[0.5em] italic leading-none">{tournament.name}</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">TABLA DE GRUPO</h1>
          </div>

          <div className="relative z-10 flex-1 w-full px-12 md:px-20 py-8 flex items-center justify-center">
             <div className="w-full bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                <div className="bg-indigo-600 p-4 text-center border-b border-white/10">
                   <h2 className="text-2xl font-black text-white italic uppercase tracking-widest">{group.name}</h2>
                </div>
                <div className="p-6 space-y-3">
                   {group.teams.map((team, idx) => (
                      <div key={team.id} className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/5 transition-all group">
                         <span className="text-indigo-400 font-black italic text-xl w-8 text-center">{idx + 1}</span>
                         <div className="w-10 h-10 bg-white rounded-xl p-1.5 shadow-lg group-hover:scale-110 transition-transform">
                            <img src={team.logoUrl} crossOrigin="anonymous" className="w-full h-full object-contain" />
                         </div>
                         <span className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter truncate flex-1">{team.name}</span>
                         <div className="flex gap-1.5 opacity-40">
                            {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white"></div>)}
                         </div>
                      </div>
                   ))}
                   {group.teams.length === 0 && (
                      <div className="py-10 text-center text-white/20 font-black uppercase italic tracking-widest">EQUIPOS POR CONFIRMAR</div>
                   )}
                </div>
             </div>
          </div>

          <div className="relative z-10 pb-10 w-full flex flex-col items-center px-10">
             <div className="flex flex-wrap justify-center items-center gap-10 opacity-80 h-8">
                {tournament.sponsors?.slice(0, 4).map(s => (
                  <img key={s.id} src={s.logoUrl} crossOrigin="anonymous" className="h-6 md:h-8 w-auto object-contain brightness-200" alt={s.name} />
                ))}
             </div>
             <div className="mt-8 text-white/10 font-black text-[8px] uppercase tracking-[1.5em] italic">SISTEMA DE TRANSMISIÓN JSPORT</div>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase border border-white/10 tracking-widest">SALIR</button>
          <button onClick={handleDownload} disabled={isExporting} className="flex-[3] bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-2xl tracking-widest flex items-center justify-center gap-3">
            {isExporting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : 'DESCARGAR TABLA PNG'}
          </button>
        </div>
      </div>
    </div>
  );
};
