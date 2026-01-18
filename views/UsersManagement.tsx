
import React from 'react';
import { User, UserRole } from '../types';
import { ROLE_CONFIG } from '../constants';

interface UsersManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({ users, setUsers }) => {
  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-10 animate-pop">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black uppercase italic text-white leading-none tracking-tighter">USUARIOS</h2>
          <p className="text-slate-500 font-black text-[10px] uppercase mt-2 tracking-widest italic">CENTRO DE CONTROL DE ACCESOS</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map(u => (
          <div key={u.id} className="bg-slate-900 p-6 rounded-[2.5rem] border border-white/5 flex flex-col gap-4 relative group shadow-2xl">
             <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <button 
                  onClick={() => { if(confirm("¿Eliminar usuario?")) setUsers(prev => prev.filter(it => it.id !== u.id)) }} 
                  className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2"/></svg>
                </button>
             </div>
             <div>
                <p className="text-white font-black uppercase text-lg italic tracking-tighter">{u.username}</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] ${ROLE_CONFIG[u.role].color}`}>
                  {ROLE_CONFIG[u.role].label}
                </span>
             </div>
          </div>
        ))}
        {users.length === 0 && (
           <div className="col-span-full py-20 bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4">
              <span className="text-slate-700 font-black italic text-xl uppercase tracking-widest">NO HAY OTROS USUARIOS</span>
           </div>
        )}
      </div>
    </div>
  );
};
