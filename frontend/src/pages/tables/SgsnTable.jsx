import React from 'react';
import { Database, Zap, Activity, Users, Download, Server } from 'lucide-react';

const SgsnTable = ({ sites = [], loading, element, locationName }) => {
  
  // --- HELPER 1: Handled Percent (Real & 0 Handled) ---
  const formatDisplayPercent = (val) => {
    // 0 atau string kosong tetap tampil 0%
    if (val === undefined || val === null || val === "" || val === "0" || val === 0) return "0,00%";
    
    let rawStr = String(val).replace(',', '.').trim();
    let num = parseFloat(rawStr);
    
    if (isNaN(num)) return val;

    // Logika x100 jika data berbentuk desimal (0,62 -> 62%)
    if (num > 0 && num < 1 && !rawStr.includes('.')) num = num * 100;

    // Bulatkan ke 2 desimal agar rapi namun tetap real sesuai permintaan
    return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
  };

  // --- HELPER 2: Format Ribuan ---
  const formatRibuan = (val) => {
    if (val === undefined || val === null || val === "" || val === "-" || val === "0") return "0";
    const cleanStr = String(val).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? val : num.toLocaleString('id-ID');
  };

  // --- LOGIKA RECAP (Summary Identik MSS) ---
  const safeSites = Array.isArray(sites) ? sites : [];
  const totalNodes = safeSites.length;

  const calculateAvgOcc = () => {
    if (totalNodes === 0) return "0,00";
    const sum = safeSites.reduce((acc, curr) => {
        let v = parseFloat(String(curr.sub_occupancy || 0).replace(',', '.'));
        if (v > 0 && v < 1) v = v * 100;
        return acc + (isNaN(v) ? 0 : v);
    }, 0);
    return (sum / totalNodes).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const columns = [
    { label: 'VENDOR', key: 'vendor' },
    { label: 'AREA', key: 'department' },
    { label:     'REGIONAL', key: 'regional_internal' },
    { label: 'SGSN NAME', key: 'name' },
    { label: 'CAPACITY', key: 'sub_capacity' },
    { label: 'USAGE', key: 'sub_usage' },
    { label: 'OCC [%]', key: 'sub_occupancy' },
  ];

  const handleExport = () => {
    const headers = ["No", ...columns.map(c => c.label)].join(",");
    const rows = safeSites.map((s, i) => [i+1, ...columns.map(c => `"${s[c.key] || '-'}"`)].join(","));
    const link = document.createElement("a");
    link.href = encodeURI("data:text/csv;charset=utf-8," + [headers, ...rows].join("\n"));
    link.download = `SGSN_Report_${locationName}.csv`;
    link.click();
  };

  return (
    <div className="text-left animate-in fade-in duration-500">
      
      {/* 1. CARDS SUMMARY (IDENTIK MSS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <RecapCard icon={<Server size={28}/>} color="slate" label="Total Nodes" value={totalNodes} />
        <RecapCard icon={<Zap size={28} fill="currentColor"/>} color="red" label="Avg Occupancy" value={`${calculateAvgOcc()}%`} />
        <RecapCard icon={<Users size={28}/>} color="blue" label="Utilization" value="Realtime" />
        <RecapCard icon={<Database size={28}/>} color="yellow" label="Service" value="Active" />
      </div>

      {/* 2. TABEL (HEADER SLATE, BODY TEGAK CENTER, BOLD MSS) */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden text-center">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest text-center">
              <tr>
                <th className="px-6 py-6 border-r border-slate-700 w-20">No</th>
                {columns.map(col => <th key={col.key} className="px-6 py-6 whitespace-nowrap border-r border-slate-700 last:border-0">{col.label}</th>)}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100 font-bold text-[12px] text-gray-700 uppercase">
              {safeSites.map((site, index) => (
                <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50 italic">{index + 1}</td>
                  {columns.map(col => {
                    const raw = site[col.key];
                    const isName = col.key === 'name';
                    const isPerc = col.key === 'sub_occupancy';
                    const isNum = col.key.includes('capacity') || col.key.includes('usage');

                    return (
                      <td key={col.key} className={`px-6 py-6 border-r border-gray-50 whitespace-nowrap text-center ${isName ? 'text-slate-900' : ''} group-hover:text-red-600 transition-colors`}>
                        {isPerc ? formatDisplayPercent(raw) : (isNum ? formatRibuan(raw) : (raw || '-'))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {totalNodes === 0 && !loading && (
             <div className="p-32 text-center text-gray-300 font-black uppercase text-2xl opacity-10">Record Empty</div>
          )}
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
        <p className="text-3xl font-black italic tracking-tighter text-slate-800 leading-none">{value}</p>
      </div>
    </div>
);

export default SgsnTable;