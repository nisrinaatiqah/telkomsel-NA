import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // LOGIKA DUMMY: Username & Pass apa saja bisa masuk
    if (username === 'admin' && password === 'telkomsel123') {
      localStorage.setItem('isLoggedIn', 'true'); // Simpan status login di browser
      navigate('/');
    } else {
      alert('Username atau Password salah! (Gunakan admin / telkomsel123)');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border-t-[12px] border-red-600">
        <div className="p-10">
          <div className="text-center mb-10">
            <img src="/logo-telkomsel.png" alt="Logo" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase">
              Network Architecture
            </h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
              Secure Access Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Username"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:border-red-600 focus:outline-none transition-all font-bold"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-12 focus:border-red-600 focus:outline-none transition-all font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button 
              type="submit"
              className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-200 hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
            >
              Sign In
            </button>
          </form>
        </div>
        <div className="bg-gray-50 py-6 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
            © 2026 PT Telkomsel Indonesia Tbk. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;