// src/pages/tables/TableSelector.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

// Import elemen tabel
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

const TableSelector = ({ isRegional = false }) => {
  const params = useParams();
  const navigate = useNavigate();

  // --- LOGIKA NORMALISASI NAMA ELEMENT (SANGAT PENTING) ---
  // Kita buat satu variabel 'finalElement' untuk digunakan di mana-mana
  let finalElement = params.element || "";
  
  if (finalElement.toUpperCase() === 'USC-STP') {
    finalElement = 'USC/STP';
  } else if (finalElement.toUpperCase() === 'UDM-HSS') {
    finalElement = 'UDM/HSS';
  } else {
    finalElement = finalElement.replace(/-/g, ' '); // Ganti strip jadi spasi (DNS-Gn jadi DNS Gn)
  }

  const locationName = isRegional ? params.regionalName : params.region;
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!finalElement || !locationName) return;
      setLoading(true);
      
      try {
        const encodedEl = encodeURIComponent(finalElement); 
        const encodedLoc = encodeURIComponent(locationName);
        
        const apiUrl = isRegional 
          ? `http://localhost:5001/api/sites/regional/${encodedEl}/${encodedLoc}`
          : `http://localhost:5001/api/sites/${encodedEl}/${encodedLoc}`;
        
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
  }, [finalElement, locationName, isRegional]);

  const renderTable = () => {
    // Props yang dikirim ke semua file di folder tables
    const tableProps = { sites, loading, element: finalElement, locationName };
    
    // Normalisasi KEY Case agar switch case kebal spasi/garis miring
    const key = finalElement.toUpperCase().replace(/[\s\-/]/g, '');

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
      case 'UDMHSS':     return <UdmHssTable {...tableProps} />;
      case 'GGSNTHP': return <GgsnTable {...tableProps} />;
      case 'GGSNPDP': return <GgsnTable {...tableProps} />;    
      default:        return <div className="p-40 text-center font-black opacity-10">ELEMENT NOT IDENTIFIED</div>;
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

        {/* HEADER AREA: Pakai variabel 'finalElement' agar error reference hilang */}
        <div className="mb-14">
            <h1 className="text-7xl font-black text-gray-900 tracking-tighter uppercase italic leading-none drop-shadow-sm">
              {finalElement}
            </h1>
            <h2 className="text-4xl font-black text-red-600 uppercase tracking-tighter mt-3 flex items-center gap-4">
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