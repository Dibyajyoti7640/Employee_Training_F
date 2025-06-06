import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, role }) => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");

    if (!user) {
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } else {
      setIsAuthorized(true);
    }
    setLoading(false);
  }, [user, setUser]);

  if (loading) return <div>Loading...</div>;

  if (!user && !isAuthorized) {
    return <Navigate to="/" />;
  }

  if (user && role && user.role !== role) {
    return <div className="p-4 text-red-600">Unauthorized Access</div>;
  }

  return children;
};

export default PrivateRoute;
