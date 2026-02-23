// src/configs/ims.js
import { findVal, formatExcelDateNumeric, getRegionFromCity } from '../lib/importHelpers';

export const imsConfig = {
  title: 'IMS',
  prismaModel: 'iMS',
  columns: [
    // ... (daftar kolom tetap sama)
    { label: 'Product', key: 'product' },
    { label: 'Name', key: 'name' },
    { label: 'Capacity', key: 'capacity' },
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
    { label: 'Next Plan Expansion', key: 'next_plan_expansion' },
  ],

  mapExcel: (row, idx, mem) => { // <-- Pastikan ada parameter 'mem'
    const name = String(findVal(row, 'NAME') || "");
    const ttcRaw = String(findVal(row, 'TTC') || "");
    
    // --- LOGIKA MERGED CELLS UNTUK NEXT ROADMAP ---
    const roadmapRaw = findVal(row, 'NEXTROADMAP') || findVal(row, 'ROADMAP') || "";
    if (roadmapRaw && String(roadmapRaw).trim() !== "") {
      mem.lastRoadmap = String(roadmapRaw).trim(); // Simpan ke memori jika ada isinya
    }
    // ----------------------------------------------

    const ttcClean = ttcRaw.replace(/TTC/gi, '').trim();
    let region = getRegionFromCity(ttcClean);
    
    if (region === 'UNKNOWN') {
      const pool = String(findVal(row, 'REGIONPOOL') || "").toLowerCase();
      if (pool.includes('jabo')) region = 'DKI JAKARTA';
      else if (pool.includes('sumbagut')) region = 'SUMATERA UTARA';
      else if (pool.includes('sumbagteng')) region = 'RIAU';
      else if (pool.includes('sumbagsel')) region = 'SUMATERA SELATAN';
      else if (pool.includes('jateng')) region = 'JAWA TENGAH';
      else if (pool.includes('jatim')) region = 'JAWA TIMUR';
      else if (pool.includes('sulawesi')) region = 'SULAWESI SELATAN';
      else if (pool.includes('kalimantan')) region = 'KALIMANTAN TIMUR';
      else if (pool.includes('balinusra')) region = 'BALI';
      else if (pool.includes('puma')) region = 'PAPUA';
    }

    return {
      siteIdCode: name ? `${name}-${idx}` : `IMS-${idx}-${Date.now()}`,
      name: name,
      region: region, 
      city: String(findVal(row, 'REGIONPOOL') || "N/A"),
      status: "Active",
      
      product: String(findVal(row, 'PRODUCT') || "-"),
      capacity: String(findVal(row, 'CAPACITY') || "-"),
      platform: String(findVal(row, 'PLATFORM') || "-"),
      region_pool: String(findVal(row, 'REGIONPOOL') || "-"),
      sw_version: String(findVal(row, 'EXISTINGSWVERSION') || "-"),
      
      sw_eom: formatExcelDateNumeric(findVal(row, 'SWEOM')),
      sw_eofs: formatExcelDateNumeric(findVal(row, 'SWEOFS')),
      sw_eos: formatExcelDateNumeric(findVal(row, 'SWEOS')),
      hw_eom: formatExcelDateNumeric(findVal(row, 'HWEOM')),
      hw_eos: formatExcelDateNumeric(findVal(row, 'HWEOS')),
      
      ttc: ttcRaw,
      // --- GUNAKAN NILAI DARI MEMORI ---
      next_roadmap: String(mem.lastRoadmap || "-"), 
      tsa: String(findVal(row, 'TSA') || "-"),
      next_plan_expansion: String(findVal(row, 'NEXTPLANEXPANSION') || "-")
    };
  }
};