import React from 'react';
import { Database, Zap, ShieldCheck, Download, AlertTriangle } from 'lucide-react';

const DnsGnTable = ({ sites, loading, element, locationName }) => {
  const cleanNum = (v) => {
    if (v === undefined || v === null || v === "" || v === "-") return 0;
    let s = String(v).trim().replace('%', '');
    return parseFloat(s) || 0;
  };

  // LOGIKA RECAP (Sesuai Logika MSS)
  const totalNodes = sites.length;
  const onAirCount = sites.filter(s => 
    String(s.status || '').toUpperCase().includes('AIR') || 
    String(s.status || '').toUpperCase().includes('ACTIVE')
  ).length;
  const maintCount = sites.filter(s => String(s.status || '').toUpperCase().includes('MAINT')).length;

  // KONFIGURASI 21 KOLOM DNS GN (KONSISTEN)
  const columns = [
    { label: 'City', key: 'city' }, 
    { label: 'NE Name', key: 'name' }, 
    { label: 'NE ID / Hostname', key: 'siteIdCode' },
    { label: 'Dept', key: 'department' },
    { label: 'Func', key: 'ne_func' },
    { label: 'Type', key: 'ne_type' },
    { label: 'Vendor', key: 'vendor' },
    { label: 'HW Ver.', key: 'hw_ver' },
    { label: 'HW Supp', key: 'hw_support' },
    { label: 'SW Ver.', key: 'sw_ver' },
    { label: 'SW Supp', key: 'sw_support' },
    { label: 'Cap 1', key: 'cap_1' },
    { label: 'Cap 1 Unit', key: 'cap_1_unit' },
    { label: 'Cap 2', key: 'cap_2' },
    { label: 'Cap 2 Unit', key: 'cap_2_unit' },
    { label: 'Domain', key: 'domain' },
    { label: 'On Air Date', key: 'on_air_date' },
    { label: 'Status', key: 'status' },
    { label: 'Site Location', key: 'site_location' },
    { label: 'Loc Type', key: 'loc_type' },
    { label: 'Address', key: 'loc_address' },
  ];

  const handleExport = () => {
    const headers = ["No", ...columns.map(c => c.label)].join(",");
    const rows = sites.map((s, i) => [i + 1, ...columns.map(c => `"${s[c.key] || '-'}"`)].join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Data_${element}_${locationName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* 1. RECAP CARDS (GAYA MSS: Hanya Nilai Utama yang Italic untuk Aksen) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 text-left">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-slate-900 text-white rounded-2xl"><Database size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Units</p>
            <p className="text-4xl font-black text-gray-800 italic leading-none">{totalNodes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-red-100 text-red-600 rounded-2xl"><ShieldCheck size={28} /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Status Active</p>
            <p className="text-4xl font-black text-red-600 italic leading-none">{onAirCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><AlertTriangle size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">In Maintenance</p>
            <p className="text-4xl font-black text-blue-600 italic leading-none">{maintCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-2xl"><Zap size={28} fill="currentColor"/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Average Load</p>
            <p className="text-4xl font-black text-gray-800 italic leading-none">72%</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
          <button onClick={handleExport} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase shadow-sm text-gray-700 hover:bg-gray-50 transition-all">
            <Download size={14}/> Export Full CSV
          </button>
      </div>

      {/* 2. TABEL (IDENTIK MSS: TEGAK, TEGAS, SLATE-800 HEADER) */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden text-left">
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
            <tbody className="divide-y divide-gray-100 font-bold text-[12px] text-gray-700 uppercase tracking-tight">
              {loading ? (
                <tr><td colSpan="40" className="p-24 text-center animate-pulse uppercase font-black text-gray-300">Synchronizing Data...</td></tr>
              ) : sites.length > 0 ? (
                sites.map((site, index) => (
                  <tr key={index} className="hover:bg-red-50/50 transition-colors group">
                    <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50">{index + 1}</td>
                    {columns.map(col => {
                      const val = site[col.key] || '-';
                      
                      // Status Badge (Badge Berwarna, Teks Putih Tegas)
                      if (col.key === 'status') {
                        const isOk = String(val).toUpperCase().includes('AIR') || String(val).toUpperCase().includes('ACTIVE');
                        return (
                          <td key={col.key} className="px-6 py-6 border-r border-gray-50 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md ${isOk ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                              {val}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td key={col.key} className="px-6 py-6 whitespace-nowrap border-r border-gray-50 group-hover:text-red-600 transition-colors last:border-0">
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="40" className="p-40 text-center text-gray-300">
                     <div className="flex flex-col items-center gap-4 opacity-30">
                        <Database size={80} />
                        <p className="text-2xl font-black uppercase tracking-[0.2em] leading-none">Records Not Found In Database</p>
                     </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DnsGnTable;