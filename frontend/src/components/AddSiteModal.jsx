import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const AddSiteModal = ({ isOpen, onClose, onRefresh, currentElement, currentRegion }) => {
  const [formData, setFormData] = useState({
    siteIdCode: '', name: '', status: 'Active', uptime: 100
  });
  const [techData, setTechData] = useState({});

  // Konfigurasi field input berdasarkan gambar yang kamu berikan
  const techFields = {
    'USC/STP': ['product', 'cap_stp', 'cap_dra', 'platform', 'region_pool', 'sw_version', 'sw_eom', 'sw_eos', 'ttc', 'next_roadmap', 'tsa', 'next_plan'],
    'UDM/HSS': ['product', 'platform', 'region_pool', 'sw_version', 'sw_eom', 'sw_eos', 'ttc', 'remark', 'next_roadmap', 'tsa'],
    'DNS Gi': ['hw_type', 'storage', 'sw_vnf', 'sw_vim', 'cap_kqps', 'hw_eom', 'hw_eos'],
    'MSS': ['vlr_capacity', 'processor_usage'],
    'GGSN': ['throughput', 'pdp_context'],
    'SGSN-MME': ['throughput', 'pdp_context']
  };

  const fields = techFields[currentElement] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/sites', {
        ...formData,
        elementType: currentElement,
        region: currentRegion,
        technicalData: techData
      });
      alert("Data berhasil disimpan ke PostgreSQL!");
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Gagal menyimpan data");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 bg-red-600 text-white flex justify-between items-center rounded-t-[2.5rem]">
          <h2 className="text-xl font-black uppercase italic tracking-tighter">Add New {currentElement} - {currentRegion}</h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Site ID</label>
              <input required className="w-full p-3 bg-gray-50 border rounded-xl font-bold" onChange={e => setFormData({...formData, siteIdCode: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Site Name</label>
              <input required className="w-full p-3 bg-gray-50 border rounded-xl font-bold" onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Status</label>
              <select className="w-full p-3 bg-gray-50 border rounded-xl font-bold" onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Initial Uptime (%)</label>
              <input type="number" step="0.01" className="w-full p-3 bg-gray-50 border rounded-xl font-bold" onChange={e => setFormData({...formData, uptime: e.target.value})} />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-xs font-black text-red-600 uppercase tracking-widest mb-4">Technical Data ({currentElement})</h3>
            <div className="grid grid-cols-2 gap-4">
              {fields.map(f => (
                <div key={f} className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-1">{f.replace('_', ' ')}</label>
                  <input className="w-full p-2 bg-gray-50 border rounded-lg text-sm font-bold" onChange={e => setTechData({...techData, [f]: e.target.value})} />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-black transition-all">
            Save to Database
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSiteModal;