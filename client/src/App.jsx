import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Notes from './pages/Notes';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/notes" /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/notes" element={token ? <Notes /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
