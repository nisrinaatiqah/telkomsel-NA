import React, { useState } from 'react'; // Tambahkan useState
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Network, Database, Globe, Server, 
  Activity, ChevronRight, TrendingUp, Shield, 
  Cpu, UserCheck, Radio, X 
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  // --- PERBAIKAN 1: Tambahkan State untuk Modal GGSN ---
  const [showGgsnMenu, setShowGgsnMenu] = useState(false);

  const csDomain = [
    { name: 'MSS', full: 'Mobile Switching Center Server', icon: <Network size={20}/>, color: 'bg-red-500', count: 245 },
    { name: 'MGW', full: 'Media Gateway', icon: <Server size={20}/>, color: 'bg-red-600', count: 189 },
    { name: 'TMGW', full: 'Trunk Media Gateway', icon: <Activity size={20}/>, color: 'bg-red-700', count: 156 },
    { name: 'GSS', full: 'Gateway Support System', icon: <Database size={20}/>, color: 'bg-rose-600', count: 203 },
  ];

  const psDomain = [
    { name: 'SGSN-MME', full: 'Serving GPRS Support Node', icon: <Cpu size={20}/>, color: 'bg-slate-700', count: 312 },
    { name: 'GGSN', full: 'Gateway GPRS Support Node', icon: <Server size={20}/>, color: 'bg-slate-600', count: 278 },
    { name: 'DNS Gi', full: 'Domain Name System Gi', icon: <Shield size={20}/>, color: 'bg-slate-500', count: 145 },
    { name: 'DNS Gn', full: 'Domain Name System Gn', icon: <Globe size={20}/>, color: 'bg-blue-600', count: 167 },
    { name: 'ADC', full: 'Application Delivery Controller', icon: <Zap size={20}/>, color: 'bg-indigo-700', count: 223 },
    { name: 'USC/STP', full: 'User Service Center', icon: <Activity size={20}/>, color: 'bg-zinc-700', count: 198 },
    { name: 'UDM/HSS', full: 'Unified Data Management', icon: <UserCheck size={20}/>, color: 'bg-cyan-700', count: 234 },
    { name: 'IMS', full: 'IP Multimedia Subsystem', icon: <Radio size={20}/>, color: 'bg-emerald-700', count: 189 },
  ];

  // --- PERBAIKAN 2: Fungsi Handler Klik ---
  const handleItemClick = (name) => {
    if (name === 'GGSN') {
      setShowGgsnMenu(true);
    } else {
      navigate(`/map/${name.replace('/', '-')}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans relative">
      <div className="max-w-7xl mx-auto p-8">
        
        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Sites', val: '15,758', trend: '+12.5%', col: 'border-red-600' },
            { label: 'CS Domain', val: '793', trend: 'Active', col: 'border-red-500' },
            { label: 'PS Domain', val: '1,746', trend: 'Active', col: 'border-slate-700' },
            { label: 'Coverage', val: '86%', trend: 'Indonesia', col: 'border-blue-500' },
          ].map((s, i) => (
            <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border-l-8 ${s.col} transform hover:scale-105 transition-all`}>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-3xl font-black text-gray-800">{s.val}</p>
              <p className="text-[10px] font-bold text-green-600 mt-2 flex items-center gap-1 uppercase"><TrendingUp size={12}/> {s.trend}</p>
            </div>
          ))}
        </div>

        {/* Domains Grid */}
        <div className="grid lg:grid-cols-2 gap-10">
          
          {/* CS Domain Section */}
          <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-gray-100 h-fit">
            <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><Network size={28}/></div>
                <div><h2 className="text-2xl font-black text-gray-800">CS Domain</h2><p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Circuit Switched</p></div>
              </div>
              <div className="text-right"><p className="text-3xl font-black text-red-600 tracking-tighter">793</p><p className="text-[10px] font-bold text-gray-300 uppercase">Total units</p></div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {csDomain.map((item, idx) => (
                <div key={idx} onClick={() => handleItemClick(item.name)}
                className="group flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-red-500 hover:bg-white transition-all cursor-pointer shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${item.color} text-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}>{item.icon}</div>
                    <div><p className="font-bold text-gray-800">{item.name}</p><p className="text-[10px] text-gray-400 font-medium">{item.full}</p></div>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* PS Domain Section */}
          <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-gray-100 h-fit">
            <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl"><Database size={28}/></div>
                <div><h2 className="text-2xl font-black text-slate-800">PS Domain</h2><p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Packet Switched</p></div>
              </div>
              <div className="text-right"><p className="text-3xl font-black text-slate-700 tracking-tighter">1,746</p><p className="text-[10px] font-bold text-gray-300 uppercase">Total units</p></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {psDomain.map((item, idx) => (
                <div key={idx} onClick={() => handleItemClick(item.name)}
                className="group flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-slate-800 hover:bg-white transition-all cursor-pointer shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${item.color} text-white rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>{item.icon}</div>
                    <div><p className="font-bold text-gray-800 text-sm">{item.name}</p><p className="text-[8px] text-gray-400 font-bold uppercase tracking-tight">{item.full.split(' ').slice(0,2).join(' ')}...</p></div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-slate-800 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- PERBAIKAN 3: MODAL PEMILIHAN TIPE GGSN --- */}
      {showGgsnMenu && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl border-8 border-white p-10 relative text-center animate-in zoom-in duration-300">
            <button 
              onClick={() => setShowGgsnMenu(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
            >
              <X size={24} />
            </button>
            
            <div className="w-20 h-20 bg-slate-100 text-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
               <Server size={40} />
            </div>

            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800 leading-none mb-2">GGSN TYPE</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Select traffic analysis category</p>
            
            <div className="grid gap-4">
              <button 
                onClick={() => navigate('/map/GGSN-THP')}
                className="group flex items-center justify-between p-6 bg-red-600 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-red-100 hover:bg-black transition-all"
              >
                <span>GGSN THP</span>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => navigate('/map/GGSN-PDP')}
                className="group flex items-center justify-between p-6 bg-slate-800 text-white rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-slate-100 hover:bg-black transition-all"
              >
                <span>GGSN PDP</span>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <button 
              onClick={() => setShowGgsnMenu(false)}
              className="mt-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] hover:text-red-600 transition-colors"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Zap = ({size}) => <Activity size={size} />; 

export default Home;