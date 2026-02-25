import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';
import BatchImportModal from '../../components/BatchImportModal';

// --- HELPER PEMBERSIH ANGKA ---
const cleanNum = (v) => {
  if (v === undefined || v === null || v === "" || v === "-") return 0;
  let s = String(v).trim().replace(/[^0-9,.]/g, '');
  if (s.includes(',') && s.includes('.')) return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  if (s.includes(',')) return parseFloat(s.replace(',', '.')) || 0;
  return parseFloat(s) || 0;
};

const UscMap = () => {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  useEffect(() => {
    fetch('/indonesia-38.json').then(res => res.json()).then(data => setGeoData(data));
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Pastikan backend mengenali route ini
      const res = await axios.get(`http://localhost:5001/api/sites/USC-STP`);
      const data = Array.isArray(res.data) ? res.data : [];
      setSites(data);
    } catch (err) { 
      console.error("Gagal ambil data USC", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const getGeoName = (properties) => {
    const keys = ['NAME_1', 'name', 'PROVINSI'];
    let found = keys.find(k => properties[k] && typeof properties[k] === 'string');
    return found ? properties[found].toUpperCase().trim() : "";
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
      <main className="flex-1 flex flex-col p-6 overflow-hidden">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 px-2 py-1 font-black text-red-600 uppercase tracking-widest text-lg hover:translate-x-[-5px] transition-all"
          >
            <ArrowLeft size={28} strokeWidth={3} /> BACK
          </button>
          
          <div className="text-right">
            <h2 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
              USC <span className="text-red-600">STP/SPS</span>
            </h2>
            <p className="text-[10px] text-gray-400 font-black uppercase mt-1 tracking-widest leading-none">
              TOTAL NATIONAL: {sites.length} UNITS
            </p>
          </div>
        </div>

        {/* STATIC MAP BOX */}
        <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border-[15px] border-white overflow-hidden relative">
          {!loading && geoData && (
            <MapContainer 
              center={[-2.5, 118]} zoom={5} 
              dragging={false} scrollWheelZoom={false} zoomControl={false}
              style={{ height: '100%', width: '100%', position: 'absolute' }}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <GeoJSON 
                key={`usc-geojson-${sites.length}`} 
                data={geoData} 
                style={(f) => {
                  const geoName = getGeoName(f.properties);
                  const hasData = sites.some(s => (s.region || "").toUpperCase().trim() === geoName);
                  // Merah Huawei jika ada data
                  return { 
                    fillColor: hasData ? "#b91c1c" : "#f1f5f9", 
                    weight: 1.5, 
                    color: 'white', 
                    fillOpacity: hasData ? 0.9 : 0.4 
                  };
                }}
                onEachFeature={(f, layer) => {
                  const geoName = getGeoName(f.properties);
                  const provSites = sites.filter(s => (s.region || "").toUpperCase().trim() === geoName);

                  if (geoName) {
                    layer.on({ click: () => navigate(`/detail/USC-STP/${geoName}`) });
                    
                    if (provSites.length > 0) {
                      // Judul khusus alias
                      let displayHeader = geoName;
                      if (geoName.includes("JAKARTA") || geoName.includes("BANTEN")) displayHeader = "JABOTABEK";

                      layer.bindTooltip(`
                        <div class="pop-wrapper">
                          <div class="pop-title-header">${displayHeader}</div>
                          <div class="pop-logo-section">
                            <img src="/logo-huawei.png" alt="Huawei" />
                          </div>
                          <table class="pop-table">
                            ${provSites.map((site, i) => `
                              <tr style="background: ${i % 2 === 0 ? '#fff' : '#fafafa'};">
                                <td class="td-name">${site.name || '-'}</td>
                                <td class="td-cap">${site.cap_stp || '-'}<br/><small>MSU/s</small></td>
                                <td class="td-type">${site.platform || '-'}</td>
                              </tr>
                            `).join('')}
                          </table>
                        </div>
                      `, { sticky: true, direction: 'top', className: 'usc-tooltip-frame' });
                    }
                  }
                }}
              />
            </MapContainer>
          )}

          <button 
            onClick={() => setIsBatchModalOpen(true)}
            className="absolute bottom-10 right-10 z-[1000] flex items-center gap-3 px-10 py-5 bg-red-600 text-white rounded-full text-sm font-black shadow-2xl hover:bg-black transition-all uppercase tracking-widest italic"
          >
            <FileSpreadsheet size={20} /> IMPORT DATA
          </button>
        </div>
      </main>

      <BatchImportModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} currentElement="USC-STP" onRefresh={fetchData} />

      {/* --- STYLE CUSTOM: POPUP TABEL (TIDAK BERUBAH) --- */}
      <style>{`
        .usc-tooltip-frame {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          opacity: 1 !important;
        }
        .pop-wrapper {
          background: white; border: 2px solid #b91c1c; border-radius: 8px; overflow: hidden;
          min-width: 260px; box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        }
        .pop-title-header {
          background: #b91c1c; color: white !important; padding: 6px; text-align: center;
          font-weight: 900; font-size: 12px; text-transform: uppercase;
        }
        .pop-logo-section { padding: 8px; display: flex; justify-content: center; border-bottom: 1px solid #f1f1f1; }
        .pop-logo-section img { height: 22px; object-fit: contain; }
        .pop-table { width: 100%; border-collapse: collapse; }
        .pop-table td { padding: 8px; border-bottom: 1px solid #f1f1f1; vertical-align: middle; text-align: center; font-family: sans-serif; }
        .td-name { font-weight: 900; font-size: 10px; color: #1e293b; text-transform: uppercase; }
        .td-cap { font-weight: 900; font-size: 10px; color: #E60A13; }
        .td-cap small { font-size: 6px; color: #94a3b8; font-weight: 700; }
        .td-type { font-weight: 900; font-size: 8px; color: #16a34a; }
        
        .usc-tooltip-frame::before { display: none !important; }
      `}</style>
    </div>
  );
};

export default UscMap;