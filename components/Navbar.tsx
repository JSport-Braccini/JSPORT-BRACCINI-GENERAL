
import React from 'react';
import { UserRole } from '../types';
import { ROLE_CONFIG } from '../constants';

interface NavbarProps {
  currentRole: UserRole;
  onGoHome: () => void;
  isAtHome: boolean;
  username?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onGoHome, isAtHome, username }) => {
  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <button 
          onClick={onGoHome}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/5 transition-transform group-hover:scale-105">
            <svg viewBox="0 0 512 512" className="w-7 h-7 text-slate-950 drop-shadow-sm transition-transform group-hover:rotate-45 duration-700" fill="currentColor">
              <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm140.2 135.2c-15.7-18.1-34.9-33.1-56.1-43.9-3.2-1.6-6.4-3.1-9.7-4.5 32.1 25.4 56.6 61 65.8 101.9-2.2-.4-4.5-.8-6.8-1.1-26.6-4.1-53.7-4.1-80.3 0-25.1 3.9-49.8 11.3-73.4 22.1 19.4-23.7 34.6-50.6 44.9-79.6 4.3-12 7.7-24.3 10-36.8 35.1 8 66.8 25.8 91 50.3 4.8 4.9 9.3 10.1 13.5 15.5l1.1 1.1zM256 80c-2.3 0-4.6.1-6.9.3-2.6 15.3-6.5 30.2-11.7 44.6-11.5 32.4-28.8 62.4-51.1 89.2-14.2-7.1-29.2-12.8-44.8-17-21.7-5.9-44-8.8-66.5-8.8-10.4 0-20.9.6-31.2 1.9C57.4 148.4 99.4 104.2 155 86.8c12-3.8 24.5-6 37.4-6.6 20.8-1.1 42.1.2 63.6 3.8zm-176 138.8c21.8-.4 43.6 2.3 64.6 8 21.3 5.8 41.7 14.5 60.7 25.9-10.1 29.3-25 56.5-44.2 80.6-5.4 6.8-11.1 13.2-17.1 19.3-43.8-31.9-74.9-80.8-82.9-136.2l1.1-1.1-2.2 3.5zm31.7 151.7c8.8-6.1 17.1-12.9 25-20.2 19-17.7 35.5-38.3 49-61 14.6 19.2 31.9 36.3 51.5 50.8 16.7 12.3 35.1 22.1 54.4 29 2.5.9 5 1.7 7.5 2.5-35 22.8-76.6 36-121.2 36-19.4 0-38.1-2.5-55.9-7.1-4.2-1-8.3-2.1-12.4-3.4 2.1-.6 4.2-1.2 6.3-1.8 13.6-4.5 26.6-9.7 39.1-15.6l-3.3.8zm181.5 61.1c-14.7-6.2-28.7-13.8-41.6-22.6-13.4-9.1-25.7-19.3-36.8-30.5 21.6-10.4 44-18.4 67.2-23.7 26.2-5.9 53-8.8 80-8.8 10.1 0 20.2.4 30.2 1.3-13.1 48.7-49.8 88.5-96.5 104-10.2-2.3-20.4-5.3-30.2-10l-2.3-1.1z"/>
            </svg>
          </div>
          <h1 className="text-xl font-black tracking-tighter hidden md:block uppercase italic">J<span className="text-indigo-500">SPORT</span></h1>
        </button>

        {!isAtHome && (
          <button 
            onClick={onGoHome}
            className="hidden sm:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-1.5 rounded-xl border border-slate-700 text-xs font-bold transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            VOLVER AL MENÚ
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end mr-2 hidden sm:block">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Usuario</p>
          <p className="text-xs font-bold text-white">{username || 'Sesión'}</p>
        </div>
        <div className={`${ROLE_CONFIG[currentRole].color} text-white px-4 py-2 rounded-xl text-[10px] md:text-xs font-black shadow-lg uppercase tracking-widest border border-white/10`}>
          {ROLE_CONFIG[currentRole].label}
        </div>
      </div>
    </nav>
  );
};
