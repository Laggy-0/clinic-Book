import { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import ScrollAnimation from "../../components/ScrollAnimation";
import toast from "react-hot-toast";
import { getSpecialties, createSpecialty, updateSpecialty, deleteSpecialty } from "../../api/specialtyApi";

export default function AdminSpecialties() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const fetchSpecialties = async () => { setLoading(true); try { const data = await getSpecialties(); setSpecialties(Array.isArray(data) ? data : data.specialties || []); } catch { toast.error("فشل تحميل التخصصات"); } finally { setLoading(false); } };
  useEffect(() => { fetchSpecialties(); }, []);
  const resetForm = () => { setForm({ name: "", description: "" }); setEditId(null); setShowForm(false); };
  const openCreate = () => { resetForm(); setShowForm(true); };
  const openEdit = (s) => { setEditId(s.id); setForm({ name: s.name, description: s.description || "" }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("الاسم مطلوب");
    setSaving(true);
    try {
      if (editId) { await updateSpecialty(editId, form); toast.success("تم تحديث التخصص"); }
      else { await createSpecialty(form); toast.success("تم إنشاء التخصص"); }
      resetForm(); fetchSpecialties();
    } catch (err) { toast.error(err.response?.data?.message || "فشلت العملية"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل تريد حذف هذا التخصص؟")) return;
    try { await deleteSpecialty(id); toast.success("تم حذف التخصص"); fetchSpecialties(); }
    catch (err) { toast.error(err.response?.data?.message || "فشل الحذف"); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ScrollAnimation variant="fade-up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">التخصصات</h1>
            <p className="text-gray-500">إنشاء، تعديل وحذف التخصصات الطبية.</p>
          </div>
          <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 cursor-pointer shadow-sm">
            + إضافة تخصص
          </button>
        </div>
        </ScrollAnimation>

        <ScrollAnimation variant="fade-up" delay={150}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">جاري التحميل…</div>
          ) : specialties.length === 0 ? (
            <div className="p-12 text-center text-gray-400">لا توجد تخصصات بعد. أنشئ أول تخصص!</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-right font-semibold text-gray-500 text-xs">الاسم</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-500 text-xs">الوصف</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 text-xs">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {specialties.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{s.name}</td>
                    <td className="px-6 py-4 text-gray-600">{s.description || "—"}</td>
                    <td className="px-6 py-4 text-left space-x-3 space-x-reverse">
                      <button onClick={() => openEdit(s)} className="text-blue-600 hover:underline font-semibold cursor-pointer">تعديل</button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline font-semibold cursor-pointer">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        </ScrollAnimation>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={resetForm}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{editId ? "تعديل التخصص" : "تخصص جديد"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-600 mb-1">الاسم</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">الوصف</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm} className="px-5 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer">إلغاء</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-300 cursor-pointer">
                  {saving ? "جاري الحفظ…" : editId ? "تحديث" : "إنشاء"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
