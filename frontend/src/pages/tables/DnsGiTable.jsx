import React from 'react';
import { Database, Zap, Server, HardDrive, Download, AlertTriangle } from 'lucide-react';

const DnsGiTable = ({ sites, loading, element, locationName }) => {
  // --- HELPER: Pembersih Angka ---
  const cleanNum = (v) => {
    if (v === undefined || v === null || v === "" || v === "-") return 0;
    let s = String(v).trim().replace('%', '');
    if (s.includes(',') && s.includes('.')) return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
    if (s.includes(',')) return parseFloat(s.replace(',', '.')) || 0;
    return parseFloat(s) || 0;
  };

  const formatID = (val) => {
    const num = cleanNum(val);
    return num.toLocaleString('id-ID');
  };

  // --- LOGIKA RECAP (Summary) ---
  const totalUnits = sites.length;
  const totalCapacity = sites.reduce((acc, curr) => acc + cleanNum(curr.capacity_kqps), 0);

  // Grouping Nama untuk Aksen Data (Buaran, Kenanga, dll)
  const getNameGroups = () => {
    if (!sites || sites.length === 0) return [];
    const groups = {};
    const labels = { 'BRN': 'BUARAN', 'KNG': 'KENANGA', 'DPS': 'DENPASAR', 'SOE': 'SOETTA' };
    sites.forEach(s => {
      const nameUpper = String(s.name || '').toUpperCase();
      const foundKey = Object.keys(labels).find(key => nameUpper.includes(key));
      const label = foundKey ? labels[foundKey] : 'OTHER';
      groups[label] = (groups[label] || 0) + 1;
    });
    return Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 1);
  };

  // --- CONFIG KOLOM (Sesuai Konfigurasi Asli) ---
  const columns = [
    { label: 'ELEMENT NAME', key: 'name' },
    { label: 'HW TYPE', key: 'hw_type' },
    { label: 'STORAGE', key: 'storage' },
    { label: 'SW VNF', key: 'sw_vnf' },
    { label: 'SW VIM', key: 'sw_vim' },
    { label: 'CAPACITY (KQPS)', key: 'capacity_kqps' },
    { label: 'HW EOM', key: 'hw_eom' },
    { label: 'HW EOS', key: 'hw_eos' },
  ];

  const handleExportCSV = () => {
    const headers = ["No", ...columns.map(c => c.label)].join(",");
    const rows = sites.map((s, i) => [i + 1, ...columns.map(c => `"${s[c.key] || '-'}"`)].join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Report_DNS_Gi_${locationName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-left animate-in fade-in duration-500">
      
      {/* 1. SUMMARY CARDS (SAMA DENGAN MSS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-slate-900 text-white rounded-2xl"><Database size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Units</p>
            <p className="text-4xl font-black text-gray-800 italic leading-none">{totalUnits}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Zap size={28} fill="currentColor"/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Capacity</p>
            <p className="text-2xl font-black text-blue-600 italic leading-none">{formatID(totalCapacity)} KQPS</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl"><Server size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Main Site</p>
            <p className="text-2xl font-black text-gray-800 italic leading-none">
              {getNameGroups()[0] ? getNameGroups()[0][0] : '-'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-2xl"><AlertTriangle size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Lifecycle Status</p>
            <p className="text-2xl font-black text-gray-800 italic leading-none">Healthy</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl text-[10px] font-black uppercase shadow-sm text-gray-700 hover:bg-gray-100 transition-all">
            <Download size={14}/> Export Gi Data
          </button>
      </div>

      {/* 2. TABEL DATA (KONSISTEN MSS) */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden shadow-gray-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1400px]">
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
                <tr><td colSpan="20" className="p-24 text-center animate-pulse uppercase font-black text-gray-300">Synchronizing Data...</td></tr>
              ) : sites.length > 0 ? (
                sites.map((site, index) => (
                  <tr key={index} className="hover:bg-red-50/50 transition-colors group">
                    <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50">{index + 1}</td>
                    {columns.map(col => {
                      const val = site[col.key] || '-';
                      
                      // Highlight Capacity jika tinggi
                      const isHighValue = col.key === 'capacity_kqps' && cleanNum(val) >= 5000;

                      return (
                        <td key={col.key} className={`px-6 py-6 whitespace-nowrap border-r border-gray-50 group-hover:text-red-600 transition-colors last:border-0 ${isHighValue ? 'text-red-600 italic font-black' : ''}`}>
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
                        <HardDrive size={80} />
                        <p className="text-2xl font-black uppercase tracking-[0.2em] leading-none">No Records Identified</p>
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

export default DnsGiTable;