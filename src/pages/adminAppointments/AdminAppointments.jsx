import { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import ScrollAnimation from "../../components/ScrollAnimation";
import toast from "react-hot-toast";
import { getPatientAppointments, updateAppointmentStatus } from "../../api/appointmentApi";

const STATUSES = ["", "pending", "confirmed", "in-progress", "completed", "cancelled"];
const statusAr = { pending: "قيد الانتظار", confirmed: "مؤكد", "in-progress": "جاري", completed: "مكتمل", cancelled: "ملغي" };
const statusStyle = {
  pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-blue-100 text-blue-700",
  "in-progress": "bg-indigo-100 text-indigo-700", completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [changingId, setChangingId] = useState(null);

  const fetchAppointments = async () => { setLoading(true); try { const data = await getPatientAppointments(); setAppointments(Array.isArray(data) ? data : data.appointments || []); } catch { toast.error("فشل تحميل المواعيد"); } finally { setLoading(false); } };
  useEffect(() => { fetchAppointments(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    setChangingId(id);
    try { await updateAppointmentStatus(id, newStatus); toast.success(`تم التحديث إلى ${statusAr[newStatus]}`); fetchAppointments(); }
    catch (err) { toast.error(err.response?.data?.message || "فشل التحديث"); }
    finally { setChangingId(null); }
  };

  const filtered = filter ? appointments.filter((a) => a.status === filter) : appointments;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ScrollAnimation variant="fade-up">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">إدارة المواعيد</h1>
          <p className="text-gray-500 mb-8">عرض وإدارة جميع المواعيد في المنصة.</p>
        </ScrollAnimation>

        <div className="flex flex-wrap gap-2 mb-8">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium border cursor-pointer transition-colors ${filter === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
              {s ? statusAr[s] || s : "الكل"}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">جاري التحميل…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">لا توجد مواعيد.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-4 text-right font-semibold text-gray-500 text-xs">المريض</th>
                    <th className="px-5 py-4 text-right font-semibold text-gray-500 text-xs">الطبيب</th>
                    <th className="px-5 py-4 text-right font-semibold text-gray-500 text-xs">التاريخ والوقت</th>
                    <th className="px-5 py-4 text-right font-semibold text-gray-500 text-xs">النوع</th>
                    <th className="px-5 py-4 text-right font-semibold text-gray-500 text-xs">الرسوم</th>
                    <th className="px-5 py-4 text-right font-semibold text-gray-500 text-xs">الحالة</th>
                    <th className="px-5 py-4 text-left font-semibold text-gray-500 text-xs">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-800">{a.patient?.name || "—"}</td>
                      <td className="px-5 py-4 text-gray-700">{a.doctor?.user?.name || "—"}</td>
                      <td className="px-5 py-4 text-gray-600">{a.slot?.date || "—"} | {a.slot?.start_time || ""}</td>
                      <td className="px-5 py-4"><span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">{a.type === "video" ? "فيديو" : a.type === "clinic" ? "عيادة" : a.type || "—"}</span></td>
                      <td className="px-5 py-4 font-semibold text-gray-800">${parseFloat(a.total_fee || 0).toFixed(0)}</td>
                      <td className="px-5 py-4"><span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusStyle[a.status] || "bg-gray-100 text-gray-600"}`}>{statusAr[a.status] || a.status}</span></td>
                      <td className="px-5 py-4 text-left">
                        <select value="" disabled={changingId === a.id} onChange={(e) => { if (e.target.value) handleStatusChange(a.id, e.target.value); }}
                          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-40">
                          <option value="">تغيير…</option>
                          {STATUSES.filter(Boolean).filter((s) => s !== a.status).map((s) => (<option key={s} value={s}>{statusAr[s]}</option>))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {!loading && <p className="mt-4 text-sm text-gray-400">عرض {filtered.length} من {appointments.length} موعد</p>}
      </div>
    </div>
  );
}
