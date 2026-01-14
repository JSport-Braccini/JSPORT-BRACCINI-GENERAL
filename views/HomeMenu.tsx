
import React from 'react';
import { UserRole } from '../types';

interface MenuOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface HomeMenuProps {
  role: UserRole;
  onSelectModule: (id: string) => void;
}

export const HomeMenu: React.FC<HomeMenuProps> = ({ role, onSelectModule }) => {
  const getMenuOptions = (): MenuOption[] => {
    switch (role) {
      case UserRole.ADMIN:
        return [
          {
            id: 'ADMIN_DASHBOARD',
            title: 'Gestión General',
            description: 'Torneos, Equipos y Fixtures',
            color: 'bg-blue-600',
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          },
          {
            id: 'ADMIN_CONSOLE',
            title: 'Consola de Marcación',
            description: 'Control de puntos en vivo',
            color: 'bg-indigo-600',
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          },
          {
            id: 'LIVE_SPECTATOR',
            title: 'Transmisión',
            description: 'Overlays y transmisión',
            color: 'bg-red-600',
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          }
        ];
      case UserRole.COACH:
        return [
          {
            id: 'COACH_ROTATION',
            title: 'Rotación',
            description: 'Configurar alineación',
            color: 'bg-blue-600',
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          },
          {
            id: 'STATS',
            title: 'Estadísticas',
            description: 'Rendimiento de equipo',
            color: 'bg-emerald-600',
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
          }
        ];
      default:
        return [
          {
            id: 'LIVE_SPECTATOR',
            title: 'En Vivo',
            description: 'Ver transmisión actual',
            color: 'bg-red-600',
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          }
        ];
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-[calc(100vh-80px)] flex flex-col justify-center">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-2 animate-pop">
          Hola, <span className="text-indigo-500">{role}</span>
        </h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Panel de Control JSPORT</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pop">
        {getMenuOptions().map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelectModule(opt.id)}
            className="group relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left transition-all hover:border-indigo-500/50 hover:bg-slate-800/50 shadow-lg"
          >
            <div className={`w-12 h-12 ${opt.color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
              {opt.icon}
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-1 group-hover:text-indigo-400 transition-colors leading-none">
              {opt.title}
            </h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{opt.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
