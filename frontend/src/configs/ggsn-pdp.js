// src/configs/ggsn-pdp.js
import { findVal, getRegionFromCity } from '../lib/importHelpers';

export const ggsnPdpConfig = {
  title: 'GGSN PDP',
  prismaModel: 'gGSN_PDP',
  columns: [
    { label: 'VENDOR', key: 'vendor' },
    { label: 'POP', key: 'city' },
    { label: 'GGSN NAME', key: 'name' },
    { label: 'REGION', key: 'regional_internal' },
    { label: 'AREA', key: 'department' },
    { label: 'CAPACITY', key: 'sub_capacity' },
    { label: 'USAGE', key: 'sub_usage' },
    { label: 'OCC [%]', key: 'sub_occupancy' },
    { label: 'CPU LOAD [%]', key: 'cpu_load' },
    { label: 'PDP CAT', key: 'vlr_category' },
  ],

  mapExcel: (row, idx) => {
    // 1. Ambil Nama & POP
    const name = String(findVal(row, 'GGSN Name') || findVal(row, 'NAME') || "");
    const popRaw = String(findVal(row, 'POP') || "");
    const regionInternalRaw = String(findVal(row, 'Region') || "").toUpperCase();

    // 2. Fungsi ambil nilai ASLI (Mendukung persen panjang & desimal real)
    const getRawValue = (target) => {
        let val = findVal(row, target);
        if (val === undefined || val === null || val === "" || val === "-") return "0";
        return String(val).trim();
    };

    // 3. Logika Penentuan Wilayah (Peta)
    // "POP Aceh" -> "ACEH"
    const popName = popRaw.replace(/POP\s+/gi, '').trim().toUpperCase();
    let region = getRegionFromCity(popName);

    // LOGIKA PENDAREH MANUAL (Untuk POP aneh seperti DAGO, AHZ, SOETA, dsb)
    if (!region || region === 'UNKNOWN') {
        const searchContext = `${popName} ${name} ${regionInternalRaw}`.toUpperCase();
        
        if (searchContext.includes('SOETA') || searchContext.includes('DAGO') || searchContext.includes('BUARAN') || searchContext.includes('JABO')) {
          region = 'DKI JAKARTA'; 
        } else if (searchContext.includes('AHZ') || searchContext.includes('SUMBAGUT')) {
          region = 'SUMATERA UTARA';
        } else if (searchContext.includes('GAYUNGAN') || searchContext.includes('JATIM')) {
          region = 'JAWA TIMUR';
        } else if (searchContext.includes('SUMBAGTENG') || searchContext.includes('BATAM')) {
          region = 'RIAU';
        } else if (searchContext.includes('SUMBAGSEL') || searchContext.includes('PALEMBANG')) {
          region = 'SUMATERA SELATAN';
        } else if (searchContext.includes('SULAWESI')) {
          region = 'SULAWESI SELATAN';
        } else if (searchContext.includes('PUMA') || searchContext.includes('PAPUA')) {
          region = 'PAPUA';
        } else if (searchContext.includes('KALIMANTAN')) {
          region = 'KALIMANTAN TIMUR';
        }
    }

    return {
      siteIdCode: `${name}-${idx}-${Date.now()}`,
      name: name,
      region: region || "UNKNOWN",
      city: popRaw,
      regional_internal: String(findVal(row, 'Region') || "-"),
      department: String(findVal(row, 'Area') || "-"),
      status: "Active",
      vendor: String(findVal(row, 'Vendor') || "-"),
      // Ambil data numerik real tanpa pembulatan (.toFixed)
      sub_capacity: getRawValue('Capacity'),
      sub_usage: getRawValue('Usage'),
      sub_occupancy: getRawValue('Occ'), // Otomatis tangkap "Occ. [%]"
      cpu_load: getRawValue('CPU Load'), // Otomatis tangkap "CPU Load [%]"
      vlr_category: String(findVal(row, 'PDP Category') || findVal(row, 'PDP CAT') || "-"),
    };
  }
};