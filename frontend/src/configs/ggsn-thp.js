import { findVal, getRegionFromCity } from '../lib/importHelpers';

export const ggsnThpConfig = {
  title: 'GGSN THP',
  prismaModel: 'gGSN_THP',
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
    { label: 'THP CAT', key: 'vlr_category' },
  ],
  mapExcel: (row, idx) => {
    const name = String(findVal(row, 'GGSN Name') || "");
    const popRaw = String(findVal(row, 'POP') || "");
    const regionRaw = String(findVal(row, 'Region') || "").toUpperCase();

    // Fungsi ambil nilai ASLI tanpa pembulatan
    const getRawValue = (target) => {
        let val = findVal(row, target);
        if (!val || val === "" || val === "-") return "0";
        return String(val).trim();
    };

    // Bersihkan tulisan "POP Aceh" jadi "Aceh"
    const popName = popRaw.replace(/POP\s+/gi, '').trim().toUpperCase();
  
    let region = getRegionFromCity(popName);

    // LOGIKA MANUAL: Jika kota aneh/singkatan tidak ada di Mapper
    if (!region || region === 'UNKNOWN') {
        if (popName.includes('SOETA') || popName.includes('DAGO') || popName.includes('BUARAN') || popName.includes('BSD')) {
      region = 'DKI JAKARTA'; 
        } else if (popName.includes('AHZ') || regionRaw.includes('SUMBAGUT')) {
        region = 'SUMATERA UTARA';
        } else if (popName.includes('GAYUNGAN') || regionRaw.includes('JATIM')) {
        region = 'JAWA TIMUR';
        } else if (regionRaw.includes('SULAWESI')) {
        region = 'SULAWESI SELATAN';
        } else if (regionRaw.includes('JABOTABEK')) {
        region = 'DKI JAKARTA';
        } else if (regionRaw.includes('PUMA')) {
            region = 'PAPUA';
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
        sub_capacity: String(findVal(row, 'Capacity') || "-"),
        sub_usage: String(findVal(row, 'Usage') || "-"),
        sub_occupancy: String(findVal(row, 'Occ') || "-"),
        cpu_load: String(findVal(row, 'CPU Load') || "-"),
        vlr_category: String(findVal(row, 'GGSN THP Category') || "-"),
        cpu_category: String(findVal(row, 'CPU Load Category') || "-")
    };
  }
};