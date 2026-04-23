import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Register  from './pages/Register';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';

function PrivateRoute({ children }) {
  const { student } = useAuth();
  return student ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}