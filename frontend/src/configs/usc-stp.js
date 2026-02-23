// src/configs/usc-stp.js
import { findVal, formatExcelDateNumeric, getRegionFromCity } from '../lib/importHelpers';

export const uscStpConfig = {
  title: 'USC/STP',
  prismaModel: 'uSC_STP', 
  columns: [
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
  mapExcel: (row, idx) => {
    const name = String(findVal(row, 'NAME') || "");
    const codeMatch = name.match(/^[A-Z]+/i);
    
    return {
      siteIdCode: `${name}-${idx}-${Date.now()}`,
      name: name,
      region: getRegionFromCity(codeMatch ? codeMatch[0] : ""),
      city: "N/A",
      status: "Active",
      
      product: String(findVal(row, 'PRODUCT') || "-"),
      cap_stp: String(findVal(row, 'CAPACITYSTP') || findVal(row, 'MSU') || "-"),
      cap_dra: String(findVal(row, 'CAPACITYDRA') || findVal(row, 'TPS') || "-"),
      platform: String(findVal(row, 'PLATFORM') || "-"),
      region_pool: String(findVal(row, 'REGIONPOOL') || "-"),
      sw_version: String(findVal(row, 'EXISTINGSWVERSION') || findVal(row, 'SWVERSION') || "-"),
      
      // KOLOM TANGGAL (Penyebab utama data strip jika salah nama)
      sw_eom: formatExcelDateNumeric(findVal(row, 'SWEOM')),
      sw_eofs: formatExcelDateNumeric(findVal(row, 'SWEOFS')),
      sw_eos: formatExcelDateNumeric(findVal(row, 'SWEOS')),
      hw_eom: formatExcelDateNumeric(findVal(row, 'HWEOM')),
      hw_eos: formatExcelDateNumeric(findVal(row, 'HWEOS')),
      
      ttc: String(findVal(row, 'TTC') || "-"),
      next_roadmap: String(findVal(row, 'NEXTROADMAP') || "-"),
      tsa: String(findVal(row, 'TSA') || "-"),
      next_plan: String(findVal(row, 'NEXTPLAN') || "-")
    };
  }
};