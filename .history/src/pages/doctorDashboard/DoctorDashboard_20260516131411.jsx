import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import ScrollAnimation from "../../components/ScrollAnimation";
import { getDoctorEarnings } from "../../api/doctorApi";
import { getDoctorAppointments } from "../../api/appointmentApi";

const statusStyle = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  "in-progress": "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const profile = user?.doctorProfile || {};
  const navigate = useNavigate();

  const [stats, setStats] = useState({ appointments_count: 0, total_earnings: 0, avg_rating: profile.avg_rating || "0.0" });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [earningsData, apptsData] = await Promise.all([
          profile.id ? getDoctorEarnings(profile.id).catch(() => ({})) : Promise.resolve({}),
          getDoctorAppointments().catch(() => []),
        ]);
        setStats((prev) => ({ ...prev, ...earningsData }));
        const apptsArray = apptsData.appointments || apptsData || [];
        setAppointments(apptsArray);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      }
      setLoading(false);
    };
    fetchData();
  }, [profile.id]);

  const upcoming = appointments.filter((a) =>
    ["pending", "confirmed", "in-progress"].includes(a.status?.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Banner */}
        <ScrollAnimation variant="fade-up">
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-emerald-200/50 mb-8">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-emerald-200 text-sm font-medium mb-1">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},</p>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                 {user?.name}
              </h1>
              <p className="text-emerald-100 text-sm max-w-lg">
                Your practice dashboard. Monitor appointments, track earnings, and manage your schedule efficiently.
              </p>
            </div>
          </div>
        </ScrollAnimation>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-gray-200 animate-pulse" />)}
          </div>
        ) : (
          <ScrollAnimation variant="fade-up" delay={100}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Appointments", value: stats.appointments_count, icon: "📋", gradient: "from-blue-500 to-blue-600" },
                { label: "Total Earnings", value: `$${stats.total_earnings}`, icon: "💰", gradient: "from-emerald-500 to-emerald-600" },
                { label: "Avg Rating", value: parseFloat(stats.avg_rating).toFixed(1), icon: "⭐", gradient: "from-amber-400 to-amber-500", suffix: "★" },
                { label: "Pending", value: appointments.filter((a) => a.status === "pending").length, icon: "⏳", gradient: "from-violet-500 to-violet-600" },
              ].map((card, i) => (
                <div key={i} className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.gradient}`} />
                  <span className="text-2xl">{card.icon}</span>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mt-2">{card.label}</p>
                  <p className="text-3xl font-black text-gray-800 mt-1">
                    {card.value} {card.suffix && <span className="text-yellow-400 text-xl">{card.suffix}</span>}
                  </p>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        )}

        {/* Quick Actions */}
        <ScrollAnimation variant="fade-up" delay={200}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Manage Schedule", desc: "Add or remove time slots", icon: "🗓️", to: "/profile" },
              { label: "My Appointments", desc: "Accept or manage bookings", icon: "📋", to: "/my-appointments" },
              { label: "View My Profile", desc: "See how patients view you", icon: "👤", to: profile.id ? `/doctor/${profile.id}` : "/profile" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left group cursor-pointer"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform inline-block">{action.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">{action.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
              </button>
            ))}
          </div>
        </ScrollAnimation>

        {/* Upcoming Appointments */}
        <ScrollAnimation variant="fade-up" delay={300}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
              <button onClick={() => navigate("/my-appointments")} className="text-emerald-600 text-sm font-semibold hover:underline cursor-pointer">
                View All →
              </button>
            </div>

            {upcoming.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">📭</span>
                <p className="text-gray-400 text-lg font-medium">Your schedule is currently clear</p>
                <p className="text-gray-300 text-sm mt-1">Patients will appear here when they book</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {upcoming.slice(0, 5).map((appt, index) => (
                  <ScrollAnimation key={appt.id} variant="fade-left" delay={index * 80}>
                    <div className="px-6 py-5 flex items-center justify-between hover:bg-emerald-50/30 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 text-white flex items-center justify-center text-lg font-bold shadow-sm group-hover:scale-105 transition-transform">
                          {appt.patient?.name?.charAt(0).toUpperCase() || "P"}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{appt.patient?.name || "Patient"}</h4>
                          <p className="text-gray-500 text-sm">
                            {appt.slot?.date || "—"} · {appt.slot?.start_time || "—"}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusStyle[appt.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {appt.status?.toUpperCase()}
                      </span>
                    </div>
                  </ScrollAnimation>
                ))}
              </div>
            )}
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}