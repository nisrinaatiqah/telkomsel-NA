import React from 'react';
import { Database, Zap, Activity, ShieldCheck, Download, AlertTriangle, RefreshCcw, Terminal } from 'lucide-react';

const UscStpTable = ({ sites = [], loading, element, locationName }) => {
  // --- HELPER: Pembersih & Formatter Angka ---
  const cleanNum = (v) => {
    if (v === undefined || v === null || v === "" || v === "-") return 0;
    let s = String(v).trim().replace(/[^0-9,.]/g, ''); 
    if (s.includes(',') && s.includes('.')) return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
    if (s.includes(',')) return parseFloat(s.replace(',', '.')) || 0;
    return parseFloat(s) || 0;
  };

  const formatID = (val) => {
    const num = cleanNum(val);
    return num.toLocaleString('id-ID');
  };

  // --- LOGIKA RECAP (Summary - Identik MSS/IMS) ---
  const safeSites = Array.isArray(sites) ? sites : [];
  const totalNodes = safeSites.length;
  const totalStpCap = safeSites.reduce((acc, curr) => acc + cleanNum(curr.cap_stp), 0);
  const totalDraCap = safeSites.reduce((acc, curr) => acc + cleanNum(curr.cap_dra), 0);
  const lifecycleAlerts = safeSites.filter(s => s.hw_eos && s.hw_eos !== '-').length;

  const columns = [
    { label: 'PRODUCT', key: 'product' },
    { label: 'NODE NAME', key: 'name' },
    { label: 'CAP STP (MSU/S)', key: 'cap_stp' },
    { label: 'CAP DRA (TPS)', key: 'cap_dra' },
    { label: 'PLATFORM', key: 'platform' },
    { label: 'SW VERSION', key: 'sw_version' },
    { label: 'SW EOS', key: 'sw_eos' },
    { label: 'HW EOS', key: 'hw_eos' },
    { label: 'ROADMAP', key: 'next_roadmap' },
  ];

  const handleExportCSV = () => {
    if (totalNodes === 0) return alert("Tidak ada data untuk di-export");
    const headers = ["No", ...columns.map(col => col.label)].join(",");
    const rows = safeSites.map((s, i) => [i + 1, ...columns.map(c => `"${s[c.key] || '-'}"`)].join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `USC_Report_${locationName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-left animate-in fade-in duration-500">
      
      {/* 1. RECAP CARDS (IDENTIK MSS & IMS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-inner"><Database size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Total Units</p>
            <p className="text-4xl font-black text-slate-800 italic leading-none">{totalNodes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-red-100 text-red-600 rounded-2xl"><Zap size={28} fill="currentColor"/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Total STP Cap</p>
            <p className="text-3xl font-black text-red-600 italic leading-none">{formatID(totalStpCap)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Activity size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Total DRA Cap</p>
            <p className="text-3xl font-black text-blue-600 italic leading-none">{formatID(totalDraCap)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-2xl"><AlertTriangle size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Lifecycle</p>
            <p className="text-3xl font-black text-slate-800 italic leading-none">{lifecycleAlerts} Alerts</p>
          </div>
        </div>
      </div>

      {/* 2. TABEL DATA (TEGAK, TEGAS, CENTER, SLATE HEADER) */}
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
            
            <tbody className="divide-y divide-gray-100 font-bold text-[12px] text-gray-700">
              {safeSites.map((site, index) => (
                <tr key={index} className="hover:bg-red-50/40 transition-colors group cursor-default">
                  {/* Nomor: Abu-abu Italic */}
                  <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50 italic">
                    {index + 1}
                  </td>
                  
                  {columns.map(col => {
                    const raw = site[col.key] || '-';
                    const isName = col.key === 'name';
                    const isEos = col.key.includes('eos');
                    const isCap = col.key.includes('cap_');

                    // STYLE KHUSUS ELEMENT NAME
                    if (isName) {
                      return (
                        <td key={col.key} className="px-6 py-6 border-r border-gray-50 font-bold text-slate-900 group-hover:text-red-600 transition-colors text-center whitespace-nowrap">
                          {raw}
                        </td>
                      );
                    }

                    // Product Badge Style
                    if (col.key === 'product') {
                         return (
                          <td key={col.key} className="px-6 py-6 border-r border-gray-50 text-center">
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-black uppercase tracking-widest border border-slate-200">
                              {raw}
                            </span>
                          </td>
                        );
                    }

                    // Red underline untuk urgensi tinggi (Eos) - TETAP TEGAK
                    if (isEos && raw !== '-') {
                      return (
                        <td key={col.key} className="px-6 py-6 border-r border-gray-50 whitespace-nowrap text-center text-slate-700 decoration-red-200 decoration-2">
                          {raw}
                        </td>
                      );
                    }

                    return (
                      <td key={col.key} className={`px-6 py-6 border-r border-gray-50 whitespace-nowrap text-center font-bold ${isCap ? 'text-slate-700' : ''}`}>
                        {raw}
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
                Signaling Records Empty
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UscStpTable;