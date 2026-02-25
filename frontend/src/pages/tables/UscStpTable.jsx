import React from 'react';
import { Database, Zap, Activity, Users, AlertTriangle, ShieldCheck, Download } from 'lucide-react';

const UscStpTable = ({ sites, loading, element, locationName }) => {
  // --- HELPER PEMBERSIH ANGKA ---
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
  const totalStpCap = sites.reduce((acc, curr) => acc + cleanNum(curr.cap_stp), 0);
  const totalDraCap = sites.reduce((acc, curr) => acc + cleanNum(curr.cap_dra), 0);
  const lifecycleAlerts = sites.filter(s => s.hw_eos && s.hw_eos !== '-').length;

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
    if (sites.length === 0) return alert("Tidak ada data untuk di-export");
    const headers = ["No", ...columns.map(c => c.label)].join(",");
    const rows = sites.map((s, i) => [i + 1, ...columns.map(c => `"${s[c.key] || '-'}"`)].join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Data_USC_STP_${locationName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-left animate-in fade-in duration-500">
      
      {/* 1. RECAP CARDS (KONSISTEN MSS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-slate-900 text-white rounded-2xl"><Database size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Units</p>
            <p className="text-4xl font-black text-gray-800 italic leading-none">{totalNodes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-red-100 text-red-600 rounded-2xl"><Zap size={28} fill="currentColor"/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">STP MSU/s</p>
            <p className="text-3xl font-black text-red-600 italic leading-none">{formatID(totalStpCap)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Activity size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">DRA TPS Cap</p>
            <p className="text-3xl font-black text-blue-600 italic leading-none">{formatID(totalDraCap)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-2xl"><AlertTriangle size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">EOS Alerts</p>
            <p className="text-4xl font-black text-gray-800 italic leading-none">{lifecycleAlerts}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase shadow-sm text-gray-700 hover:bg-gray-50 transition-all">
          <Download size={14}/> Export USC Table
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
                <tr><td colSpan="20" className="p-24 text-center animate-pulse uppercase font-black text-gray-300">Synchronizing Multimedia Signaling...</td></tr>
              ) : sites.length > 0 ? (
                sites.map((site, index) => (
                  <tr key={index} className="hover:bg-red-50/50 transition-colors group">
                    <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50">{index + 1}</td>
                    {columns.map(col => {
                      const val = site[col.key] || '-';
                      
                      // Highlight Cap data (Rata kanan untuk angka)
                      const isNumeric = col.key.includes('cap');

                      // Styling Node Name
                      if (col.key === 'name') {
                        return <td key={col.key} className="px-6 py-6 border-r border-gray-50 font-black text-slate-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">
                          {val}
                        </td>;
                      }

                      // Product Badge Style
                      if (col.key === 'product') {
                         return (
                          <td key={col.key} className="px-6 py-6 border-r border-gray-50 text-center">
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-[10px] font-black uppercase tracking-widest border border-slate-200">
                              {val}
                            </span>
                          </td>
                        );
                      }

                      // EOS Alerts (High Urgency Style)
                      if ((col.key === 'sw_eos' || col.key === 'hw_eos') && val !== '-') {
                        return (
                          <td key={col.key} className="px-6 py-6 border-r border-gray-50 text-red-600 font-black underline decoration-red-200">
                            {val}
                          </td>
                        );
                      }

                      return (
                        <td key={col.key} className={`px-6 py-6 whitespace-nowrap border-r border-gray-50 group-hover:text-slate-900 transition-colors ${isNumeric ? 'text-right' : ''}`}>
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
                        <Activity size={80} strokeWidth={3} />
                        <p className="text-2xl font-black uppercase tracking-[0.2em] leading-none">Database Signaling Record Null</p>
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

export default UscStpTable;