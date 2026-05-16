import { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import ScrollAnimation from "../../components/ScrollAnimation";
import { getPatientAppointments } from "../../api/appointmentApi";
import { useNavigate } from "react-router-dom";

const statusStyle = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  "in-progress": "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const statusAr = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  "in-progress": "جاري",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const tips = [
  { icon: "💧", text: "اشرب 8 أكواب ماء يومياً للحفاظ على ترطيب جسمك ونشاطك!" },
  { icon: "🏃", text: "30 دقيقة مشي يومياً تقلل خطر أمراض القلب بنسبة 35%." },
  { icon: "😴", text: "البالغون يحتاجون 7-9 ساعات نوم. وقت نوم ثابت يحسّن الجودة." },
  { icon: "🍎", text: "تناول 5 حصص من الفواكه والخضروات يومياً للتغذية المثالية." },
];

export default function PatientDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const tip = tips[Math.floor(Math.random() * tips.length)];

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getPatientAppointments();
        setAppointments(data.appointments || data || []);
      } catch (error) {
        console.error("Failed to load appointments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const upcoming = appointments.filter((a) =>
    ["pending", "confirmed", "in-progress"].includes(a.status?.toLowerCase())
  );
  const completedCount = appointments.filter((a) => a.status === "completed").length;

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "صباح الخير" : h < 18 ? "مساء الخير" : "مساء النور";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ScrollAnimation variant="fade-up">
          <div className="relative overflow-hidden bg-gradient-to-l from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-blue-200/50 mb-8">
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">{getGreeting()},</p>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                  {user?.name || "المريض"}
                </h1>
                <p className="text-blue-100 text-sm max-w-md">
                  لوحة متابعة صحتك. تابع مواعيدك، ابحث عن أطباء، وابقَ على اطلاع برحلتك الصحية.
                </p>
              </div>
              <button
                onClick={() => navigate("/doctor-search")}
                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-lg cursor-pointer whitespace-nowrap"
              >
                ابحث عن طبيب
              </button>
            </div>
          </div>
        </ScrollAnimation>

        <ScrollAnimation variant="fade-up" delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "إجمالي الحجوزات", value: appointments.length, icon: (<svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), color: "from-blue-500 to-blue-600" },
              { label: "القادمة", value: upcoming.length, icon: (<svg className="w-7 h-7 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>), color: "from-violet-500 to-violet-600" },
              { label: "المكتملة", value: completedCount, icon: (<svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), color: "from-emerald-500 to-emerald-600" },
              { label: "نشطة الآن", value: appointments.filter((a) => a.status === "in-progress").length, icon: (<svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>), color: "from-amber-500 to-amber-600" },
            ].map((stat, i) => (
              <div key={i} className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group">
                <div className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-l ${stat.color}`} />
                <span>{stat.icon}</span>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mt-2">{stat.label}</p>
                <p className="text-3xl font-black text-gray-800 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        </ScrollAnimation>

        <ScrollAnimation variant="fade-right" delay={200}>
          <div className="bg-gradient-to-l from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <span className="text-3xl">{tip.icon}</span>
            <div>
              <h3 className="font-bold text-emerald-800 text-sm uppercase tracking-wider mb-1">💡 نصيحة صحية لليوم</h3>
              <p className="text-emerald-700 text-sm leading-relaxed">{tip.text}</p>
            </div>
          </div>
        </ScrollAnimation>

        <ScrollAnimation variant="fade-up" delay={300}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">الحجوزات القادمة</h2>
              <button
                onClick={() => navigate("/my-appointments")}
                className="text-blue-600 text-sm font-semibold hover:underline cursor-pointer"
              >
                عرض الكل ←
              </button>
            </div>

            {loading ? (
              <div className="p-8 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-16 px-6">
                <span className="text-5xl block mb-4">📭</span>
                <p className="text-gray-400 text-lg font-medium">لا توجد مواعيد قادمة</p>
                <p className="text-gray-300 text-sm mt-1">احجز أول موعد لك للبدء</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {upcoming.slice(0, 5).map((appt, index) => (
                  <ScrollAnimation key={appt.id} variant="fade-left" delay={index * 80}>
                    <div className="px-6 py-5 flex items-center justify-between hover:bg-blue-50/30 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-sm shadow-blue-200 group-hover:scale-105 transition-transform overflow-hidden">
                          <img src="/doctor-char.png" className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{appt.doctor?.user?.name || "طبيب"}</h4>
                          <p className="text-gray-500 text-sm">
                            {appt.slot?.date || "—"} · {appt.slot?.start_time || "—"}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusStyle[appt.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {statusAr[appt.status] || appt.status}
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