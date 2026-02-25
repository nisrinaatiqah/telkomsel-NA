import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Database, Download, Zap, AlertTriangle, Battery, Info 
} from 'lucide-react';

const DetailTable = ({ isRegional = false }) => { 
  const params = useParams();
  const navigate = useNavigate();

  // --- PERBAIKAN 1: NORMALISASI NAMA ELEMENT ---
  const rawElement = params.element || ""; 
  // Ganti tanda strip (-) jadi spasi ( ) agar "DNS-Gn" jadi "DNS Gn" dan cocok dengan ColumnConfig
  let elementClean = rawElement.replace(/-/g, ' '); 

  // Koreksi khusus untuk USC agar pas dengan kunci USC/STP
  if (elementClean.toUpperCase().includes('USC')) {
    elementClean = 'USC/STP';
  }

  const element = elementClean; 
  // Penentuan Judul Lokasi (Provinsi atau Nama Regional)
  const locationTitle = isRegional ? params.regionalName : params.region;

  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    // Gunakan elementClean (misal: "DNS Gn") untuk memanggil API
    const apiUrl = isRegional 
      ? `http://localhost:5001/api/sites/regional/${encodeURIComponent(element)}/${encodeURIComponent(locationTitle)}`
      : `http://localhost:5001/api/sites/${encodeURIComponent(element)}/${encodeURIComponent(locationTitle)}`;
    
    axios.get(apiUrl)
      .then(res => {
        setSites(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal ambil data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
     if (element && locationTitle) {
      fetchData();
     }
  }, [element, locationTitle]);

  // --- LOGIKA RECAP ---
  const getNameGroups = () => {
    if (!sites || sites.length === 0) return [];
    const groups = {};
    const categoryLabels = {
      'BRN': 'BUARAN', 'TMK': 'TIMIKA', 'BJB': 'BANJAR BARU',
      'KNG': 'KENANGA', 'DPS': 'DENPASAR', 'DGO': 'DAGO',
      'SUD': 'SUDIANG', 'SOE': 'SOETTA', 'PKB': 'PEKANBARU'
    };
    sites.forEach(s => {
      const nameUpper = String(s.name || '').toUpperCase();
      const foundKey = Object.keys(categoryLabels).find(key => nameUpper.includes(key));
      const label = foundKey ? categoryLabels[foundKey] : 'LAINNYA';
      groups[label] = (groups[label] || 0) + 1;
    });
    return Object.entries(groups).sort((a, b) => b[1] - a[1]);
  };

  const onAirCount = sites.filter(s => 
    String(s.status || '').toUpperCase().includes('ON AIR') || 
    String(s.status || '').toUpperCase() === 'ACTIVE'
  ).length;

  const maintenanceCount = sites.filter(s => 
    String(s.status || '').toUpperCase().includes('MAINT')
  ).length;

  // --- KONFIGURASI KOLOM ---
  const columnConfig = {
    'DNS Gn': [
      { label: 'City', key: 'city' }, 
      { label: 'NE Name', key: 'name' }, 
      { label: 'NE ID / Hostname', key: 'siteIdCode' },
      { label: 'Dept', key: 'department' },
      { label: 'Func', key: 'ne_func' },
      { label: 'Type', key: 'ne_type' },
      { label: 'Vendor', key: 'vendor' },
      { label: 'HW Ver.', key: 'hw_ver' },
      { label: 'HW Supp', key: 'hw_support' },
      { label: 'SW Ver.', key: 'sw_ver' },
      { label: 'SW Supp', key: 'sw_support' },
      { label: 'Cap 1', key: 'cap_1' },
      { label: 'Cap 1 Unit', key: 'cap_1_unit' },
      { label: 'Cap 2', key: 'cap_2' },
      { label: 'Cap 2 Unit', key: 'cap_2_unit' },
      { label: 'Domain', key: 'domain' },
      { label: 'On Air Date', key: 'on_air_date' },
      { label: 'Status', key: 'status' },
      { label: 'Site Location', key: 'site_location' },
      { label: 'Loc Type', key: 'loc_type' },
      { label: 'Address', key: 'loc_address' },
    ],
    'DNS Gi': [
      { label: 'Name', key: 'name' },
      { label: 'Existing HW Type', key: 'hw_type' },
      { label: 'Storage', key: 'storage' },
      { label: 'Existing SW version VNF', key: 'sw_vnf' },
      { label: 'Existing SW version VIM', key: 'sw_vim' },
      { label: 'Capacity - Existing(K QpS)', key: 'capacity_kqps' },
      { label: 'HW EOM', key: 'hw_eom' },
      { label: 'HW EOS', key: 'hw_eos' },
    ],
    'ADC': [
      { label: 'Node Name', key: 'name' },
      { label: 'Region', key: 'region' },
      { label: 'VLAN', key: 'vlan' },
      { label: 'VRF SDN', key: 'vrf_sdn' },
    ],
    'USC/STP': [
      { label: 'Product', key: 'product' },
      { label: 'Name', key: 'name' },
      { label: 'Capacity STP (MSU/s)', key: 'cap_stp' },
      { label: 'Capacity DRA TPS', key: 'cap_dra' },
      { label: 'Platform', key: 'platform' },
      { label: 'Region Pool', key: 'region_pool' },
      { label: 'Existing SW Version', key: 'sw_version' },
      { label: 'SW EOM', key: 'sw_eom' },
      { label: 'SW EOFS', key: 'sw_eofs' },
      { label: 'SW EOS', key: 'sw_eos' },
      { label: 'HW EOM', key: 'hw_eom' },
      { label: 'HW EOS', key: 'hw_eos' },
      { label: 'TTC', key: 'ttc' },
      { label: 'Next Roadmap', key: 'next_roadmap' },
      { label: 'TSA', key: 'tsa' },
      { label: 'Next Plan', key: 'next_plan' },
    ],
    'UDM/HSS': [
        { label: 'City', key: 'city' },
        { label: 'Name', key: 'name' },
        { label: 'Platform', key: 'platform' },
        { label: 'Region Pool', key: 'region_pool' },
        { label: 'Existing SW version', key: 'sw_version' },
        { label: 'SW EOM', key: 'sw_eom' },
        { label: 'HW EOS', key: 'hw_eos' },
        { label: 'TTC', key: 'ttc' },
      ],
    'MSS': [
      { label: 'REGIONAL', key: 'regional_internal' }, 
      { label: 'MSS ELEMENT', key: 'name' },          
      { label: 'VENDOR', key: 'vendor' },
      { label: 'SUB CAPACITY', key: 'sub_capacity' },
      { label: 'SUB USAGE', key: 'sub_usage' },
      { label: 'OCC (%)', key: 'sub_occupancy' },
      { label: 'CPU LOAD (%)', key: 'cpu_load' },
      { label: 'VLR CATEGORY', key: 'vlr_category' },
    ],
    'MGW': [
        { label: 'REGIONAL', key: 'regional_internal' },
        { label: 'MGW ELEMENT', key: 'name' },
        { label: 'VENDOR', key: 'vendor' },
        { label: 'SCC UTIL (%)', key: 'scc_util' },
    ],
    'TMGW': [
        { label: 'REGIONAL', key: 'regional_internal' },
        { label: 'TMGW ELEMENT', key: 'name' },
        { label: 'VENDOR', key: 'vendor' },
        { label: 'SCC UTIL (%)', key: 'scc_util' },
    ],
    'GSS': [
        { label: 'REGIONAL', key: 'regional_internal' },
        { label: 'GSS ELEMENT', key: 'name' },
        { label: 'BHCA OCC (%)', key: 'bhca_occupancy' },
    ],
    'IMS': [
      { label: 'Product', key: 'product' },
      { label: 'Name', key: 'name' },
      { label: 'Capacity', key: 'capacity' },
      { label: 'Platform', key: 'platform' },
      { label: 'SW EOM', key: 'sw_eom' },
      { label: 'SW EOS', key: 'sw_eos' },
      { label: 'TTC', key: 'ttc' },
    ],
  };

  const currentCols = columnConfig[element] || [{ label: 'Region', key: 'region' }, { label: 'Name', key: 'name' }];

  // --- PERBAIKAN 2: FUNGSI EXPORT (Ganti region -> locationTitle) ---
  const handleExportCSV = () => {
    if (sites.length === 0) return alert("Tidak ada data untuk di-export");
    const headers = ["No", ...currentCols.map(col => col.label)].join(",");
    const csvRows = sites.map((site, index) => {
      const rowData = [
        index + 1,
        ...currentCols.map(col => {
          let val = site[col.key] || '-';
          if (typeof val === 'number') val = val.toLocaleString('id-ID'); 
          return `"${val}"`;
        })
      ];
      return rowData.join(",");
    });
    const csvContent = [headers, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // Pakai locationTitle yang sudah pasti didefinisikan
    link.download = `Export_${element}_${locationTitle}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <div className="max-w-[98%] mx-auto p-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 font-black text-red-600 uppercase tracking-widest text-sm hover:translate-x-[-5px] transition-all">
          <ArrowLeft size={20} /> Back to Map
        </button>
        
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">{element}</h1>
            <h2 className="text-3xl font-black text-red-600 uppercase tracking-tighter mt-2 leading-none">{locationTitle}</h2>
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl text-xs font-black shadow-sm uppercase hover:bg-gray-50 text-gray-700">
            <Download size={16}/> Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {element === 'DNS Gi' ? (
            <>
              <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5">
                <div className="p-4 bg-slate-900 text-white rounded-2xl"><Database size={28}/></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Unit</p>
                  <p className="text-4xl font-black text-gray-800 italic tracking-tighter">{sites.length}</p>
                </div>
              </div>
              {getNameGroups().slice(0, 3).map(([catName, count], i) => (
                <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5">
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><Info size={28}/></div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">{catName}</p>
                    <p className="text-4xl font-black text-red-600 italic tracking-tighter">{count}</p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
                <div className="p-4 bg-green-100 text-green-600 rounded-2xl"><Zap size={28} fill="currentColor" /></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">On Air</p>
                  <p className="text-4xl font-black text-gray-800 italic leading-none tracking-tighter">{onAirCount}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
                <div className="p-4 bg-yellow-100 text-yellow-600 rounded-2xl"><AlertTriangle size={28}/></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Maintenance</p>
                  <p className="text-4xl font-black text-gray-800 italic leading-none tracking-tighter">{maintenanceCount}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Battery size={28}/></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Health Score</p>
                  <p className="text-4xl font-black text-gray-800 italic leading-none tracking-tighter">Normal</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white flex items-center gap-5 transition-transform hover:scale-105">
                <div className="p-4 bg-slate-900 text-white rounded-2xl"><Database size={28}/></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Records</p>
                  <p className="text-4xl font-black text-gray-800 italic leading-none tracking-tighter">{sites.length}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1600px]">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-6 py-6 text-center w-20 border-r border-slate-700 font-black text-[10px] uppercase">No</th>
                  {currentCols.map(col => (
                    <th key={col.key} className="px-6 py-6 border-r border-slate-700 font-black text-[10px] uppercase">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-bold text-[12px] text-gray-700">
                {loading ? (
                  <tr><td colSpan="40" className="p-24 text-center animate-pulse text-gray-300 text-xl font-black">FETCHING SYSTEM DATA...</td></tr>
                ) : sites.length > 0 ? (
                  sites.map((site, index) => (
                    <tr key={index} className="hover:bg-blue-50/50 group transition-all">
                      <td className="px-6 py-6 text-center border-r border-gray-100 text-gray-400 font-medium bg-gray-50/50">{index + 1}</td>
                      {currentCols.map(col => {
                        let val = site[col.key] || '-';
                        if (col.key === 'status') {
                            const statusUpper = String(val).toUpperCase();
                            const isActive = statusUpper.includes('ON AIR') || statusUpper === 'ACTIVE';
                            return (
                              <td key={col.key} className="px-6 py-6 border-r border-gray-50 last:border-0">
                                <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase ${isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                                  {val}
                                </span>
                              </td>
                            );
                        }
                        return (
                          <td key={col.key} className="px-6 py-6 border-r border-gray-50 group-hover:text-red-600 transition-all">{val}</td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="40" className="p-32 text-center text-gray-200 font-black text-2xl uppercase tracking-widest italic opacity-20">NO RECORDS DETECTED</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailTable;