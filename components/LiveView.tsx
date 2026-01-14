
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
    <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center overflow-hidden font-sans select-none">
      
      {/* SEÑAL DE VIDEO O FONDO */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {!isSpectator ? (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover md:object-contain bg-slate-900" />
        ) : (
          <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center gap-4 relative">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 to-black opacity-40"></div>
             <img src={tournamentLogo} className="w-32 h-32 opacity-10 animate-pulse relative z-10" />
             <p className="text-white/20 font-black uppercase text-[10px] tracking-[0.8em] relative z-10">JSPORT LIVE BROADCAST</p>
          </div>
        )}
      </div>

      {/* --- OVERLAYS ADAPTADOS --- */}

      {/* MINIBUG */}
      {overlay === 'MINIBUG' && (
        <div className="absolute top-4 md:top-10 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 z-50 animate-pop flex items-stretch h-9 md:h-12 bg-black/90 rounded-xl shadow-2xl overflow-hidden border border-white/10">
           <div className="bg-white px-2 md:px-3 flex items-center justify-center">
              <img src={tournamentLogo} className="h-6 md:h-8 w-auto object-contain" />
           </div>
           <div className="flex items-center px-3 gap-2 md:gap-3">
              <img src={match.teamA.logoUrl} className="w-5 md:w-6 h-5 md:h-6 object-contain bg-white rounded-sm p-0.5" />
              <span className="text-white font-black italic text-base md:text-xl">{currentSet.teamAScore}</span>
           </div>
           <div className="w-[1px] bg-white/10 my-2"></div>
           <div className="flex items-center px-3 gap-2 md:gap-3">
              <span className="text-white font-black italic text-base md:text-xl">{currentSet.teamBScore}</span>
              <img src={match.teamB.logoUrl} className="w-5 md:w-6 h-5 md:h-6 object-contain bg-white rounded-sm p-0.5" />
           </div>
           <div className="bg-red-600 px-2 md:px-4 flex items-center">
              <span className="text-white font-black text-[9px] md:text-[11px] italic">SET {match.currentSet}</span>
           </div>
        </div>
      )}

      {/* TICKER BOTTOM */}
      {overlay === 'TICKER_BOTTOM' && (
        <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-50 animate-pop w-[92%] max-w-5xl">
           <div className="bg-black/95 h-12 md:h-16 rounded-2xl border border-white/20 shadow-3xl flex items-stretch overflow-hidden">
              <div className="flex-1 flex items-center justify-end gap-2 md:gap-6 px-4">
                 <img src={match.teamA.logoUrl} className="w-6 md:w-10 h-6 md:h-10 object-contain bg-white rounded p-1 hidden sm:block" />
                 <span className="text-white font-black uppercase italic tracking-tighter text-xs md:text-xl truncate">{match.teamA.name}</span>
                 <span className="text-indigo-400 font-black text-[10px] md:text-xs">{getSetWins('A')}</span>
                 <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-indigo-600 rounded-xl shadow-lg border border-white/10">
                    <span className="text-white font-black italic text-lg md:text-2xl">{currentSet.teamAScore}</span>
                 </div>
              </div>
              <div className="px-3 md:px-6 flex items-center justify-center bg-white">
                 <img src={tournamentLogo} className="h-6 md:h-12 w-auto object-contain" />
              </div>
              <div className="flex-1 flex items-center justify-start gap-2 md:gap-6 px-4">
                 <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-indigo-600 rounded-xl shadow-lg border border-white/10">
                    <span className="text-white font-black italic text-lg md:text-2xl">{currentSet.teamBScore}</span>
                 </div>
                 <span className="text-indigo-400 font-black text-[10px] md:text-xs">{getSetWins('B')}</span>
                 <span className="text-white font-black uppercase italic tracking-tighter text-xs md:text-xl truncate">{match.teamB.name}</span>
                 <img src={match.teamB.logoUrl} className="w-6 md:w-10 h-6 md:h-10 object-contain bg-white rounded p-1 hidden sm:block" />
              </div>
           </div>
        </div>
      )}

      {/* SEPARATE STATISTICS SCREEN */}
      {overlay === 'STATS_MATCH' && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-2xl animate-pop p-4 md:p-10">
           <div className="w-full max-w-5xl bg-[#101a6b] rounded-[2rem] md:rounded-[3rem] border border-white/10 overflow-hidden shadow-3xl flex flex-col max-h-[95vh]">
              <header className="p-6 md:p-10 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div>
                    <h2 className="text-white text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">ESTADÍSTICAS PRO</h2>
                    <p className="text-indigo-300 font-bold text-xs uppercase tracking-widest mt-2">{tournament?.name}</p>
                 </div>
                 <div className="flex bg-black/40 p-1.5 rounded-2xl">
                    {(['MATCH', 'PLAYERS', 'TEAM'] as const).map(tab => (
                      <button key={tab} onClick={() => setStatTab(tab)} className={`px-5 md:px-8 py-2.5 rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all ${statTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
                        {tab === 'MATCH' ? 'SETS' : tab === 'PLAYERS' ? 'JUGADORES' : 'EQUIPOS'}
                      </button>
                    ))}
                 </div>
              </header>
              
              <div className="p-6 md:p-12 overflow-y-auto custom-scrollbar flex-1">
                 {statTab === 'MATCH' && (
                    <div className="space-y-4">
                       {match.sets.map((s, i) => (
                          <div key={i} className="flex justify-between items-center bg-black/30 p-5 rounded-[1.5rem] border border-white/5">
                             <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black italic text-xs">S{i+1}</div>
                               <span className="text-white/50 font-black text-xs uppercase">RESULTADO SET</span>
                             </div>
                             <div className="flex items-center gap-6">
                                <span className="text-white text-4xl font-black italic">{s.teamAScore}</span>
                                <span className="text-indigo-500 font-black text-xl italic">VS</span>
                                <span className="text-white text-4xl font-black italic">{s.teamBScore}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
                 {statTab === 'PLAYERS' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                       {[match.teamA, match.teamB].map((team, idx) => (
                          <div key={idx} className="space-y-3">
                             <div className="flex items-center gap-4 mb-4">
                                <img src={team.logoUrl} className="w-10 h-10 bg-white rounded-xl p-1" />
                                <h3 className="text-white font-black italic uppercase text-xl">{team.name}</h3>
                             </div>
                             {team.players.filter(p => p.stats.totalPoints > 0).sort((a,b) => b.stats.totalPoints - a.stats.totalPoints).map(p => (
                                <div key={p.id} className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-white/5">
                                   <div className="flex items-center gap-3">
                                      <span className="text-indigo-400 font-black italic text-base">#{p.number}</span>
                                      <span className="text-white text-xs font-black uppercase truncate max-w-[120px]">{p.name}</span>
                                   </div>
                                   <div className="flex gap-3 md:gap-5 text-center">
                                      <div className="w-8"><span className="block text-[7px] text-slate-500 font-black">ATA</span><span className="text-white font-black text-sm">{p.stats.attacks}</span></div>
                                      <div className="w-8"><span className="block text-[7px] text-slate-500 font-black">BLQ</span><span className="text-white font-black text-sm">{p.stats.blocks}</span></div>
                                      <div className="w-12 bg-indigo-600/30 rounded-lg"><span className="block text-[7px] text-indigo-400 font-black">TOT</span><span className="text-white font-black text-sm">{p.stats.totalPoints}</span></div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       ))}
                    </div>
                 )}
                 {statTab === 'TEAM' && (
                   <div className="space-y-8 max-w-3xl mx-auto">
                      {[
                        { label: 'ATAQUES GANADOS', key: 'attacks' as keyof PlayerStats },
                        { label: 'BLOQUEOS GANADOS', key: 'blocks' as keyof PlayerStats },
                        { label: 'SAQUES ACE', key: 'aces' as keyof PlayerStats },
                        { label: 'ERRORES COMETIDOS', key: 'errors' as keyof PlayerStats }
                      ].map((row, i) => {
                        const valA = match.teamA.players.reduce((sum, p) => sum + p.stats[row.key], 0);
                        const valB = match.teamB.players.reduce((sum, p) => sum + p.stats[row.key], 0);
                        const total = valA + valB || 1;
                        return (
                          <div key={i} className="space-y-3">
                             <div className="flex justify-between text-white font-black italic px-4 text-sm md:text-base">
                                <span>{valA}</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-300">{row.label}</span>
                                <span>{valB}</span>
                             </div>
                             <div className="h-2.5 md:h-4 bg-black/50 rounded-full overflow-hidden flex border border-white/5 shadow-inner">
                                <div style={{ width: `${(valA/total)*100}%` }} className="h-full bg-indigo-500 transition-all duration-700"></div>
                                <div style={{ width: `${(valB/total)*100}%` }} className="h-full bg-red-600 transition-all duration-700"></div>
                             </div>
                          </div>
                        )
                      })}
                   </div>
                 )}
              </div>
              
              {!isSpectator && (
                <footer className="p-8 md:p-10 flex justify-center border-t border-white/10 bg-black/20">
                   <button onClick={closeOverlay} className="bg-white text-[#101a6b] px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-slate-100 active:scale-95 transition-all flex items-center gap-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      REGRESAR A CONSOLA
                   </button>
                </footer>
              )}
           </div>
        </div>
      )}

      {/* SEPARATE ROTATION VIEW */}
      {overlay === 'ROTATION_VIEW' && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 animate-pop">
           <div className="w-full max-w-5xl bg-slate-900 rounded-[2rem] md:rounded-[3rem] border border-white/10 overflow-hidden shadow-3xl flex flex-col max-h-[95vh]">
              <header className="p-8 bg-indigo-600 text-center">
                 <h2 className="text-white text-2xl md:text-4xl font-black italic uppercase tracking-tighter">ALINEACIÓN Y ROTACIÓN</h2>
                 <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest mt-2">JUGADORES EN CANCHA ACTUALES</p>
              </header>
              <div className="flex-1 p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 overflow-y-auto custom-scrollbar">
                 {[match.teamA, match.teamB].map((team, idx) => (
                    <div key={idx} className="space-y-6">
                       <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                          <img src={team.logoUrl} className="w-12 h-12 bg-white rounded-xl p-1 shadow-lg" />
                          <h3 className="text-white font-black italic text-2xl uppercase tracking-tighter">{team.name}</h3>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          {team.players.map(p => {
                            const onCourt = idx === 0 ? match.rotationA.includes(p.id) : match.rotationB.includes(p.id);
                            return (
                              <div key={p.id} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${onCourt ? 'bg-indigo-600 border-white shadow-xl scale-105' : 'bg-black/40 border-white/5 opacity-40'}`}>
                                 <img src={p.imageUrl} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                                 <div className="overflow-hidden">
                                    <p className="text-white font-black text-xs italic truncate">#{p.number} {p.name.split(' ')[0]}</p>
                                    <p className={`text-[8px] font-bold uppercase tracking-widest ${onCourt ? 'text-white' : 'text-indigo-400'}`}>{onCourt ? 'EN CANCHA' : p.position}</p>
                                 </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                 ))}
              </div>
              {!isSpectator && (
                <footer className="p-8 flex justify-center border-t border-white/10">
                   <button onClick={closeOverlay} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-3">
                      REGRESAR A CONSOLA
                   </button>
                </footer>
              )}
           </div>
        </div>
      )}

      {/* OJO DE HALCÓN (BALÓN PARABÓLICO) */}
      {(overlay === 'HAWK_EYE_SCAN' || overlay === 'HAWK_EYE_RESULT') && (
        <div className="absolute inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center animate-pop">
           <div className="w-full max-w-4xl px-4 md:px-10">
              <div className="relative aspect-video bg-[#1b5e20] border-4 md:border-[12px] border-[#388e3c] shadow-3xl rounded-[2rem] md:rounded-[3rem] overflow-hidden">
                 <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'repeating-linear-gradient(0deg, #fff, #fff 2px, transparent 2px, transparent 40px), repeating-linear-gradient(90deg, #fff, #fff 2px, transparent 2px, transparent 40px)'}}></div>
                 <div className="absolute bottom-[22%] left-0 w-full h-1 md:h-3 bg-white shadow-2xl"></div>
                 
                 {overlay === 'HAWK_EYE_SCAN' ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                      <div className="w-16 h-16 border-8 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-2xl md:text-4xl font-black italic text-white uppercase tracking-[0.5em] animate-pulse">RECONSTRUYENDO...</span>
                   </div>
                 ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className={`absolute w-12 h-12 md:w-16 md:h-16 bg-yellow-400 rounded-full border-4 border-black shadow-3xl animate-parabola-final ${match.hawkEyeResult === 'IN' ? 'target-in' : 'target-out'}`}></div>
                      <h2 className={`text-[6rem] md:text-[14rem] font-black italic uppercase drop-shadow-[0_20px_50px_rgba(0,0,0,1)] leading-none ${match.hawkEyeResult === 'IN' ? 'text-emerald-400' : 'text-red-500'}`}>
                        {match.hawkEyeResult === 'IN' ? 'DENTRO' : 'FUERA'}
                      </h2>
                      <div className="bg-white text-[#101a6b] px-8 md:px-12 py-2 md:py-4 font-black text-2xl md:text-5xl italic shadow-3xl mt-6 rounded-2xl">HAWK EYE PRO</div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* SET / MATCH POINT OVERLAYS */}
      {(overlay === 'SET_POINT' || overlay === 'MATCH_POINT') && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
           <div className={`${overlay === 'SET_POINT' ? 'bg-orange-600' : 'bg-red-700'} px-10 md:px-16 py-4 md:py-6 rounded-[2.5rem] md:rounded-[3rem] border-4 md:border-8 border-white shadow-3xl`}>
              <span className="text-white font-black italic text-3xl md:text-7xl uppercase tracking-tighter leading-none">{overlay.replace('_', ' ')}</span>
           </div>
        </div>
      )}

      {/* LOGO TORNEO PERPETUO (ABAJO DERECHA) */}
      {tournamentLogo && overlay !== 'TICKER_BOTTOM' && (
        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-40 opacity-40 hover:opacity-100 transition-opacity">
           <img src={tournamentLogo} className="h-10 md:h-20 w-auto object-contain" />
        </div>
      )}

      {/* BOTONES DE ADMINISTRACIÓN (ESCONDIDOS PARA ESPECTADOR) */}
      {!isSpectator && isAdmin && (
        <div className="absolute top-6 right-6 md:top-10 md:right-10 z-[2000] flex flex-col gap-3 items-end">
           <div className="flex gap-2">
             <button onClick={handleShare} className="bg-indigo-600 p-4 md:p-5 rounded-2xl shadow-2xl border border-white/20 text-white hover:scale-105 active:scale-95 transition-all">
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
             </button>
             <button onClick={onGoToConsole} className="bg-white text-[#101a6b] px-6 md:px-8 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase shadow-2xl border border-white/10 hover:bg-slate-100 active:scale-95 transition-all">
                CONSOLA
             </button>
           </div>
           <button onClick={onFinishLive} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-2xl border border-white/10 hover:bg-red-500 transition-all">
              SALIR DE TRANSMISIÓN
           </button>
        </div>
      )}

      {/* BOTÓN CERRAR PARA ESPECTADOR */}
      {isSpectator && (
        <button onClick={onFinishLive} className="absolute top-6 right-6 z-[2000] bg-black/50 text-white p-4 rounded-full hover:bg-black/80 shadow-2xl">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}

      <style>{`
        .shadow-3xl { filter: drop-shadow(0 35px 70px rgba(0,0,0,0.9)); }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        
        @keyframes parabola-final {
          0% { transform: translate(-300px, -50px) scale(2); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: translate(0, -180px) scale(1.2); }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.8); }
        }
        
        .animate-parabola-final {
          animation: parabola-final 1s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
        }

        .target-in { --tx: 0px; --ty: 100px; }
        .target-out { --tx: 280px; --ty: 100px; }

        @media (max-width: 768px) {
          .target-in { --tx: 0px; --ty: 40px; }
          .target-out { --tx: 100px; --ty: 40px; }
        }
      `}</style>
    </div>
  );
};
