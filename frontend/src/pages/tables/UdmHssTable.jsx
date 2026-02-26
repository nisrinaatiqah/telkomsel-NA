import React from 'react';
import { Database, Zap, Activity, Users, Download, Server } from 'lucide-react';

const UdmHssTable = ({ sites = [], loading, element, locationName }) => {
  
  // --- HELPER 1: Handled Percent (Format Tegak & Real 2 Desimal) ---
  const formatDisplayPercent = (val) => {
    // Pastikan nilai 0 atau kosong tetap tampil 0,00%
    if (val === undefined || val === null || val === "" || val === "0" || val === 0) return "0,00%";
    
    let rawStr = String(val).replace(',', '.').trim();
    let num = parseFloat(rawStr);
    
    if (isNaN(num)) return "0,00%";

    // Handled desimal murni Excel: Jika angka kecil (0.xxxx) maka kali 100
    if (num > 0 && num < 1) num = num * 100;

    return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
  };

  // --- HELPER 2: Format Ribuan (Standard MSS) ---
  const formatRibuan = (val) => {
    if (val === undefined || val === null || val === "" || val === "-" || val === "0") return "0";
    const cleanStr = String(val).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? val : num.toLocaleString('id-ID');
  };

  // --- LOGIKA RECAP (Summary - Identik MSS) ---
  const safeSites = Array.isArray(sites) ? sites : [];
  const totalNodes = safeSites.length;
  const isVoLTE = String(element || "").toUpperCase().includes('VOLTE');

  const calculateGlobalAvg = (targetKey) => {
    if (totalNodes === 0) return "0,00";
    const sum = safeSites.reduce((acc, curr) => {
        let v = parseFloat(String(curr[targetKey] || 0).replace(',', '.'));
        if (v > 0 && v < 1) v = v * 100;
        return acc + (isNaN(v) ? 0 : v);
    }, 0);
    return (sum / totalNodes).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // --- CONFIG KOLOM DINAMIS (Berdasarkan Schema Prisma Anda) ---
  const columns = isVoLTE ? [
    { label: 'AREA', key: 'area' },
    { label: 'NE ID', key: 'name' },
    { label: 'BE USAGE', key: 'be_usage' },
    { label: 'BE OCC [%]', key: 'be_occupancy' },
    { label: 'FE USAGE', key: 'fe_usage' },
    { label: 'FE OCC [%]', key: 'fe_occupancy' },
  ] : [
    { label: 'AREA', key: 'area' },
    { label: 'NE ID', key: 'name' },
    { label: 'CAPACITY', key: 'capacity' },
    { label: 'USAGE', key: 'usage' },
    { label: '5G OCC [%]', key: 'occupancy' },
  ];

  const handleExportCSV = () => {
    if (totalNodes === 0) return alert("Tidak ada data");
    const headers = ["No", ...columns.map(c => c.label)].join(",");
    const rows = safeSites.map((site, i) => [
        i + 1,
        ...columns.map(col => `"${site[col.key] || '-'}"`)
    ].join(","));
    const link = document.createElement("a");
    link.href = encodeURI("data:text/csv;charset=utf-8," + [headers, ...rows].join("\n"));
    link.download = `UDM_Report_${element}_${locationName}.csv`;
    link.click();
  };

  return (
    <div className="text-left animate-in fade-in duration-500">
      
      {/* 1. CARDS SUMMARY (IDENTIK MSS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-inner"><Server size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Nodes</p>
            <p className="text-4xl font-black text-slate-800 italic leading-none">{totalNodes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-red-100 text-red-600 rounded-2xl"><Zap size={28} fill="currentColor"/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Avg Occupancy</p>
            <p className="text-3xl font-black text-red-600 italic leading-none">
              {calculateGlobalAvg(isVoLTE ? 'be_occupancy' : 'occupancy')}%
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Users size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Core Access</p>
            <p className="text-2xl font-black text-slate-800 italic leading-none uppercase">Validated</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-2xl"><Activity size={28}/></div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Inventory</p>
            <p className="text-3xl font-black text-slate-800 italic leading-none uppercase">Synced</p>
          </div>
        </div>
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
                <tr key={index} className="hover:bg-red-50/50 transition-colors group">
                  {/* NOMOR: Italic Abu-abu khas template kita */}
                  <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50 italic">{index + 1}</td>
                  
                  {columns.map(col => {
                    const raw = site[col.key];
                    const isName = col.key === 'name';
                    const isPerc = col.key.toLowerCase().includes('occ') || col.key === 'occupancy';
                    const isNum = col.key.includes('usage') || col.key.includes('capacity');

                    return (
                      <td key={col.key} className={`px-6 py-6 border-r border-gray-50 whitespace-nowrap text-center transition-colors group-hover:text-red-600 ${isName ? 'text-slate-700' : ''}`}>
                        {isPerc ? formatDisplayPercent(raw) : (isNum ? formatRibuan(raw) : (raw || '-'))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && totalNodes === 0 && (
              <div className="p-40 text-center text-gray-300 font-black uppercase text-2xl tracking-[0.2em] opacity-10">Data Connection Ready</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UdmHssTable;