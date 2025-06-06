import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  use,
} from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    console.log("Initializing authentication...");
    const initializeAuth = async () => {
      try {
        console.log("Checking local storage for auth token and user...");
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          try {
            const decoded = jwtDecode(storedToken);
            console.log(decoded);
            const { exp } = decoded;
            const isExpired = Date.now() >= exp * 1000;
            console.log("Is token expired?", isExpired);
            const currentTime = Date.now() / 1000;

            if (decoded.exp && decoded.exp < currentTime) {
              navigate("/");
              throw new Error("Token expired");
            }

            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${storedToken}`;

            setUser(JSON.parse(storedUser));
          } catch (error) {
            console.error("Invalid or expired token:", error);
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", userData);

      if (!response.data || !response.data.token) {
        throw new Error("Invalid response from server");
      }

      const token = response.data.token;

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("authToken", token);

      const decoded = jwtDecode(token);
      console.log(decoded);

      const { jti, email, name, sub } = decoded;

      const curUser = {
        userId: jti,
        email,
        name,
        role: sub,
      };

      localStorage.setItem("user", JSON.stringify(curUser));
      setUser(curUser);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed");
      return { success: false, error: error.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    delete api.defaults.headers.common["Authorization"];

    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    navigate("/");

    setUser(null);
  };

  const RequireAuth = ({ children }) => {
    if (loading) return <div>Loading authentication...</div>;
    if (!user) return <Navigate to="/" />;
    return children;
  };

  return (
    <>
      <AuthContext.Provider
        value={{
          user,
          setUser,
          login,
          logout,
          loading,
          error,
          RequireAuth,
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
};

export const useAuth = () => useContext(AuthContext);
