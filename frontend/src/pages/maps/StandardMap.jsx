// src/pages/maps/StandardMap.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// PERBAIKAN 1: Import hanya 1 kali, tanpa typo GeoGeoJSON
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'; 
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import axios from 'axios'; 
import BatchImportModal from '../../components/BatchImportModal';

const StandardMap = ({ element }) => {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState(null);
  const [count, setCount] = useState(0);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Perhitungan Element untuk Keperluan Display & API (Spasi aman untuk DB)
  const normalizedElement = element ? decodeURIComponent(element).replace(/-/g, ' ') : "";

  useEffect(() => {
    fetch('/indonesia-38.json').then(res => res.json()).then(data => setGeoData(data));
    
    // PERBAIKAN 2: Request ke API backend menggunakan format Spasi
    if (normalizedElement) {
        axios.get(`http://localhost:5001/api/sites/${encodeURIComponent(normalizedElement)}`)
          .then(res => setCount(Array.isArray(res.data) ? res.data.length : 0))
          .catch(err => console.error("Error Load API Data:", err));
    }
  }, [normalizedElement]);

  const getGeoName = (props) => {
    const keys = ['NAME_1', 'name', 'PROVINSI'];
    let foundKey = keys.find(key => props[key] && typeof props[key] === 'string');
    return foundKey ? props[foundKey].toUpperCase().trim() : null;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans text-left">
      <main className="flex-1 flex flex-col p-6 overflow-hidden">
        
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
                {normalizedElement} <span className="text-red-600">MAP</span>
            </h2>
            <p className="text-[11px] text-gray-400 font-black uppercase mt-1">TOTAL UNITS: {count}</p>
          </div>
        </div>

        {/* STATIC MAP BOX */}
        <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border-[15px] border-white overflow-hidden relative">
          {geoData && (
            <MapContainer 
                center={[-2.5, 118]} zoom={5} dragging={false} 
                scrollWheelZoom={false} zoomControl={false} doubleClickZoom={false} 
                style={{ height: '100%', width: '100%', position: 'absolute' }}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <GeoJSON 
                key={element} // PENTING agar map ter-update warnanya
                data={geoData} 
                style={{ fillColor: '#E60A13', weight: 1.2, color: 'white', fillOpacity: 0.5 }}
                onEachFeature={(feature, layer) => {
                  const provName = getGeoName(feature.properties);

                  layer.on({
                    mouseover: (e) => { e.target.setStyle({ fillOpacity: 0.8 }); },
                    mouseout: (e) => { e.target.setStyle({ fillOpacity: 0.5 }); },
                    click: () => {
                      if (provName) {
                        // PERBAIKAN 3: Ubah elemen di URL menjadi (-) agar Router tidak mati putih
                        const safeElementUrl = normalizedElement.replace(/\//g, '-').replace(/\s+/g, '-');
                        navigate(`/detail/${safeElementUrl}/${provName}`); 
                      }
                    }
                  });

                  if (provName) {
                    layer.bindTooltip(`<div class="font-black text-red-600 uppercase text-[10px] tracking-widest">${provName}</div>`, { sticky: true, direction: 'top' });
                  }
                }}
              />
            </MapContainer>
          )}

          <button onClick={() => setIsBatchModalOpen(true)} className="absolute bottom-10 right-10 z-[1000] px-10 py-5 bg-red-600 text-white rounded-full text-sm font-black shadow-2xl hover:bg-black transition-all uppercase tracking-widest italic font-sans">IMPORT DATA</button>
        </div>
      </main>

      <BatchImportModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} currentElement={normalizedElement} />
    </div>
  );
};

export default StandardMap;