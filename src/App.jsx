import { Routes, Route } from "react-router-dom";

import WelcomePage from "./pages/welcomepage/Welcomepage";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";

import PatientDashboard from "./pages/patientDashboard/PatientDashboard";
import DoctorSearch from "./pages/doctorsearch/DoctorSearch";
import DoctorProfile from "./pages/doctorProfile/DoctorProfile";
import MyAppointments from "./pages/MyAppointments/MyAppointments";
import Profile from "./pages/profile/Profile";
import DoctorDashboard from "./pages/doctorDashboard/DoctorDashboard";

import AdminDashboard from "./pages/adminDashboard/AdminDashboard";
import AdminUsers from "./pages/adminUsers/AdminUsers";
import AdminDoctors from "./pages/adminDoctors/AdminDoctors";
import AdminSpecialties from "./pages/adminSpecialties/AdminSpecialties";
import AdminAppointments from "./pages/adminAppointments/AdminAppointments";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/patient-dashboard"
        element={
          <ProtectedRoute>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoute>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor-search"
        element={
          <ProtectedRoute>
            <DoctorSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/:id"
        element={
          <ProtectedRoute>
            <DoctorProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-appointments"
        element={
          <ProtectedRoute>
            <MyAppointments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <AdminRoute>
            <AdminDoctors />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/specialties"
        element={
          <AdminRoute>
            <AdminSpecialties />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <AdminRoute>
            <AdminAppointments />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;