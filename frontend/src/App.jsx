import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import MapSelector from './pages/maps/MapSelector'; // Import Pintu Utama Map
import TableSelect from './pages/tables/TableSelector'; // IMPORT BARU: Folder tables
import Login from './pages/Login'; 
import Navbar from './components/Navbar';
import Profile from './pages/Profile';

// Fungsi proteksi halaman
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Login tidak pakai Navbar */}
        <Route path="/login" element={<Login />} />

        {/* Semua halaman di bawah ini diproteksi dan pakai Navbar */}
        <Route path="/" element={
          <ProtectedRoute>
            <Navbar />
            <Home />
          </ProtectedRoute>
        } />
        
        {/* 
            MapSelector: Menentukan element map yang dibuka (Adc, Mss, Ggsn, dll)
        */}
        <Route path="/map/:element" element={
          <ProtectedRoute>
            <Navbar />
            <MapSelector />
          </ProtectedRoute>
        } />

        {/* 
            PERBAIKAN DETAIL PROVINSI/KOTA:
            Menggunakan TableSelect (Selector pusat yang mengarahkan ke file MssTable, AdcTable, dll)
        */}
        <Route path="/detail/:element/:region" element={
          <ProtectedRoute>
            <Navbar />
            <TableSelect isRegional={false} />
          </ProtectedRoute>
        } />

        {/* 
            PERBAIKAN DETAIL REGIONAL/CLUSTER:
            Juga menggunakan TableSelect dengan props isRegional=true
        */}
        <Route path="/regional/:element/:regionalName" element={
          <ProtectedRoute>
            <Navbar />
            <TableSelect isRegional={true} /> 
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Navbar />
            <Profile />
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;