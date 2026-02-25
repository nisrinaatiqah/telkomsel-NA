import React from 'react';
import { Database, Zap, HardDrive, ShieldCheck, Download, Info, Activity, AlertCircle } from 'lucide-react';

const UdmHssTable = ({ sites, loading, element, locationName }) => {
  // --- HELPER: Format Nama Elemen untuk Judul ---
  const displayElement = element || "UDM/HSS";

  // --- LOGIKA RECAP (Summary Cards) ---
  const totalNodes = sites.length;
  const uniqueProducts = new Set(sites.map(s => s.product).filter(p => p !== "-")).size;
  const lifecycleAlerts = sites.filter(s => s.hw_eos && s.hw_eos !== '-').length;
  
  // Mencari Platform paling umum (misal: Cloud atau ATCA)
  const getTopPlatform = () => {
    if (sites.length === 0) return "-";
    const counts = {};
    sites.forEach(s => counts[s.platform] = (counts[s.platform] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  // --- CONFIG KOLOM (Persis udmHssConfig.js) ---
  const columns = [
    { label: 'City', key: 'city' },
    { label: 'Name', key: 'name' },
    { label: 'Platform', key: 'platform' },
    { label: 'Region Pool', key: 'region_pool' },
    { label: 'Existing SW version', key: 'sw_version' },
    { label: 'LCM', key: 'lcm' },
    { label: 'SW EOS', key: 'sw_eos' },
    { label: 'HW EOS', key: 'hw_eos' },
    { label: 'TTC', key: 'ttc' },
    { label: 'Next Roadmap', key: 'next_roadmap' },
  ];

  // --- FUNGSI EXPORT CSV ---
  const handleExportCSV = () => {
    if (sites.length === 0) return alert("Tidak ada data untuk di-export");
    // Header lengkap sesuai config database
    const headers = ["No", "City", "Name", "Platform", "Region Pool", "FS Version", "Eaight", "LCM", "SW Version", "SW EOM", "SW EOFS", "SW EOS", "HW EOM", "HW EOS", "TTC", "Remark", "Next Roadmap", "TSA"].join(",");
    
    const rows = sites.map((s, i) => {
      const rowData = [
        i + 1, s.city, s.name, s.platform, s.region_pool, s.fs_version, s.eaight, s.lcm, 
        s.sw_version, s.sw_eom, s.sw_eofs, s.sw_eos, s.hw_eom, s.hw_eos, s.ttc, s.remark, 
        s.next_roadmap, s.tsa
      ].map(val => `"${val || '-'}"`);
      return rowData.join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Inventory_UDM_HSS_${locationName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-left animate-in fade-in duration-500">
      
      {/* 1. RECAP CARDS (IDENTIK DENGAN MSS: TEBAL & TEGAK) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-inner"><Database size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Nodes</p>
            <p className="text-4xl font-black text-gray-800 italic leading-none">{totalNodes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl"><Activity size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Products</p>
            <p className="text-3xl font-black text-slate-800 italic leading-none">{uniqueProducts}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><HardDrive size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Platform Type</p>
            <p className="text-2xl font-black text-slate-800 italic leading-none uppercase truncate max-w-[120px]">{getTopPlatform()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-red-100 text-red-600 rounded-2xl"><AlertCircle size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">HW EOS Alerts</p>
            <p className="text-4xl font-black text-red-600 italic leading-none">{lifecycleAlerts}</p>
          </div>
        </div>
      </div>

      {/* ACTION HEADER */}
      <div className="flex justify-end mb-4">
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase shadow-sm text-gray-700 hover:bg-gray-50 transition-all">
          <Download size={14}/> Export Inventory CSV
        </button>
      </div>

      {/* 2. TABEL DATA (DESAIN MSS: SLATE HEADER & NORMAL BODY) */}
      <div className="bg-white rounded-[3.5rem] shadow-2xl border-8 border-white overflow-hidden shadow-gray-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1600px]">
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
                <tr><td colSpan="20" className="p-24 text-center animate-pulse uppercase font-black text-gray-300 tracking-widest text-xl">Polling UDM/HSS Database...</td></tr>
              ) : sites.length > 0 ? (
                sites.map((site, index) => (
                  <tr key={index} className="hover:bg-red-50/40 transition-colors group cursor-default">
                    <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50">{index + 1}</td>
                    {columns.map(col => {
                      const val = site[col.key] || '-';
                      
                      // Node Name Style
                      if (col.key === 'name') {
                        return (
                          <td key={col.key} className="px-6 py-6 whitespace-nowrap border-r border-gray-50 group-hover:bg-white/50 transition-colors">
                            {val}
                          </td>
                        );
                      }

                      // Life Cycle Date Warnings (Pill Style tegak)
                      if ((col.key === 'sw_eos' || col.key === 'hw_eos') && val !== '-') {
                        return (
                          <td key={col.key} className="px-6 py-6 border-r border-gray-50">
                             <span className="text-red-600 font-black underline decoration-red-200 decoration-2">{val}</span>
                          </td>
                        );
                      }

                      return (
                        <td key={col.key} className="px-6 py-6 whitespace-nowrap border-r border-gray-50 group-hover:bg-white/50 transition-colors">
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="20" className="p-40 text-center text-gray-300">
                     <div className="flex flex-col items-center gap-4 opacity-20">
                        <HardDrive size={100} strokeWidth={1} />
                        <p className="text-3xl font-black uppercase tracking-[0.2em] leading-none">Subscribed Profile DB Not Linked</p>
                     </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 3. DECORATIVE FOOTER */}
      <div className="mt-8 flex justify-between px-10 opacity-30 items-center">
        <div className="flex gap-4">
        </div>
      </div>

    </div>
  );
};

export default UdmHssTable;