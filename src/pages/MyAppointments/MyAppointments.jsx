import { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import ScrollAnimation from "../../components/ScrollAnimation";
import toast from "react-hot-toast";
import {
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  submitReview,
} from "../../api/appointmentApi";

const statusAr = { pending: "قيد الانتظار", confirmed: "مؤكد", "in-progress": "جاري", completed: "مكتمل", cancelled: "ملغي" };
const statusStyle = {
  pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-blue-100 text-blue-700",
  "in-progress": "bg-amber-100 text-amber-700", completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle[status?.toLowerCase()] || "bg-gray-100 text-gray-700"}`}>
    {statusAr[status] || status || "غير معروف"}
  </span>
);

const PatientView = ({ appointments, refreshData }) => {
  const [reviewingId, setReviewingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewedAppts, setReviewedAppts] = useState(new Set());

  const handleCancel = async (id) => {
    if (!window.confirm("هل تريد إلغاء هذا الموعد؟")) return;
    const toastId = toast.loading("جاري الإلغاء...");
    try { await updateAppointmentStatus(id, "cancelled"); toast.success("تم إلغاء الموعد.", { id: toastId }); refreshData(); }
    catch { toast.error("فشل إلغاء الموعد.", { id: toastId }); }
  };

  const handleReviewSubmit = async (appointmentId) => {
    const toastId = toast.loading("جاري إرسال المراجعة...");
    try {
      await submitReview(appointmentId, { rating, comment });
      toast.success("تم إرسال المراجعة بنجاح!", { id: toastId });
      setReviewedAppts((prev) => new Set([...prev, appointmentId]));
      setReviewingId(null); setRating(5); setComment("");
    } catch (err) { toast.error(err.response?.data?.message || "فشل الإرسال", { id: toastId }); }
  };

  if (appointments.length === 0) return <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300"><p className="text-gray-500 text-lg">لا توجد مواعيد.</p></div>;

  return (
    <div className="space-y-4">
      {appointments.map((appt) => (
        <div key={appt.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-sm overflow-hidden">
                <img src="/doctor-char.png" className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{appt.doctor?.user?.name || "طبيب"}</h3>
                <p className="text-blue-600 text-xs font-bold">{appt.doctor?.specialty?.name || "عام"}</p>
                <p className="text-gray-500 text-sm mt-1">{appt.slot?.date || "—"} · {appt.slot?.start_time || "—"}</p>
              </div>
            </div>
            <StatusBadge status={appt.status} />
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">{appt.type === "video" ? "فيديو" : "عيادة"}</span>
              <span className="font-bold text-gray-800">${parseFloat(appt.total_fee || 0).toFixed(0)}</span>
            </div>
            <div className="flex gap-2">
              {["pending", "confirmed"].includes(appt.status) && (
                <button onClick={() => handleCancel(appt.id)} className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition cursor-pointer">إلغاء</button>
              )}
              {appt.status === "completed" && !reviewedAppts.has(appt.id) && !appt.review && (
                <button onClick={() => setReviewingId(reviewingId === appt.id ? null : appt.id)}
                  className="px-4 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm font-bold hover:bg-amber-100 transition cursor-pointer">
                  {reviewingId === appt.id ? "إخفاء" : "أضف مراجعة"}
                </button>
              )}
            </div>
          </div>

          {reviewingId === appt.id && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1">التقييم</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRating(s)} className="text-2xl cursor-pointer transition-transform hover:scale-110">
                      {s <= rating ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1">التعليق (اختياري)</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="شاركنا تجربتك..." />
              </div>
              <button onClick={() => handleReviewSubmit(appt.id)} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition cursor-pointer">إرسال المراجعة</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const DoctorView = ({ appointments, refreshData }) => {
  const handleStatusChange = async (id, newStatus) => {
    const toastId = toast.loading("جاري التحديث...");
    try { await updateAppointmentStatus(id, newStatus); toast.success(`تم التحديث إلى ${statusAr[newStatus]}`, { id: toastId }); refreshData(); }
    catch { toast.error("فشل تحديث الحالة", { id: toastId }); }
  };

  if (appointments.length === 0) return <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300"><p className="text-gray-500 text-lg">لا توجد مواعيد.</p></div>;

  return (
    <div className="space-y-4">
      {appointments.map((appt) => (
        <div key={appt.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 text-white flex items-center justify-center text-lg font-bold shadow-sm overflow-hidden">
                <img src="/patient-char.png" className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{appt.patient?.name || "مريض"}</h3>
                <p className="text-gray-500 text-sm">{appt.slot?.date || "—"} · {appt.slot?.start_time || "—"}</p>
              </div>
            </div>
            <StatusBadge status={appt.status} />
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span className="text-gray-600 text-sm">{appt.type === "video" ? "فيديو" : "عيادة"} · <span className="font-bold text-gray-800">${parseFloat(appt.total_fee || 0).toFixed(0)}</span></span>
            <div className="flex gap-2">
              {appt.status === "pending" && (
                <>
                  <button onClick={() => handleStatusChange(appt.id, "confirmed")} className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition cursor-pointer">قبول</button>
                  <button onClick={() => handleStatusChange(appt.id, "cancelled")} className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition cursor-pointer">رفض</button>
                </>
              )}
              {appt.status === "confirmed" && (
                <button onClick={() => handleStatusChange(appt.id, "in-progress")} className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-100 transition cursor-pointer">بدء الجلسة</button>
              )}
              {appt.status === "in-progress" && (
                <button onClick={() => handleStatusChange(appt.id, "completed")} className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition cursor-pointer">إتمام</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function MyAppointments() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "patient";
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = role === "doctor" ? await getDoctorAppointments() : await getPatientAppointments();
      setAppointments(data.appointments || data || []);
    } catch { toast.error("فشل تحميل المواعيد"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const filteredAppointments = filterStatus === "all" ? appointments : appointments.filter(a => a.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-8">
        <ScrollAnimation variant="fade-up">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">مواعيدي</h1>
            <p className="text-gray-500 text-sm mt-1">عرض {filteredAppointments.length} من {appointments.length} موعد</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "confirmed", "in-progress", "completed", "cancelled"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium border cursor-pointer transition ${filterStatus === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                {s === "all" ? "الكل" : statusAr[s] || s}
              </button>
            ))}
          </div>
        </div>
        </ScrollAnimation>

        {loading ? (
          <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        ) : (
          <ScrollAnimation variant="fade-up" delay={150}>
            {role === "doctor" ? (
              <DoctorView appointments={filteredAppointments} refreshData={fetchAppointments} />
            ) : (
              <PatientView appointments={filteredAppointments} refreshData={fetchAppointments} />
            )}
          </ScrollAnimation>
        )}
      </div>
    </div>
  );
}