import React from 'react';
import { Database, Zap, Activity, Users, AlertTriangle } from 'lucide-react';

const TmgwTable = ({ sites, loading }) => {
  const cleanNum = (v) => {
    if (v === undefined || v === null || v === "" || v === "-") return 0;
    let s = String(v).trim().replace('%', '');
    return parseFloat(s) || 0;
  };

  // LOGIKA RECAP TMGW / MGW
  const totalNodes = sites.length;
  const avgUtil = sites.length > 0 
    ? (sites.reduce((acc, curr) => acc + cleanNum(curr.scc_util), 0) / sites.length).toFixed(2) 
    : 0;
  const totalUsage = sites.reduce((acc, curr) => acc + cleanNum(curr.scc_usage), 0);
  const criticalNodes = sites.filter(s => cleanNum(s.scc_util) >= 80).length;

  const columns = [
    { label: 'REGIONAL', key: 'regional_internal' },
    { label: 'ELEMENT NAME', key: 'name' },
    { label: 'VENDOR', key: 'vendor' },
    { label: 'SCC CAPACITY', key: 'scc_capacity' },
    { label: 'SCC USAGE', key: 'scc_usage' },
    { label: 'SCC UTIL (%)', key: 'scc_util' },
    { label: 'OCC CATEGORY', key: 'occ_category' }
  ];

  return (
    <>
      {/* SUMMARY CARDS (DESAIN MSS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <SummaryCard icon={<Database size={28}/>} color="slate" label="Total Nodes" value={totalNodes} />
        <SummaryCard icon={<Activity size={28}/>} color="red" label="Avg Util" value={`${avgUtil}%`} />
        <SummaryCard icon={<Zap size={28} fill="currentColor"/>} color="blue" label="SCC Usage" value={totalUsage.toLocaleString('id-ID')} />
        <SummaryCard icon={<AlertTriangle size={28}/>} color="yellow" label="Critical nodes" value={criticalNodes} />
      </div>

      {/* TABLE (DESAIN MSS) */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-6 text-center w-20 border-r border-slate-700">No</th>
                {columns.map(col => <th key={col.key} className="px-6 py-6 border-r border-slate-700 last:border-0">{col.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-bold text-[12px] text-gray-700">
              {!loading && sites.map((site, index) => (
                <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 bg-gray-50/50">{index + 1}</td>
                  {columns.map(col => {
                    const val = site[col.key] || '-';
                    const isHigh = col.key === 'scc_util' && cleanNum(val) >= 80;

                    if (col.key === 'occ_category') {
                        const isCrit = String(val).toUpperCase().includes('CRIT');
                        return (
                          <td key={col.key} className="px-6 py-6 border-r border-gray-50 text-center">
                             <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isCrit ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                               {val}
                             </span>
                          </td>
                        );
                    }
                    return (
                      <td key={col.key} className={`px-6 py-6 border-r border-gray-50 ${isHigh ? 'text-red-600 italic font-black' : ''}`}>
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// Sub-component untuk card agar lebih rapi
const SummaryCard = ({ icon, color, label, value }) => (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
      <div className={`p-4 rounded-2xl ${color === 'slate' ? 'bg-slate-900 text-white' : `bg-${color}-100 text-${color}-600`}`}>{icon}</div>
      <div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-4xl font-black text-gray-800 italic leading-none">{value}</p>
      </div>
    </div>
);

export default TmgwTable;