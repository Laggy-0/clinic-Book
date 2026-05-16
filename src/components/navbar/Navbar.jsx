import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "patient";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #E2E8F0",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link 
          to={role === "admin" ? "/admin" : role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard"} 
          style={{ textDecoration: "none" }}
        >
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>
            <span style={{ color: "#2563eb" }}>Clinic</span>
            <span style={{ color: "#10b981" }}>Care</span>
          </span>
        </Link>

        {/* Right side - Dynamic Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          
          {role === "patient" && (
            <>
              <Link to="/doctor-search" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500, color: "#3d4947", textDecoration: "none" }}>
                Find Doctors
              </Link>
              <Link to="/my-appointments" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500, color: "#3d4947", textDecoration: "none" }}>
                My Appointments
              </Link>
            </>
          )}

          {role === "doctor" && (
            <>
              {user?.doctorProfile?.id && (
                <Link to={`/doctor/${user.doctorProfile.id}`} style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500, color: "#3d4947", textDecoration: "none" }}>
                  Patient POV
                </Link>
              )}
              <Link to="/my-appointments" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500, color: "#3d4947", textDecoration: "none" }}>
                My Appointments
              </Link>
            </>
          )}

          {role === "admin" && (
            <>
              <Link to="/admin/users" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500, color: "#3d4947", textDecoration: "none" }}>Users</Link>
              <Link to="/admin/doctors" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500, color: "#3d4947", textDecoration: "none" }}>Doctors</Link>
              <Link to="/admin/specialties" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500, color: "#3d4947", textDecoration: "none" }}>Specialties</Link>
              <Link to="/admin" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500, color: "#3d4947", textDecoration: "none" }}>Appointments</Link>
              <Link to="/admin/reviews" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500, color: "#3d4947", textDecoration: "none" }}>Reviews</Link>
            </>
          )}

          {/* Profile & Logout */}
          <Link to="/profile" title="Go to Profile">
            {user?.profile_picture ? (
              <img 
                src={user.profile_picture} 
                alt="Avatar" 
                style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #10b981" }} 
              />
            ) : (
              <div
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "#10b981", color: "#fff",
                  fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
          </Link>

          <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 14, fontWeight: 600 }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}