import { Routes, Route } from "react-router-dom";

// Public Pages
import WelcomePage from "./pages/welcomepage/Welcomepage";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";

// Protected Pages
import PatientDashboard from "./pages/patientDashboard/PatientDashboard";
import DoctorSearch from "./pages/doctorsearch/DoctorSearch";
import DoctorProfile from "./pages/doctorProfile/DoctorProfile";
import MyAppointments from "./pages/MyAppointments/MyAppointments";
import Profile from "./pages/profile/Profile";
import DoctorDashboard from "./pages/doctorDashboard/DoctorDashboard";

// Security Wrapper
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes (No login required) */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes (Must have a JWT token to access) */}
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
    </Routes>
  );
}

export default App;