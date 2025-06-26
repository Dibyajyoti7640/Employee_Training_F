import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../Slices/AuthSlice";

const PrivateRoute = ({ children, role }) => {
  const { user, isInitialized } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");

    if (!user && storedUser && storedToken) {
      dispatch(setUser(JSON.parse(storedUser)));
      setIsAuthorized(true);
    } else if (user) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }

    setLoading(false);
  }, [user, dispatch]);

  if (loading || !isInitialized) return <div>Loading...</div>;

  if (!isAuthorized) return <Navigate to="/" replace />;

  if (role && user?.role !== role) {
    return <div className="p-4 text-red-600">Unauthorized Access</div>;
  }

  return children;
};

export default PrivateRoute;
