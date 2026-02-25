import React from 'react';
import { Database, Zap, Award, Download, Info, RefreshCcw, HardDrive, Calendar } from 'lucide-react';

const ImsTable = ({ sites, loading, element, locationName }) => {
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

  // --- LOGIKA RECAP (Summary) ---
  const totalNodes = sites.length;
  const uniqueProducts = new Set(sites.map(s => s.product).filter(p => p !== "-")).size;
  const mostUsedPlatform = () => {
    if (sites.length === 0) return "-";
    const counts = {};
    sites.forEach(s => counts[s.platform] = (counts[s.platform] || 0) + 1);
    return Object.entries(counts).sort((a,b) => b[1] - a[1])[0][0];
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
    if (sites.length === 0) return alert("Tidak ada data");
    const headers = ["No", ...columns.map(col => col.label)].join(",");
    const rows = sites.map((s, i) => [i + 1, ...columns.map(c => `"${s[c.key] || '-'}"`)].join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Data_IMS_${locationName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-left animate-in fade-in duration-500">
      
      {/* 1. RECAP CARDS (IDENTIK DENGAN MSS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-slate-900 text-white rounded-2xl"><Database size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Nodes</p>
            <p className="text-4xl font-black text-gray-800 italic leading-none">{totalNodes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl"><Award size={28} fill="currentColor"/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Products</p>
            <p className="text-4xl font-black text-purple-600 italic leading-none">{uniqueProducts}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><HardDrive size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Main Platform</p>
            <p className="text-2xl font-black text-gray-800 italic leading-none">{mostUsedPlatform()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-red-100 text-red-600 rounded-2xl"><Calendar size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Deployments</p>
            <p className="text-2xl font-black text-red-600 italic leading-none uppercase">Synced</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl text-[10px] font-black uppercase shadow-sm text-gray-700 hover:bg-gray-50 transition-all">
          <Download size={14}/> Export IMS Inventory
        </button>
      </div>

      {/* 2. TABEL DATA (TEGAK, TEGAS, SLATE-800 HEADER) */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden shadow-gray-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1500px]">
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
                <tr><td colSpan="20" className="p-24 text-center animate-pulse uppercase font-black text-gray-300">Synchronizing Database...</td></tr>
              ) : sites.length > 0 ? (
                sites.map((site, index) => (
                  <tr key={index} className="hover:bg-purple-50/50 transition-colors group">
                    <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50">{index + 1}</td>
                    {columns.map(col => {
                      const val = site[col.key] || '-';
                      
                      // Node Name Bold Black Highlight
                      if (col.key === 'name') {
                        return <td key={col.key} className="px-6 py-6 border-r border-slate-50 font-bold text-slate-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">
                          {val}
                        </td>;
                      }

                      // Product Badge Style (Identik badge MssTable)
                      if (col.key === 'product') {
                         return (
                          <td key={col.key} className="px-6 py-6 border-r border-gray-50">
                            <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-md text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm">
                              {val}
                            </span>
                          </td>
                        );
                      }

                      // EOS Warnings (Orange Highlight tanpa miring)
                      if ((col.key === 'sw_eos' || col.key === 'hw_eos') && val !== '-') {
                        return (
                          <td key={col.key} className="px-6 py-6 border-r border-gray-50 text-red-600 font-black underline decoration-red-100 decoration-4">
                            {val}
                          </td>
                        );
                      }

                      return (
                        <td key={col.key} className="px-6 py-6 border-r border-gray-50 whitespace-nowrap group-hover:text-slate-900 transition-colors">
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="20" className="p-40 text-center text-gray-300">
                     <div className="flex flex-col items-center gap-4 opacity-30">
                        <RefreshCcw size={80} strokeWidth={3} />
                        <p className="text-2xl font-black uppercase tracking-[0.2em] leading-none">Database Inventory Record Null</p>
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

export default ImsTable;