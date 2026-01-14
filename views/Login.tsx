
import React, { useState } from 'react';
import { UserRole, User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      let determinedRole = UserRole.SPECTATOR;
      const lowerUser = username.toLowerCase();
      
      if (lowerUser.includes('admin')) {
        determinedRole = UserRole.ADMIN;
      } else if (lowerUser.includes('coach') || lowerUser.includes('entrenador')) {
        determinedRole = UserRole.COACH;
      } else if (lowerUser.includes('ref') || lowerUser.includes('arbitro')) {
        determinedRole = UserRole.REFEREE;
      }

      onLogin({ username, role: determinedRole });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 overflow-hidden relative">
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-pink-500 blur-3xl"></div>
      </div>

      <div className="w-full max-w-[380px] glass-panel p-8 rounded-[2rem] border border-white/5 shadow-2xl animate-pop relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-500/40 transform -rotate-3 transition-transform hover:rotate-0 duration-500 group">
            <svg viewBox="0 0 512 512" className="w-12 h-12 text-white drop-shadow-xl" fill="currentColor">
              <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm140.2 135.2c-15.7-18.1-34.9-33.1-56.1-43.9-3.2-1.6-6.4-3.1-9.7-4.5 32.1 25.4 56.6 61 65.8 101.9-2.2-.4-4.5-.8-6.8-1.1-26.6-4.1-53.7-4.1-80.3 0-25.1 3.9-49.8 11.3-73.4 22.1 19.4-23.7 34.6-50.6 44.9-79.6 4.3-12 7.7-24.3 10-36.8 35.1 8 66.8 25.8 91 50.3 4.8 4.9 9.3 10.1 13.5 15.5l1.1 1.1zM256 80c-2.3 0-4.6.1-6.9.3-2.6 15.3-6.5 30.2-11.7 44.6-11.5 32.4-28.8 62.4-51.1 89.2-14.2-7.1-29.2-12.8-44.8-17-21.7-5.9-44-8.8-66.5-8.8-10.4 0-20.9.6-31.2 1.9C57.4 148.4 99.4 104.2 155 86.8c12-3.8 24.5-6 37.4-6.6 20.8-1.1 42.1.2 63.6 3.8zm-176 138.8c21.8-.4 43.6 2.3 64.6 8 21.3 5.8 41.7 14.5 60.7 25.9-10.1 29.3-25 56.5-44.2 80.6-5.4 6.8-11.1 13.2-17.1 19.3-43.8-31.9-74.9-80.8-82.9-136.2l1.1-1.1-2.2 3.5zm31.7 151.7c8.8-6.1 17.1-12.9 25-20.2 19-17.7 35.5-38.3 49-61 14.6 19.2 31.9 36.3 51.5 50.8 16.7 12.3 35.1 22.1 54.4 29 2.5.9 5 1.7 7.5 2.5-35 22.8-76.6 36-121.2 36-19.4 0-38.1-2.5-55.9-7.1-4.2-1-8.3-2.1-12.4-3.4 2.1-.6 4.2-1.2 6.3-1.8 13.6-4.5 26.6-9.7 39.1-15.6l-3.3.8zm181.5 61.1c-14.7-6.2-28.7-13.8-41.6-22.6-13.4-9.1-25.7-19.3-36.8-30.5 21.6-10.4 44-18.4 67.2-23.7 26.2-5.9 53-8.8 80-8.8 10.1 0 20.2.4 30.2 1.3-13.1 48.7-49.8 88.5-96.5 104-10.2-2.3-20.4-5.3-30.2-10l-2.3-1.1z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white italic">J<span className="text-indigo-500">SPORT</span></h1>
          <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">Gestión Pro de Voleibol</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-white placeholder-slate-700 font-bold text-sm"
              placeholder="Nombre de usuario"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-white placeholder-slate-700 font-bold text-sm"
              placeholder="Contraseña"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-2xl shadow-indigo-600/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs mt-2"
          >
            ENTRAR AL SISTEMA
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] italic">JSPORT BROADCAST SYSTEM v2.5</p>
        </div>
      </div>
    </div>
  );
};
