import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    fetch('/indonesia-38.json').then(res => res.json()).then(data => setGeoData(data));
    const safeElement = element.replace('/', '-');
    axios.get(`http://localhost:5001/api/sites/${safeElement}`)
      .then(res => setCount(res.data.length));
  }, [element]);

  // FUNGSI PINTAR: Mencari nama provinsi di berbagai kemungkinan nama kolom JSON
  const getProvinceName = (props) => {
    const keys = ['NAME_1', 'name', 'PROVINSI', 'Provinsi', 'Propinsi', 'NAME_PROV'];
    let found = keys.find(k => props[k] && typeof props[k] === 'string');
    return found ? props[found].toUpperCase().trim() : null;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
      <main className="flex-1 flex flex-col p-6 overflow-hidden">
        
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 px-2 py-1 font-black text-red-600 uppercase tracking-widest text-lg hover:translate-x-[-5px] transition-all"
          >
            <ArrowLeft size={28} strokeWidth={3} /> BACK
          </button>
          
          <div className="text-right">
            <h2 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
              {element} <span className="text-red-600">DISTRIBUTION</span>
            </h2>
            <p className="text-[11px] text-gray-400 font-black uppercase mt-2 tracking-[0.2em]">
              TOTAL NATIONAL: <span className="text-red-600">{count} UNITS</span>
            </p>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border-[12px] border-white overflow-hidden relative">
          <MapContainer 
            center={[-2.5, 118]} zoom={5} 
            dragging={false} scrollWheelZoom={false} zoomControl={false}
            doubleClickZoom={false} touchZoom={false}
            style={{ height: '100%', width: '100%', position: 'absolute' }}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            {geoData && (
              <GeoJSON 
                key={element} 
                data={geoData} 
                style={{ fillColor: '#E60A13', weight: 1.5, color: 'white', fillOpacity: 0.4 }}
                onEachFeature={(feature, layer) => {
                  const provName = getProvinceName(feature.properties);
                  
                  layer.on({
                    mouseover: (e) => { e.target.setStyle({ fillOpacity: 0.7, weight: 2.5 }); },
                    mouseout: (e) => { e.target.setStyle({ fillOpacity: 0.4, weight: 1.5 }); },
                    click: () => {
                      if (provName) {
                        const safeElement = element.replace('/', '-');
                        navigate(`/detail/${safeElement}/${provName}`);
                      }
                    }
                  });

                  if (provName) {
                    layer.bindTooltip(`<div class="font-black text-red-600 uppercase text-[10px] tracking-widest">${provName}</div>`, { sticky: true });
                  }
                }}
              />
            )}
          </MapContainer>

          <button 
            onClick={() => setIsBatchModalOpen(true)}
            className="absolute bottom-10 right-10 z-[1000] flex items-center gap-3 px-10 py-5 bg-red-600 text-white rounded-full text-sm font-black shadow-2xl hover:bg-black transition-all uppercase tracking-widest italic"
          >
            <FileSpreadsheet size={20} /> IMPORT DATA
          </button>
        </div>
      </main>
      <BatchImportModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} currentElement={element} onRefresh={() => window.location.reload()} />
    </div>
  );
};

export default StandardMap;