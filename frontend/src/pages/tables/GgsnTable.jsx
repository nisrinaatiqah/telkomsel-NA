import React from 'react';
import { Database, Zap, Users, AlertTriangle, Server, Download } from 'lucide-react';

const GgsnTable = ({ sites = [], loading, element, locationName }) => {
  
  // --- HELPER 1: Penyembuh Angen (0.69 -> 69,00%) ---
  const formatDisplayPercent = (val) => {
    // Tangani nilai 0 tetap tampil sebagai 0%
    if (val === "0" || val === 0) return "0,00%";
    if (!val || val === "-") return "0,00%";
    
    let rawStr = String(val).replace(',', '.').trim();
    let num = parseFloat(rawStr);
    if (isNaN(num)) return "0,00%";

    // Jika desimal murni Excel (angka < 1 misal 0.69), kali 100
    if (num > 0 && num < 1) num = num * 100;

    // Batasi ke 2 desimal biar rapi tapi tetap tegak
    return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
  };

  const formatRibuan = (val) => {
    if (!val || val === "-" || val === "0") return "0";
    const cleanStr = String(val).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? val : num.toLocaleString('id-ID');
  };

  // --- LOGIKA RECAP (Summary Tanpa NaN) ---
  const safeSites = Array.isArray(sites) ? sites : [];
  const totalNodes = safeSites.length;

  const calculateAvg = (key) => {
    if (totalNodes === 0) return "0,00";
    const sum = safeSites.reduce((acc, curr) => {
        let v = parseFloat(String(curr[key] || 0).replace(',', '.'));
        if (v > 0 && v < 1) v = v * 100;
        return acc + (isNaN(v) ? 0 : v);
    }, 0);
    return (sum / totalNodes).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
      
      {/* 1. CARDS (IDENTIK MSS: BOLD TAPI TEGAK) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <RecapCard icon={<Server size={28}/>} color="slate" label="Total Nodes" value={totalNodes} />
        <RecapCard icon={<Zap size={28} fill="currentColor"/>} color="red" label="Avg Occupancy" value={`${calculateAvg('sub_occupancy')}%`} />
        <RecapCard icon={<Users size={28}/>} color="blue" label="Avg CPU Load" value={`${calculateAvg('cpu_load')}%`} />
        <RecapCard icon={<AlertTriangle size={28}/>} color="yellow" label="Service Status" value="Syncing" />
      </div>

      {/* 2. TABLE AREA (Sama persis dengan ketebalan MssTable) */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest text-center">
              <tr>
                <th className="px-6 py-6 border-r border-slate-700 w-20 text-center">No</th>
                {columns.map(col => (
                  <th key={col.key} className={`px-6 py-6 whitespace-nowrap border-r border-slate-700 last:border-0 ${columns.length > 10 ? 'text-[8px]' : 'text-[10px]'}`}>{col.label}</th>
                ))}
              </tr>
            </thead>
            
            {/* TBODY: Identik MSS (Rata Tengah / Center) */}
            <tbody className="divide-y divide-gray-100 font-bold text-[12px] text-gray-700 uppercase">
              {safeSites.map((site, index) => (
                <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50 italic">{index + 1}</td>
                  {columns.map(col => {
                    const raw = site[col.key];
                    const isPerc = col.key.includes('sub_occupancy') || col.key.includes('cpu_load');
                    const isVal = col.key.includes('capacity') || col.key.includes('usage');

                    // GGSN NAME: Bold Black, Tampil apa adanya, Tengah
                    if (col.key === 'name') {
                        return <td key={col.key} className="px-6 py-6 border-r border-gray-50 text-slate-900 font-bold text-center group-hover:text-red-600 transition-colors normal-case">{raw || '-'}</td>;
                    }

                    // BADGE KATEGORI
                    if (col.key.includes('category') || col.key === 'vlr_category' || col.key === 'cpu_category') {
                        const t = String(raw || "").toUpperCase();
                        const isHigh = t.includes('HIGH');
                        const isMed = t.includes('MEDIUM') || t.includes('PREPARE');
                        return (
                          <td key={col.key} className="px-6 py-6 border-r border-gray-50 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-md ${isHigh ? 'bg-red-600 text-white' : (isMed ? 'bg-orange-500 text-white' : 'bg-green-600 text-white')}`}>
                                {raw || '-'}
                            </span>
                          </td>
                        );
                    }

                    return (
                      <td key={col.key} className={`px-6 py-6 border-r border-gray-50 whitespace-nowrap text-center`}>
                        {isPerc ? formatDisplayPercent(raw) : (isVal ? formatRibuan(raw) : (raw || '-'))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const RecapCard = ({ icon, label, value, color }) => (
    <div className="bg-white p-7 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
      <div className={`p-4 rounded-2xl ${color === 'slate' ? 'bg-slate-900 text-white' : `bg-${color}-100 text-${color}-600`}`}>{icon}</div>
      <div>
        <p className="text-[10px] text-gray-400 font-black uppercase mb-1">{label}</p>
        <p className="text-3xl font-black italic text-slate-800 leading-none">{value}</p>
      </div>
    </div>
);

export default GgsnTable;