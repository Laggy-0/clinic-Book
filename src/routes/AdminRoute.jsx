import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== "admin") {

    const dest = user?.role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard";
    return <Navigate to={dest} replace />;
  }

  return children;
}
