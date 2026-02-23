import React from 'react';
import { useParams } from 'react-router-dom';
import AdcMap from './AdcMap';
import StandardMap from './StandardMap';
import MssMap from './MssMap'; 
import GssMap from './GssMap'; 
import TmgwMap from './TmgwMap';
import MgwMap from './MgwMap';

const MapSelector = () => {
  const { element } = useParams();
  const normalizedElement = element ? element.replace('-', '/') : "";

  // PILIH TAMPILAN BERDASARKAN ELEMEN
  switch (normalizedElement) {
    case 'ADC':
      return <AdcMap element={normalizedElement} />;
    case 'MSS':
      return <MssMap element={normalizedElement} />; 
    case 'GSS':
      return <GssMap element={normalizedElement} />;
    case 'TMGW': 
      return <TmgwMap element={normalizedElement} />;
    case 'MGW': 
      return <MgwMap element={normalizedElement} />;
    default:
      return <StandardMap element={normalizedElement} />;
  }
};

export default MapSelector;