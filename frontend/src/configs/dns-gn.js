// src/configs/dns-gn.js
import { findVal, formatExcelDateNumeric } from '../lib/importHelpers'; 
import { getRegionFromCity } from '../lib/cityMapper';

export const dnsGnConfig = {
  title: 'DNS Gn',
  prismaModel: 'dNS_Gn',
  columns: [
    { label: 'City', key: 'city' }, 
    { label: 'NE Name', key: 'name' }, 
    { label: 'NE ID / Hostname', key: 'siteIdCode' },
    { label: 'Dept', key: 'department' },
    { label: 'Func', key: 'ne_func' },
    { label: 'Type', key: 'ne_type' },
    { label: 'Vendor', key: 'vendor' },
    { label: 'HW Ver.', key: 'hw_ver' },
    { label: 'HW Supp', key: 'hw_support' },
    { label: 'SW Ver.', key: 'sw_ver' },
    { label: 'SW Supp', key: 'sw_support' },
    { label: 'Cap 1', key: 'cap_1' },
    { label: 'Cap 1 Unit', key: 'cap_1_unit' },
    { label: 'Cap 2', key: 'cap_2' },
    { label: 'Cap 2 Unit', key: 'cap_2_unit' },
    { label: 'Domain', key: 'domain' },
    { label: 'On Air Date', key: 'on_air_date' },
    { label: 'Status', key: 'status' },
    { label: 'Site Location', key: 'site_location' },
    { label: 'Loc Type', key: 'loc_type' },
    { label: 'Address', key: 'loc_address' },
  ],
  mapExcel: (row, idx) => {
    // Cari kolom Name & City dari Excel
    const name = String(findVal(row, 'NENAME') || findVal(row, 'NAME') || "");
    const cityName = String(findVal(row, 'CITY') || findVal(row, 'REGNAME') || "");
    
    // Mapping data balik ke Database
    return {
      siteIdCode: String(findVal(row, 'NEID') || findVal(row, 'HOSTNAME') || findVal(row, 'SITEID') || `GN-${idx}-${Date.now()}`),
      name: name,
      region: getRegionFromCity(cityName) || getRegionFromCity(name) || "Unknown",
      city: cityName,
      status: String(findVal(row, 'STATUS') || "Active"),
      department: String(findVal(row, 'DEPARTMENT') || "-"),
      ne_func: String(findVal(row, 'NEFUNC') || "-"),
      ne_type: String(findVal(row, 'NETYPE') || "-"),
      vendor: String(findVal(row, 'VENDOR') || "-"),
      
      // HW/SW Version & Support (Disesuaikan dengan Header "HW End Of" di Excel)
      hw_ver: String(findVal(row, 'HWVER') || "-"),
      hw_support: String(findVal(row, 'HWENDOF') || findVal(row, 'HWSUPP') || "-"),
      
      sw_ver: String(findVal(row, 'SWVER') || "-"),
      sw_support: String(findVal(row, 'SWENDOF') || findVal(row, 'SWSUPP') || "-"),
      
      cap_1: String(findVal(row, 'CAP1') || "-"),
      cap_1_unit: String(findVal(row, 'CAP1UNIT') || "-"),
      cap_2: String(findVal(row, 'CAP2') || "-"),
      cap_2_unit: String(findVal(row, 'CAP2UNIT') || "-"),
      domain: String(findVal(row, 'DOMAIN') || "-"),
      on_air_date: formatExcelDateNumeric(findVal(row, 'ONAIRDATE')),
      site_location: String(findVal(row, 'SITELOCATION') || "-"),
      loc_type: String(findVal(row, 'LOCTYPE') || "-"),
      loc_address: String(findVal(row, 'LOCADDRESS') || "-"),
    };
  }
};