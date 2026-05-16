import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "patient";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    color: isActive(path) ? "#2563eb" : "#4b5563",
    textDecoration: "none",
    padding: "6px 14px",
    borderRadius: "8px",
    transition: "all 0.2s",
    background: isActive(path) ? "rgba(37, 99, 235, 0.08)" : "transparent",
  });

  const roleCharImg = role === "admin" ? "/admin-char.png" : role === "doctor" ? "/doctor-char.png" : "/patient-char.png";

  return (
    <nav
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(226,232,240,0.8)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 8px rgba(15,23,42,0.04)",
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
        <Link
          to={role === "admin" ? "/admin" : role === "doctor" ? "/doctor-dashboard" : "/patient-dashboard"}
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}
        >
          <img src="/logo.png" alt="شفاء" style={{ height: 55, width: "auto", objectFit: "contain" }} />
          <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: 26, fontWeight: 800, color: "#2563eb" }}>
            شفاء
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

          {role === "patient" && (
            <>
              <Link to="/doctor-search" style={linkStyle("/doctor-search")}>البحث عن طبيب</Link>
              <Link to="/my-appointments" style={linkStyle("/my-appointments")}>مواعيدي</Link>
            </>
          )}

          {role === "doctor" && (
            <>
              {user?.doctorProfile?.id && (
                <Link to={`/doctor/${user.doctorProfile.id}`} style={linkStyle(`/doctor/${user.doctorProfile.id}`)}>عرض ملفي</Link>
              )}
              <Link to="/my-appointments" style={linkStyle("/my-appointments")}>مواعيدي</Link>
            </>
          )}

          {role === "admin" && (
            <>
              <Link to="/admin" style={linkStyle("/admin")}>لوحة التحكم</Link>
              <Link to="/admin/users" style={linkStyle("/admin/users")}>المستخدمون</Link>
              <Link to="/admin/doctors" style={linkStyle("/admin/doctors")}>الأطباء</Link>
              <Link to="/admin/specialties" style={linkStyle("/admin/specialties")}>التخصصات</Link>
              <Link to="/admin/appointments" style={linkStyle("/admin/appointments")}>المواعيد</Link>
            </>
          )}

          <div style={{ width: 1, height: 28, background: "#e2e8f0", margin: "0 8px" }} />

          <Link to="/profile" title="الملف الشخصي">
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="الصورة"
                style={{
                  width: 36, height: 36, borderRadius: "50%", objectFit: "cover",
                  border: "2px solid #10b981", transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              />
            ) : (
              <img
                src={roleCharImg}
                alt="الصورة"
                style={{
                  width: 38, height: 38, borderRadius: "50%", objectFit: "cover",
                  border: "2px solid #10b981", transition: "transform 0.2s", cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              />
            )}
          </Link>

          <button
            onClick={handleLogout}
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "none", cursor: "pointer",
              color: "#ef4444", fontSize: 13, fontWeight: 700,
              padding: "6px 14px", borderRadius: "8px",
              transition: "all 0.2s", fontFamily: "'Cairo', sans-serif",
            }}
            onMouseEnter={(e) => { e.target.style.background = "rgba(239,68,68,0.15)"; }}
            onMouseLeave={(e) => { e.target.style.background = "rgba(239,68,68,0.08)"; }}
          >
            تسجيل خروج
          </button>
        </div>
      </div>
    </nav>
  );
}