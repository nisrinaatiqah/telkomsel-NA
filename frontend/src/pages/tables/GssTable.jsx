import React from 'react';
import { Database, Zap, Users, AlertTriangle, Server } from 'lucide-react';

const GgsnTable = ({ sites = [], loading, element, locationName }) => {
  
  // --- HELPER: Menampilkan Data Apa Adanya (Real) + Persen ---
  const formatReal = (val, isPercent = false) => {
    if (val === undefined || val === null || val === "" || val === "-") return "-";
    let s = String(val).trim();
    if (isPercent && s !== "0" && s !== "-") {
      // Tempel persen jika belum ada
      return s.includes('%') ? s : s + "%";
    }
    return s;
  };

  // --- LOGIKA RECAP (Dibuat sangat aman agar tidak crash) ---
  const totalNodes = Array.isArray(sites) ? sites.length : 0;
  
  const getAvgString = (key) => {
    if (totalNodes === 0) return "0";
    const total = sites.reduce((acc, curr) => {
      // Ambil angka saja (menangani 76.45 maupun 76,45%)
      const n = parseFloat(String(curr[key] || 0).replace(',', '.').replace(/[^0-9.]/g, '')) || 0;
      return acc + n;
    }, 0);
    const avg = total / totalNodes;
    // Gunakan toLocaleString agar rapi tapi tetap mewakili desimal aslinya (maks 2 digit saja untuk recap agar tidak overflow)
    return avg.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  };

  const columns = [
    { label: 'VENDOR', key: 'vendor' },
    { label: 'POP', key: 'city' },
    { label: 'GGSN NAME', key: 'name' },
    { label: 'REGION', key: 'regional_internal' },
    { label: 'AREA', key: 'department' },
    { label: 'CAPACITY', key: 'sub_capacity' },
    { label: 'USAGE', key: 'sub_usage' },
    { label: 'OCC [%]', key: 'sub_occupancy' },
    { label: 'CPU LOAD [%]', key: 'cpu_load' },
    { label: 'GGSN CAT', key: 'vlr_category' },
    { label: 'CPU CAT', key: 'cpu_category' },
  ];

  return (
    <div className="text-left animate-in fade-in duration-500">
      
      {/* 1. RECAP CARDS (Konsisten Desain MSS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-slate-900 text-white rounded-2xl"><Server size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Units</p>
            <p className="text-4xl font-black text-gray-800 italic leading-none">{totalNodes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-red-100 text-red-600 rounded-2xl"><Zap size={28} fill="currentColor"/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Avg Occupancy</p>
            <p className="text-3xl font-black text-red-600 italic leading-none">{getAvgString('sub_occupancy')}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Users size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Avg CPU Load</p>
            <p className="text-3xl font-black text-blue-600 italic leading-none">{getAvgString('cpu_load')}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-2xl"><AlertTriangle size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">High Load</p>
            <p className="text-4xl font-black text-gray-800 italic leading-none">0</p>
          </div>
        </div>
      </div>

      {/* 2. TABEL DATA (Desain Tegak, Tidak Bold berlebih, Sesuai Data) */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-6 text-center w-20 border-r border-slate-700">No</th>
                {columns.map(col => <th key={col.key} className="px-6 py-6 whitespace-nowrap border-r border-slate-700 last:border-0">{col.label}</th>)}
              </tr>
            </thead>
            {/* Teks Tidak Bold (font-semibold atau font-medium agar rapi) */}
            <tbody className="divide-y divide-gray-100 text-[12px] font-semibold text-gray-600">
              {!loading && sites.map((site, index) => (
                <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-300 font-medium bg-gray-50/50 italic">{index + 1}</td>
                  {columns.map(col => {
                    const raw = site[col.key] || '-';
                    const isPercentField = col.key.includes('sub_occupancy') || col.key.includes('cpu_load');
                    
                    // Style khusus Status Kategori tetap pakai badge warna (lebih fungsional)
                    if (col.key.includes('category') || col.key.includes('CAT')) {
                      const isHigh = String(raw).toUpperCase().includes('MEDIUM') || String(raw).toUpperCase().includes('HIGH');
                      return (
                        <td key={col.key} className="px-6 py-6 border-r border-gray-50 text-center">
                          <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase shadow-sm ${isHigh ? 'bg-orange-500 text-white' : 'bg-green-600 text-white'}`}>
                            {raw}
                          </span>
                        </td>
                      );
                    }

                    return (
                      <td key={col.key} className={`px-6 py-6 border-r border-gray-50 whitespace-nowrap group-hover:text-red-600 transition-colors`}>
                        {formatReal(raw, isPercentField)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {sites.length === 0 && !loading && (
            <div className="p-40 text-center text-gray-300 font-black uppercase tracking-widest text-2xl opacity-10">Data Warehouse Empty</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GgsnTable;