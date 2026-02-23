import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Briefcase, History, Calendar, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5001/api/history')
      .then(res => setLogs(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-8 font-black text-red-600 uppercase tracking-widest text-sm hover:translate-x-[-5px] transition-all">
          <ArrowLeft size={20} /> Back
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* KIRI: KARTU PROFIL */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border-8 border-white overflow-hidden p-8 text-center">
              <div className="w-32 h-32 bg-red-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white border-4 border-red-50 shadow-xl">
                <User size={60} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 uppercase italic leading-none">Admin</h2>
              <p className="text-red-600 font-bold text-[10px] tracking-widest uppercase mt-2">Verified User</p>
              
              <div className="mt-8 pt-8 border-t border-gray-100 text-left space-y-4">
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase">Jabatan</p>
                    <p className="text-xs font-bold text-gray-800">Core</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase">Departemen</p>
                    <p className="text-xs font-bold text-gray-800">Network Architecture</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KANAN: HISTORY */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border-8 border-white p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-slate-900 text-white rounded-2xl"><History size={24}/></div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Activity Logs</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tracking Your Data Additions</p>
                </div>
              </div>

              <div className="space-y-4">
                {logs.length > 0 ? logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-red-100 transition-all">
                    <div className="p-2 bg-white rounded-xl shadow-sm mt-1 text-red-600">
                      <Calendar size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{log.action}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-800">Element: {log.element}</p>
                      <p className="text-xs text-gray-500 italic mt-1">{log.details}</p>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest italic">
                    Belum ada aktivitas tercatat
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;