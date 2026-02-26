import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ArrowLeft, FileSpreadsheet, LayoutGrid, Users, 
  Zap, Database, HardDrive 
} from 'lucide-react';
import axios from 'axios'; 
import BatchImportModal from '../../components/BatchImportModal';

const cleanNum = (v) => {
  if (v === undefined || v === null || v === "" || v === "-") return 0;
  let s = String(v).trim().replace('%', '');
  if (s.includes(',') && s.includes('.')) return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  if (s.includes(',')) return parseFloat(s.replace(',', '.')) || 0;
  let num = parseFloat(s) || 0;
  if (num > 0 && num < 1) num = num * 100;
  return num;
};

const SgsnMap = ({ element = "SGSN-MME" }) => {
  const navigate = useNavigate();
  const [geoData, setGeoData] = useState(null);
  const [sites, setSites] = useState([]);
  const [statsByRegion, setStatsByRegion] = useState({});
  const [statsByRegional, setStatsByRegional] = useState({});
  const [viewMode, setViewMode] = useState('occupancy'); 
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
    "Regional Papua & Maluku": ["MALUKU", "MALUKU UTARA", "PAPUA", "PAPUA BARAT", "PAPUA TENGAH", "PAPUA SELATAN", "PAPUA PEGUNUNGAN", "PAPUA BARAT DAYA", "PUMA", "USO"]
  };

  useEffect(() => {
    fetch('/indonesia-38.json').then(res => res.json()).then(data => setGeoData(data));
    fetchData();
  }, [element]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/sites/${element}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setSites(data);
      
      const pStats = {};
      const rStats = {};

      Object.keys(regionalMapping).forEach(reg => {
        rStats[reg] = { count: 0, totalOcc: 0, totalUsage: 0, totalCap: 0 };
      });

      data.forEach(site => {
        const prov = (site.region || site.regional_internal || "UNKNOWN").toUpperCase().trim();
        const occ = cleanNum(site.sub_occupancy);
        const usage = cleanNum(site.sub_usage);
        const cap = cleanNum(site.sub_capacity);
        const vendorRaw = String(site.vendor || "").toUpperCase();

        if (!pStats[prov]) pStats[prov] = { count: 0, totalOcc: 0, totalUsage: 0, totalCap: 0, ericsson: 0, nokia: 0, huawei: 0, zte: 0 };
        pStats[prov].count += 1;
        pStats[prov].totalOcc += occ;
        pStats[prov].totalUsage += usage;
        pStats[prov].totalCap += cap;
        if (vendorRaw.includes("ERICSSON") || vendorRaw.includes("EID")) pStats[prov].ericsson += 1;
        else if (vendorRaw.includes("NOKIA")) pStats[prov].nokia += 1;
        else if (vendorRaw.includes("HUAWEI")) pStats[prov].huawei += 1;
        else if (vendorRaw.includes("ZTE")) pStats[prov].zte += 1; 

        const targetReg = Object.keys(regionalMapping).find(reg => regionalMapping[reg].includes(prov));
        if (targetReg) {
          rStats[targetReg].count += 1;
          rStats[targetReg].totalOcc += occ;
          rStats[targetReg].totalUsage += usage;
          rStats[targetReg].totalCap += cap;
        }
      });

      Object.keys(pStats).forEach(k => {
        const v = pStats[k];
        v.avgOcc = (v.totalOcc / v.count).toFixed(2);
        const max = Math.max(v.ericsson, v.nokia, v.huawei, v.zte);
        if (v.ericsson === max) pStats[k].dominantLogo = "/logo-ericsson.png";
        else if (v.nokia === max) pStats[k].dominantLogo = "/logo-nokia.png";
        else if (v.huawei === max) pStats[k].dominantLogo = "/logo-huawei.png";
        else if (v.zte === max) pStats[k].dominantLogo = "/logo-zte.png";
      });

      Object.keys(rStats).forEach(k => {
        if(rStats[k].count > 0) rStats[k].avgOcc = (rStats[k].totalOcc / rStats[k].count).toFixed(2);
        else rStats[k].avgOcc = "0.00";
      });

      setStatsByRegion(pStats);
      setStatsByRegional(rStats);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const getStyle = (f) => {
    const name = (f.properties.NAME_1 || f.properties.name || f.properties.PROVINSI || "").toUpperCase().trim();
    const data = statsByRegion[name];
    let color = "#f1f5f9"; 

    if (data && data.count > 0) {
      if (viewMode === 'occupancy') {
        const occ = parseFloat(data.avgOcc);
        color = occ >= 80 ? "#ef4444" : occ >= 70 ? "#ff7f00" : "#eab308";
      } else if (viewMode === 'vendor') {
        // PERBAIKAN: Menambahkan logic warna untuk ZTE & HUAWEI
        if (data.dominantLogo?.includes("ericsson")) color = "#2563eb";
        else if (data.dominantLogo?.includes("nokia")) color = "#10b981";
        else if (data.dominantLogo?.includes("huawei")) color = "#ea580c";
        else if (data.dominantLogo?.includes("zte")) color = "#00a1e4"; // Biru Muda ZTE
      } else if (viewMode === 'capacity') color = "#6366f1";
      else color = "#8b5cf6";
    }
    return { fillColor: color, weight: 1.2, color: 'white', fillOpacity: 0.75 };
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6 overflow-x-hidden">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 font-black text-red-600 uppercase tracking-widest text-lg hover:translate-x-[-5px] transition-all">
          <ArrowLeft size={28} strokeWidth={3} /> BACK
        </button>

        <div className="bg-white p-1.5 rounded-full shadow-2xl border flex gap-1">
          {[
            { id: 'occupancy', label: 'OCCUPANCY', icon: <Zap size={16}/>, color: 'bg-red-600' },
            { id: 'capacity', label: 'CAPACITY', icon: <Database size={16}/>, color: 'bg-indigo-600' },
            { id: 'usage', label: 'USAGE', icon: <HardDrive size={16}/>, color: 'bg-purple-600' },
            { id: 'vendor', label: 'VENDOR', icon: <Users size={16}/>, color: 'bg-slate-900' },
          ].map(m => (
            <button key={m.id} onClick={() => setViewMode(m.id)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-2 ${viewMode === m.id ? `${m.color} text-white shadow-lg` : 'text-gray-400 hover:text-gray-600'}`}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>


        <div className="text-right font-black italic tracking-tighter uppercase">
          <h2 className="text-4xl text-gray-900 leading-none">{element.replace('-',' ')} <span className="text-red-600">{viewMode}</span></h2>
          <button 
            onClick={() => setIsBatchModalOpen(true)} 
            className="mt-3 flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-full text-[9px] font-black shadow-lg hover:bg-black transition-all uppercase tracking-widest italic ml-auto"
          >
            <FileSpreadsheet size={20} /> IMPORT DATA
          </button>
        </div>
      </div>

      <div className="w-full h-[73vh] bg-white rounded-[3rem] shadow-2xl border-[12px] border-white overflow-hidden relative mb-12">
        {!loading && geoData && (
          <MapContainer center={[-2.5, 118]} zoom={5} zoomControl={false} dragging={true} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <GeoJSON 
              key={`${viewMode}-${sites.length}`} 
              data={geoData} 
              style={getStyle}
              onEachFeature={(f, layer) => {
                const provName = (f.properties.NAME_1 || f.properties.name || f.properties.PROVINSI || "").toUpperCase().trim();
                const d = statsByRegion[provName];
                
                layer.on({
                    click: () => navigate(`/detail/${element}/${provName}`),
                    mouseover: (e) => e.target.setStyle({ fillOpacity: 0.95, weight: 2 }),
                    mouseout: (e) => e.target.setStyle({ fillOpacity: 0.75, weight: 1.2 })
                });

                if (d) {
                    let tt = "";
                    if(viewMode === 'vendor') {
                      // UPDATE: Menambahkan CAPACITY ke tooltip vendor dan memoles tampilannya
                      tt = `
                        <div class="p-4 text-center min-w-[150px]">
                          <img src="${d.dominantLogo}" class="h-8 mx-auto mb-2 object-contain" />
                          <div class="font-black border-t pt-2 mt-1 text-[10px] uppercase text-slate-800">${provName}</div>
                          <div class="mt-2 space-y-0.5">
                            <div class="text-[8px] text-gray-600 font-black">CAPACITY: ${d.totalCap.toLocaleString('id-ID')}</div>
                            <div class="text-[8px] text-gray-600 font-black">USAGE: ${d.totalUsage.toLocaleString('id-ID')}</div>
                            <div class="text-[8px] text-gray-600 font-black border-t mt-2 pt-1.5 uppercase italic tracking-tighter">OCCUPANCY: ${d.avgOcc}%</div>
                          </div>
                        </div>`;
                    } else {
                      const val = viewMode === 'occupancy' ? `${d.avgOcc}%` : viewMode === 'capacity' ? d.totalCap.toLocaleString('id-ID') : d.totalUsage.toLocaleString('id-ID');
                      const lbl = viewMode.toUpperCase();
                      tt = `<div class="p-3 text-center"><div class="text-[9px] text-gray-400 font-black mb-1">${provName}</div><div class="text-xl font-black italic text-red-600 leading-none">${val}</div><div class="text-[7px] text-gray-400 uppercase mt-1 font-black">${lbl}</div></div>`;
                    }
                    layer.bindTooltip(tt, { sticky: true, opacity: 1 });
                }
              }}
            />
          </MapContainer>
        )}
        {/* --- KODE LEGEND DINAMIS --- */}
<div className="absolute top-8 left-8 z-[1000] bg-white/95 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl border border-gray-100 font-black text-[10px] uppercase">
    <p className="text-gray-300 mb-4 tracking-[0.2em] text-[8px] italic font-bold">LEGEND</p>
    <div className="space-y-3 font-black italic">
        {viewMode === 'occupancy' && (
           <>
            <div className="flex items-center gap-3"><div className="w-4 h-4 bg-red-500 rounded-lg shadow-sm"></div> &gt; 80% HIGH</div>
            <div className="flex items-center gap-3"><div className="w-4 h-4 bg-orange-500 rounded-lg shadow-sm"></div> 70-80% MEDIUM</div>
            <div className="flex items-center gap-3"><div className="w-4 h-4 bg-yellow-500 rounded-lg shadow-sm"></div> &lt; 70% LOW</div>
           </>
        )}
        
        {viewMode === 'vendor' && (
            <>
            <div className="flex items-center gap-3"><div className="w-4 h-4 bg-blue-600 rounded-lg shadow-sm"></div> ERICSSON/EID</div>
            <div className="flex items-center gap-3"><div className="w-4 h-4 bg-emerald-500 rounded-lg shadow-sm"></div> NOKIA</div>
            <div className="flex items-center gap-3"><div className="w-4 h-4 bg-orange-600 rounded-lg shadow-sm"></div> HUAWEI</div>
            <div className="flex items-center gap-3"><div className="w-4 h-4 bg-cyan-500 rounded-lg shadow-sm"></div> ZTE</div>
            </>
        )}

        {viewMode === 'capacity' && (
            <div className="flex items-center gap-3"><div className="w-4 h-4 bg-indigo-600 rounded-lg shadow-sm"></div> CAPACITY DIST.</div>
        )}

        {viewMode === 'usage' && (
            <div className="flex items-center gap-3"><div className="w-4 h-4 bg-purple-600 rounded-lg shadow-sm"></div> USAGE DIST.</div>
        )}
    </div>
</div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl p-12 border-8 border-white mb-20">
            <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-slate-900 text-white rounded-3xl"><LayoutGrid size={32} /></div>
                <div>
                  <h3 className="text-3xl font-black italic text-slate-800 uppercase tracking-tighter leading-none">Regional Summary</h3>
                  <p className="text-[10px] text-gray-400 font-black mt-2 tracking-widest uppercase italic">Click cards to see regional detail</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {Object.entries(statsByRegional).map(([name, data]) => (
                <div 
                    key={name} 
                    onClick={() => navigate(`/regional/${element}/${name}`)}
                    className="bg-white p-10 rounded-[2.5rem] shadow-lg border border-slate-50 transition-all hover:scale-105 hover:border-red-500 cursor-pointer group active:scale-95"
                >
                    <h4 className="text-[10px] text-slate-800 font-black uppercase italic tracking-[0.2em] mb-8 group-hover:text-red-500 transition-colors">{name}</h4>
                    <div className="space-y-6">
                        
                        {(viewMode !== 'vendor') ? (
                          <>
                            <div className="flex justify-between items-end">
                               <span className="text-[9px] text-slate-800 font-black uppercase italic tracking-widest">NODES</span>
                               <span className="text-4xl text-slate-800 font-black italic tracking-tighter leading-none">{data.count}</span>
                            </div>
                            <div className="flex justify-between items-end border-t pt-5 border-gray-50">
                               <span className="text-[9px] text-slate-800 font-black uppercase italic tracking-widest">{viewMode === 'occupancy' ? 'AVG OCC' : viewMode === 'capacity' ? 'CAPACITY' : 'USAGE'}</span>
                               <span className="text-2xl font-black italic tracking-tighter leading-none text-red-500">
                                 {viewMode === 'occupancy' ? `${data.avgOcc}%` : viewMode === 'capacity' ? data.totalCap.toLocaleString('id-ID') : data.totalUsage.toLocaleString('id-ID')}
                               </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between items-end">
                               <span className="text-[8px] text-slate-300 font-black uppercase italic tracking-tighter">CAPACITY</span>
                               <span className="text-xl text-blue-800 font-black italic tracking-tighter leading-none">{data.totalCap.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-end border-t pt-3 border-gray-100">
                               <span className="text-[8px] text-slate-300 font-black uppercase italic tracking-tighter">USAGE</span>
                               <span className="text-xl text-purple-600 font-black italic tracking-tighter leading-none">{data.totalUsage.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-end border-t pt-3 border-gray-100">
                               <span className="text-[8px] text-slate-300 font-black uppercase italic tracking-tighter">AVG OCC</span>
                               <span className="text-xl text-red-600 font-black italic tracking-tighter leading-none">{data.avgOcc}%</span>
                            </div>
                          </>
                        )}
                    </div>
                </div>
            ))}
         </div>
      </div>
      <BatchImportModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} currentElement={element} onRefresh={fetchData} />
    </div>
  );
};

export default SgsnMap;