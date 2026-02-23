import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import MapSelector from './pages/maps/MapSelector'; // Import Pintu Utama Map
import DetailTable from './pages/DetailTable';
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
            PERBAIKAN DI SINI: 
            Gunakan MapSelector sebagai pengganti MapView.
            MapSelector lah yang akan menentukan apakah akan menampilkan 
            AdcMap, MssMap, atau StandardMap berdasarkan elemen yang di-klik.
        */}
        <Route path="/map/:element" element={
          <ProtectedRoute>
            <Navbar />
            <MapSelector />
          </ProtectedRoute>
        } />

        <Route path="/detail/:element/:region" element={
          <ProtectedRoute>
            <Navbar />
            <DetailTable />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Navbar />
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/regional/:element/:regionalName" element={
          <ProtectedRoute>
            <Navbar />
            <DetailTable isRegional={true} /> 
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;