import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Board from './pages/Board';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <div className="min-h-screen flex flex-col bg-[#040507]">
      <main className="flex-1 w-full flex flex-col">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/board" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/board" element={isAuthenticated ? <Board /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
