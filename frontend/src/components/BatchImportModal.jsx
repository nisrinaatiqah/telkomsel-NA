// src/components/BatchImportModal.jsx
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { X, Upload, Loader2, CheckCircle2 } from 'lucide-react';

// IMPORT SEMUA CONFIG DARI FOLDER CONFIGS
import { dnsGnConfig } from '../configs/dns-gn';
import { dnsGiConfig } from '../configs/dns-gi';
import { adcConfig } from '../configs/adc';
import { mssConfig } from '../configs/mss';
import { udmHssConfig } from '../configs/udm-hss';
import { uscStpConfig } from '../configs/usc-stp';
import { tmgwConfig } from '../configs/tmgw';
import { mgwConfig } from '../configs/mgw';
import { gssConfig } from '../configs/gss';
import { imsConfig } from '../configs/ims';
import { ggsnThpConfig } from '../configs/ggsn-thp';
import { ggsnPdpConfig } from '../configs/ggsn-pdp';

const BatchImportModal = ({ isOpen, onClose, currentElement, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);

  // DAFTAR PEMETAAN
  const configs = {
    'DNS Gn': dnsGnConfig,
    'DNS Gi': dnsGiConfig,
    'ADC': adcConfig,
    'MSS': mssConfig,
    'UDM/HSS': udmHssConfig,
    'USC/STP': uscStpConfig,
    'UDM-HSS': udmHssConfig,
    'USC-STP': uscStpConfig,
    'TMGW': tmgwConfig,
    'MGW': mgwConfig,
    'GSS': gssConfig,
    'IMS': imsConfig,
    'GGSN-THP': ggsnThpConfig,
    'GGSN-PDP': ggsnPdpConfig,
    'GGSN/THP': ggsnThpConfig, 
    'GGSN/PDP': ggsnPdpConfig,
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      let finalData = [];
      // Kita coba scan dari baris 0 sampai 5 untuk mencari mana yang ada kolom "Element" atau "Name"
      for (let r = 0; r < 5; r++) {
        const trialData = XLSX.utils.sheet_to_json(ws, { defval: "", range: r });
        if (trialData.length > 0) {
          const keys = Object.keys(trialData[0]).join(" ").toUpperCase();
          // Jika baris ini mengandung kata kunci header, maka inilah baris headernya!
          if (keys.includes("ELEMENT") || keys.includes("NAME") || keys.includes("PRODUCT") || keys.includes("REGIONAL")) {
            console.log(`Header ditemukan di Baris ${r + 1}`);
            finalData = trialData;
            break;
          }
        }
      }

      if (finalData.length === 0) {
        console.error("Gagal mendeteksi header. Menggunakan default baris 1.");
        finalData = XLSX.utils.sheet_to_json(ws, { defval: "" });
      }

      setFileData(finalData);
    };
    reader.readAsBinaryString(file);
  };

  const processImport = async () => {
    if (!fileData || fileData.length === 0) return;
    setLoading(true);
    setProgress(0);

    const activeConfig = configs[currentElement];

    if (!activeConfig) {
      alert(`Error: Konfigurasi untuk elemen "${currentElement}" tidak ditemukan di Modal!`);
      setLoading(false);
      return;
    }

    try {
      console.log(`--- PROSES IMPORT: ${currentElement} ---`);
      
      // --- PERBAIKAN 1: Tambahkan Objek Memory ---
      // Ini wajib agar MSS bisa menangani Merged Cells (Regional yang kosong di bawah)
      let memory = { currentMssReg: "-", lastEos: "-", lastRoadmap: "-" };

      const mappedData = fileData.map((row, idx) => {
        // --- PERBAIKAN 2: Perluas daftar kunci nama ---
        // Menambahkan variasi penulisan agar 'MSS Element' terdeteksi
        const nameKeys = [
          'Name', 'NAME', 'Node', 'NODE', 'Node Name', 
          'NE Name', 'NE NAME', 'SITE ID', 'GGSN Name', 'GGSN NAME',
          'MSS ELEMENT', 'MSS Element', 'MGW ELEMENT', 'MGW Element', 'TMGW ELEMENT', 'TMGW Element', 'GSS ELEMENT', 'GSS Element'
        ];
        
        let nameVal = "";
        for (let k of nameKeys) {
          if (row[k]) { 
            nameVal = String(row[k]).trim(); 
            break; 
          }
        }

        // --- PERBAIKAN 3: Perluas daftar filter baris tidak valid ---
        // Menghindari baris summary atau header tabel di tengah Excel masuk ke database
        const invalidNames = [
          'NAME', 'NODE', 'NE NAME', 'NEXT ROADMAP',
          'VLR - MSS', 'SUMMARY', 'NATIONWIDE', 'TOTAL',
          'MSS ELEMENT', 'MSS DATA', 'MGW ELEMENT', 'MGW DATA', 'TMGW ELEMENT', 'TMGW DATA', 'GSS ELEMENT', 'GSS DATA'
        ];

        if (!nameVal || nameVal === "" || invalidNames.includes(nameVal.toUpperCase())) {
            return null;
        }

        // --- PERBAIKAN 4: Kirim 'memory' ke fungsi mapExcel ---
        // Tanpa parameter ketiga (memory), MSS akan crash saat baca mem.currentMssReg
        return activeConfig.mapExcel(row, idx, memory);
      }).filter(item => item !== null);

      if (mappedData.length === 0) {
        alert("Gagal: Tidak ada data valid yang bisa dibaca dari Excel ini.");
        setLoading(false);
        return;
      }

      console.log("SAMPLE DATA BERHASIL DI-MAP:", mappedData[0]);

      const chunkSize = 100;
      let successTotal = 0;

      for (let i = 0; i < mappedData.length; i += chunkSize) {
        const chunk = mappedData.slice(i, i + chunkSize);
        await axios.post('http://localhost:5001/api/sites/batch', { 
          sites: chunk, 
          elementType: currentElement 
        });

        successTotal += chunk.length;
        setProgress(Math.round(((i + chunk.length) / mappedData.length) * 100));
      }

      alert(`Alhamdulillah! Berhasil mengimport ${successTotal} data ke ${currentElement}`);
      if (onRefresh) onRefresh();
      onClose();
      setFileData(null);

    } catch (err) {
      console.error("IMPORT ERROR:", err.response?.data || err.message);
      alert("Gagal Import: " + (err.response?.data?.error || "Cek terminal backend"));
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border-8 border-white overflow-hidden text-center p-10 relative font-sans">
        <div className="p-8 bg-slate-800 text-white flex justify-between items-center absolute top-0 left-0 w-full">
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-white font-sans">Batch Import System</h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform"><X /></button>
        </div>
        
        <div className="mt-16">
          {!fileData ? (
            <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 hover:border-red-500 cursor-pointer relative group transition-all">
              <input type="file" accept=".xlsx" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
              <Upload size={48} className="mx-auto text-slate-300 group-hover:text-red-600 mb-4 transition-colors" />
              <p className="font-black text-slate-600 uppercase">Klik/Drop File Excel <br/><span className="text-red-600">{currentElement}</span></p>
            </div>
          ) : (
            <div className="bg-green-50 p-8 rounded-[2.5rem] border-2 border-green-100">
              <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
              <p className="font-black text-green-800 uppercase truncate px-4">{fileName}</p>
              <p className="text-green-600 font-bold mt-1 uppercase text-[10px] tracking-widest">{fileData.length} baris data ditemukan</p>
              {loading && (
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-10 flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 font-black uppercase text-slate-400 text-xs tracking-widest hover:text-gray-600 transition-all">Cancel</button>
            <button 
              disabled={!fileData || loading} 
              onClick={processImport} 
              className="flex-[2] bg-red-600 text-white py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 italic tracking-wider leading-none font-sans"
            >
              {loading ? <><Loader2 className="animate-spin" /><span>Processing {progress}%</span></> : "Execute Import"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchImportModal;