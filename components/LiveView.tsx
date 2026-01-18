
import React, { useEffect, useRef, useState } from 'react';
import { Match, UserRole, Tournament, Team, Player, PlayerStats, OverlayType } from '../types';

interface LiveViewProps {
  match: Match;
  onGoToConsole?: () => void;
  onFinishLive?: () => void;
  tournamentLogo?: string;
  userRole?: UserRole;
  tournament?: Tournament;
  onUpdateTournament?: (t: Tournament) => void;
  onUpdateMatch?: (m: Match) => void;
}

export const LiveView: React.FC<LiveViewProps> = ({ 
  match, onGoToConsole, onFinishLive, tournamentLogo, userRole, tournament, onUpdateTournament, onUpdateMatch 
}) => {
  const currentSetIdx = match.currentSet - 1;
  const currentSet = match.sets[currentSetIdx] || { teamAScore: 0, teamBScore: 0 };
  const overlay = match.activeOverlay;
  const videoRef = useRef<HTMLVideoElement>(null);
  const isAdmin = userRole === UserRole.ADMIN;
  const isSpectator = userRole === UserRole.SPECTATOR;

  const [statTab, setStatTab] = useState<'MATCH' | 'PLAYERS' | 'TEAM'>('MATCH');

  useEffect(() => {
    async function setupCamera() {
      if (isSpectator) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, 
          audio: false 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.warn("Cámara bloqueada o no disponible"); }
    }
    setupCamera();
  }, [isSpectator]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${tournament?.syncId ? `?cid=${tournament.syncId}` : ''}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Sigue el torneo: ${tournament?.name || 'Voley Live'}`,
          text: `Marcador en vivo: ${match.teamA.name} vs ${match.teamB.name}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error al compartir:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Enlace copiado al portapapeles");
    }
  };

  const closeOverlay = () => {
    if (onUpdateMatch) onUpdateMatch({ ...match, activeOverlay: 'NONE' });
  };

  const getSetWins = (team: 'A' | 'B') => match.sets.filter(s => s.winner === team).length;

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center overflow-hidden font-sans select-none text-white">
      
      <div className="absolute inset-0 z-0 overflow-hidden">
        {!isSpectator ? (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover bg-slate-900" />
        ) : (
          <div className="w-full h-full bg-[#050a1f] flex flex-col items-center justify-center gap-8 relative">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 to-black opacity-80"></div>
             <img src={tournamentLogo} className="w-48 h-48 md:w-64 md:h-64 opacity-10 animate-pulse relative z-10" />
             <p className="text-white/30 font-black uppercase text-xs md:text-sm tracking-[1.5em] relative z-10">RED DE TRANSMISIÓN EN VIVO JSPORT</p>
          </div>
        )}
      </div>

      {overlay === 'MINIBUG' && (
        <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 z-50 animate-pop flex items-stretch h-10 md:h-12 bg-black/90 rounded-xl shadow-2xl overflow-hidden border border-white/20">
           <div className="bg-white px-3 md:px-4 flex items-center justify-center shrink-0">
              <img src={tournamentLogo} className="h-6 md:h-8 w-auto object-contain" />
           </div>
           <div className="flex items-center px-4 md:px-6 gap-3 md:gap-5">
              <div className="flex items-center gap-2 md:gap-3">
                 <img src={match.teamA.logoUrl} className="w-6 md:w-8 h-6 md:h-8 object-contain bg-white rounded p-0.5" />
                 <span className="text-white font-black italic text-xl md:text-3xl leading-none">{currentSet.teamAScore}</span>
              </div>
              <div className="w-[1px] h-6 bg-white/20"></div>
              <div className="flex items-center gap-2 md:gap-3">
                 <span className="text-white font-black italic text-xl md:text-3xl leading-none">{currentSet.teamBScore}</span>
                 <img src={match.teamB.logoUrl} className="w-6 md:w-8 h-6 md:h-8 object-contain bg-white rounded p-0.5" />
              </div>
           </div>
           <div className="bg-red-600 px-3 md:px-4 flex items-center justify-center">
              <span className="text-white font-black text-[9px] md:text-[10px] italic uppercase tracking-tighter">S{match.currentSet}</span>
           </div>
        </div>
      )}

      {overlay === 'TICKER_BOTTOM' && (
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-50 animate-pop w-[92%] max-w-5xl">
           <div className="bg-black/95 h-14 md:h-20 rounded-3xl border border-white/20 shadow-3xl flex items-stretch overflow-hidden backdrop-blur-md">
              <div className="flex-1 flex items-center justify-end gap-3 md:gap-8 px-4 md:px-10">
                 <img src={match.teamA.logoUrl} className="w-8 md:w-12 h-8 md:h-12 object-contain bg-white rounded-xl p-1.5 hidden sm:block shadow-lg" />
                 <span className="text-white font-black uppercase italic tracking-tighter text-sm md:text-2xl truncate">{match.teamA.name.slice(0,10)}</span>
                 <span className="text-indigo-400 font-black text-[10px] md:text-base">({getSetWins('A')})</span>
                 <div className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center bg-indigo-600 rounded-2xl shadow-xl">
                    <span className="text-white font-black italic text-xl md:text-4xl">{currentSet.teamAScore}</span>
                 </div>
              </div>
              <div className="px-4 md:px-8 flex items-center justify-center bg-white">
                 <img src={tournamentLogo} className="h-8 md:h-12 w-auto object-contain" />
              </div>
              <div className="flex-1 flex items-center justify-start gap-3 md:gap-8 px-4 md:px-10">
                 <div className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center bg-indigo-600 rounded-2xl shadow-xl">
                    <span className="text-white font-black italic text-xl md:text-4xl">{currentSet.teamBScore}</span>
                 </div>
                 <span className="text-indigo-400 font-black text-[10px] md:text-base">({getSetWins('B')})</span>
                 <span className="text-white font-black uppercase italic tracking-tighter text-sm md:text-2xl truncate">{match.teamB.name.slice(0,10)}</span>
                 <img src={match.teamB.logoUrl} className="w-8 md:w-12 h-8 md:h-12 object-contain bg-white rounded-xl p-1.5 hidden sm:block shadow-lg" />
              </div>
           </div>
        </div>
      )}

      {overlay === 'STATS_MATCH' && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-2xl animate-pop p-4 md:p-8">
           <div className="w-full max-w-5xl bg-[#0a1040] rounded-[3rem] border border-white/10 overflow-hidden shadow-3xl flex flex-col max-h-[90vh]">
              <header className="p-8 md:p-10 border-b border-white/10 flex flex-col md:row justify-between items-center gap-6 bg-indigo-950/40">
                 <div className="text-center md:text-left">
                    <h2 className="text-white text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-2">ANALÍTICA PRO</h2>
                    <p className="text-indigo-400 font-bold text-xs uppercase tracking-[0.5em]">{tournament?.name}</p>
                 </div>
                 <div className="flex bg-black/50 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
                    {(['MATCH', 'PLAYERS', 'TEAM'] as const).map(tab => (
                      <button key={tab} onClick={() => setStatTab(tab)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statTab === tab ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400'}`}>
                        {tab === 'MATCH' ? 'SETS' : tab === 'PLAYERS' ? 'JUGADORES' : 'EQUIPOS'}
                      </button>
                    ))}
                 </div>
              </header>
              <div className="p-8 md:p-14 overflow-y-auto custom-scrollbar flex-1">
                 {statTab === 'MATCH' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-6">
                          <h3 className="text-white/50 font-black text-xs uppercase tracking-widest border-l-4 border-indigo-600 pl-4">MARCADORES POR SET</h3>
                          {match.sets.map((s, i) => (
                             <div key={i} className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-white/5">
                                <span className="text-indigo-400 font-black italic text-lg">SET {i+1}</span>
                                <div className="flex items-center gap-8">
                                   <span className="text-white text-4xl font-black italic">{s.teamAScore}</span>
                                   <span className="text-indigo-900 font-black text-xl italic opacity-40">VS</span>
                                   <span className="text-white text-4xl font-black italic">{s.teamBScore}</span>
                                </div>
                             </div>
                          ))}
                       </div>
                       <div className="bg-black/50 p-10 rounded-[3rem] flex flex-col items-center justify-center border border-white/5">
                          <div className="flex items-center gap-10 mb-8">
                             <img src={match.teamA.logoUrl} className="w-16 h-16 bg-white rounded-2xl p-2 shadow-xl" />
                             <span className="text-4xl text-indigo-700 font-black italic">VS</span>
                             <img src={match.teamB.logoUrl} className="w-16 h-16 bg-white rounded-2xl p-2 shadow-xl" />
                          </div>
                          <p className="text-white/20 font-black text-[9px] tracking-widest uppercase text-center">SISTEMA DE ESTADÍSTICAS JSPORT MASTER</p>
                       </div>
                    </div>
                 )}
                 {statTab === 'PLAYERS' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                       {[match.teamA, match.teamB].map((team, idx) => (
                          <div key={idx} className="space-y-4">
                             <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                                <img src={team.logoUrl} className="w-10 h-10 bg-white rounded-xl p-1 shadow-lg" />
                                <h3 className="text-white font-black italic uppercase text-xl">{team.name}</h3>
                             </div>
                             {team.players.filter(p => p.stats.totalPoints > 0).sort((a,b) => b.stats.totalPoints - a.stats.totalPoints).map(p => (
                                <div key={p.id} className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                                   <div className="flex items-center gap-4">
                                      <span className="text-indigo-400 font-black italic text-lg w-8">#{p.number}</span>
                                      <span className="text-white text-xs font-black uppercase truncate max-w-[120px]">{p.name}</span>
                                   </div>
                                   <div className="flex gap-6 text-center items-center">
                                      <div><span className="block text-[8px] text-slate-500 font-black uppercase">ATQ</span><span className="text-white font-black text-sm">{p.stats.attacks}</span></div>
                                      <div><span className="block text-[8px] text-slate-500 font-black uppercase">BLQ</span><span className="text-white font-black text-sm">{p.stats.blocks}</span></div>
                                      <div className="bg-indigo-600/30 px-4 py-1 rounded-xl"><span className="block text-[8px] text-indigo-400 font-black uppercase">TOT</span><span className="text-white font-black text-sm">{p.stats.totalPoints}</span></div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       ))}
                    </div>
                 )}
              </div>
              {!isSpectator && (
                <footer className="p-8 border-t border-white/10 bg-black/50 flex justify-center">
                   <button onClick={closeOverlay} className="bg-white text-indigo-950 px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">VOLVER AL VIVO</button>
                </footer>
              )}
           </div>
        </div>
      )}

      {(overlay === 'HAWK_EYE_SCAN' || overlay === 'HAWK_EYE_RESULT') && (
        <div className="absolute inset-0 z-[200] bg-black/98 flex items-center justify-center animate-pop">
           <div className="w-full max-w-4xl px-4">
              <div className="relative aspect-video bg-[#0d2a0f] border-[12px] md:border-[20px] border-[#2e5e31] shadow-3xl rounded-[2rem] md:rounded-[4rem] overflow-hidden">
                 <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff, #fff 1px, transparent 1px, transparent 40px)', transform: 'perspective(500px) rotateX(45deg)'}}></div>
                 <div className="absolute bottom-[20%] left-0 w-full h-2 md:h-4 bg-white shadow-[0_0_30px_rgba(255,255,255,1)]"></div>
                 
                 {overlay === 'HAWK_EYE_SCAN' ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                      <div className="w-16 h-16 md:w-24 md:h-24 border-8 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xl md:text-3xl font-black italic text-white uppercase tracking-[0.5em] animate-pulse">RECONSTRUYENDO...</span>
                   </div>
                 ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className={`absolute w-12 h-12 md:w-20 md:h-20 bg-yellow-400 rounded-full border-4 md:border-8 border-black shadow-3xl animate-parabola-final ${match.hawkEyeResult === 'IN' ? 'target-in' : 'target-out'}`}></div>
                      <div className="mt-auto pb-12 flex flex-col items-center animate-pop">
                         <h2 className={`text-8xl md:text-[12rem] font-black italic uppercase drop-shadow-2xl ${match.hawkEyeResult === 'IN' ? 'text-emerald-400' : 'text-red-500'}`}>
                           {match.hawkEyeResult === 'IN' ? 'DENTRO' : 'FUERA'}
                         </h2>
                         <div className="bg-white text-indigo-950 px-8 py-2 md:py-4 font-black text-2xl md:text-4xl italic shadow-2xl rounded-2xl uppercase">HAWK EYE PRO</div>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {(overlay === 'SET_POINT' || overlay === 'MATCH_POINT') && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
           <div className={`${overlay === 'SET_POINT' ? 'bg-orange-600' : 'bg-red-700'} px-10 md:px-20 py-5 md:py-8 rounded-[3rem] border-8 md:border-[12px] border-white shadow-3xl`}>
              <span className="text-white font-black italic text-4xl md:text-8xl uppercase tracking-tighter">{overlay === 'SET_POINT' ? 'SET POINT' : 'MATCH POINT'}</span>
           </div>
        </div>
      )}

      {!isSpectator && isAdmin && (
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[2000] flex flex-col gap-3 items-end">
           <div className="flex gap-2">
             <button onClick={handleShare} className="bg-indigo-600 p-3.5 rounded-xl shadow-2xl border border-white/20 text-white hover:scale-110 active:scale-90 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeWidth="2.5"/></svg>
             </button>
             <button onClick={onGoToConsole} className="bg-white text-indigo-950 px-5 py-3 rounded-xl font-black text-[10px] uppercase shadow-2xl border border-white/10 hover:bg-slate-100 active:scale-95 transition-all">
                CONSOLA
             </button>
           </div>
           <button onClick={onFinishLive} className="bg-red-600/90 text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase shadow-xl hover:bg-red-600 transition-all">
              FINALIZAR
           </button>
        </div>
      )}

      {isSpectator && (
        <button onClick={onFinishLive} className="absolute top-4 right-4 z-[2000] bg-black/50 text-white p-3.5 rounded-full hover:bg-black/70 shadow-2xl transition-all">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="4"/></svg>
        </button>
      )}

      <style>{`
        .shadow-3xl { filter: drop-shadow(0 30px 60px rgba(0,0,0,0.9)); }
        @keyframes parabola-final {
          0% { transform: translate(-300px, -50px) scale(2.5); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: translate(0, -200px) scale(1.4); }
          100% { transform: translate(var(--target-x), var(--target-y)) scale(0.9); }
        }
        .animate-parabola-final { animation: parabola-final 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .target-in { --target-x: 0px; --target-y: 100px; }
        .target-out { --target-x: 300px; --target-y: 100px; }
        @media (max-width: 768px) {
          .target-in { --target-x: 0px; --target-y: 40px; }
          .target-out { --target-x: 120px; --target-y: 40px; }
        }
      `}</style>
    </div>
  );
};
