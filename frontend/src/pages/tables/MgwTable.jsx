import React from 'react';
import { Database, Zap, Activity, Users, AlertTriangle } from 'lucide-react';

const MgwTable = ({ sites, loading }) => {
  // --- HELPER PEMBERSIH ANGKA (Agar perhitungan Recap Akurat) ---
  const cleanNum = (v) => {
    if (v === undefined || v === null || v === "" || v === "-") return 0;
    let s = String(v).trim().replace('%', '');
    if (s.includes(',') && s.includes('.')) return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
    if (s.includes(',')) return parseFloat(s.replace(',', '.')) || 0;
    return parseFloat(s) || 0;
  };

  // --- LOGIKA RECAP (Summary Cards) ---
  const totalNodes = sites.length;
  const avgUtil = sites.length > 0 
    ? (sites.reduce((acc, curr) => acc + cleanNum(curr.scc_util), 0) / sites.length).toFixed(2) 
    : 0;
  const totalSccUsage = sites.reduce((acc, curr) => acc + cleanNum(curr.scc_usage), 0);
  const criticalNodes = sites.filter(s => cleanNum(s.scc_util) >= 80).length;

  // --- CONFIG KOLOM (Sesuai configs/mgw.js) ---
  const columns = [
    { label: 'REGIONAL', key: 'regional_internal' },
    { label: 'MGW ELEMENT', key: 'name' },
    { label: 'VENDOR', key: 'vendor' },
    { label: 'SCC CAPACITY', key: 'scc_capacity' },
    { label: 'SCC USAGE', key: 'scc_usage' },
    { label: 'SCC UTIL (%)', key: 'scc_util' },
    { label: 'OCC CATEGORY', key: 'occ_category' }
  ];

  return (
    <>
      {/* 1. RECAP CARDS (DESAIN MSS) */}
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
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Avg Utilization</p>
            <p className="text-4xl font-black text-red-600 italic leading-none">{avgUtil}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Users size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Usage</p>
            <p className="text-2xl font-black text-gray-800 italic leading-none">{totalSccUsage.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-2xl"><AlertTriangle size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Critical (&gt;80%)</p>
            <p className="text-4xl font-black text-gray-800 italic leading-none">{criticalNodes}</p>
          </div>
        </div>
      </div>

      {/* 2. TABEL DATA MGW (DESAIN MSS) */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden text-center">
        <div className="overflow-x-auto">
          <table className="w-full">
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
                <tr><td colSpan="20" className="p-24 text-center animate-pulse uppercase font-black text-gray-300">Loading Infrastructure Data...</td></tr>
              ) : sites.length > 0 ? (
                sites.map((site, index) => (
                  <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50">{index + 1}</td>
                    {columns.map(col => {
                      let val = site[col.key] || '-';
                      
                      // Highlight Utilization jika di atas 80% (Baru miring/italic & merah)
                      const isHighLoad = col.key === 'scc_util' && cleanNum(val) >= 80;

                      // Badge Kategori
                      if (col.key === 'occ_category') {
                        // Variabel txt HARUS didefinisikan dulu seperti baris di bawah ini:
                        const txt = String(val || "").toUpperCase(); 
                        
                        let colorClass = "bg-gray-100 text-gray-500"; // Warna standar abu-abu
                        
                        if (txt.includes('PREPARE')) {
                            colorClass = "bg-green-600 text-white shadow-md";
                        } else if (txt.includes('MEDIUM')) {
                            colorClass = "bg-orange-500 text-white shadow-md";
                        } else if (txt.includes('LOW')) {
                            colorClass = "bg-red-600 text-white shadow-md";
                        }

                        return (
                            <td key={col.key} className="px-6 py-6 border-r border-gray-50 text-center">
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${colorClass}`}>
                                {val || '-'}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td key={col.key} className={`px-6 py-6 border-r border-gray-50 group-hover:text-red-600 transition-colors ${isHighLoad ? 'text-red-600 italic font-black' : ''}`}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr><td colSpan="20" className="p-32 text-center opacity-20"><Database size={80} className="mx-auto mb-4" /><p className="text-2xl font-black uppercase tracking-widest">No Record Identified</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default MgwTable;