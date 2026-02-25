import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, FileSpreadsheet, LayoutGrid, Maximize2, Minimize2 } from 'lucide-react';
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
  const { element } = useParams(); // Mengambil nama elemen dari URL
  const [geoData, setGeoData] = useState(null);
  const [sites, setSites] = useState([]);
  const [statsByRegion, setStatsByRegion] = useState({});
  const [statsByRegional, setStatsByRegional] = useState({});
  const [loading, setLoading] = useState(true);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isWide, setIsWide] = useState(false);

  // Normalisasi element agar sinkron antara URL (DNS%20Gi) dan Backend (DNS Gi)
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
      // Menggunakan rute API yang benar (DNS%20Gi)
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
    <div className={`min-h-screen bg-gray-50 font-sans transition-all duration-700 ${isWide ? '' : 'p-6'} overflow-x-hidden text-left`}>
      
      {/* HEADER */}
      {!isWide && (
        <div className="flex justify-between items-center mb-8 px-2">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 font-black text-red-600 uppercase tracking-widest text-lg hover:translate-x-[-3px] transition-all">
              <ArrowLeft size={28} strokeWidth={3} /> BACK
            </button>
            <button onClick={() => setIsBatchModalOpen(true)} className="flex items-center gap-3 px-6 py-2.5 bg-red-600 text-white rounded-full text-[10px] font-black shadow-xl hover:bg-black transition-all uppercase tracking-widest leading-none italic font-sans">
               <FileSpreadsheet size={16} /> Import New Data
            </button>
          </div>

          <div className="flex items-center gap-5">
            <button onClick={() => setIsWide(true)} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black shadow-xl hover:bg-blue-600 transition-all uppercase italic">
              <Maximize2 size={16} /> Go Wide View
            </button>
            <h2 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
              DNS GI <span className="text-blue-600">HEATMAP</span>
            </h2>
          </div>
        </div>
      )}

      {/* MAP BOX */}
      <div className={`relative transition-all duration-700 ease-in-out
        ${isWide ? 'fixed inset-0 z-[5000] w-screen h-screen bg-slate-100' : 'w-full h-[70vh] bg-white rounded-[3.5rem] shadow-2xl border-[15px] border-white overflow-hidden mb-12'}
      `}>
        {isWide && (
           <button onClick={() => setIsWide(false)} className="absolute top-8 right-8 z-[6000] p-4 bg-red-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-90"><Minimize2 size={32}/></button>
        )}

        {!loading && geoData && (
          <MapContainer 
            center={isWide ? [-4.0, 118] : [-2.8, 118]} 
            zoom={isWide ? 5.2 : 5} 
            dragging={false} scrollWheelZoom={false} zoomControl={false} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <GeoJSON 
              key={`gi-vfinal-${isWide}-${sites.length}`} 
              data={geoData} 
              style={(f) => {
                const provName = (f.properties.NAME_1 || f.properties.name || f.properties.PROVINSI || "").toUpperCase().trim();
                const hasData = sites.some(s => (s.region || "").toUpperCase().trim() === provName);
                // Gunakan Biru Navy Slate khas Core
                return { fillColor: hasData ? "#334155" : "#f1f5f9", weight: 0.8, color: 'white', fillOpacity: 0.85 };
              }}
              onEachFeature={(f, layer) => {
                const provName = (f.properties.NAME_1 || f.properties.name || f.properties.PROVINSI || "").toUpperCase().trim();
                const provSites = sites.filter(s => (s.region || "").toUpperCase().trim() === provName);

                if (provName) {
                  layer.on({ click: () => navigate(`/detail/DNS-Gi/${provName}`) });
                  
                  if (provSites.length > 0) {
                    layer.bindTooltip(`
                      <div class="pop-wrapper-gi">
                        <div class="pop-head-gi">${provName}</div>
                        <div class="pop-body-gi">
                           <table class="pop-tab-gi">
                             ${provSites.map((s, i) => `
                               <tr style="background: ${i % 2 === 0 ? '#fff' : '#fafafa'}; border-bottom: 1px solid #f1f5f9;">
                                  <td class="td-gi-name">${s.name.split('-')[0]}</td>
                                  <td class="td-gi-hw">
                                    <div class="hw-bold">${s.hw_type || '-'}</div>
                                    <div class="hw-date-sm">${s.hw_eos || '-'}</div>
                                  </td>
                                  <td class="td-gi-cap">${s.capacity_kqps || '-'} <small>KQPS</small></td>
                               </tr>
                             `).join('')}
                           </table>
                        </div>
                      </div>
                    `, { 
                        permanent: isWide, 
                        direction: 'top', 
                        sticky: !isWide, 
                        className: 'custom-gi-tooltip' 
                    });
                  }
                }
              }}
            />
          </MapContainer>
        )}
      </div>

      {/* SUMMARY GRID */}
      {!isWide && (
        <div className="bg-white rounded-[3rem] shadow-xl p-10 border-4 border-white mb-24 mt-4 font-black uppercase italic tracking-tighter">
          <div className="flex flex-col md:flex-row md:items-center gap-5 mb-10 border-b border-slate-100 pb-8 text-gray-900">
            <div className="flex items-center gap-4">
               <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl"><LayoutGrid size={32} /></div>
               <h3 className="text-3xl">Regional Summary</h3>
            </div>
            <div className="md:ml-auto flex items-center gap-8 bg-slate-50 px-10 py-5 rounded-[2.5rem] border border-slate-200 shadow-inner">
               <div className="text-right border-r pr-8 border-slate-300">
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-1">National Units</p>
                  <p className="text-3xl text-slate-800 leading-none">{sites.length}</p>
               </div>
               <div>
                  <p className="text-[9px] text-red-400 uppercase tracking-widest leading-none mb-1">Nationwide Capacity</p>
                  <p className="text-3xl text-red-600 leading-none">
                    {sites.reduce((acc, curr) => acc + cleanNum(curr.capacity_kqps), 0).toLocaleString('id-ID')} <small class="text-xs uppercase">KQPS</small>
                  </p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-800">
            {Object.entries(statsByRegional).map(([name, data]) => (
              <div key={name} onClick={() => navigate(`/regional/DNS-Gi/${name}`)} className="bg-gray-50/70 p-7 rounded-[2.5rem] border-2 border-transparent hover:border-blue-600 hover:bg-white transition-all group cursor-pointer shadow-sm transform hover:scale-105">
                <p className="text-[11px] text-gray-400 mb-5 group-hover:text-blue-600 tracking-widest leading-none">{name}</p>
                <div className="flex justify-between border-b pb-3"><span className="text-slate-400 text-[9px]">Nodes</span><span className="text-2xl leading-none font-black italic">{data.count}</span></div>
                <div className="flex justify-between pt-3"><span className="text-slate-400 text-[9px]">Cap Capacity</span><span className="text-sm text-red-600 font-black italic">{data.totalCap.toLocaleString('id-ID')}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BatchImportModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} currentElement="DNS Gi" onRefresh={fetchData} />

      {/* --- CSS KHUSUS POPUP --- */}
      <style>{`
        .custom-gi-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; opacity: 1 !important; z-index: 1000 !important; pointer-events: none !important; }
        .pop-wrapper-gi { background: white; border: 1.5px solid #1e293b; border-radius: 8px; overflow: hidden; min-width: 250px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); font-family: 'Segoe UI', sans-serif; }
        .pop-head-gi { background: #1e293b; color: white !important; font-size: 8px; font-weight: 900; padding: 4px; text-align: center; text-transform: uppercase; }
        .pop-tab-gi { width: 100%; border-collapse: collapse; }
        .pop-tab-gi td { padding: 6px 10px; vertical-align: middle; text-align: center; }
        .td-gi-name { font-weight: 900; font-size: 10px; color: #1e293b; text-transform: uppercase; border-right: 1px solid #f8fafc; }
        .td-gi-hw { border-right: 1px solid #f8fafc; line-height: 1.1; }
        .hw-bold { font-weight: 900; font-size: 9px; color: #ef4444; }
        .hw-date-sm { font-size: 6.5px; color: #94a3b8; font-weight: 800; }
        .td-gi-cap { font-weight: 900; font-size: 10px; color: #1e293b; }
        .td-gi-cap small { font-size: 6px; opacity: 0.4; }
        .custom-gi-tooltip::before { display: none !important; }
      `}</style>
    </div>
  );
};

export default DnsGiMap;