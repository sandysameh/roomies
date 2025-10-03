import React from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  console.log("here", user);

  return <>{children}</>;
};

export default ProtectedRoute;
