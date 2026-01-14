
import React, { useEffect, useRef, useState } from 'react';
import { Match, UserRole } from '../types';

interface LiveViewProps {
  match: Match;
  onGoToConsole?: () => void;
  onFinishLive?: () => void;
  tournamentLogo?: string;
  userRole?: UserRole;
}

export const LiveView: React.FC<LiveViewProps> = ({ match, onGoToConsole, onFinishLive, tournamentLogo, userRole }) => {
  const currentSet = match.sets[match.currentSet - 1] || { teamAScore: 0, teamBScore: 0 };
  const overlay = match.activeOverlay;
  const videoRef = useRef<HTMLVideoElement>(null);
  const isAdmin = userRole === UserRole.ADMIN;

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, 
          audio: false 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.warn("No se pudo acceder a la cámara:", err);
      }
    }
    setupCamera();
  }, []);

  const getSetWins = (team: 'A' | 'B') => match.sets.filter(s => s.winner === team).length;

  return (
    <div className="relative w-full h-full min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* FEED DE BROADCAST */}
      <div className="absolute inset-0 z-0">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      </div>

      {/* 1. MINIBUG - SUPERIOR IZQUIERDA, HORIZONTAL, CON LOGOS */}
      {overlay === 'MINIBUG' && (
        <div className="fixed top-6 left-6 z-50 flex flex-col animate-pop">
          <div className="flex items-stretch h-10 bg-white p-[1px] rounded-md shadow-2xl overflow-hidden border border-white/20">
            {/* Team A */}
            <div className="bg-[#101a6b] flex items-center px-3 gap-2">
              <div className="w-6 h-6 bg-white rounded-sm p-0.5 shadow-inner">
                <img src={match.teamA.logoUrl} crossOrigin="anonymous" className="w-full h-full object-contain" alt="Logo A" />
              </div>
              <span className="text-white font-black italic text-sm tracking-tighter uppercase">{match.teamA.name.slice(0,3)}</span>
              <div className="bg-white/10 w-5 h-5 flex items-center justify-center rounded-sm">
                 <span className="text-white font-black text-xs italic">{getSetWins('A')}</span>
              </div>
            </div>
            
            {/* Score A */}
            <div className={`w-10 flex items-center justify-center border-x border-white/20 transition-colors duration-500 ${match.lastPointTeam === 'A' ? 'bg-[#ff4d4d]' : 'bg-[#101a6b]'}`}>
               <span className="text-white font-black text-xl tabular-nums italic">{currentSet.teamAScore}</span>
            </div>

            {/* Central Logo */}
            <div className="bg-[#101a6b] px-2 flex items-center justify-center border-x border-white/20">
               <img src={tournamentLogo} crossOrigin="anonymous" className="h-5 w-auto brightness-200" alt="Tournament" />
            </div>

            {/* Score B */}
            <div className={`w-10 flex items-center justify-center border-x border-white/20 transition-colors duration-500 ${match.lastPointTeam === 'B' ? 'bg-[#ff4d4d]' : 'bg-[#101a6b]'}`}>
               <span className="text-white font-black text-xl tabular-nums italic">{currentSet.teamBScore}</span>
            </div>

            {/* Team B */}
            <div className="bg-[#101a6b] flex items-center px-3 gap-2">
              <div className="bg-white/10 w-5 h-5 flex items-center justify-center rounded-sm">
                 <span className="text-white font-black text-xs italic">{getSetWins('B')}</span>
              </div>
              <span className="text-white font-black italic text-sm tracking-tighter uppercase">{match.teamB.name.slice(0,3)}</span>
              <div className="w-6 h-6 bg-white rounded-sm p-0.5 shadow-inner">
                <img src={match.teamB.logoUrl} crossOrigin="anonymous" className="w-full h-full object-contain" alt="Logo B" />
              </div>
            </div>
          </div>
          
          {/* Timeouts/Subs Indicator (Optional micro-stats) */}
          <div className="flex justify-between mt-1 px-1">
             <div className="flex gap-1">
                {[...Array(match.timeoutsA)].map((_, i) => <div key={i} className="w-2 h-1 bg-yellow-400 rounded-full"></div>)}
                {[...Array(match.subsA)].map((_, i) => <div key={i} className="w-1.5 h-1.5 border border-white rounded-full"></div>)}
             </div>
             <div className="flex gap-1">
                {[...Array(match.subsB)].map((_, i) => <div key={i} className="w-1.5 h-1.5 border border-white rounded-full"></div>)}
                {[...Array(match.timeoutsB)].map((_, i) => <div key={i} className="w-2 h-1 bg-yellow-400 rounded-full"></div>)}
             </div>
          </div>
        </div>
      )}

      {/* 2. STATS MATCH - CON LOGOS */}
      {overlay === 'STATS_MATCH' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg animate-pop">
           <div className="bg-white rounded-2xl p-0.5 shadow-2xl">
              <div className="bg-[#101a6b] rounded-t-2xl p-6 flex justify-between items-center px-8 border-b border-white/10">
                 <div className="flex items-center gap-3">
                    <img src={match.teamA.logoUrl} crossOrigin="anonymous" className="w-10 h-10 object-contain bg-white rounded-lg p-1" />
                    <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">{match.teamA.name.slice(0,3)}</h2>
                 </div>
                 <div className="bg-[#ff4d4d] px-6 py-1.5 rounded-lg text-white font-black text-3xl italic tabular-nums">
                   {currentSet.teamAScore} - {currentSet.teamBScore}
                 </div>
                 <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black italic text-white uppercase tracking-tighter text-right">{match.teamB.name.slice(0,3)}</h2>
                    <img src={match.teamB.logoUrl} crossOrigin="anonymous" className="w-10 h-10 object-contain bg-white rounded-lg p-1" />
                 </div>
              </div>
              <div className="bg-[#050a1f] rounded-b-2xl overflow-hidden pb-4">
                 {[
                   ['SETS', getSetWins('A'), getSetWins('B')],
                   ['ATAQUES', 14, 16],
                   ['BLOQUEOS', 4, 2],
                   ['ERRORES', 5, 8]
                 ].map(([label, valA, valB], idx) => (
                   <div key={idx} className={`flex items-center justify-between px-10 py-3 ${idx % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}>
                      <span className="text-2xl font-black text-white w-12 text-left italic">{valA}</span>
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">{label}</span>
                      <span className="text-2xl font-black text-white w-12 text-right italic">{valB}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* 3. OJO DE HALCÓN - CANCHA + BALÓN CAYENDO */}
      {(overlay === 'HAWK_EYE_IN' || overlay === 'HAWK_EYE_OUT') && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 animate-pop">
           <div className="relative w-80 h-80 flex flex-col items-center justify-center">
              {/* Cancha de Voley Abstracta (Línea de fondo) */}
              <div className="relative w-64 h-32 bg-emerald-600 border-x-4 border-t-4 border-white shadow-2xl">
                 <div className="absolute bottom-0 w-full h-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                 {/* Representación de zona de OUT */}
                 <div className="absolute -bottom-16 w-full h-16 bg-emerald-900/30"></div>
                 
                 {/* El Balón Animado */}
                 <div 
                   className={`absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-400 rounded-full border-2 border-slate-900 shadow-xl ball-drop ${overlay === 'HAWK_EYE_IN' ? 'land-in' : 'land-out'}`}
                 >
                    <div className="w-full h-full rounded-full border-t-2 border-white/40 rotate-45"></div>
                 </div>
              </div>

              {/* Resultado */}
              <div className="mt-20 flex flex-col items-center gap-2 result-fade-in">
                 <h2 className={`text-7xl font-black italic uppercase leading-none drop-shadow-2xl tracking-tighter ${overlay === 'HAWK_EYE_IN' ? 'text-emerald-400' : 'text-red-500'}`}>
                    {overlay === 'HAWK_EYE_IN' ? 'IN' : 'OUT'}
                 </h2>
                 <div className="bg-white text-[#101a6b] px-10 py-2 font-black text-xl italic uppercase tracking-[0.3em] shadow-2xl">
                    OJO DE HALCÓN
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 4. SET/MATCH POINT */}
      {(overlay === 'SET_POINT' || overlay === 'MATCH_POINT') && (
        <div className="absolute top-24 w-full z-50 flex flex-col items-center animate-pop">
           <div className="bg-white p-[1px] rounded shadow-2xl flex border-b-4 border-[#ff4d4d]">
              <div className="bg-[#101a6b] px-16 py-3 flex items-center justify-center">
                 <span className="text-white font-black italic text-5xl tracking-tighter uppercase">
                   {overlay === 'SET_POINT' ? 'SET POINT' : 'MATCH POINT'}
                 </span>
              </div>
           </div>
        </div>
      )}

      {/* Control Buttons (Admin Only) */}
      {isAdmin && (
        <div className="absolute top-6 right-6 z-[60] flex flex-col gap-2">
          {onGoToConsole && (
            <button onClick={onGoToConsole} className="bg-[#101a6b]/80 backdrop-blur-md text-white px-5 py-2.5 rounded-lg font-black text-[9px] tracking-widest shadow-xl border border-white/10 uppercase">CONSOLA</button>
          )}
          {onFinishLive && (
            <button onClick={onFinishLive} className="bg-red-600/80 backdrop-blur-md text-white px-5 py-2.5 rounded-lg font-black text-[9px] tracking-widest shadow-xl border border-white/10 uppercase">FINALIZAR</button>
          )}
        </div>
      )}

      <style>{`
        @keyframes ballDropIn {
          0% { transform: translate(-50%, -200px) scale(1.5); opacity: 0; }
          100% { transform: translate(-50%, 14px) scale(1); opacity: 1; }
        }
        @keyframes ballDropOut {
          0% { transform: translate(-50%, -200px) scale(1.5); opacity: 0; }
          100% { transform: translate(-50%, 50px) scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .ball-drop { animation-duration: 0.8s; animation-fill-mode: forwards; animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .land-in { animation-name: ballDropIn; }
        .land-out { animation-name: ballDropOut; }
        .result-fade-in { animation: fadeIn 0.4s ease-out 0.8s forwards; opacity: 0; }
      `}</style>

    </div>
  );
};
