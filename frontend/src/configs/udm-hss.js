// src/configs/udm-hss.js
import { findVal, formatExcelDateNumeric, getRegionFromCity } from '../lib/importHelpers';

export const udmHssConfig = {
  title: 'UDM/HSS',
  prismaModel: 'uDM_HSS',
  columns: [
    // ... kolom tetap sama
    { label: 'City', key: 'city' },
    { label: 'Name', key: 'name' },
    { label: 'Platform', key: 'platform' },
    { label: 'Region Pool', key: 'region_pool' },
    { label: 'FS Version', key: 'fs_version' },
    { label: 'Eaight', key: 'eaight' }, 
    { label: 'LCM', key: 'lcm' },
    { label: 'Existing SW version', key: 'sw_version' },
    { label: 'SW EOM', key: 'sw_eom' },
    { label: 'SW EOFS', key: 'sw_eofs' },
    { label: 'SW EOS', key: 'sw_eos' },
    { label: 'HW EOM', key: 'hw_eom' },
    { label: 'HW EOS', key: 'hw_eos' },
    { label: 'TTC', key: 'ttc' },
    { label: 'Remark', key: 'remark' },
    { label: 'Next Roadmap', key: 'next_roadmap' },
    { label: 'TSA', key: 'tsa' },
  ],
  mapExcel: (row, idx) => {
    const name = String(findVal(row, 'NAME') || "");
    const ttcRaw = String(findVal(row, 'TTC') || "");
    const regionPoolRaw = String(findVal(row, 'REGIONPOOL') || "");
    
    const ttcClean = ttcRaw.replace(/TTC/gi, '').trim();
    
    // Perbaikan Regex: Mencari 2-3 huruf kapital di akhir nama (seperti BD atau MDN)
    const codeMatch = name.match(/([A-Z]{2,3})\d*$/i);
    const cityCode = codeMatch ? codeMatch[1].toUpperCase() : "";

    let region = getRegionFromCity(ttcClean);

    if (!region || region === 'UNKNOWN') {
      const manualMap = {
        'MDN': 'SUMATERA UTARA', 'PLG': 'SUMATERA SELATAN', 'TBS': 'DKI JAKARTA',
        'SBY': 'JAWA TIMUR', 'UPD': 'SULAWESI SELATAN', 'BJB': 'KALIMANTAN SELATAN',
        'BPP': 'KALIMANTAN TIMUR', 'MDO': 'SULAWESI UTARA', 'PTK': 'KALIMANTAN BARAT',
        'BNA': 'ACEH', 'PDG': 'SUMATERA BARAT', 'BDL': 'LAMPUNG', 'PKB': 'RIAU',
        'BTW': 'KEPULAUAN RIAU', 'DPS': 'BALI', 'MKS': 'SULAWESI SELATAN',
        'BD': 'JAWA BARAT', 'SOE': 'JAWA BARAT', 'KNG': 'DKI JAKARTA', 'AHZ': 'SUMATERA UTARA'
      };
      region = manualMap[cityCode] || 'UNKNOWN';
    }

    // Penambahan Filter Kata Kunci untuk Region Pool
    if (!region || region === 'UNKNOWN') {
      const pool = regionPoolRaw.toLowerCase();
      if (pool.includes('sumbagut')) region = 'SUMATERA UTARA';
      else if (pool.includes('sumbagsel')) region = 'SUMATERA SELATAN';
      else if (pool.includes('sumbagteng')) region = 'RIAU';
      else if (pool.includes('jabodetabek')) region = 'DKI JAKARTA';
      else if (pool.includes('jabar')) region = 'JAWA BARAT'; // Tangkap BD & SOE
      else if (pool.includes('jateng')) region = 'JAWA TENGAH';
      else if (pool.includes('jatim')) region = 'JAWA TIMUR';
      else if (pool.includes('balinusra')) region = 'BALI'; // Tangkap DPS
      else if (pool.includes('sulawesi')) region = 'SULAWESI SELATAN';
      else if (pool.includes('kalimantan')) region = 'KALIMANTAN TIMUR';
      else if (pool.includes('puma')) region = 'PAPUA';
    }

    return {
      siteIdCode: name ? `${name}-${idx}` : `UDM-${idx}-${Date.now()}`,
      name: name,
      region: region || "UNKNOWN", 
      city: regionPoolRaw || "N/A",
      status: "Active",
      product: String(findVal(row, 'PRODUCT') || "-"),
      platform: String(findVal(row, 'PLATFORM') || "-"),
      region_pool: regionPoolRaw,
      fs_version: String(findVal(row, 'FSVERSION') || "-"),
      eaight: String(findVal(row, 'ESIGHT') || findVal(row, 'EAIGHT') || "-"),
      lcm: String(findVal(row, 'LCM') || "-"),
      sw_version: String(findVal(row, 'EXISTINGSWVERSION') || "-"),
      sw_eom: formatExcelDateNumeric(findVal(row, 'SWEOM')),
      sw_eofs: formatExcelDateNumeric(findVal(row, 'SWEOFS')),
      sw_eos: formatExcelDateNumeric(findVal(row, 'SWEOS')),
      hw_eom: formatExcelDateNumeric(findVal(row, 'HWEOM')),
      hw_eos: formatExcelDateNumeric(findVal(row, 'HWEOS')),
      ttc: ttcRaw,
      remark: String(findVal(row, 'REMARK') || "-"),
      next_roadmap: String(findVal(row, 'NEXTROADMAP') || "-"),
      tsa: String(findVal(row, 'TSA') || "-"),
    };
  }
};