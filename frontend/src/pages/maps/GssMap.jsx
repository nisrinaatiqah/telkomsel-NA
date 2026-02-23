import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, FileSpreadsheet, Database, LayoutGrid } from 'lucide-react';
import axios from 'axios'; 
import BatchImportModal from '../../components/BatchImportModal';

const GssMap = ({ element }) => {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState(null);
  const [sites, setSites] = useState([]);
  const [statsByRegion, setStatsByRegion] = useState({}); // Per Provinsi
  const [statsByRegional, setStatsByRegional] = useState({}); // Per Regional (Sumbagut, dll)
  const [loading, setLoading] = useState(true);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

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
    "Regional Papua & Maluku": ["MALUKU", "MALUKU UTARA", "PAPUA", "PAPUA BARAT"]
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
      processStats(data);
    } catch (err) {
      console.error("Gagal load data GSS", err);
    } finally {
      setLoading(false);
    }
  };

  const processStats = (allSites) => {
    const provStats = {};
    const regStats = {};

    Object.keys(regionalMapping).forEach(reg => {
      regStats[reg] = { count: 0, totalOcc: 0, avgOcc: 0 };
    });

    allSites.forEach(site => {
      const provName = (site.region || "UNKNOWN").toUpperCase().trim();
      const occValue = parseFloat(String(site.bhca_occupancy || "0").replace(',', '.'));

      if (!provStats[provName]) provStats[provName] = { count: 0, totalOcc: 0, avgOcc: 0 };
      provStats[provName].count += 1;
      provStats[provName].totalOcc += isNaN(occValue) ? 0 : occValue;

      const targetReg = Object.keys(regionalMapping).find(r => regionalMapping[r].includes(provName));
      if (targetReg) {
        regStats[targetReg].count += 1;
        regStats[targetReg].totalOcc += isNaN(occValue) ? 0 : occValue;
      }
    });

    Object.keys(provStats).forEach(k => provStats[k].avgOcc = (provStats[k].totalOcc / provStats[k].count).toFixed(2));
    Object.keys(regStats).forEach(k => {
      if(regStats[k].count > 0) regStats[k].avgOcc = (regStats[k].totalOcc / regStats[k].count).toFixed(2);
    });

    setStatsByRegion(provStats);
    setStatsByRegional(regStats);
  };

  const getRegionStyle = (feature) => {
    const keys = ['NAME_1', 'name', 'PROVINSI'];
    let found = keys.find(k => feature.properties[k]);
    const provName = found ? feature.properties[found].toUpperCase().trim() : "";
    
    const stat = statsByRegion[provName];
    let color = "#f1f5f9"; 
    
    if (stat && stat.count > 0) {
      const occ = parseFloat(stat.avgOcc);
      if (occ >= 80) color = "#ef4444";
      else if (occ >= 50) color = "#eab308";
      else color = "#22c55e";
    }
    return { fillColor: color, weight: 1.5, color: 'white', fillOpacity: 0.6 };
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6 overflow-x-hidden">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 font-black text-red-600 uppercase tracking-widest text-lg hover:translate-x-[-5px] transition-all">
          <ArrowLeft size={28} strokeWidth={3} /> BACK
        </button>
        <div className="text-right">
          <h2 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">GSS <span className="text-red-600">HEATMAP</span></h2>
          <p className="text-[11px] text-gray-400 font-black uppercase mt-2 tracking-widest">BHCA OCCUPANCY (%) ANALYSIS</p>
        </div>
      </div>

      <div className="w-full h-[55vh] bg-white rounded-[3rem] shadow-2xl border-[12px] border-white overflow-hidden relative mb-10">
        {!loading && geoData && (
          <MapContainer center={[-2.5, 118]} zoom={5} dragging={false} scrollWheelZoom={false} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <GeoJSON 
              key="GSS-HEATMAP"
              data={geoData} 
              style={getRegionStyle}
              onEachFeature={(f, layer) => {
                const keys = ['NAME_1', 'name', 'PROVINSI'];
                let found = keys.find(k => f.properties[k]);
                const prov = found ? f.properties[found].toUpperCase().trim() : "UNKNOWN";
                const s = statsByRegion[prov] || { count: 0, avgOcc: 0 };
                
                layer.on('click', () => navigate(`/detail/GSS/${prov}`));
                layer.bindTooltip(`
                  <div class="p-2 font-black uppercase text-[10px]">
                    <div class="text-red-600 border-b mb-1 pb-1">${prov}</div>
                    <div class="text-slate-800">${s.count} UNITS | ${s.avgOcc}% BHCA OCC</div>
                  </div>
                `, { sticky: true });
              }}
            />
          </MapContainer>
        )}

        {/* Legend */}
        <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center gap-3"><div className="w-3 h-3 bg-[#ef4444] rounded-full"></div><span className="text-[9px] font-black uppercase tracking-widest text-slate-600">&gt; 80% CRITICAL</span></div>
            <div className="flex items-center gap-3"><div className="w-3 h-3 bg-[#eab308] rounded-full"></div><span className="text-[9px] font-black uppercase tracking-widest text-slate-600">50-80% WARNING</span></div>
            <div className="flex items-center gap-3"><div className="w-3 h-3 bg-[#22c55e] rounded-full"></div><span className="text-[9px] font-black uppercase tracking-widest text-slate-600">&lt; 50% GOOD</span></div>
          </div>
        </div>

        <button onClick={() => setIsBatchModalOpen(true)} className="absolute bottom-6 right-6 z-[1000] flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-full text-xs font-black shadow-2xl hover:bg-black transition-all uppercase italic tracking-widest">
          <FileSpreadsheet size={18} /> IMPORT GSS DATA
        </button>
      </div>

      {/* REGIONAL SUMMARY */}
      <div className="bg-white rounded-[3rem] shadow-xl p-10 border-4 border-white mb-20">
        <div className="flex items-center gap-5 mb-10 border-b border-gray-100 pb-8">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl"><LayoutGrid size={32} /></div>
          <div>
            <h3 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter leading-none">Regional Summary</h3>
            <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-2">GSS BHCA Performance Overview</p>
          </div>
          <div className="ml-auto bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100 flex items-center gap-6">
             <div className="text-right border-r pr-6 border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GSS Nodes</p>
                <p className="text-3xl font-black text-slate-800 italic leading-none">{sites.length}</p>
             </div>
             <div>
                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Avg BHCA Occ</p>
                <p className="text-3xl font-black text-red-600 italic leading-none">
                  {(sites.reduce((a, b) => a + parseFloat(String(b.bhca_occupancy || 0).replace(',','.')), 0) / (sites.length || 1)).toFixed(2)}%
                </p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.entries(statsByRegional).sort((a, b) => b[1].count - a[1].count).map(([name, data]) => (
            <div key={name} className="bg-gray-50/50 p-6 rounded-[2.5rem] border-2 border-transparent hover:border-red-500 hover:bg-white transition-all group shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 group-hover:text-red-500">{name}</p>
              <div className="flex flex-col gap-2">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase italic">Nodes</span>
                    <span className="text-2xl font-black text-slate-800 italic group-hover:text-red-600">{data.count}</span>
                 </div>
                 <div className="flex items-center justify-between border-t pt-2 border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase italic">Avg Occ</span>
                    <span className={`text-sm font-black italic ${parseFloat(data.avgOcc) > 80 ? 'text-red-600' : 'text-green-600'}`}>
                      {data.avgOcc}%
                    </span>
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