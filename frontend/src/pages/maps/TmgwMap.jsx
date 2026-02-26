import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, FileSpreadsheet, LayoutGrid, Database, Users, Zap } from 'lucide-react';
import axios from 'axios'; 
import BatchImportModal from '../../components/BatchImportModal';

// --- HELPER PEMBERSIH ANGKA ---
const cleanNum = (v) => {
  if (v === undefined || v === null || v === "") return 0;
  let s = String(v).trim().replace('%', '');
  if (s.includes(',') && s.includes('.')) return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  if (s.includes(',')) return parseFloat(s.replace(',', '.')) || 0;
  return parseFloat(s) || 0;
};

const TmgwMap = ({ element }) => {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState(null);
  const [sites, setSites] = useState([]);
  const [statsByRegion, setStatsByRegion] = useState({});
  const [statsByRegional, setStatsByRegional] = useState({});
  const [loading, setLoading] = useState(true);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  
  // State untuk Switcher Slide (Utilization vs Vendor)
  const [viewMode, setViewMode] = useState('utilization'); 

  const regionalMapping = {
    "Regional Sumbagut": ["ACEH", "SUMATERA UTARA"],
    "Regional Sumbagteng": ["RIAU", "KEPULAUAN RIAU", "SUMATERA BARAT"],
    "Regional Sumbagsel": ["SUMATERA SELATAN", "LAMPUNG", "JAMBI", "BENGKULU", "KEPULAUAN BANGKA BELITUNG"],
    "Regional Jabotabek": ["DKI JAKARTA", "BANTEN"],
    "Regional Jawa Barat": ["JAWA BARAT"],
    "Regional Jawa Tengah & DIY": ["JAWA TENGAH", "DAERAH ISTIMEWA YOGYAKARTA"],
    "Regional Jawa Timur": ["JAWA TIMUR"],
    "Regional Bali Nusra": ["BALI", "NUSA TENGGARA BARAT", "NUSA TENGGARA TIMUR"],
    "Regional Kalimantan": ["KALIMANTAN BARAT", "KALIMANTAN TENGAH", "KALIMANTAN SELATAN", "KALIMANTAN TIMUR", "KALIMANTAN UTARA"],
    "Regional Sulawesi": ["SULAWESI SELATAN", "SULAWESI BARAT", "SULAWESI TENGGARA", "SULAWESI TENGAH", "SULAWESI UTARA", "GORONTALO"],
    "Regional Papua & Maluku": ["MALUKU", "MALUKU UTARA", "PAPUA", "PAPUA BARAT", "PAPUA TENGAH", "PAPUA SELATAN", "PAPUA PEGUNUNGAN", "PAPUA BARAT DAYA"]
  };

  useEffect(() => {
    fetch('/indonesia-38.json').then(res => res.json()).then(data => setGeoData(data));
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/sites/TMGW`);
      const data = Array.isArray(res.data) ? res.data : [];
      setSites(data);
      processAdvancedStats(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const processAdvancedStats = (allSites) => {
    const pStats = {};
    const rStats = {};
    Object.keys(regionalMapping).forEach(reg => {
      rStats[reg] = { count: 0, totalUtil: 0, totalUsage: 0, ericsson: 0, nokia: 0, avgUtil: 0 };
    });

    allSites.forEach(site => {
      const prov = (site.region || "UNKNOWN").toUpperCase().trim();
      const util = cleanNum(site.scc_util);
      const usage = cleanNum(site.scc_usage);
      const vendor = String(site.vendor || "").toUpperCase();

      if (!pStats[prov]) pStats[prov] = { count: 0, totalUtil: 0, totalUsage: 0, ericsson: 0, nokia: 0 };
      pStats[prov].count += 1;
      pStats[prov].totalUtil += util;
      pStats[prov].totalUsage += usage;
      if (vendor.includes("ERICSSON")) pStats[prov].ericsson += 1;
      else if (vendor.includes("NOKIA")) pStats[prov].nokia += 1;

      const targetReg = Object.keys(regionalMapping).find(reg => regionalMapping[reg].includes(prov));
      if (targetReg) {
        rStats[targetReg].count += 1;
        rStats[targetReg].totalUtil += util;
        rStats[targetReg].totalUsage += usage;
        if (vendor.includes("ERICSSON")) rStats[targetReg].ericsson += 1;
        else if (vendor.includes("NOKIA")) rStats[targetReg].nokia += 1;
      }
    });

    Object.keys(pStats).forEach(k => pStats[k].avgUtil = (pStats[k].totalUtil / pStats[k].count).toFixed(2));
    Object.keys(rStats).forEach(k => {
      if(rStats[k].count > 0) rStats[k].avgUtil = (rStats[k].totalUtil / rStats[k].count).toFixed(2);
    });
    setStatsByRegion(pStats);
    setStatsByRegional(rStats);
  };

  const getRegionStyle = (feature) => {
    const provName = (feature.properties.NAME_1 || feature.properties.name || feature.properties.PROVINSI || "").toUpperCase().trim();
    const provData = statsByRegion[provName];
    const regName = Object.keys(regionalMapping).find(reg => regionalMapping[reg].includes(provName));
    const regData = statsByRegional[regName] || { count: 0, avgUtil: 0 };

    let color = "#f1f5f9"; 

    if (viewMode === 'utilization') {
      const finalUtil = (provData && provData.count > 0) ? parseFloat(provData.avgUtil) : parseFloat(regData.avgUtil);
      if ((provData && provData.count > 0) || (regData && regData.count > 0)) {
        if (finalUtil >= 80) color = "#ef4444";
        else if (finalUtil >= 70) color = "#ff7f00"; 
        else color = "#eab308";
      }
    } else {
      const eCount = (provData?.ericsson || 0) + (regData?.ericsson || 0);
      const nCount = (provData?.nokia || 0) + (regData?.nokia || 0);
      if (eCount > 0 || nCount > 0) color = eCount >= nCount ? "#2563eb" : "#10b981";
    }
    return { fillColor: color, weight: 1.5, color: 'white', fillOpacity: 0.6 };
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6 overflow-x-hidden">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 font-black text-red-600 uppercase tracking-widest text-lg hover:translate-x-[-5px] transition-all">
          <ArrowLeft size={28} strokeWidth={3} /> BACK
        </button>

        {/* SWITCHER DENGAN IKON */}
        <div className="bg-white p-1.5 rounded-full shadow-2xl border-2 border-gray-100 flex gap-2">
          <button onClick={() => setViewMode('utilization')} className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'utilization' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-red-600'}`}>
            <Zap size={14}/> UTILIZATION
          </button>
          <button onClick={() => setViewMode('vendor')} className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'vendor' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-slate-900'}`}>
            <Users size={14}/> VENDOR
          </button>
        </div>

        <div className="text-right font-black italic tracking-tighter leading-none">
          <h2 className="text-4xl text-gray-900 uppercase">TMGW <span className="text-red-600">{viewMode.toUpperCase()}</span></h2>
          <button onClick={() => setIsBatchModalOpen(true)} className="absolute bottom-6 right-6 z-[1000] flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-full text-xs font-black shadow-2xl hover:bg-black transition-all uppercase italic tracking-widest leading-none font-sans"><FileSpreadsheet size={18} /> IMPORT DATA</button>
        </div>
      </div>

      {/* MAP BOX */}
      <div className="w-full h-[55vh] bg-white rounded-[3rem] shadow-2xl border-[12px] border-white overflow-hidden relative mb-10">
        {!loading && geoData && (
          <MapContainer center={[-2.5, 118]} zoom={5} dragging={false} scrollWheelZoom={false} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <GeoJSON 
              key={`${viewMode}-${sites.length}`}
              data={geoData} 
              style={getRegionStyle}
              onEachFeature={(f, layer) => {
                const provName = (f.properties.NAME_1 || f.properties.name || f.properties.PROVINSI || "").toUpperCase().trim();
                const pData = statsByRegion[provName];

                if (pData && pData.count > 0) {
                  const logoSrc = pData.ericsson >= pData.nokia ? "/logo-ericsson.png" : "/logo-nokia.png";
                  layer.on({ click: () => navigate(`/detail/TMGW/${provName}`) });
                  layer.bindTooltip(`
                    <div class="p-4 font-black uppercase text-[10px] min-w-[200px] text-center">
                      <div class="text-red-600 border-b mb-3 pb-1 text-xs italic font-black">${provName}</div>
                      ${viewMode === 'utilization' ? `
                        <div class="text-slate-800 text-lg font-black">${pData.count} UNITS</div>
                        <div class="text-slate-500 font-black">AVG UTIL: ${pData.avgUtil}%</div>
                      ` : `
                        <div class="flex flex-col items-center gap-2">
                          <img src="${logoSrc}" class="h-8 object-contain mb-1" />
                          <div class="text-slate-800 text-sm mt-1 font-black italic">${pData.totalUsage.toLocaleString('id-ID')}</div>
                          <div class="text-[8px] text-gray-400 font-black uppercase">SCC USAGE</div>
                        </div>
                      `}
                    </div>
                  `, { sticky: true });
                }
              }}
            />
          </MapContainer>
        )}
        
        {/* Legend */}
        <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-5 rounded-[2rem] shadow-xl border border-gray-100 min-w-[200px]">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">{viewMode === 'utilization' ? 'Util Level' : 'Dominant Vendor'}</p>
          <div className="space-y-3 font-black italic uppercase">
            {viewMode === 'utilization' ? (
              <>
                <div className="flex items-center gap-3"><div className="w-4 h-4 bg-[#ef4444] rounded-lg shadow-sm"></div><span className="text-[10px] text-slate-700">&gt; 80% Critical</span></div>
                <div className="flex items-center gap-3"><div className="w-4 h-4 bg-[#ff7f00] rounded-lg shadow-sm"></div><span className="text-[10px] text-slate-700">70-80% Warning</span></div>
                <div className="flex items-center gap-3"><div className="w-4 h-4 bg-[#eab308] rounded-lg shadow-sm"></div><span className="text-[10px] text-slate-700">&lt; 70% Good</span></div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3"><div className="w-4 h-4 bg-[#2563eb] rounded-lg shadow-sm"></div><span className="text-[10px] text-slate-700">Ericsson</span></div>
                <div className="flex items-center gap-3"><div className="w-4 h-4 bg-[#10b981] rounded-lg shadow-sm"></div><span className="text-[10px] text-slate-700">Nokia</span></div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* REGIONAL SUMMARY (DINAMIS) */}
      <div className="bg-white rounded-[3rem] shadow-xl p-10 border-4 border-white mb-20 mt-10">
        <div className="flex flex-col md:flex-row md:items-center gap-5 mb-10 border-b border-gray-100 pb-8 font-black uppercase italic">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl"><LayoutGrid size={32} /></div>
             <div>
                <h3 className="text-3xl text-gray-900">Regional Summary</h3>
                <p className="text-[11px] text-gray-400 tracking-widest mt-2">Aggregated Trunk Performance</p>
             </div>
          </div>
          
          <div className="md:ml-auto flex items-center gap-6 bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100 shadow-inner">
             <div className="text-right border-r pr-6 border-slate-200">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-2">Total Nodes</p>
                <p className="text-3xl text-slate-800 italic leading-none">{sites.length}</p>
             </div>
             <div>
                {viewMode === 'utilization' ? (
                  <>
                    <p className="text-[9px] text-red-400 uppercase tracking-widest leading-none mb-2">National Util Avg</p>
                    <p className="text-3xl text-red-600 italic leading-none">
                      {(sites.reduce((acc, curr) => acc + cleanNum(curr.scc_util), 0) / (sites.length || 1)).toFixed(2)}%
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[9px] text-blue-400 uppercase tracking-widest leading-none mb-2">Total SCC Usage</p>
                    <p className="text-3xl text-blue-600 italic leading-none">
                      {sites.reduce((acc, curr) => acc + cleanNum(curr.scc_usage), 0).toLocaleString('id-ID')}
                    </p>
                  </>
                )}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.entries(statsByRegional).map(([name, data]) => (
            <div key={name} onClick={() => navigate(`/regional/TMGW/${name}`)} className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-transparent hover:border-red-500 hover:bg-white transition-all group shadow-sm font-black uppercase italic cursor-pointer transform hover:scale-105">
              <p className="text-[10px] text-gray-400 tracking-widest mb-4 group-hover:text-red-500">{name}</p>
              <div className="flex flex-col gap-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 tracking-tighter">Nodes</span>
                    <span className="text-2xl text-slate-800 group-hover:text-red-600">{data.count}</span>
                 </div>
                 <div className="flex items-center justify-between border-t pt-3 border-slate-100">
                    {viewMode === 'utilization' ? (
                      <>
                        <span className="text-[9px] text-slate-400 tracking-tighter">Avg Util</span>
                        <span className={`text-sm ${parseFloat(data.avgUtil) > 80 ? 'text-red-600' : 'text-green-600'}`}>{data.avgUtil}%</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] text-slate-400 tracking-tighter">Total Usage</span>
                        <span className="text-sm text-blue-600">{data.totalUsage.toLocaleString('id-ID')}</span>
                      </>
                    )}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BatchImportModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} currentElement="TMGW" onRefresh={fetchData} />
    </div>
  );
};

export default TmgwMap;