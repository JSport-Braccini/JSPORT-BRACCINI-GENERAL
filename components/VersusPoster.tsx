
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
          className="relative w-full aspect-square bg-[#0a0f1e] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col items-center border border-white/10"
        >
          {/* Fondo Abstracto de Voley */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-indigo-600/30 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-pink-600/20 blur-[120px] rounded-full"></div>
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none flex items-center justify-center overflow-hidden">
               <h2 className="text-[30rem] font-black italic rotate-[-15deg] uppercase leading-none tracking-tighter">VOLEY</h2>
            </div>
            {/* Líneas abstractas que simulan el campo */}
            <div className="absolute inset-0 opacity-10">
               <div className="absolute top-1/2 left-0 w-full h-1 bg-white"></div>
               <div className="absolute top-0 left-1/2 w-1 h-full bg-white"></div>
            </div>
          </div>

          {/* Jugadores Laterales con Degradado Transparente */}
          <div className="absolute bottom-0 left-[-15%] w-[60%] h-[85%] opacity-90 pointer-events-none z-10">
             <img src={playerA.imageUrl} crossOrigin="anonymous" className="h-full w-full object-cover side-mask-left" alt="Player A" />
          </div>
          <div className="absolute bottom-0 right-[-15%] w-[60%] h-[85%] opacity-90 pointer-events-none z-10">
             <img src={playerB.imageUrl} crossOrigin="anonymous" className="h-full w-full object-cover side-mask-right" alt="Player B" />
          </div>

          {/* Contenido Central Superpuesto */}
          <div className="relative z-20 w-full h-full flex flex-col items-center justify-between py-10">
            <div className="flex flex-col items-center text-center">
              <img src={tournament.logoUrl} crossOrigin="anonymous" className="h-24 md:h-36 w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] mb-2" alt="Logo" />
              <div className="bg-indigo-600 px-6 py-1 rounded-full border border-white/20 shadow-xl mt-4">
                 <p className="text-white font-black text-[10px] uppercase tracking-[0.5em] italic leading-none">{tournament.name}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
               <div className="flex items-center gap-8 md:gap-12">
                  <div className="flex flex-col items-center">
                     <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl p-2 shadow-2xl border-b-4 border-indigo-600">
                        <img src={match.teamA.logoUrl} crossOrigin="anonymous" className="w-full h-full object-contain" />
                     </div>
                     <span className="mt-3 text-white font-black italic text-xl uppercase tracking-tighter drop-shadow-lg">{match.teamA.name.split(' ')[0]}</span>
                  </div>

                  <div className="flex flex-col items-center">
                     <span className="text-7xl md:text-8xl font-black italic text-white tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">VS</span>
                  </div>

                  <div className="flex flex-col items-center">
                     <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl p-2 shadow-2xl border-b-4 border-[#ff4d4d]">
                        <img src={match.teamB.logoUrl} crossOrigin="anonymous" className="w-full h-full object-contain" />
                     </div>
                     <span className="mt-3 text-white font-black italic text-xl uppercase tracking-tighter drop-shadow-lg">{match.teamB.name.split(' ')[0]}</span>
                  </div>
               </div>

               <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-3 rounded-2xl shadow-2xl text-center">
                  <p className="text-white font-black text-xl italic tracking-widest uppercase leading-none">
                     {match.date} <span className="text-indigo-400 mx-2">|</span> {match.time} HS
                  </p>
                  <p className="text-[9px] text-white/50 font-bold uppercase tracking-[0.3em] mt-2">PARTIDO OFICIAL - JSPORT</p>
               </div>
            </div>

            <div className="w-full px-10 flex flex-col items-center gap-4">
               <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
               <div className="flex flex-wrap justify-center items-center gap-8">
                  {tournament.sponsors?.slice(0, 4).map(s => (
                    <img key={s.id} src={s.logoUrl} crossOrigin="anonymous" className="h-6 md:h-8 w-auto object-contain brightness-200" alt={s.name} />
                  ))}
               </div>
               <p className="text-white/10 font-black text-[7px] uppercase tracking-[1.5em] italic">JSPORT BROADCAST SYSTEM</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
           <button onClick={onClose} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase border border-white/10 tracking-widest">CERRAR</button>
           <button onClick={handleDownload} disabled={isExporting} className="flex-[3] bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-2xl flex items-center justify-center gap-3 tracking-widest hover:bg-indigo-500 transition-all">
             {isExporting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : 'DESCARGAR POSTER PNG'}
           </button>
        </div>
      </div>
      <style>{`
        .side-mask-left {
          -webkit-mask-image: linear-gradient(to right, black 30%, transparent 90%), linear-gradient(to top, black 40%, transparent 100%);
          -webkit-mask-composite: source-in;
          mask-composite: intersect;
        }
        .side-mask-right {
          -webkit-mask-image: linear-gradient(to left, black 30%, transparent 90%), linear-gradient(to top, black 40%, transparent 100%);
          -webkit-mask-composite: source-in;
          mask-composite: intersect;
        }
      `}</style>
    </div>
  );
};
