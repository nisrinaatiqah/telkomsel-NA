import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronDown, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearInterval(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  // Format Tanggal: 28 Januari 2026 (Tidak disingkat)
  const fullDate = currentTime.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Format Jam: 10.30.45 WIB
  const fullTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/:/g, '.') + " WIB";

  return (
    // py-3: Ukuran pas, tidak setebal py-4, tidak se-tipis py-2
    <nav className="bg-white border-b-8 border-red-600 px-10 py-3 flex justify-between items-center shadow-xl sticky top-0 z-[5000] w-full font-sans">
      
      {/* SISI KIRI: Logo & Judul Ramping */}
      <div className="flex items-center gap-5">
        {/* h-16 (64px) adalah ukuran logo standar website profesional */}
        <img 
          src="/logo-telkomsel.png" 
          alt="Telkomsel Logo" 
          className="h-16 w-auto object-contain cursor-pointer transition-transform hover:opacity-80" 
          onClick={() => navigate('/')}
        />
        
        <div className="h-10 w-[1px] bg-gray-100 ml-2 hidden md:block"></div>
        
        <div className="hidden md:block">
          {/* text-base (16px): Ukuran font ideal untuk dashboard */}
          <h2 className="text-gray-900 font-black text-base tracking-tight uppercase leading-none italic">
            Network Architecture
          </h2>
          <p className="text-red-600 font-bold text-[9px] tracking-[0.25em] uppercase mt-1">
            Data Potensi Nasional
          </p>
        </div>
      </div>
      
      {/* SISI KANAN: Waktu & Profil */}
      <div className="flex items-center gap-8">
        
        {/* WAKTU: Tanggal Atas, Jam Bawah, Font sama dengan judul */}
        <div className="text-right leading-none border-r border-gray-100 pr-8">
          <p className="text-[10px] font-black text-gray-900 uppercase italic tracking-tighter mb-1.5">
            {fullDate}
          </p>
          <p className="text-base font-black text-red-600 tabular-nums tracking-tighter italic">
            {fullTime}
          </p>
        </div>

        {/* PROFIL DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-1 pr-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-all border border-gray-100 shadow-sm group"
          >
            {/* FOTO PROFIL DUMMY */}
            <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md overflow-hidden">
               <User size={20} />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[10px] font-black text-gray-900 leading-none">ADMIN</p>
              <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Architecture</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* MENU DROPDOWN MEWAH */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden py-2 animate-in fade-in zoom-in duration-200">
              <div className="px-5 py-4 border-b border-gray-50 mb-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                <p className="text-sm font-black text-gray-800 tracking-tight italic">Super Admin</p>
              </div>
              
              <button 
                onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <ShieldCheck size={18} className="text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-tight">Akun Saya</span>
              </button>

              <div className="h-[1px] bg-gray-50 my-1 mx-5"></div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-red-50 text-red-600 transition-colors"
              >
                <LogOut size={18} />
                <span className="text-xs font-black uppercase tracking-tight">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;