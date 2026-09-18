export const API_URL = "http://localhost:5000/api";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("enem_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};
