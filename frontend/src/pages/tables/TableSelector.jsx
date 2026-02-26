import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

// Import elemen tabel (Pastikan file-file ini ADA di folder yang sama)
import MssTable from './MssTable';
import GssTable from './GssTable';
import MgwTable from './MgwTable';
import TmgwTable from './TmgwTable';
import DnsGnTable from './DnsGnTable';
import DnsGiTable from './DnsGiTable';
import UscStpTable from './UscStpTable';
import AdcTable from './AdcTable';
import ImsTable from './ImsTable';
import UdmHssTable from './UdmHssTable';
import GgsnTable from './GgsnTable';
import SgsnTable from './SgsnTable';

const TableSelector = ({ isRegional = false }) => {
  const params = useParams();
  const navigate = useNavigate();

  // --- PERBAIKAN 1: NORMALISASI NAMA ELEMENT ---
  const rawElement = params.element ? decodeURIComponent(params.element) : "";
  
  const getNormalizedNames = (raw) => {
    const upper = raw.toUpperCase();
    
    // Khusus UDM: Pertahankan pemisah agar API backend tahu tipe spesifiknya
    if (upper.includes('UDM') && upper.includes('5G')) return { display: 'UDM 5G', api: 'UDM 5G' };
    if (upper.includes('UDM') && upper.includes('VOLTE')) return { display: 'UDM VoLTE', api: 'UDM VoLTE' };
    
    // Default UDM / HSS lama
    if (upper === 'UDM-HSS' || upper === 'UDM HSS') return { display: 'UDM/HSS', api: 'UDM/HSS' };

    // USC
    if (upper.includes('USC')) return { display: 'USC/STP', api: 'USC/STP' };
    
    // SGSN
    if (upper.includes('SGSN')) return { display: 'SGSN/MME', api: 'SGSN/MME' };
    
    // Lainnya (Ganti strip jadi spasi: DNS-Gn -> DNS Gn)
    const clean = raw.replace(/-/g, ' ');
    return { display: clean, api: clean };
  };

  const names = getNormalizedNames(rawElement);
  const finalElement = names.display; // Untuk Judul dan Switch Case
  const apiElement = names.api;     // Untuk Request ke Backend

  const locationName = isRegional ? params.regionalName : params.region;
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- PERBAIKAN 2: SINKRONISASI FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      if (!apiElement || !locationName) return;
      setLoading(true);
      
      try {
        const encodedEl = encodeURIComponent(apiElement); 
        const encodedLoc = encodeURIComponent(locationName);
        
        const apiUrl = isRegional 
          ? `http://localhost:5001/api/sites/regional/${encodedEl}/${encodedLoc}`
          : `http://localhost:5001/api/sites/${encodedEl}/${encodedLoc}`;
        
        console.log("Fetching Table Data from:", apiUrl); 
        const res = await axios.get(apiUrl);
        setSites(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Gagal load data detail:", err);
        setSites([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiElement, locationName, isRegional]);

  const renderTable = () => {
    const tableProps = { sites, loading, element: finalElement, locationName };
    
    // PERBAIKAN 3: Key pemilih case yang lebih bersih (Hapus spasi & simbol)
    const key = finalElement.toUpperCase().replace(/[^A-Z0-9]/g, '');

    switch (key) {
      case 'MSS':     return <MssTable {...tableProps} />;
      case 'GSS':     return <GssTable {...tableProps} />;
      case 'MGW':     return <MgwTable {...tableProps} />;
      case 'TMGW':    return <TmgwTable {...tableProps} />;
      case 'DNSGN':   return <DnsGnTable {...tableProps} />;
      case 'DNSGI':   return <DnsGiTable {...tableProps} />;
      case 'USCSTP':  return <UscStpTable {...tableProps} />;
      case 'ADC':     return <AdcTable {...tableProps} />;
      case 'IMS':     return <ImsTable {...tableProps} />;
      
      // Semua varian UDM diarahkan ke UdmHssTable
      case 'UDM5G': return <UdmHssTable {...tableProps} />;
      case 'UDMVOLTE': return <UdmHssTable {...tableProps} />;
      
      case 'GGSNTHP': return <GgsnTable {...tableProps} />;
      case 'GGSNPDP': return <GgsnTable {...tableProps} />;  
      case 'SGSNMME': return <SgsnTable {...tableProps} />;      
      default:        
        return (
            <div className="p-40 text-center flex flex-col items-center gap-4 opacity-20">
                <span className="text-4xl font-black italic uppercase tracking-tighter">Element {finalElement} Not Defined</span>
                <p className="font-bold text-xs uppercase tracking-widest">Please check the TableSelector component cases.</p>
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 text-left">
      <div className="max-w-[98%] mx-auto p-8">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-10 font-black text-red-600 uppercase tracking-widest text-sm hover:translate-x-[-5px] transition-all"
        >
          <ArrowLeft size={20} strokeWidth={3} /> Back to Map
        </button>

        {/* HEADER AREA */}
        <div className="mb-14">
            <h1 className="text-7xl font-black text-gray-900 tracking-tighter uppercase italic leading-none drop-shadow-sm">
              {finalElement}
            </h1>
            <h2 className="text-4xl font-black text-red-600 uppercase tracking-tighter mt-3 flex items-center gap-4 italic">
              <span className="h-1.5 w-12 bg-red-600 inline-block"></span>
              {locationName}
            </h2>
        </div>

        {renderTable()}
      </div>
    </div>
  );
};

export default TableSelector;