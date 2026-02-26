import React from 'react';
import { Database, Zap, Layers, Network, Download, ShieldCheck, RefreshCcw } from 'lucide-react';

const AdcTable = ({ sites = [], loading, element, locationName }) => {
  // --- LOGIKA RECAP ---
  const safeSites = Array.isArray(sites) ? sites : [];
  const totalNodes = safeSites.length;
  const uniqueVlans = new Set(safeSites.map(s => s.vlan).filter(v => v !== "-")).size;
  const activeNodes = safeSites.filter(s => 
    String(s.status || '').toUpperCase().includes('ACTIVE') || 
    String(s.status || '').toUpperCase().includes('ON AIR')
  ).length;

  const columns = [
    { label: 'NODE NAME', key: 'name' },
    { label: 'VLAN ID', key: 'vlan' },
    { label: 'VRF / SDN SEGMENT', key: 'vrf_sdn' },
  ];

  const handleExportCSV = () => {
    if (totalNodes === 0) return alert("Tidak ada data");
    const headers = ["No", ...columns.map(col => col.label)].join(",");
    const rows = safeSites.map((s, i) => [i + 1, ...columns.map(c => `"${s[c.key] || '-'}"`)].join(","));
    const link = document.createElement("a");
    link.href = encodeURI("data:text/csv;charset=utf-8," + [headers, ...rows].join("\n"));
    link.download = `ADC_Report_${locationName}.csv`;
    link.click();
  };

  return (
    <div className="text-left animate-in fade-in duration-500">
      
      {/* 1. RECAP CARDS (IDENTIK DENGAN MSS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-inner"><Database size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Nodes</p>
            <p className="text-4xl font-black text-slate-800 italic leading-none">{totalNodes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-red-100 text-red-600 rounded-2xl"><Zap size={28} fill="currentColor"/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Active</p>
            <p className="text-4xl font-black text-red-600 italic leading-none">{activeNodes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Network size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Unique VLAN</p>
            <p className="text-3xl font-black text-slate-800 italic leading-none">{uniqueVlans}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-green-100 text-green-600 rounded-2xl"><ShieldCheck size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Integrity</p>
            <p className="text-3xl font-black text-green-600 italic leading-none">VERIFIED</p>
          </div>
        </div>
      </div>

      {/* 2. TABEL DATA (KONSISTEN: RATA TENGAH, SLATE-700, TEGAK) */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden text-center">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest text-center">
              <tr>
                <th className="px-6 py-6 border-r border-slate-700 w-20">No</th>
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-6 whitespace-nowrap border-r border-slate-700 last:border-0">{col.label}</th>
                ))}
              </tr>
            </thead>
            
            {/* TBODY: Slate-700, Tegak, Bold, Center */}
            <tbody className="divide-y divide-gray-100 font-bold text-[12px] text-slate-700">
              {safeSites.map((site, index) => (
                <tr key={index} className="hover:bg-blue-50/40 transition-colors group cursor-default">
                  <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50 italic">{index + 1}</td>
                  
                  {columns.map(col => {
                    const val = site[col.key] || '-';

                    return (
                      <td key={col.key} className="px-6 py-6 border-r border-gray-50 whitespace-nowrap text-center transition-colors group-hover:text-red-700">
                         {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {totalNodes === 0 && !loading && (
             <div className="p-40 text-center text-gray-300 font-black uppercase text-2xl tracking-[0.2em] opacity-10">
                <RefreshCcw size={80} className="mx-auto mb-4" />
                Data Records Empty
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdcTable;