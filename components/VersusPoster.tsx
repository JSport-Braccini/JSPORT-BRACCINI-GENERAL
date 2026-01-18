
import React, { useRef, useState } from 'react';
import { Match, Team, Tournament } from '../types';
import html2canvas from 'html2canvas';

interface VersusPosterProps {
  match: Match;
  tournament: Tournament;
  onClose: () => void;
}

export const VersusPoster: React.FC<VersusPosterProps> = ({ match, tournament, onClose }) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const getCaptain = (team: Team) => {
    return team.players.find(p => p.id === team.captainId) || team.players[0] || { name: 'Jugador', number: 1, imageUrl: 'https://picsum.photos/seed/default/400' };
  };

  const playerA = getCaptain(match.teamA);
  const playerB = getCaptain(match.teamB);

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
      link.download = `JSPORT-VERSUS-${match.teamA.name}-${match.teamB.name}.png`.replace(/\s+/g, '-');
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error(error);
      alert("Error al generar la imagen.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-2 md:p-4 overflow-y-auto">
      <div className="flex flex-col gap-4 max-w-2xl w-full animate-pop my-auto pb-4">
        
        <div 
          ref={posterRef} 
          className="relative w-full aspect-square bg-[#030712] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col items-center border border-white/10"
        >
          {/* Fondo Mesh Gradient Elegante */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-indigo-600/40 blur-[140px] rounded-full animate-pulse"></div>
            <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/30 blur-[120px] rounded-full"></div>
            <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-blue-500/20 blur-[130px] rounded-full"></div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none flex items-center justify-center overflow-hidden">
               <h2 className="text-[35rem] font-black italic rotate-[-15deg] uppercase leading-none tracking-tighter">VERSUS</h2>
            </div>
            {/* Textura de ruido sutil */}
            <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")'}}></div>
          </div>

          <div className="absolute bottom-0 left-[-15%] w-[65%] h-[90%] opacity-90 pointer-events-none z-10">
             <img src={playerA.imageUrl} crossOrigin="anonymous" className="h-full w-full object-cover side-mask-left drop-shadow-[0_0_30px_rgba(79,70,229,0.3)]" alt="Jugador A" />
          </div>
          <div className="absolute bottom-0 right-[-15%] w-[65%] h-[90%] opacity-90 pointer-events-none z-10">
             <img src={playerB.imageUrl} crossOrigin="anonymous" className="h-full w-full object-cover side-mask-right drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]" alt="Jugador B" />
          </div>

          <div className="relative z-20 w-full h-full flex flex-col items-center justify-between py-10">
            <div className="flex flex-col items-center text-center">
              <img src={tournament.logoUrl} crossOrigin="anonymous" className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]" alt="Logo" />
              <div className="bg-indigo-600/20 backdrop-blur-md px-6 py-1.5 rounded-full border border-white/10 shadow-xl mt-6">
                 <p className="text-white font-black text-[10px] uppercase tracking-[0.5em] italic leading-none">{tournament.name}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
               <div className="flex items-center gap-8 md:gap-14">
                  <div className="flex flex-col items-center">
                     <div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform -rotate-3">
                        <img src={match.teamA.logoUrl} crossOrigin="anonymous" className="w-full h-full object-contain" />
                     </div>
                     <span className="mt-4 text-white font-black italic text-xl md:text-2xl uppercase tracking-tighter drop-shadow-lg">{match.teamA.name.split(' ')[0]}</span>
                  </div>

                  <div className="flex flex-col items-center">
                     <span className="text-8xl md:text-9xl font-black italic text-white tracking-tighter drop-shadow-[0_15px_40px_rgba(0,0,0,0.6)]">VS</span>
                  </div>

                  <div className="flex flex-col items-center">
                     <div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform rotate-3">
                        <img src={match.teamB.logoUrl} crossOrigin="anonymous" className="w-full h-full object-contain" />
                     </div>
                     <span className="mt-4 text-white font-black italic text-xl md:text-2xl uppercase tracking-tighter drop-shadow-lg">{match.teamB.name.split(' ')[0]}</span>
                  </div>
               </div>

               <div className="bg-white/5 backdrop-blur-2xl border border-white/10 px-10 py-4 rounded-[2rem] shadow-2xl text-center">
                  <p className="text-white font-black text-2xl italic tracking-widest uppercase leading-none">
                     {match.date} <span className="text-indigo-400 mx-2">|</span> {match.time} HS
                  </p>
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.4em] mt-3">ENCUENTRO OFICIAL JSPORT PRO</p>
               </div>
            </div>

            <div className="w-full px-12 flex flex-col items-center gap-6">
               <div className="w-full flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.5em] italic">AUSPICIADO POR</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
               </div>
               <div className="flex flex-wrap justify-center items-center gap-10 md:gap-14">
                  {tournament.sponsors?.slice(0, 5).map(s => (
                    <img key={s.id} src={s.logoUrl} crossOrigin="anonymous" className="h-7 md:h-10 w-auto object-contain brightness-110 drop-shadow-md" alt={s.name} />
                  ))}
                  {(!tournament.sponsors || tournament.sponsors.length === 0) && (
                    <span className="text-[8px] text-white/10 font-black uppercase tracking-widest">ESPACIO DISPONIBLE PARA MARCAS</span>
                  )}
               </div>
               <p className="text-white/10 font-black text-[7px] uppercase tracking-[1.5em] italic mt-2">NETWORK BROADCAST SYSTEM v4.2</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           <button onClick={onClose} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase border border-white/10 tracking-widest hover:bg-slate-800 transition-all">CERRAR</button>
           <button onClick={handleDownload} disabled={isExporting} className="flex-[3] bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-2xl flex items-center justify-center gap-3 tracking-widest hover:bg-indigo-500 transition-all active:scale-95">
             {isExporting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : 'DESCARGAR PÓSTER PREMIUM PNG'}
           </button>
        </div>
      </div>
      <style>{`
        .side-mask-left {
          -webkit-mask-image: linear-gradient(to right, black 40%, transparent 95%), linear-gradient(to top, black 50%, transparent 100%);
          -webkit-mask-composite: source-in;
          mask-composite: intersect;
        }
        .side-mask-right {
          -webkit-mask-image: linear-gradient(to left, black 40%, transparent 95%), linear-gradient(to top, black 50%, transparent 100%);
          -webkit-mask-composite: source-in;
          mask-composite: intersect;
        }
      `}</style>
    </div>
  );
};
