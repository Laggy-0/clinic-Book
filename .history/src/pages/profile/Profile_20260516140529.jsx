import { useState, useRef, useEffect } from "react";
import Navbar from './../../components/navbar/Navbar';
import ScrollAnimation from "../../components/ScrollAnimation";
import toast from "react-hot-toast";
import { getMe, updateUserProfile, uploadAvatar, removeAvatar } from "../../api/userApi";
import { getDoctorEarnings, updateDoctorProfile } from "../../api/doctorApi";
import { getDoctorSlots, createSlot, deleteSlot } from "../../api/slotApi";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [stats, setStats] = useState({});
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: "", start_time: "", end_time: "" });
  const fileRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", bio: "", location: "",
    consultation_fee: "", qualifications: "",
  });

  const role = user?.role || "patient";
  const doctorProfile = user?.doctorProfile;

  useEffect(() => {
    (async () => {
      try {
        const data = await getMe();
        const u = data.user || data;
        setUser(u);
        setAvatarPreview(u.profile_picture || null);
        setFormData({
          name: u.name || "", email: u.email || "", phone: u.phone || "",
          bio: u.doctorProfile?.bio || "", location: u.doctorProfile?.location || "",
          consultation_fee: u.doctorProfile?.consultation_fee || "",
          qualifications: u.doctorProfile?.qualifications || "",
        });
        if (u.role === "doctor" && u.doctorProfile?.id) {
          const [earn, sl] = await Promise.all([
            getDoctorEarnings(u.doctorProfile.id).catch(() => ({})),
            getDoctorSlots(u.doctorProfile.id).catch(() => []),
          ]);
          setStats(earn);
          setSlots(sl.slots || sl || []);
        }
      } catch { toast.error("فشل تحميل الملف الشخصي"); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const toastId = toast.loading("جاري الحفظ...");
    try {
      await updateUserProfile({ name: formData.name, phone: formData.phone });
      if (role === "doctor" && doctorProfile?.id) {
        await updateDoctorProfile(doctorProfile.id, {
          bio: formData.bio, location: formData.location,
          consultation_fee: formData.consultation_fee, qualifications: formData.qualifications,
        });
      }
      const fresh = await getMe();
      const u = fresh.user || fresh;
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
      setIsEditing(false);
      toast.success("تم حفظ التغييرات!", { id: toastId });
    } catch (err) { toast.error(err.response?.data?.message || "فشل الحفظ", { id: toastId }); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const toastId = toast.loading("جاري رفع الصورة...");
    try {
      const formD = new FormData();
      formD.append("avatar", file);
      const data = await uploadAvatar(formD);
      setAvatarPreview(data.profile_picture || URL.createObjectURL(file));
      const fresh = await getMe();
      setUser(fresh.user || fresh);
      localStorage.setItem("user", JSON.stringify(fresh.user || fresh));
      toast.success("تم تحديث الصورة!", { id: toastId });
    } catch { toast.error("فشل رفع الصورة", { id: toastId }); }
  };

  const handleAvatarRemove = async () => {
    const toastId = toast.loading("جاري حذف الصورة...");
    try {
      await removeAvatar();
      setAvatarPreview(null);
      const fresh = await getMe();
      setUser(fresh.user || fresh);
      localStorage.setItem("user", JSON.stringify(fresh.user || fresh));
      toast.success("تم حذف الصورة", { id: toastId });
    } catch { toast.error("فشل حذف الصورة", { id: toastId }); }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.start_time || !newSlot.end_time) return toast.error("جميع الحقول مطلوبة");
    const toastId = toast.loading("جاري الإضافة...");
    try {
      await createSlot({ ...newSlot, doctor_id: doctorProfile.id });
      const sl = await getDoctorSlots(doctorProfile.id);
      setSlots(sl.slots || sl || []);
      setNewSlot({ date: "", start_time: "", end_time: "" });
      toast.success("تمت إضافة الموعد!", { id: toastId });
    } catch (err) { toast.error(err.response?.data?.message || "فشل الإضافة", { id: toastId }); }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("حذف هذا الموعد؟")) return;
    try {
      await deleteSlot(slotId);
      setSlots(slots.filter(s => s.id !== slotId));
      toast.success("تم حذف الموعد");
    } catch { toast.error("فشل الحذف"); }
  };

  const roleCharImg = role === "admin" ? "/admin-char.png" : role === "doctor" ? "/doctor-char.png" : "/patient-char.png";

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 pb-20">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">

        {/* --- 1. HEADER & AVATAR --- */}
        <ScrollAnimation variant="fade-up">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 hover:shadow-md transition-shadow">
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-4xl overflow-hidden border-4 border-blue-50 shrink-0">
            {avatarPreview ? (
              <img src={avatarPreview} alt="الصورة" className="w-full h-full object-cover" />
            ) : (
              <img src={roleCharImg} alt="الصورة" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 text-center md:text-right">
            <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <p className="text-blue-600 text-xs font-bold mt-1 uppercase">{role === "doctor" ? "طبيب" : role === "admin" ? "مشرف" : "مريض"}</p>
            <div className="flex gap-3 mt-4 justify-center md:justify-start">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          
            </div>
          </div>
        </div>
        </ScrollAnimation>

        {/* --- 2. DOCTOR STATS --- */}
        {role === "doctor" && (
          <ScrollAnimation variant="fade-up" delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center"><p className="text-gray-400 text-xs font-bold mb-1">التقييم</p><p className="text-2xl font-black text-yellow-500">{parseFloat(doctorProfile?.avg_rating || 0).toFixed(1)} ★</p></div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center"><p className="text-gray-400 text-xs font-bold mb-1">المواعيد</p><p className="text-2xl font-black text-gray-800">{stats.appointments_count || 0}</p></div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center"><p className="text-gray-400 text-xs font-bold mb-1">الأرباح</p><p className="text-2xl font-black text-green-600">${stats.total_earnings || 0}</p></div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center"><p className="text-gray-400 text-xs font-bold mb-1">المراجعات</p><p className="text-2xl font-black text-gray-800">{stats.reviews_count || 0}</p></div>
          </div>
          </ScrollAnimation>
        )}

        {/* --- 3. PROFILE FORM --- */}
        <ScrollAnimation variant="fade-up" delay={200}>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">تفاصيل الملف الشخصي</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="text-blue-600 font-bold text-sm hover:underline cursor-pointer">تعديل</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="text-gray-500 font-bold text-sm hover:underline cursor-pointer">إلغاء</button>
                <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 cursor-pointer">حفظ</button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-sm font-medium text-gray-500 mb-1">الاسم</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg outline-none disabled:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" /></div>
            <div><label className="block text-sm font-medium text-gray-500 mb-1">البريد الإلكتروني</label>
              <input type="email" name="email" value={formData.email} disabled className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg outline-none text-gray-500 cursor-not-allowed" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-500 mb-1">رقم الهاتف</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg outline-none disabled:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" placeholder="أدخل رقم هاتفك" /></div>
            {role === "doctor" && (
              <>
                <div><label className="block text-sm font-medium text-gray-500 mb-1">رسوم الاستشارة ($)</label>
                  <input type="number" name="consultation_fee" value={formData.consultation_fee} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg outline-none disabled:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" /></div>
                <div><label className="block text-sm font-medium text-gray-500 mb-1">الموقع</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg outline-none disabled:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" placeholder="عنوان العيادة" /></div>
                <div><label className="block text-sm font-medium text-gray-500 mb-1">المؤهلات</label>
                  <input type="text" name="qualifications" value={formData.qualifications} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg outline-none disabled:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" placeholder="دكتوراه، ماجستير..." /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-500 mb-1">نبذة مهنية</label>
                  <textarea name="bio" value={formData.bio} onChange={handleInputChange} disabled={!isEditing} rows="3" className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg outline-none disabled:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" placeholder="أخبر المرضى عن خبراتك..."></textarea></div>
              </>
            )}
          </div>
        </div>
        </ScrollAnimation>

        {/* --- 4. AVAILABILITY SLOTS --- */}
        {role === "doctor" && (
          <ScrollAnimation variant="fade-up" delay={300}>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">إدارة أوقات المواعيد</h2>

            <form onSubmit={handleAddSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
              <input type="date" value={newSlot.date} onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                className="border border-gray-200 px-4 py-3 rounded-xl text-sm bg-gray-50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              <input type="time" value={newSlot.start_time} onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                className="border border-gray-200 px-4 py-3 rounded-xl text-sm bg-gray-50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              <input type="time" value={newSlot.end_time} onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                className="border border-gray-200 px-4 py-3 rounded-xl text-sm bg-gray-50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              <button type="submit" className="bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition cursor-pointer">+ إضافة موعد</button>
            </form>

            {slots.length === 0 ? (
              <p className="text-gray-400 text-sm italic">لا توجد أوقات مواعيد. أضف أول موعد أعلاه!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {slots.map(slot => (
                  <div key={slot.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{new Date(slot.date).toLocaleDateString("ar-EG", {weekday:'short', month:'short', day:'numeric'})}</p>
                      <p className="text-xs text-gray-500">{slot.start_time?.substring(0, 5)} — {slot.end_time?.substring(0, 5)}</p>
                    </div>
                    <button onClick={() => handleDeleteSlot(slot.id)} className="text-red-500 hover:text-red-700 font-bold text-sm cursor-pointer">حذف</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          </ScrollAnimation>
        )}

      </div>
    </div>
  );
}