import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/navbar/Navbar";
import ScrollAnimation from "../../components/ScrollAnimation";
import toast from "react-hot-toast";
import { getAdminUsers, updateAdminUser } from "../../api/adminApi";

const roleAr = { admin: "مشرف", doctor: "طبيب", patient: "مريض" };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await getAdminUsers({ page, search, role: roleFilter });
      setUsers(data.users || []);
      setPagination({ page: data.page || 1, total_pages: data.total_pages || 1 });
    } catch { toast.error("فشل تحميل المستخدمين"); }
    finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openEdit = (u) => { setEditUser(u); setEditForm({ name: u.name, email: u.email, role: u.role }); };
  const closeEdit = () => { setEditUser(null); };

  const handleSave = async () => {
    try {
      await updateAdminUser(editUser.id, editForm);
      toast.success("تم تحديث المستخدم");
      closeEdit(); fetchUsers(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || "فشل التحديث"); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ScrollAnimation variant="fade-up">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">إدارة المستخدمين</h1>
          <p className="text-gray-500 mb-8">بحث، فلترة وإدارة جميع مستخدمي المنصة.</p>
        </ScrollAnimation>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input type="text" placeholder="ابحث بالاسم أو البريد..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-white border border-gray-200 px-5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-gray-200 px-5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm min-w-[160px]">
            <option value="">جميع الأدوار</option>
            <option value="patient">مريض</option>
            <option value="doctor">طبيب</option>
            <option value="admin">مشرف</option>
          </select>
        </div>

        <ScrollAnimation variant="fade-up" delay={150}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">جاري التحميل…</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-400">لا يوجد مستخدمون مطابقون.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-4 text-right font-semibold text-gray-500 text-xs">الاسم</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-500 text-xs">البريد</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-500 text-xs">الدور</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-500 text-xs">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800">{u.name}</td>
                      <td className="px-6 py-4 text-gray-600">{u.email}</td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">{roleAr[u.role] || u.role}</span></td>
                      <td className="px-6 py-4 text-left">
                        <button onClick={() => openEdit(u)} className="text-blue-600 hover:underline font-semibold cursor-pointer">تعديل</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </ScrollAnimation>

        {pagination.total_pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => fetchUsers(p)}
                className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition ${p === pagination.page ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={closeEdit}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">تعديل المستخدم</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-600 mb-1">الاسم</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">البريد</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">الدور</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="patient">مريض</option><option value="doctor">طبيب</option><option value="admin">مشرف</option>
                </select></div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={closeEdit} className="px-5 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer">إلغاء</button>
                <button onClick={handleSave} className="px-5 py-2.5 text-sm rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer">حفظ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
