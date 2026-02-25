import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';
import BatchImportModal from '../../components/BatchImportModal';

const DnsGnMap = () => {
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
      // Endpoint DNS Gn
      const res = await axios.get(`http://localhost:5001/api/sites/DNS%20Gn`);
      setSites(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const getGeoName = (properties) => {
    const keys = ['NAME_1', 'name', 'PROVINSI'];
    let found = keys.find(k => properties[k] && typeof properties[k] === 'string');
    return found ? properties[found].toUpperCase().trim() : "";
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans text-left">
      <main className="flex-1 flex flex-col p-6 overflow-hidden">
        
        {/* HEADER SECTION - KONSISTEN BOLD ITALIC */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 px-2 py-1 font-black text-red-600 uppercase tracking-widest text-lg hover:translate-x-[-5px] transition-all">
            <ArrowLeft size={28} strokeWidth={3} /> BACK
          </button>
          
          <div className="text-right">
            <h2 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
              DNS GN <span className="text-red-600">DISTRIBUTION</span>
            </h2>
            <p className="text-[11px] text-gray-400 font-black uppercase mt-1 tracking-widest">
               TOTAL NODES: <span className="text-red-600 font-black">{sites.length} UNITS</span>
            </p>
          </div>
        </div>

        {/* MAP BOX - WARNA HIJAU SESUAI REFERENSI */}
        <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border-[15px] border-white overflow-hidden relative">
          {!loading && geoData && (
            <MapContainer 
              center={[-2.5, 118]} zoom={5} 
              dragging={false} scrollWheelZoom={false} zoomControl={false}
              style={{ height: '100%', width: '100%', position: 'absolute' }}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <GeoJSON 
                key={`dnsgn-final-fix-${sites.length}`} 
                data={geoData} 
                style={(f) => {
                  const geoName = getGeoName(f.properties);
                  const hasData = sites.some(s => (s.region || "").toUpperCase().trim() === geoName);
                  // Ijo Canva (#22c55e)
                  return { 
                    fillColor: hasData ? "#22c55e" : "#f1f5f9", 
                    weight: 1.2, color: 'white', 
                    fillOpacity: hasData ? 0.9 : 0.4 
                  };
                }}
                onEachFeature={(f, layer) => {
                  const geoName = getGeoName(f.properties);
                  const provSites = sites.filter(s => (s.region || "").toUpperCase().trim() === geoName);

                  if (provSites.length > 0) {
                    layer.on({ click: () => navigate(`/detail/DNS-Gn/${geoName}`) });

                    // --- LOGIKA GROUPING BERDASARKAN HW VERSION ---
                    const groupedHW = provSites.reduce((acc, site) => {
                      const hw = site.hw_ver || "UNKNOWN";
                      if (!acc[hw]) acc[hw] = { hw: hw, count: 0 };
                      acc[hw].count++;
                      return acc;
                    }, {});

                    layer.bindTooltip(`
                      <div class="dns-clean-pop">
                        <div class="dns-pop-header">${geoName}</div>
                        
                        <div class="dns-pop-body">
                          ${Object.values(groupedHW).map((data, i) => `
                            <div class="dns-pop-row" style="border-top: ${i === 0 ? 'none' : '1px solid #f1f1f1'}">
                              <div class="dns-vendor-logo">
                                <img src="/logo-infoblox.png" alt="Vendor" />
                              </div>
                              <div class="dns-hw-info">
                                <div class="hw-text-val">${data.hw}</div>
                                <div class="hw-count-badge">${data.count} <small>UNITS</small></div>
                              </div>
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    `, { sticky: true, direction: 'top', className: 'dns-leaflet-tooltip' });
                  }
                }}
              />
            </MapContainer>
          )}

          {/* TOMBOL TETAP MERAH */}
          <button 
            onClick={() => setIsBatchModalOpen(true)}
            className="absolute bottom-10 right-10 z-[1000] flex items-center gap-3 px-10 py-5 bg-red-600 text-white rounded-full text-sm font-black shadow-2xl hover:bg-black transition-all uppercase tracking-widest italic"
          >
            <FileSpreadsheet size={20} /> IMPORT DATA
          </button>
        </div>
      </main>

      <BatchImportModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} currentElement="DNS Gn" onRefresh={fetchData} />

      <style>{`
        .dns-leaflet-tooltip { 
            background: transparent !important; 
            border: none !important; 
            box-shadow: none !important; 
            padding: 0 !important; 
            opacity: 1 !important; 
            pointer-events: none !important; 
        }
        
        .dns-clean-pop {
          background: white; border: 2px solid #22c55e; border-radius: 12px; overflow: hidden;
          min-width: 240px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); font-family: sans-serif;
        }
        
        .dns-pop-header {
          background: #22c55e; color: white !important; padding: 6px; text-align: center;
          font-weight: 900; font-size: 11px; text-transform: uppercase;
        }

        .dns-pop-row { display: flex; align-items: center; background: white; }

        /* Box Logo Terang (Sesuai Permintaan) */
        .dns-vendor-logo {
          background: #fff; padding: 12px; width: 80px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-right: 1px solid #f8fafc;
        }
        .dns-vendor-logo img { width: 100%; height: auto; max-height: 25px; object-fit: contain; }

        .dns-hw-info { padding: 10px 15px; }
        .hw-label-sm { font-size: 6px; color: #94a3b8; font-weight: 900; letter-spacing: 1px; }
        .hw-text-val { font-weight: 900; color: #1e293b; font-size: 11px; margin: 1px 0; }
        .hw-count-badge { color: #E60A13; font-weight: 900; font-size: 12px; font-style: italic; }
        .hw-count-badge small { font-size: 8px; font-style: normal; opacity: 0.6; color: #64748b; margin-left: 2px; }

        .dns-leaflet-tooltip::before { display: none !important; }
      `}</style>
    </div>
  );
};

export default DnsGnMap;