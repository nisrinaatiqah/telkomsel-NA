import React from 'react';
import { Database, Zap, Users, AlertTriangle, Server, Download } from 'lucide-react';

const GgsnTable = ({ sites = [], loading, element, locationName }) => {
  
  // --- 1. LOGIKA DINAMIS KOLOM ---
  const isPDP = String(element).toUpperCase().includes('PDP');

  // Helper 2 desimal & scaling (0,69 -> 69%)
  const formatDisplayPercent = (val) => {
    if (val === undefined || val === null || val === "" || val === "-" || val === "0" || val === 0) return "0,00%";
    let rawStr = String(val).replace(',', '.').trim();
    let num = parseFloat(rawStr);
    if (isNaN(num)) return "0,00%";
    if (num > 0 && num < 1 && !rawStr.includes('.')) num = num * 100;
    return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
  };

  const formatRibuan = (val) => {
    if (!val || val === "-" || val === "0") return "0";
    const cleanStr = String(val).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? val : num.toLocaleString('id-ID');
  };

  // --- 2. LOGIKA RECAP (Summary) ---
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

  // --- 3. DEFINISI KOLOM (Filter jika PDP) ---
  let columns = [
    { label: 'VENDOR', key: 'vendor' },
    { label: 'POP', key: 'city' },
    { label: 'GGSN NAME', key: 'name' },
    { label: 'REGION', key: 'regional_internal' },
    { label: 'AREA', key: 'department' },
    { label: 'CAPACITY', key: 'sub_capacity' },
    { label: 'USAGE', key: 'sub_usage' },
    { label: 'OCC [%]', key: 'sub_occupancy' },
    { label: 'CPU LOAD [%]', key: 'cpu_load' },
    { label: isPDP ? 'PDP CAT' : 'THP CAT', key: 'vlr_category' },
    { label: 'CPU CAT', key: 'cpu_category' },
  ];

  // Hapus kolom CPU CAT jika element adalah PDP
  if (isPDP) {
    columns = columns.filter(col => col.key !== 'cpu_category');
  }

  return (
    <div className="text-left animate-in fade-in duration-500">
      
      {/* SUMMARY CARDS (Standard MSS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <RecapCard icon={<Server size={28}/>} color="slate" label="Total Nodes" value={totalNodes} />
        <RecapCard icon={<Zap size={28} fill="currentColor"/>} color="red" label="Avg Occupancy" value={`${calculateAvg('sub_occupancy')}%`} />
        <RecapCard icon={<Users size={28}/>} color="blue" label="Avg CPU Load" value={`${calculateAvg('cpu_load')}%`} />
        <RecapCard icon={<AlertTriangle size={28}/>} color="yellow" label="Service Status" value="Syncing" />
      </div>

      {/* TABLE DATA (Rata Tengah, Slate-700, Tegak) */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest text-center">
              <tr>
                <th className="px-6 py-6 border-r border-slate-700 w-20 text-center">No</th>
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-6 whitespace-nowrap border-r border-slate-700 last:border-0 text-center">{col.label}</th>
                ))}
              </tr>
            </thead>
            
            {/* TBODY: Identik MSS (Rata Tengah, Tegak, Slate-700) */}
            <tbody className="divide-y divide-gray-100 font-bold text-[12px] text-slate-700 uppercase">
              {safeSites.map((site, index) => (
                <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50 italic">{index + 1}</td>
                  {columns.map(col => {
                    const raw = site[col.key];
                    const isPerc = col.key.includes('occupancy') || col.key.includes('cpu_load');
                    const isVal = col.key.includes('capacity') || col.key.includes('usage');

                    // Nama: Bold Black khusus elemen kunci (tetap Center & Normal case data)
                    if (col.key === 'name') {
                        return <td key={col.key} className="px-6 py-6 border-r border-gray-50 text-slate-900 font-bold text-center group-hover:text-red-600 transition-colors normal-case">{raw || '-'}</td>;
                    }

                    // Badge Kategori (GGSN CAT & CPU CAT)
                    if (col.key.includes('category') || col.key === 'vlr_category' || col.key === 'cpu_category') {
                        const t = String(raw || "").toUpperCase();
                        const isHigh = t.includes('PREPARE') || t.includes('CRITICAL');
                        const isMed = t.includes('MEDIUM') || t.includes('WARNING');
                        return (
                          <td key={col.key} className="px-6 py-6 border-r border-gray-50 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-sm ${isHigh ? 'bg-red-600 text-white' : (isMed ? 'bg-orange-500 text-white' : 'bg-green-600 text-white')}`}>
                                {raw || '-'}
                            </span>
                          </td>
                        );
                    }

                    return (
                      <td key={col.key} className="px-6 py-6 border-r border-gray-50 whitespace-nowrap text-center">
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

// Recap Card (Design Solid)
const RecapCard = ({ icon, label, value, color }) => (
    <div className="bg-white p-7 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
      <div className={`p-4 rounded-2xl ${color === 'slate' ? 'bg-slate-900 text-white' : `bg-${color}-100 text-${color}-600`}`}>{icon}</div>
      <div>
        <p className="text-[10px] text-gray-400 font-black uppercase mb-1">{label}</p>
        <p className="text-4xl font-black italic text-slate-800 leading-none">{value}</p>
      </div>
    </div>
);

export default GgsnTable;