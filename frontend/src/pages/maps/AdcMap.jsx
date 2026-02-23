import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, FileSpreadsheet, LayoutGrid, Database } from 'lucide-react';
import axios from 'axios';
import BatchImportModal from '../../components/BatchImportModal';

const AdcMap = ({ element }) => {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState(null);
  const [sites, setSites] = useState([]);
  const [provStats, setProvStats] = useState({}); // State untuk simpan jumlah per provinsi
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
    try {
      const res = await axios.get(`http://localhost:5001/api/sites/ADC`);
      const data = Array.isArray(res.data) ? res.data : [];
      setSites(data);
      
      // HITUNG JUMLAH NODE PER PROVINSI
      const stats = {};
      data.forEach(s => {
        const prov = (s.region || "UNKNOWN").toUpperCase().trim();
        stats[prov] = (stats[prov] || 0) + 1;
      });
      setProvStats(stats);
    } catch (err) {
      console.error("Gagal load data ADC", err);
    }
  };

  const getProvinceName = (props) => {
    const keys = ['NAME_1', 'name', 'PROVINSI', 'Provinsi', 'Propinsi'];
    let found = keys.find(k => props[k] && typeof props[k] === 'string');
    return found ? props[found].toUpperCase().trim() : null;
  };

  const getRegionalSummary = () => {
    const summary = {};
    Object.keys(regionalMapping).forEach(reg => summary[reg] = 0);
    sites.forEach(site => {
      const prov = (site.region || "").toUpperCase();
      const regName = Object.keys(regionalMapping).find(reg => regionalMapping[reg].includes(prov));
      if (regName) summary[regName]++;
    });
    return Object.entries(summary).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans overflow-x-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-3 px-2 py-1 font-black text-red-600 uppercase tracking-widest text-lg hover:translate-x-[-5px] transition-all"
        >
          <ArrowLeft size={28} strokeWidth={3} /> BACK
        </button>
        <div className="text-right">
          <h2 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
            ADC <span className="text-red-600">DISTRIBUTION</span>
          </h2>
        </div>
      </div>

      {/* STATIC MAP BOX */}
      <div className="w-full h-[55vh] bg-white rounded-[3rem] shadow-2xl border-[12px] border-white overflow-hidden relative mb-10">
        {geoData && (
          <MapContainer 
            center={[-2.5, 118]} zoom={5} 
            dragging={false} 
            scrollWheelZoom={false} 
            zoomControl={false}
            doubleClickZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <GeoJSON 
              key="ADC-GEO-LAYER" 
              data={geoData} 
              style={{ fillColor: '#E60A13', weight: 1.5, color: 'white', fillOpacity: 0.4 }}
              onEachFeature={(feature, layer) => {
                const provName = getProvinceName(feature.properties);
                const nodeCount = provStats[provName] || 0; // Ambil jumlah node dari state

                layer.on({
                  mouseover: (e) => { e.target.setStyle({ fillOpacity: 0.7, weight: 2.5 }); },
                  mouseout: (e) => { e.target.setStyle({ fillOpacity: 0.4, weight: 1.5 }); },
                  click: () => {
                    if (provName) navigate(`/detail/ADC/${provName}`);
                  }
                });

                if (provName) {
                  layer.bindTooltip(`
                    <div class="p-2 font-black uppercase text-[10px]">
                      <div class="text-red-600 border-b mb-1 pb-1">${provName}</div>
                      <div class="text-slate-800 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                        ${nodeCount} NODES
                      </div>
                    </div>
                  `, { sticky: true, direction: 'top' });
                }
              }}
            />
          </MapContainer>
        )}
        <button 
          onClick={() => setIsBatchModalOpen(true)} 
          className="absolute bottom-6 right-6 z-[1000] flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-full text-xs font-black shadow-2xl hover:bg-black transition-all uppercase tracking-widest italic"
        >
          <FileSpreadsheet size={18} /> IMPORT NEW DATA
        </button>
      </div>

      {/* REGIONAL SUMMARY SECTION */}
      <div className="bg-white rounded-[3rem] shadow-xl p-10 border-4 border-white mb-20">
        <div className="flex items-center gap-5 mb-10 border-b border-gray-100 pb-8">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl"><LayoutGrid size={32} /></div>
          <div>
            <h3 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter leading-none">Regional Summary</h3>
            <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-2">ADC Infrastructure Distribution</p>
          </div>
          <div className="ml-auto bg-red-50 px-8 py-4 rounded-3xl border border-red-100 flex items-center gap-4">
            <span className="text-[11px] font-black text-red-400 uppercase tracking-widest">Total National</span>
            <span className="text-4xl font-black text-red-600 italic tracking-tighter leading-none">{sites.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {getRegionalSummary().map(([name, count]) => (
            <div key={name} className="bg-gray-50/50 p-6 rounded-[2.5rem] border-2 border-transparent hover:border-red-500 hover:bg-white transition-all group flex justify-between items-center shadow-sm">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-red-500">{name}</p>
                <p className="text-3xl font-black text-slate-800 italic tracking-tighter group-hover:text-red-600">
                  {count} <span className="text-xs not-italic text-gray-400 uppercase">Node</span>
                </p>
              </div>
              <Database size={24} className="text-gray-200 group-hover:text-red-100 transition-colors" />
            </div>
          ))}
        </div>
      </div>
      <BatchImportModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} currentElement="ADC" onRefresh={fetchData} />
    </div>
  );
};

export default AdcMap;