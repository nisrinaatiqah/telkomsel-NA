import React from 'react';
import { Database, Zap, Activity, Users, AlertTriangle } from 'lucide-react';

const MssTable = ({ sites, loading }) => {
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
  const avgLoad = sites.length > 0 
    ? (sites.reduce((acc, curr) => acc + cleanNum(curr.sub_occupancy), 0) / sites.length).toFixed(2) 
    : 0;
  const totalUsage = sites.reduce((acc, curr) => acc + cleanNum(curr.sub_usage), 0);
  const criticalNodes = sites.filter(s => cleanNum(s.sub_occupancy) >= 80).length;

  // --- CONFIG KOLOM (Sesuaikan dengan configs/mss.js) ---
  const columns = [
    { label: 'REGIONAL', key: 'regional_internal' }, 
    { label: 'MSS ELEMENT', key: 'name' },
    { label: 'VENDOR', key: 'vendor' },
    { label: 'SUB CAPACITY', key: 'sub_capacity' },
    { label: 'SUB USAGE', key: 'sub_usage' },
    { label: 'OCC (%)', key: 'sub_occupancy' },
    { label: 'CPU LOAD (%)', key: 'cpu_load' },
    { label: 'VLR CAT', key: 'vlr_category' },
    { label: 'CPU CAT', key: 'cpu_category' },
  ];

  return (
    <>
      {/* 1. RECAP CARDS KHUSUS MSS */}
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
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Avg Load</p>
            <p className="text-4xl font-black text-red-600 italic leading-none">{avgLoad}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Users size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Usage</p>
            <p className="text-2xl font-black text-gray-800 italic leading-none">{totalUsage.toLocaleString('id-ID')}</p>
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

      {/* 2. TABEL DATA MSS */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden text-center">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1400px]">
            <thead className="bg-slate-800 text-white text-center">
              <tr>
                <th className="px-6 py-6 text-center w-20 border-r border-slate-700 font-black text-[10px] uppercase tracking-widest">No</th>
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-6 whitespace-nowrap border-r border-slate-700 last:border-0 font-black text-[10px] uppercase tracking-widest">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-bold text-[12px] text-gray-700 text-center">
              {loading ? (
                <tr><td colSpan="20" className="p-24 text-center animate-pulse uppercase font-black text-gray-300 tracking-widest text-xl">Loading MSS Infrastructure...</td></tr>
              ) : sites.length > 0 ? (
                sites.map((site, index) => (
                  <tr key={index} className="hover:bg-red-50/50 transition-colors group">
                    <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50">{index + 1}</td>
                    {columns.map(col => {
                      let val = site[col.key] || '-';
                      
                      // Kondisi khusus: Mewarnai Kolom Kategori VLR/CPU jika mengandung CRITICAL
                      if (col.key === 'vlr_category' || col.key === 'cpu_category') {
                        const txt = String(val).toUpperCase();
                        // Tentukan warna berdasarkan isi teks
                        let colorClass = "bg-gray-100 text-gray-500"; // Default warna abu
                        if (txt.includes('PREPARE')) colorClass = "bg-green-500 text-white shadow-md";
                        if (txt.includes('MEDIUM'))  colorClass = "bg-orange-500 text-white shadow-md";
                        if (txt.includes('LOW'))     colorClass = "bg-red-500 text-white shadow-md";
                        return (
                          <td key={col.key} className="px-6 py-6 border-r border-gray-50">
                             <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${colorClass}`}>
                               {val}
                             </span>
                          </td>
                        );
                      }

                      // Kolom load Load warnanya ganti merah kalau tinggi
                      if (col.key === 'sub_occupancy') {
                        const occ = cleanNum(val);
                        return (
                          <td key={col.key} className={`px-6 py-6 border-r border-gray-50 font-black italic ${occ >= 80 ? 'text-red-600' : 'group-hover:text-red-600'}`}>
                             {val}
                          </td>
                        );
                      }

                      return (
                        <td key={col.key} className="px-6 py-6 whitespace-nowrap border-r border-gray-50 group-hover:text-red-600 transition-colors">
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr><td colSpan="20" className="p-32 text-center opacity-20"><Database size={80} className="mx-auto mb-4" /><p className="text-2xl font-black uppercase tracking-widest">No MSS Data Found</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default MssTable;