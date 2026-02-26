import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, FileSpreadsheet, LayoutGrid, Database, Zap } from 'lucide-react';
import axios from 'axios';
import BatchImportModal from '../../components/BatchImportModal';

// --- HELPER PEMBERSIH ANGKA ---
const cleanNum = (v) => {
  if (!v) return 0;
  let s = String(v).trim().replace('%', '');
  if (s.includes(',') && s.includes('.')) return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  if (s.includes(',')) return parseFloat(s.replace(',', '.')) || 0;
  return parseFloat(s) || 0;
};

const DnsGiMap = () => {
  const navigate = useNavigate();
  const { element } = useParams();
  const [geoData, setGeoData] = useState(null);
  const [sites, setSites] = useState([]);
  const [statsByRegion, setStatsByRegion] = useState({});
  const [statsByRegional, setStatsByRegional] = useState({});
  const [loading, setLoading] = useState(true);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Sinkronisasi nama element dari URL
  const normalizedElement = element ? decodeURIComponent(element).replace('-', ' ') : "DNS Gi";

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
  }, [normalizedElement]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/sites/${encodeURIComponent(normalizedElement)}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setSites(data);
      processStats(data);
    } catch (err) {
      console.error("Gagal ambil data DNS Gi:", err);
    } finally {
      setLoading(false);
    }
  };

  const processStats = (allSites) => {
    const pStats = {};
    const rStats = {};
    Object.keys(regionalMapping).forEach(reg => { rStats[reg] = { count: 0, totalCap: 0 }; });

    allSites.forEach(site => {
      const prov = (site.region || "UNKNOWN").toUpperCase().trim();
      const cap = cleanNum(site.capacity_kqps);
      
      if (!pStats[prov]) pStats[prov] = { count: 0, totalCap: 0 };
      pStats[prov].count += 1;
      pStats[prov].totalCap += cap;

      const targetReg = Object.keys(regionalMapping).find(r => regionalMapping[r].includes(prov));
      if (targetReg) {
        rStats[targetReg].count += 1;
        rStats[targetReg].totalCap += cap;
      }
    });
    setStatsByRegion(pStats);
    setStatsByRegional(rStats);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6 overflow-x-hidden text-left">
      
      {/* HEADER (Sesuai gaya MSS) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 font-black text-red-600 uppercase tracking-widest text-lg hover:translate-x-[-5px] transition-all">
          <ArrowLeft size={28} strokeWidth={3} /> BACK
        </button>

        {/* DNS Gi Title Center-ish/Right */}
        <div className="text-right font-black italic tracking-tighter leading-none">
          <h2 className="text-4xl text-gray-900 uppercase">
            DNS GI <span className="text-red-600">DISTRIBUTION</span>
          </h2>
          <p className="text-[11px] text-gray-400 font-black uppercase mt-1 tracking-widest">
             TOTAL NODES: <span className="text-red-600 font-black">{sites.length} UNITS</span>
          </p>
        </div>
      </div>

      {/* MAP BOX - HEIGHT GEDE 75vh & MAP FROZEN */}
      <div className="w-full h-[75vh] bg-white rounded-[3rem] shadow-2xl border-[12px] border-white overflow-hidden relative mb-10">
        {!loading && geoData && (
          <MapContainer 
            center={[-2.5, 118]} 
            zoom={5} 
            dragging={false} 
            scrollWheelZoom={false} 
            zoomControl={false} 
            doubleClickZoom={false}
            touchZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <GeoJSON 
              key={`dnsgi-fixed-${sites.length}`} 
              data={geoData} 
              style={(f) => {
                const provName = (f.properties.NAME_1 || f.properties.name || f.properties.PROVINSI || "").toUpperCase().trim();
                const pData = statsByRegion[provName];
                // Navy Slate khas Core
                return { fillColor: (pData && pData.count > 0) ? "#334155" : "#f1f5f9", weight: 1.2, color: 'white', fillOpacity: 0.85 };
              }}
              onEachFeature={(f, layer) => {
                const provName = (f.properties.NAME_1 || f.properties.name || f.properties.PROVINSI || "").toUpperCase().trim();
                const pData = statsByRegion[provName];

                if (pData && pData.count > 0) {
                  layer.on({ click: () => navigate(`/detail/DNS-Gi/${provName}`) });
                  
                  // Pop desain disamakan dengan gaya simpel MSS
                  layer.bindTooltip(`
                    <div class="p-4 font-black uppercase text-[10px] min-w-[180px] text-center">
                      <div class="text-blue-600 border-b border-blue-100 mb-3 pb-1 text-xs italic font-black">${provName}</div>
                      <div class="text-slate-800 text-lg font-black leading-none">${pData.count} UNITS</div>
                      <div class="mt-2 text-slate-400 font-black">TOTAL CAPACITY:</div>
                      <div class="text-slate-800 text-sm font-black italic">${pData.totalCap.toLocaleString('id-ID')} KQPS</div>
                    </div>
                  `, { sticky: true });
                }
              }}
            />
          </MapContainer>
        )}

        {/* Import Data Button - Positioned exactly like MSS Map View */}
        <button 
          onClick={() => setIsBatchModalOpen(true)} 
          className="absolute bottom-6 right-6 z-[1000] flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-full text-xs font-black shadow-2xl hover:bg-black transition-all uppercase italic tracking-widest leading-none"
        >
          <FileSpreadsheet size={18} /> IMPORT NEW DATA
        </button>
      </div>

      {/* SUMMARY GRID (DYNAMIC) */}
      <div className="bg-white rounded-[3rem] shadow-xl p-10 border-4 border-white mb-20 mt-4 font-black uppercase italic tracking-tighter">
        <div className="flex flex-col md:flex-row md:items-center gap-5 mb-10 border-b border-slate-100 pb-8 text-gray-900">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl"><LayoutGrid size={32} /></div>
             <h3 className="text-3xl">Regional Summary</h3>
          </div>
          
          <div className="md:ml-auto flex items-center gap-8 bg-slate-50 px-10 py-5 rounded-[2.5rem] border border-slate-200 shadow-inner">
             <div className="text-right border-r pr-8 border-slate-300">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1 leading-none">Nationwide Units</p>
                <p className="text-3xl text-slate-800 italic leading-none">{sites.length}</p>
             </div>
             <div>
                <p className="text-[9px] text-blue-400 uppercase tracking-widest mb-1 leading-none">Total KQPS Cap</p>
                <p className="text-3xl text-blue-600 italic leading-none">
                  {sites.reduce((acc, curr) => acc + cleanNum(curr.capacity_kqps), 0).toLocaleString('id-ID')}
                </p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-800 font-black uppercase">
          {Object.entries(statsByRegional).map(([name, data]) => (
            <div key={name} onClick={() => navigate(`/regional/DNS-Gi/${name}`)} className="bg-gray-50/70 p-7 rounded-[2.5rem] border-2 border-transparent hover:border-blue-600 hover:bg-white transition-all group cursor-pointer shadow-sm transform hover:scale-105 italic">
              <p className="text-[10px] text-gray-400 mb-5 group-hover:text-blue-600 tracking-widest leading-none">{name}</p>
              <div className="flex justify-between items-end border-b pb-3 mb-1">
                 <span className="text-slate-400 text-[8px] leading-none uppercase">Units</span>
                 <span className="text-2xl text-slate-800 group-hover:text-blue-600 leading-none">{data.count}</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                 <span className="text-slate-400 text-[8px] leading-none uppercase">Cap KQPS</span>
                 <span className="text-sm text-slate-600 leading-none">{data.totalCap.toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BatchImportModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} currentElement="DNS Gi" onRefresh={fetchData} />
    </div>
  );
};

export default DnsGiMap;