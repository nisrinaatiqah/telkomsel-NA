import React from 'react';
import { Database, Zap, Award, Download, Info, RefreshCcw, HardDrive, Calendar } from 'lucide-react';

const ImsTable = ({ sites = [], loading, element, locationName }) => {
  // --- HELPER: Pembersih Angka ---
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

  // --- LOGIKA RECAP (Summary - Konsisten MSS) ---
  const safeSites = Array.isArray(sites) ? sites : [];
  const totalNodes = safeSites.length;
  const uniqueProducts = new Set(safeSites.map(s => s.product).filter(p => p !== "-")).size;
  
  const getMostUsedPlatform = () => {
    if (totalNodes === 0) return "-";
    const counts = {};
    safeSites.forEach(s => {
        if(s.platform) counts[s.platform] = (counts[s.platform] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : "-";
  };

  const columns = [
    { label: 'PRODUCT', key: 'product' },
    { label: 'ELEMENT NAME', key: 'name' },
    { label: 'CAPACITY', key: 'capacity' },
    { label: 'PLATFORM', key: 'platform' },
    { label: 'REGION POOL', key: 'region_pool' },
    { label: 'SW VERSION', key: 'sw_version' },
    { label: 'SW EOS', key: 'sw_eos' },
    { label: 'HW EOS', key: 'hw_eos' },
    { label: 'TTC', key: 'ttc' },
    { label: 'ROADMAP', key: 'next_roadmap' },
  ];

  const handleExportCSV = () => {
    if (totalNodes === 0) return alert("Tidak ada data untuk di-export");
    const headers = ["No", ...columns.map(col => col.label)].join(",");
    const rows = safeSites.map((s, i) => [i + 1, ...columns.map(c => `"${s[c.key] || '-'}"`)].join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `IMS_Report_${locationName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-left animate-in fade-in duration-500">
      
      {/* 1. RECAP CARDS (IDENTIK DENGAN MSS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-inner"><Database size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Total Units</p>
            <p className="text-4xl font-black text-slate-800 italic leading-none">{totalNodes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl"><Award size={28} fill="currentColor"/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Unique Products</p>
            <p className="text-3xl font-black text-slate-800 italic leading-none">{uniqueProducts}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><HardDrive size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Main Platform</p>
            <p className="text-2xl font-black text-slate-800 italic leading-none uppercase truncate max-w-[150px]">
                {getMostUsedPlatform()}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-red-100 text-red-600 rounded-2xl"><Calendar size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Status Sync</p>
            <p className="text-3xl font-black text-red-600 italic leading-none uppercase">Synced</p>
          </div>
        </div>
      </div>

      {/* 2. TABEL DATA (IDENTIK MSS: TEGAK, TEGAS, CENTER, SLATE HEADER) */}
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
                <tr key={index} className="hover:bg-purple-50/40 transition-colors group cursor-default">
                  {/* Nomor urut gaya identik kita (Abu-abu Italic) */}
                  <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50 italic">
                    {index + 1}
                  </td>
                  
                  {columns.map(col => {
                    const val = site[col.key] || '-';
                    const isName = col.key === 'name';
                    const isEos = col.key.includes('eos');

                    // STYLE KHUSUS ELEMENT NAME: Tegak (Normal case), Tebal Standard MSS
                    if (isName) {
                      return (
                        <td key={col.key} className="px-6 py-6 border-r border-gray-50 font-bold text-slate-900 group-hover:text-red-600 transition-colors text-center whitespace-nowrap">
                          {val}
                        </td>
                      );
                    }

                    // Badge Kategori untuk Product
                    if (col.key === 'product') {
                         return (
                          <td key={col.key} className="px-6 py-6 border-r border-gray-50 text-center">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-200">
                              {val}
                            </span>
                          </td>
                        );
                    }

                    // Warna merah tegas untuk kolom EOS (tanpa miring)
                    const isHighUrgency = isEos && val !== '-';

                    return (
                      <td key={col.key} className={`px-6 py-6 border-r border-gray-50 whitespace-nowrap text-center font-bold ${isHighUrgency ? 'text-slate-700' : ''}`}>
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
                Inventory Record Null
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImsTable;