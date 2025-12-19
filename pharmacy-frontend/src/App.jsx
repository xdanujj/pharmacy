import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import MedicineList from './components/MedicineList';
import AddMedicine from './components/AddMedicine';
import PrescriptionList from './components/PrescriptionList';
import PrescriptionDetail from './components/PrescriptionDetail';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" />
          ) : (
            <Login setIsAuthenticated={setIsAuthenticated} />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" />
          ) : (
            <Register />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Dashboard onSignOut={handleSignOut} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/medicines"
        element={
          isAuthenticated ? (
            <MedicineList onSignOut={handleSignOut} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/medicines/add"
        element={
          isAuthenticated ? (
            <AddMedicine onSignOut={handleSignOut} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/prescriptions"
        element={
          isAuthenticated ? (
            <PrescriptionList onSignOut={handleSignOut} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/prescriptions/:id"
        element={
          isAuthenticated ? (
            <PrescriptionDetail onSignOut={handleSignOut} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;