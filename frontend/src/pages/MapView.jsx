import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, FileSpreadsheet, MapPin, Loader2, Activity, Database, Zap, Battery } from 'lucide-react';
import axios from 'axios'; 
import BatchImportModal from '../components/BatchImportModal';

const MapView = () => {
  const params = useParams();
  const navigate = useNavigate();

  // Mengembalikan USC-STP menjadi USC/STP agar cocok dengan model database/config
  const element = params.element ? params.element.replace('-', '/') : "";
  const { region } = params;
  
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [mssSummary, setMssSummary] = useState(null);
  const [summary, setSummary] = useState(null);

  const indonesiaBounds = [[-11.0, 94.0], [6.0, 141.0]];

  const normalizeProvinceName = (rawName) => {
    if (!rawName || typeof rawName !== 'string') return "UNKNOWN";
    const name = rawName.toUpperCase().trim();
    const renameMap = {
      "NANGGROE ACEH DARUSSALAM": "ACEH", "DI. ACEH": "ACEH",
      "IRIAN JAYA": "PAPUA", "IRIAN JAYA BARAT": "PAPUA BARAT", "IRIAN JAYA TENGAH": "PAPUA TENGAH",
      "DKI JAKARTA": "DKI JAKARTA", "JAKARTA": "DKI JAKARTA",
      "YOGYAKARTA": "DAERAH ISTIMEWA YOGYAKARTA", "D.I. YOGYAKARTA": "DAERAH ISTIMEWA YOGYAKARTA",
      "WEST PAPUA": "PAPUA BARAT", "CENTRAL PAPUA": "PAPUA TENGAH", "SOUTH PAPUA": "PAPUA SELATAN",
      "HIGHLAND PAPUA": "PAPUA PEGUNUNGAN", "SOUTHWEST PAPUA": "PAPUA BARAT DAYA",
      "CENTRAL SULAWESI": "SULAWESI TENGAH", "NORTH SULAWESI": "SULAWESI UTARA",
      "SOUTH SULAWESI": "SULAWESI SELATAN", "SOUTHEAST SULAWESI": "SULAWESI TENGGARA",
      "WEST SULAWESI": "SULAWESI BARAT", "WEST KALIMANTAN": "KALIMANTAN BARAT",
      "EAST KALIMANTAN": "KALIMANTAN TIMUR", "SOUTH KALIMANTAN": "KALIMANTAN SELATAN",
      "CENTRAL KALIMANTAN": "KALIMANTAN TENGAH", "NORTH KALIMANTAN": "KALIMANTAN UTARA",
      "NORTH SUMATRA": "SUMATERA UTARA", "SOUTH SUMATRA": "SUMATERA SELATAN", "WEST SUMATRA": "SUMATERA BARAT",
    };
    return renameMap[name] || name;
  };

  useEffect(() => {
    setLoading(true);
    fetch('/indonesia-38.json') 
      .then(res => res.json())
      .then(data => { setGeoData(data); setLoading(false); })
      .catch(err => setLoading(false));
  }, []);

  useEffect(() => {
  const fetchSummary = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/summary/${element.replace('/', '-')}`);
      setSummary(res.data);
    } catch (err) {
      console.error("Gagal load summary:", err);
    }
  };
  
  if (element) fetchSummary();
}, [element]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">

      <main className="flex-1 flex flex-col p-3 md:p-6 overflow-hidden">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div className="flex items-center gap-5 md:gap-8">
            
            {/* TOMBOL BACK - DIPERBESAR SESUAI DETAIL TABLE */}
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 font-black text-red-600 uppercase tracking-widest text-base hover:translate-x-[-5px] transition-all whitespace-nowrap"
            >
              <ArrowLeft size={24} /> Back
            </button>

            {/* TOMBOL IMPORT - LONJONG, SATU BARIS, DI SAMPING BACK */}
            <button 
              onClick={() => setIsBatchModalOpen(true)}
              className="flex items-center gap-3 px-6 py-2.5 bg-red-600 text-white rounded-full text-[11px] font-black shadow-xl shadow-red-100 hover:bg-slate-900 transition-all uppercase tracking-widest whitespace-nowrap"
            >
              <FileSpreadsheet size={18} className="text-white" />
              <span>Import New Data</span>
            </button>
          </div>
          
          <div className="text-left md:text-right w-full">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-red-600 uppercase italic tracking-tighter leading-none">
              {element} <span className="text-gray-200">/</span> DISTRIBUTION
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-[0.3em]">
              National Network Architecture Monitoring
            </p>
          </div>
        </div>

        {/* CONTAINER MAP - FIT TO SCREEN */}
        <div className="flex-1 bg-white rounded-2xl md:rounded-[3rem] shadow-2xl border-4 md:border-[10px] border-white overflow-hidden relative flex items-center justify-center min-h-0">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="animate-spin text-red-600" size={48} />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Initialising National Data...</p>
            </div>
          )}

          {!loading && geoData && (
            <MapContainer 
              center={[-2.5, 118]} zoom={5} minZoom={5} maxZoom={8}
              maxBounds={indonesiaBounds} maxBoundsViscosity={1.0}
              style={{ height: '100%', width: '100%', position: 'absolute' }}
              zoomControl={window.innerWidth > 768}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <GeoJSON 
                data={geoData} 
                style={{ fillColor: '#E60A13', weight: 1.2, color: 'white', fillOpacity: 0.5 }}
                onEachFeature={(feature, layer) => {
                  const props = feature.properties;
                  const possibleKeys = ['NAME_1', 'name', 'Propinsi', 'Provinsi', 'PROVINSI', 'NAME_PROV'];
                  let foundKey = possibleKeys.find(key => props[key] && typeof props[key] === 'string' && isNaN(props[key]));
                  const rawName = foundKey ? props[foundKey] : "UNKNOWN";
                  const provinceName = normalizeProvinceName(rawName);

                  layer.on({
                    mouseover: (e) => { e.target.setStyle({ fillOpacity: 0.8, weight: 2 }); },
                    mouseout: (e) => { e.target.setStyle({ fillOpacity: 0.5, weight: 1.2 }); },
                    click: () => { 
                      const safeName = element.replace('/', '-');
                      navigate(`/detail/${safeName}/${provinceName}`); }
                  });

                  layer.bindTooltip(
                    `<div class="font-black text-red-600 uppercase text-[10px] tracking-widest">${provinceName}</div>`, 
                    { sticky: true, direction: 'top' }
                  );
                }}
              />
            </MapContainer>
          )}

          {/* --- TAMBAHAN UNTUK MSS: 3. UI Panel Summary di atas Peta (Kanan Atas) --- */}
          {element === 'MSS' && mssSummary && (
            <div className="absolute top-6 right-6 z-[1000] bg-white/90 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl border-4 border-white min-w-[320px] animate-in fade-in slide-in-from-right duration-500">
              <div className="flex items-center gap-3 mb-5 border-b pb-3">
                 <div className="p-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-200">
                    <Activity size={20} />
                 </div>
                 <h3 className="text-gray-900 font-black italic uppercase tracking-tighter text-lg leading-none">
                   Nationwide MSS Summary
                 </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Subscriber Capacity</span>
                  <span className="text-sm font-black text-gray-900">{mssSummary.totalSubscriberCapacity?.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Subscriber Usage</span>
                  <span className="text-sm font-black text-red-600">{mssSummary.totalSubscriberUsage?.toLocaleString('id-ID')}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                   <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                      <p className="text-[8px] font-black text-blue-400 uppercase mb-1">Avg Occ (%)</p>
                      <p className="text-lg font-black text-blue-700 italic">{mssSummary.averageOccupancy}%</p>
                   </div>
                   <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100">
                      <p className="text-[8px] font-black text-orange-400 uppercase mb-1">Avg CPU (%)</p>
                      <p className="text-lg font-black text-orange-700 italic">{mssSummary.averageCpuLoad}%</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Overlay Info Analytics */}
          <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-5 rounded-[2rem] shadow-2xl border border-gray-100 max-w-[240px] hidden lg:block">
             <div className="flex items-center gap-3 mb-3 text-left">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl animate-pulse">
                  <MapPin size={18} fill="currentColor" fillOpacity={0.2}/>
                </div>
                <p className="font-black text-gray-800 text-[11px] uppercase tracking-widest">Real-time Analytics</p>
             </div>
             <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight text-left">
               Mendukung format 38 Provinsi terbaru. Klik wilayah pada peta untuk meninjau detail teknis infrastruktur.
             </p>
          </div>
        </div>
      </main>

      <BatchImportModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} currentElement={element} />
    </div>
  );
};

export default MapView;