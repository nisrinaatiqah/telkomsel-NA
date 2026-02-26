import React from 'react';
import { Database, Zap, Users, AlertTriangle, Server } from 'lucide-react';

const GssTable = ({ sites = [], loading }) => {
  
  // --- HELPER PEMBERSIH ANGKA ---
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
    ? (sites.reduce((acc, curr) => acc + cleanNum(curr.bhca_occupancy || curr.sub_occupancy), 0) / sites.length).toFixed(2) 
    : 0;
  const totalUsage = sites.reduce((acc, curr) => acc + cleanNum(curr.bhca_usage || curr.sub_usage), 0);
  const criticalNodes = sites.filter(s => cleanNum(s.bhca_occupancy || s.sub_occupancy) >= 80).length;

  // --- CONFIG KOLOM GSS (SAMA PERSIS DESIGN MSS) ---
  const columns = [
    { label: 'REGIONAL', key: 'regional_internal' },
    { label: 'GSS NAME', key: 'name' },
    { label: 'VENDOR', key: 'vendor' },
    { label: 'BHCA CAPACITY', key: 'bhca_capacity' },
    { label: 'BHCA USAGE', key: 'bhca_usage' },
    { label: 'BHCA OCC (%)', key: 'bhca_occupancy' },
    { label: 'CPU LOAD (%)', key: 'cpu_load' },
    { label: 'VLR CAT', key: 'vlr_category' }, // Kita akan pakai logika fallback untuk ini
    { label: 'CPU CAT', key: 'cpu_category' },
  ];

  return (
    <div className="text-left animate-in fade-in duration-500">
      
      {/* 1. RECAP CARDS (DESAIN MSS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-slate-900 text-white rounded-2xl"><Server size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Units</p>
            <p className="text-4xl font-black text-gray-800 italic leading-none">{totalNodes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-red-100 text-red-600 rounded-2xl"><Zap size={28} fill="currentColor"/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Avg Load</p>
            <p className="text-4xl font-black text-red-600 italic leading-none">{avgLoad}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Users size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Usage</p>
            <p className="text-2xl font-black text-gray-800 italic leading-none">{totalUsage.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-2xl"><AlertTriangle size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Critical (&gt;80%)</p>
            <p className="text-4xl font-black text-gray-800 italic leading-none">{criticalNodes}</p>
          </div>
        </div>
      </div>

      {/* 2. TABEL DATA GSS (CONSISTENT WITH MSS) */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1400px]">
            <thead className="bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-6 text-center w-20 border-r border-slate-700">No</th>
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-6 whitespace-nowrap border-r border-slate-700 last:border-0">{col.label}</th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100 font-bold text-[12px] text-gray-700">
              {!loading && sites.length > 0 ? (
                sites.map((site, index) => (
                  <tr key={index} className="hover:bg-red-50/50 transition-colors group">
                    <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50 italic">{index + 1}</td>
                    {columns.map(col => {
                      // LOGIKA PENTING: Jika vlr_category kosong, coba cari di bhca_category atau cat_occupancy
                      let val = site[col.key];
                      if (col.key === 'vlr_category' && (!val || val === '-')) {
                        val = site.bhca_category || site.category || site.status || '-';
                      }
                      
                      val = val || '-'; // Final fallback if all fails

                      // Style Kategori (Merah kalau Critical/High)
                      if (col.key === 'vlr_category' || col.key === 'cpu_category') {
                        // Variabel txt HARUS didefinisikan dulu seperti baris di bawah ini:
                        const txt = String(val || "").toUpperCase(); 
                        
                        let colorClass = "bg-gray-100 text-gray-500"; // Warna standar abu-abu
                        
                        if (txt.includes('PREPARE') || txt.includes('HIGH')) {
                            colorClass = "bg-green-500 text-white shadow-md";
                        } else if (txt.includes('MEDIUM')) {
                            colorClass = "bg-orange-500 text-white shadow-md";
                        } else if (txt.includes('LOW')) {
                            colorClass = "bg-red-500 text-white shadow-md";
                        }

                        return (
                            <td key={col.key} className="px-6 py-6 border-r border-gray-50 text-center">
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${colorClass}`}>
                                {val || '-'}
                            </span>
                          </td>
                        );
                      }

                      // BHCA OCC Merah jika tinggi
                      if (col.key === 'bhca_occupancy') {
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
                <tr>
                   <td colSpan="20" className="p-32 text-center opacity-20">
                     <Database size={80} className="mx-auto mb-4" />
                     <p className="text-2xl font-black uppercase tracking-widest">{loading ? "Loading..." : "No GSS Data Found"}</p>
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

export default GssTable;