import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem("enem_user");
        const storedToken = localStorage.getItem("enem_token");

        if (storedToken) {
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          // Sincroniza dados atualizados direto do banco (cursoAlvo, faculdadeAlvo, pesos)
          try {
            const res = await fetch(`${API_URL}/users/profile`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${storedToken}`
              }
            });
            if (res.ok) {
              const freshData = await res.json();
              const mergedUser = {
                ...(storedUser ? JSON.parse(storedUser) : {}),
                ...freshData,
                token: storedToken
              };
              setUser(mergedUser);
              localStorage.setItem("enem_user", JSON.stringify(mergedUser));
            }
          } catch (fetchErr) {
            console.warn("Não foi possível sincronizar perfil remoto:", fetchErr.message);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados de autenticação:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("enem_user", JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem("enem_token", userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("enem_user");
    localStorage.removeItem("enem_token");
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem("enem_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export default AuthContext;
