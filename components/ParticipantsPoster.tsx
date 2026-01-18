
import React, { useRef, useState, useMemo } from 'react';
import { Tournament, Player } from '../types';
import html2canvas from 'html2canvas';

interface ParticipantsPosterProps {
  tournament: Tournament;
  onClose: () => void;
}

export const ParticipantsPoster: React.FC<ParticipantsPosterProps> = ({ tournament, onClose }) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const allTeams = useMemo(() => {
    const teamsMap = new Map();
    tournament.groups.forEach(g => {
      g.teams.forEach(t => teamsMap.set(t.id, t));
    });
    return Array.from(teamsMap.values());
  }, [tournament]);

  const randomPlayers = useMemo(() => {
    const players: Player[] = [];
    allTeams.forEach(t => players.push(...t.players));
    return players.sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [allTeams]);

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
      link.download = `JSPORT-PARTICIPANTES-${tournament.name.replace(/\s+/g, '-')}.png`;
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
      <div className="flex flex-col gap-4 w-full max-w-2xl animate-pop my-auto pb-4">
        
        <div 
          ref={posterRef} 
          className="relative w-full aspect-[4/5] bg-[#050a1f] overflow-hidden rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center"
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[100%] bg-indigo-600/20 blur-[130px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-blue-600/10 blur-[130px] rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
               <h2 className="text-[22rem] font-black italic rotate-[-10deg] uppercase leading-none tracking-tighter">JUGADORES</h2>
            </div>
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/10"></div>
          </div>

          {randomPlayers[0] && (
            <div className="absolute bottom-0 left-[-22%] w-[58%] h-[72%] opacity-30 z-10 scale-90 origin-bottom grayscale blur-[1px]">
              <img src={randomPlayers[0].imageUrl} crossOrigin="anonymous" className="h-full w-full object-cover side-mask-left" />
            </div>
          )}
          {randomPlayers[1] && (
            <div className="absolute bottom-0 left-[-10%] w-[60%] h-[82%] opacity-90 z-30 origin-bottom">
              <img src={randomPlayers[1].imageUrl} crossOrigin="anonymous" className="h-full w-full object-cover side-mask-left" />
            </div>
          )}
          
          {randomPlayers[2] && (
            <div className="absolute bottom-0 right-[-22%] w-[58%] h-[72%] opacity-30 z-10 scale-90 origin-bottom grayscale blur-[1px]">
              <img src={randomPlayers[2].imageUrl} crossOrigin="anonymous" className="h-full w-full object-cover side-mask-right" />
            </div>
          )}
          {randomPlayers[3] && (
            <div className="absolute bottom-0 right-[-10%] w-[60%] h-[82%] opacity-90 z-30 origin-bottom">
              <img src={randomPlayers[3].imageUrl} crossOrigin="anonymous" className="h-full w-full object-cover side-mask-right" />
            </div>
          )}

          <div className="relative z-40 w-full pt-12 flex flex-col items-center text-center px-10">
            <img src={tournament.logoUrl} crossOrigin="anonymous" className="h-28 md:h-36 w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] mb-4" />
            <div className="bg-indigo-600 px-8 py-1.5 rounded-full border border-white/20 shadow-2xl mb-3 mt-4">
               <p className="text-white font-black text-[10px] uppercase tracking-[0.5em] italic leading-none">{tournament.name}</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 drop-shadow-xl">EQUIPOS PARTICIPANTES</h1>
            
            <div className="flex gap-4 items-center">
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-2xl shadow-xl">
                 <p className="text-white/50 text-[8px] font-black uppercase tracking-widest mb-0.5">INICIA EL</p>
                 <p className="text-white font-black text-base italic uppercase">{tournament.startDate || 'PRÓXIMAMENTE'}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-2xl shadow-xl">
                 <p className="text-white/50 text-[8px] font-black uppercase tracking-widest mb-0.5">SEDE CENTRAL</p>
                 <p className="text-white font-black text-base italic uppercase">{tournament.location || 'POR DEFINIR'}</p>
              </div>
            </div>
          </div>

          <div className="relative z-40 flex-1 w-full px-12 md:px-16 py-10 flex items-center justify-center">
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-h-full overflow-hidden">
                {allTeams.slice(0, 9).map((team) => (
                   <div key={team.id} className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl flex flex-col items-center gap-2 shadow-2xl transition-all hover:scale-105 border-b-4 border-b-indigo-600">
                      <div className="w-12 h-12 bg-white rounded-xl p-1.5 shadow-xl">
                         <img src={team.logoUrl} crossOrigin="anonymous" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-white font-black text-[9px] md:text-[10px] uppercase italic text-center leading-tight tracking-tight">{team.name}</span>
                   </div>
                ))}
                {allTeams.length === 0 && (
                   <div className="col-span-full py-12 text-center text-white/20 font-black italic uppercase tracking-widest border-2 border-dashed border-white/10 rounded-3xl">
                      ESPERANDO INSCRIPCIONES
                   </div>
                )}
             </div>
          </div>

          <div className="relative z-50 w-full px-10 pb-12 flex flex-col items-center bg-gradient-to-t from-[#050a1f] via-[#050a1f]/80 to-transparent">
             <div className="flex flex-wrap justify-center items-center gap-8 md:gap-10">
                {tournament.sponsors?.slice(0, 5).map(s => (
                  <img key={s.id} src={s.logoUrl} crossOrigin="anonymous" className="h-6 md:h-8 w-auto object-contain brightness-200" alt={s.name} />
                ))}
             </div>
             <div className="mt-8 text-white/10 font-black text-[7px] md:text-[8px] uppercase tracking-[1.5em] italic">SISTEMA DE TRANSMISIÓN JSPORT</div>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 bg-slate-900 border border-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">VOLVER</button>
          <button onClick={handleDownload} disabled={isExporting} className="flex-[3] bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3">
            {isExporting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : 'DESCARGAR PÓSTER PNG'}
          </button>
        </div>
      </div>
      <style>{`
        .side-mask-left {
          -webkit-mask-image: linear-gradient(to right, black 25%, transparent 95%), linear-gradient(to top, black 35%, transparent 100%);
          -webkit-mask-composite: source-in;
          mask-composite: intersect;
        }
        .side-mask-right {
          -webkit-mask-image: linear-gradient(to left, black 25%, transparent 95%), linear-gradient(to top, black 35%, transparent 100%);
          -webkit-mask-composite: source-in;
          mask-composite: intersect;
        }
      `}</style>
    </div>
  );
};
