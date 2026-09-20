import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";

// Layouts
import PublicLayout from "./components/PublicLayout";
import AppLayout from "./components/AppLayout";

// Páginas
import PaginaInicial from "./pages/PaginaInicial";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Simulados from "./pages/Simulados";
import Profile from "./pages/Profile";

// Rota protegida: apenas para usuário logado
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Rota de visitante: apenas para usuário deslogado
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Carregando...</div>;
  if (user) return <Navigate to="/home" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas com Navbar no topo e Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PaginaInicial />} />
        <Route 
          path="/login" 
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          } 
        />
      </Route>

      {/* Rotas Privadas com Painel Lateral (Sidebar) */}
      <Route 
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/simulados" element={<Simulados />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Rota coringa */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}
