import { getRegionFromCity } from './cityMapper';

// 1. Format Tanggal Angka Saja (DD/MM/YYYY)
const formatExcelDateNumeric = (val) => {
  if (!val || String(val).includes('#N/A') || val === '-' || val === 'None Announced') return '-';
  
  const numVal = Number(val);
  // Jika nilai adalah angka serial Excel (biasanya di atas 30000)
  if (!isNaN(numVal) && numVal > 30000) {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }
  return String(val).trim();
};

// 2. Pencarian Kolom yang Super Sensitif
const findVal = (row, target) => {
  const keys = Object.keys(row);
  const cleanTarget = target.trim().replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const match = keys.find(k => {
    const cleanKey = k.trim().replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return cleanKey === cleanTarget || cleanKey.includes(cleanTarget);
  });
  return match ? String(row[match]).trim() : null;
};

// 3. Mengambil kolom berdasarkan urutan (untuk Of Support 1 & 2)
const getValByIndex = (row, keyword, index) => {
  const keys = Object.keys(row);
  const matches = keys.filter(k => k.trim().toUpperCase().includes(keyword.toUpperCase()));
  const targetKey = matches[index];
  // PERBAIKAN: Paksa jadi String
  return targetKey ? String(row[targetKey]).trim() : "-";
};

export const mappers = {
  // DNS Gn: Pastikan siteIdCode masuk
  'DNS Gn': (row, idx) => {
    const name = findVal(row, 'NENAME') || findVal(row, 'NAME') || "";
    const city = findVal(row, 'CITY') || findVal(row, 'REGNAME') || "";
    const sKeys = Object.keys(row).filter(k => k.toUpperCase().includes('OF SUPPORT'));
    
    return {
      siteIdCode: String(findVal(row, 'NEID') || findVal(row, 'HOSTNAME') || findVal(row, 'SITEID') || `GN-${idx}`),
      name, region: getRegionFromCity(city) || getRegionFromCity(name), city,
      status: findVal(row, 'STATUS') || "Active",
      department: findVal(row, 'DEPARTMENT'),
      ne_func: findVal(row, 'NEFUNC'),
      ne_type: findVal(row, 'NETYPE'),
      vendor: findVal(row, 'VENDOR'),
      hw_ver: findVal(row, 'HWVER'),
      hw_support: String(row[sKeys[0]] || "-"),
      sw_ver: findVal(row, 'SWVER'),
      sw_support: String(row[sKeys[1]] || "-"),
      cap_1: findVal(row, 'CAP1'),
      cap_1_unit: findVal(row, 'CAP1UNIT'),
      cap_2: findVal(row, 'CAP2'),
      cap_2_unit: findVal(row, 'CAP2UNIT'),
      domain: findVal(row, 'DOMAIN'),
      on_air_date: formatExcelDateNumeric(findVal(row, 'ONAIRDATE')),
      site_location: findVal(row, 'SITELOCATION'),
      loc_type: findVal(row, 'LOCTYPE'),
      loc_address: findVal(row, 'LOCADDRESS'),
    };
  },

  'DNS Gi': (row, idx, mem) => {
    const name = String(findVal(row, 'NAME') || findVal(row, 'NENAME') || "");
    let eos = findVal(row, 'HWEOS');
    if (!eos || String(eos).includes('#N/A')) eos = mem.lastEos; else mem.lastEos = eos;

    return {
      siteIdCode: String(findVal(row, 'NEID') || `GI-${idx}`),
      name, region: getRegionFromCity(name), city: "N/A", status: "Active",
      hw_type: findVal(row, 'HWTYPE'),
      storage: findVal(row, 'STORAGE'),
      sw_vnf: findVal(row, 'VNF'),
      sw_vim: findVal(row, 'VIM'),
      capacity_kqps: findVal(row, 'KQPS') || findVal(row, 'CAPACITY'),
      hw_eom: formatExcelDateNumeric(findVal(row, 'HWEOM')),
      hw_eos: formatExcelDateNumeric(eos)
    };
  },

  'ADC': (row, idx) => {
    const node = findVal(row, 'NODE') || findVal(row, 'NAME') || "";
    const codeMatch = String(node).match(/^[A-Z]+/i);
    const keys = Object.keys(row);
    // Cari kolom VLAN dan VRF secara manual jika findVal gagal
    const vlanKey = keys.find(k => k.toUpperCase().includes('VLAN'));
    const vrfKey = keys.find(k => k.toUpperCase().includes('VRF') || k.toUpperCase().includes('SDN'));

    return {
      siteIdCode: `${node}-${idx}`,
      name: node, region: getRegionFromCity(codeMatch ? codeMatch[0] : ""), city: "N/A", status: "Active",
      vlan: vlanKey ? String(row[vlanKey]).trim() : "-",
      vrf_sdn: vrfKey ? String(row[vrfKey]).trim() : "-"
    };
  },

  'USC/STP': (row, idx) => {
    const name = findVal(row, 'NAME') || "";
    const codeMatch = String(name).match(/^[A-Z]+/i);
    return {
      siteIdCode: String(name + "-" + idx + "-" + Date.now()),
      name, region: getRegionFromCity(codeMatch ? codeMatch[0] : ""), city: "N/A", status: "Active",
      product: findVal(row, 'PRODUCT'),
      cap_stp: findVal(row, 'CAPACITYSTP') || findVal(row, 'STP'),
      cap_dra: findVal(row, 'CAPACITYDRA'),
      platform: findVal(row, 'PLATFORM'),
      region_pool: findVal(row, 'REGIONPOOL'),
      sw_version: findVal(row, 'EXISTINGSWVERSION'),
      sw_eom: formatExcelDateNumeric(findVal(row, 'SWEOM')),
      hw_eos: formatExcelDateNumeric(findVal(row, 'HWEOS')),
      ttc: findVal(row, 'TTC'),
      next_plan: findVal(row, 'NEXTPLAN')
    };
  },

  'UDM/HSS': (row, idx) => {
    const name = findVal(row, 'NAME') || "";
    const ttc = findVal(row, 'TTC') || "";
    
    // LOGIKA PERBAIKAN UDM: Singkatan Terakhir Sebelum Angka
    // Contoh: UDM-BE-KNG1 -> parts: [UDM, BE, KNG1] -> KNG1 -> KNG
    const parts = name.split('-');
    const lastPart = parts[parts.length - 1] || ""; 
    const codeMatch = lastPart.match(/[A-Z]+/i);
    const code = codeMatch ? codeMatch[0] : "";
    
    return {
      siteIdCode: String(name + "-" + idx),
      name, region: getRegionFromCity(ttc) || getRegionFromCity(code), city: "N/A", status: "Active",
      product: findVal(row, 'PRODUCT'),
      platform: findVal(row, 'PLATFORM'),
      region_pool: findVal(row, 'REGIONPOOL') || findVal(row, 'POOL'),
      fs_version: findVal(row, 'FSVERSION') || findVal(row, 'FS VERSION'),
      eaight: findVal(row, 'EAIGHT') || findVal(row, 'EEIGHT'),
      lcm: findVal(row, 'LCM'),
      sw_version: findVal(row, 'EXISTINGSWVERSION'),
      sw_eom: formatExcelDateNumeric(findVal(row, 'SWEOM')),
      sw_eofs: formatExcelDateNumeric(findVal(row, 'SWEOFS')),
      sw_eos: formatExcelDateNumeric(findVal(row, 'SWEOS')),
      hw_eom: formatExcelDateNumeric(findVal(row, 'HWEOM')),
      hw_eos: formatExcelDateNumeric(findVal(row, 'HWEOS')),
      ttc, remark: findVal(row, 'REMARK'),
      next_roadmap: findVal(row, 'NEXTROADMAP'),
      tsa: findVal(row, 'TSA')
    };
  },

  'MSS': (row, idx, mem) => {
    const mssName = row['MSS Element'] || row['MSS ELEMENT'] || "";
    const rawRegional = row['Regional'] || row['REGIONAL'] || "";

    // 1. Logika Merged Cells: Ingat Regional terakhir (Sumbagut, Jabotabek, dll)
    if (rawRegional && String(rawRegional).trim() !== "") {
      mem.currentMssReg = String(rawRegional).trim();
    }

    // 2. Filter: Jika bukan baris data, skip
    if (!mssName || String(mssName).toUpperCase().includes('VLR - MSS')) return null;

    const name = String(mssName).trim();
    
    // 3. Deteksi Region (Bedah MSMDN6 -> cari MDN di kamus)
    let region = getRegionFromCity(name);
    if (region === 'UNKNOWN') region = getRegionFromCity(mem.currentMssReg);

    return {
      siteIdCode: name,
      name: name,
      region: region,
      city: mem.currentMssReg || "N/A",
      status: "Active",
      vendor: String(row['Vendor'] || "-"),
      sub_capacity: String(row['Subscriber Capacity'] || "-"),
      sub_usage: String(row['Subscriber Usage'] || "-"),
      sub_occupancy: String(row['Subscriber Occupancy (%)'] || "-"),
      cpu_load: String(row['CPU Load (%) MSS'] || "-"),
      vlr_category: String(row['VLR Occ Category'] || "-"),
      cpu_category: String(row['CPU Load Category'] || "-"),
    };
  }
};