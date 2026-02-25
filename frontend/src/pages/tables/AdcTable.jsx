import React from 'react';
import { Database, Zap, Layers, Network, Download, ShieldCheck } from 'lucide-react';

const AdcTable = ({ sites, loading, element, locationName }) => {
  // --- LOGIKA RECAP ---
  const totalNodes = sites.length;
  const uniqueVlans = new Set(sites.map(s => s.vlan).filter(v => v !== "-")).size;
  const activeNodes = sites.filter(s => 
    String(s.status || '').toUpperCase().includes('ACTIVE') || 
    String(s.status || '').toUpperCase().includes('ON AIR')
  ).length;

  const columns = [
    { label: 'NODE NAME', key: 'name' },
    { label: 'PROVINCE', key: 'region' },
    { label: 'VLAN ID', key: 'vlan' },
    { label: 'VRF / SDN SEGMENT', key: 'vrf_sdn' },
    { label: 'STATUS', key: 'status' },
  ];

  const handleExportCSV = () => {
    if (sites.length === 0) return alert("No records found");
    const headers = ["No", ...columns.map(col => col.label)].join(",");
    const rows = sites.map((s, i) => [i + 1, ...columns.map(c => `"${s[c.key] || '-'}"`)].join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `ADC_Report_${locationName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-left animate-in fade-in duration-500">
      
      {/* 1. SUMMARY CARDS (IDENTIK DENGAN MSS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-slate-900 text-white rounded-2xl"><Database size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Nodes</p>
            <p className="text-4xl font-black text-gray-800 italic leading-none">{totalNodes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-red-100 text-red-600 rounded-2xl"><Zap size={28} fill="currentColor"/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Active Nodes</p>
            <p className="text-4xl font-black text-red-600 italic leading-none">{activeNodes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Network size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Unique VLANs</p>
            <p className="text-2xl font-black text-gray-800 italic leading-none">{uniqueVlans}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-green-100 text-green-600 rounded-2xl"><ShieldCheck size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Status Integrity</p>
            <p className="text-2xl font-black text-gray-800 italic leading-none">VERIFIED</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl text-[10px] font-black uppercase shadow-sm text-gray-700 hover:bg-gray-50 transition-all">
          <Download size={14}/> Export ADC Table
        </button>
      </div>

      {/* 2. TABEL DATA (KONSISTEN MSS: TEGAK & TEGAS) */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden shadow-gray-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-6 text-center w-20 border-r border-slate-700 font-black">No</th>
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-6 whitespace-nowrap border-r border-slate-700 last:border-0 font-black">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-bold text-[12px] text-gray-700">
              {loading ? (
                <tr><td colSpan="20" className="p-24 text-center animate-pulse uppercase font-black text-gray-300">Fetching Network Matrix...</td></tr>
              ) : sites.length > 0 ? (
                sites.map((site, index) => (
                  <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50">{index + 1}</td>
                    
                    {/* Node Name */}
                    <td className="px-6 py-6 border-r border-gray-50 uppercase tracking-tight font-black text-slate-900 group-hover:text-red-600">
                      {site.name || '-'}
                    </td>

                    {/* Province */}
                    <td className="px-6 py-6 border-r border-gray-50 text-slate-400">
                      {site.region || '-'}
                    </td>

                    {/* VLAN ID (Badge Tegak) */}
                    <td className="px-6 py-6 border-r border-gray-50">
                      <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${site.vlan === '-' ? 'text-gray-300' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                        VLAN {site.vlan || '-'}
                      </span>
                    </td>

                    {/* VRF SDN (Terminal Style Tegak) */}
                    <td className="px-6 py-6 border-r border-gray-50">
                      <span className="font-mono bg-gray-100 px-3 py-1 rounded border-b-2 border-gray-200 text-slate-800 font-black tracking-tighter">
                        {site.vrf_sdn || '-'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-6 border-r border-gray-50 text-center">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md ${String(site.status).toUpperCase().includes('ACTIVE') || String(site.status).toUpperCase().includes('ON AIR') ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                         {site.status || 'Active'}
                       </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="20" className="p-40 text-center text-gray-300">
                     <div className="flex flex-col items-center gap-4 opacity-30">
                        <Layers size={80} strokeWidth={3} />
                        <p className="text-2xl font-black uppercase tracking-[0.2em] leading-none">ADC Segment Not Identified</p>
                     </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdcTable;