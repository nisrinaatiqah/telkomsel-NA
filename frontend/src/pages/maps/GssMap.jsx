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

const GssMap = ({ element }) => {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState(null);
  const [sites, setSites] = useState([]);
  const [statsByRegion, setStatsByRegion] = useState({});
  const [statsByRegional, setStatsByRegional] = useState({});
  const [loading, setLoading] = useState(true);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('occupancy'); // 'occupancy' atau 'vendor'

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
      const res = await axios.get(`http://localhost:5001/api/sites/GSS`);
      const data = Array.isArray(res.data) ? res.data : [];
      setSites(data);
      processAdvancedStats(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const processAdvancedStats = (allSites) => {
    const pStats = {};
    const rStats = {};
    Object.keys(regionalMapping).forEach(reg => {
      rStats[reg] = { count: 0, totalOcc: 0, totalUsage: 0, ericsson: 0, nokia: 0, avgOcc: 0 };
    });

    allSites.forEach(site => {
      const prov = (site.region || "UNKNOWN").toUpperCase().trim();
      const occ = cleanNum(site.bhca_occupancy);
      const usage = cleanNum(site.bhca_usage);
      const vendor = String(site.vendor || "").toUpperCase();

      if (!pStats[prov]) pStats[prov] = { count: 0, totalOcc: 0, totalUsage: 0, ericsson: 0, nokia: 0 };
      pStats[prov].count += 1;
      pStats[prov].totalOcc += occ;
      pStats[prov].totalUsage += usage;
      if (vendor.includes("ERICSSON")) pStats[prov].ericsson += 1;
      else if (vendor.includes("NOKIA")) pStats[prov].nokia += 1;

      const targetReg = Object.keys(regionalMapping).find(reg => regionalMapping[reg].includes(prov));
      if (targetReg) {
        rStats[targetReg].count += 1;
        rStats[targetReg].totalOcc += occ;
        rStats[targetReg].totalUsage += usage;
        if (vendor.includes("ERICSSON")) rStats[targetReg].ericsson += 1;
        else if (vendor.includes("NOKIA")) rStats[targetReg].nokia += 1;
      }
    });

    Object.keys(pStats).forEach(k => pStats[k].avgOcc = (pStats[k].totalOcc / pStats[k].count).toFixed(2));
    Object.keys(rStats).forEach(k => {
      if(rStats[k].count > 0) rStats[k].avgOcc = (rStats[k].totalOcc / rStats[k].count).toFixed(2);
    });
    setStatsByRegion(pStats);
    setStatsByRegional(rStats);
  };

  const getRegionStyle = (feature) => {
    const provName = (feature.properties.NAME_1 || feature.properties.name || feature.properties.PROVINSI || "").toUpperCase().trim();
    const provData = statsByRegion[provName];
    const regName = Object.keys(regionalMapping).find(reg => regionalMapping[reg].includes(provName));
    const regData = statsByRegional[regName] || { count: 0, avgOcc: 0, ericsson: 0, nokia: 0 };

    let color = "#f1f5f9"; 

    if (viewMode === 'occupancy') {
      // INHERITANCE: Jika provinsi kosong, ambil data regional
      const finalOcc = (provData && provData.count > 0) ? parseFloat(provData.avgOcc) : parseFloat(regData.avgOcc);
      if ((provData && provData.count > 0) || (regData && regData.count > 0)) {
        if (finalOcc >= 80) color = "#ef4444";
        else if (finalOcc >= 70) color = "#ff7f00"; 
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

        <div className="bg-white p-1.5 rounded-full shadow-2xl border-2 border-gray-100 flex gap-2">
          <button onClick={() => setViewMode('occupancy')} className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'occupancy' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-red-600'}`}>
            <Zap size={14} className="inline mr-2"/> OCCUPANCY
          </button>
          <button onClick={() => setViewMode('vendor')} className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'vendor' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400 hover:text-slate-900'}`}>
            <Users size={14} className="inline mr-2"/> VENDOR
          </button>
        </div>

        <div className="text-right font-black italic tracking-tighter leading-none">
          <h2 className="text-4xl text-gray-900 uppercase">GSS <span className="text-red-600">{viewMode.toUpperCase()}</span></h2>
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
                  layer.on({ click: () => navigate(`/detail/GSS/${provName}`) });
                  layer.bindTooltip(`
                    <div class="p-4 font-black uppercase text-[10px] min-w-[200px] text-center">
                      <div class="text-red-600 border-b mb-3 pb-1 text-xs italic font-black">${provName}</div>
                      ${viewMode === 'occupancy' ? `
                        <div class="text-slate-800 text-lg font-black">${pData.count} UNITS</div>
                        <div class="text-slate-500 font-black">AVG BHCA OCC: ${pData.avgOcc}%</div>
                      ` : `
                        <div class="flex flex-col items-center gap-2">
                          <img src="${logoSrc}" class="h-8 object-contain mb-1" />
                          <div class="text-slate-800 text-sm mt-1 font-black italic">${pData.totalUsage.toLocaleString('id-ID')}</div>
                          <div class="text-[8px] text-gray-400 font-black uppercase">BHCA USAGE</div>
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
          <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">{viewMode === 'occupancy' ? 'BHCA Load Level' : 'Dominant Vendor'}</p>
          <div className="space-y-3 font-black italic uppercase">
            {viewMode === 'occupancy' ? (
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
        <button onClick={() => setIsBatchModalOpen(true)} className="absolute bottom-6 right-6 z-[1000] flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-full text-xs font-black shadow-2xl hover:bg-black transition-all uppercase italic tracking-widest leading-none font-sans"><FileSpreadsheet size={18} /> IMPORT GSS DATA</button>
      </div>

      {/* REGIONAL SUMMARY DENGAN NATIONWIDE (DYNAMIC) */}
      <div className="bg-white rounded-[3rem] shadow-xl p-10 border-4 border-white mb-20 mt-10">
        <div className="flex flex-col md:flex-row md:items-center gap-5 mb-10 border-b border-gray-100 pb-8">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl"><LayoutGrid size={32} /></div>
             <div>
                <h3 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter leading-none">Regional Summary</h3>
                <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-2">Aggregated Infrastructure Data</p>
             </div>
          </div>
          
          <div className="md:ml-auto flex items-center gap-6 bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100 font-black shadow-inner">
             <div className="text-right border-r pr-6 border-slate-200">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-2">Nationwide Nodes</p>
                <p className="text-3xl text-slate-800 italic leading-none">{sites.length}</p>
             </div>
             <div>
                {viewMode === 'occupancy' ? (
                  <>
                    <p className="text-[9px] text-red-400 uppercase tracking-widest leading-none mb-2">Global BHCA Load</p>
                    <p className="text-3xl text-red-600 italic leading-none">
                      {(sites.reduce((acc, curr) => acc + cleanNum(curr.bhca_occupancy), 0) / (sites.length || 1)).toFixed(2)}%
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[9px] text-blue-400 uppercase tracking-widest leading-none mb-2">Total BHCA Usage</p>
                    <p className="text-3xl text-blue-600 italic leading-none">
                      {sites.reduce((acc, curr) => acc + cleanNum(curr.bhca_usage), 0).toLocaleString('id-ID')}
                    </p>
                  </>
                )}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.entries(statsByRegional).map(([name, data]) => (
            <div key={name} onClick={() => navigate(`/regional/GSS/${name}`)} className="bg-gray-50/50 p-6 rounded-[2.5rem] border-2 border-transparent hover:border-red-500 hover:bg-white transition-all group shadow-sm font-black uppercase italic cursor-pointer transform hover:scale-105">
              <p className="text-[10px] text-gray-400 tracking-widest mb-4 group-hover:text-red-500">{name}</p>
              <div className="flex flex-col gap-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 tracking-tighter">Nodes</span>
                    <span className="text-2xl text-slate-800 group-hover:text-red-600">{data.count}</span>
                 </div>
                 <div className="flex items-center justify-between border-t pt-3 border-slate-100">
                    {viewMode === 'occupancy' ? (
                      <>
                        <span className="text-[9px] text-slate-400 tracking-tighter">Avg Load</span>
                        <span className={`text-sm ${parseFloat(data.avgOcc) > 80 ? 'text-red-600' : 'text-green-600'}`}>{data.avgOcc}%</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] text-slate-400 tracking-tighter">BHCA Usage</span>
                        <span className="text-sm text-blue-600">{data.totalUsage.toLocaleString('id-ID')}</span>
                      </>
                    )}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BatchImportModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} currentElement="GSS" onRefresh={fetchData} />
    </div>
  );
};

export default GssMap;  