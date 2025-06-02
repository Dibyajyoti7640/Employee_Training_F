import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { user, setUser } = useAuth();
  if (!user) {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');

    if (storedToken == "") {
      <Navigate to="/" />;
    }

    console.log(storedToken, storedUser)

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    } else {

      console.log("User not found")
      return <Navigate to="/" />;
    }
  }
  else if (user.role !== role) {
    return <div className="p-4 text-red-600">Unauthorized Access</div>;
  }


  return children;
};

export default PrivateRoute;
