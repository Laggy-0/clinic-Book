import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import ScrollAnimation from "../../components/ScrollAnimation";
import { getAdminStats } from "../../api/adminApi";

const statCards = [
  { key: "users", label: "المستخدمون", icon: "👥", gradient: "from-blue-500 to-blue-700" },
  { key: "doctors", label: "الأطباء", icon: "🩺", gradient: "from-emerald-500 to-emerald-700" },
  { key: "appointments", label: "المواعيد", icon: "📋", gradient: "from-violet-500 to-violet-700" },
  { key: "revenue", label: "الإيرادات", icon: "💰", gradient: "from-amber-500 to-amber-700", prefix: "$" },
  { key: "completed", label: "المكتملة", icon: "✅", gradient: "from-teal-500 to-teal-700" },
  { key: "pending", label: "قيد الانتظار", icon: "⏳", gradient: "from-rose-500 to-rose-700" },
];

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try { const data = await getAdminStats(); setStats(data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ScrollAnimation variant="fade-up">
          <div className="relative overflow-hidden bg-gradient-to-l from-slate-800 via-slate-900 to-gray-900 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-slate-300/30 mb-10">
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-slate-400 text-sm font-medium mb-1">لوحة تحكم المشرف</p>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">أهلاً بعودتك، {"المشرف"}</h1>
              <p className="text-slate-300 text-sm max-w-lg">نظرة شاملة على منصة العيادة. راقب المستخدمين، الإيرادات، والمواعيد في لمحة.</p>
            </div>
          </div>
        </ScrollAnimation>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {[...Array(6)].map((_, i) => <div key={i} className="h-36 rounded-2xl bg-gray-200 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {statCards.map((card, i) => (
              <ScrollAnimation key={card.key} variant="fade-up" delay={i * 80}>
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-bl ${card.gradient} p-6 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default`}>
                  <div className="absolute -top-6 -left-6 w-28 h-28 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                  <div className="relative z-10">
                    <span className="text-3xl">{card.icon}</span>
                    <p className="mt-3 text-sm font-medium text-white/80">{card.label}</p>
                    <p className="mt-1 text-4xl font-black">{card.prefix || ""}{typeof stats[card.key] === "number" ? stats[card.key].toLocaleString() : stats[card.key] ?? 0}</p>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        )}

        <ScrollAnimation variant="fade-up" delay={500}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { to: "/admin/users", label: "إدارة المستخدمين", desc: "بحث، فلترة وتعديل", icon: "👥" },
              { to: "/admin/doctors", label: "إدارة الأطباء", desc: "عرض الملفات والتقييمات", icon: "🩺" },
              { to: "/admin/specialties", label: "التخصصات", desc: "إنشاء، تعديل وحذف", icon: "🏥" },
              { to: "/admin/appointments", label: "المواعيد", desc: "الإشراف على جميع الحجوزات", icon: "📅" },
            ].map((item) => (
              <Link key={item.to} to={item.to}
                className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 no-underline">
                <span className="text-3xl group-hover:scale-110 transition-transform inline-block">{item.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-gray-800 group-hover:text-violet-600 transition-colors">{item.label}</h3>
                <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
              </Link>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}
