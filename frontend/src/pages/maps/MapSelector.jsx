import React from 'react';
import { useParams } from 'react-router-dom';
import AdcMap from './AdcMap';
import StandardMap from './StandardMap';
import MssMap from './MssMap'; 
import GssMap from './GssMap'; 
import TmgwMap from './TmgwMap';
import MgwMap from './MgwMap';
import UscMap from './UscMap';
import DnsGnMap from './DnsGnMap';
import DnsGiMap from './DnsGiMap';

const MapSelector = () => {
  const { element } = useParams();

  // --- PERBAIKAN START ---
  // 1. decodeURIComponent: Mengubah %20 kembali menjadi spasi asli
  // 2. toUpperCase: Menyamakan semua menjadi huruf besar agar tidak salah deteksi
  // 3. replace('-', ' '): Mengubah strip menjadi spasi agar 'DNS-Gn' jadi 'DNS GN'
  const cleanElement = element ? decodeURIComponent(element).toUpperCase().replace('-', ' ') : "";

  // CASE SWITCHER MENGGUNAKAN cleanElement (HURUF BESAR SEMUA)
  if (cleanElement.includes('ADC')) {
    return <AdcMap element="ADC" />;
  }
  
  if (cleanElement.includes('MSS')) {
    return <MssMap element="MSS" />;
  }

  if (cleanElement.includes('GSS')) {
    return <GssMap element="GSS" />;
  }

  if (cleanElement.includes('TMGW')) {
    return <TmgwMap element="TMGW" />;
  }

  if (cleanElement.includes('MGW')) {
    return <MgwMap element="MGW" />;
  }

  if (cleanElement.includes('USC')) {
    // Karena config pakai USC/STP, kita kirimkan element dengan format aslinya
    return <UscMap element="USC/STP" />;
  }

  if (cleanElement.includes('DNS GN')) {
    return <DnsGnMap element="DNS Gn" />;
  }

  if (cleanElement.includes('DNS GI')) {
    return <DnsGiMap element="DNS GI" />;
  }

  // Jika tidak ada yang cocok (seperti DNS Gi, SGSN, dll), pakai tampilan Standar
  const normalizedElement = element ? element.replace('-', '/') : "";
  return <StandardMap element={normalizedElement} />;
};

export default MapSelector;