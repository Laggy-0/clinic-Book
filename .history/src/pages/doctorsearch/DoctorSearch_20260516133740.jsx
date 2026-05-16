import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import ScrollAnimation from "../../components/ScrollAnimation";
import toast from "react-hot-toast";
import { searchDoctors } from "../../api/doctorApi";
import { getSpecialties } from "../../api/specialtyApi";

export default function DoctorSearch() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: "", specialty: "", date: "", startTime: "", minPrice: "", maxPrice: "", minRating: "" });

  useEffect(() => {
    const initPage = async () => {
      try {
        const [specsData, docsData] = await Promise.all([getSpecialties().catch(() => []), searchDoctors({})]);
        setSpecialties(specsData.specialties || specsData || []);
        setDoctors(docsData.doctors || docsData || []);
      } catch { toast.error("خطأ في تحميل البيانات"); }
      finally { setLoading(false); }
    };
    initPage();
  }, []);

  const handleInputChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { const data = await searchDoctors(filters); setDoctors(data.doctors || data || []); toast.success("تم تحديث البحث!"); }
    catch { toast.error("فشل في تصفية الأطباء"); }
    finally { setLoading(false); }
  };

  const clearFilters = async () => {
    const empty = { name: "", specialty: "", date: "", startTime: "", minPrice: "", maxPrice: "", minRating: "" };
    setFilters(empty); setLoading(true);
    try { const data = await searchDoctors(empty); setDoctors(data.doctors || data || []); } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

        <ScrollAnimation variant="fade-right">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit lg:sticky lg:top-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">التصفية</h2>
            <button onClick={clearFilters} className="text-sm text-blue-600 font-medium hover:underline cursor-pointer">مسح</button>
          </div>
          <form onSubmit={handleSearchSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">اسم الطبيب</label>
              <input type="text" name="name" value={filters.name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">التخصص</label>
              <select name="specialty" value={filters.specialty} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 text-sm">
                <option value="">جميع التخصصات</option>
                {specialties.map(spec => <option key={spec.id} value={spec.name}>{spec.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">التاريخ</label>
              <input type="date" name="date" value={filters.date} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">وقت البداية</label>
              <input type="time" name="startTime" value={filters.startTime} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">نطاق السعر ($)</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" name="minPrice" value={filters.minPrice} onChange={handleInputChange} placeholder="أدنى" className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl outline-none focus:border-blue-500 text-sm" />
                <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleInputChange} placeholder="أقصى" className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl outline-none focus:border-blue-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">أدنى تقييم</label>
              <select name="minRating" value={filters.minRating} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 text-sm">
                <option value="">أي تقييم</option>
                <option value="4.5">4.5+ ★</option>
                <option value="4.0">4.0+ ★</option>
                <option value="3.0">3.0+ ★</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition cursor-pointer">تطبيق التصفية</button>
          </form>
        </div>
        </ScrollAnimation>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">لا يوجد أطباء مطابقون لمعايير البحث.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doc, index) => (
                <ScrollAnimation key={doc.id} variant="fade-up" delay={index * 60}>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all duration-200">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden">
                          {doc.user?.profile_picture ? <img src={doc.user.profile_picture} className="w-full h-full object-cover" alt="" /> : (doc.user?.name?.charAt(0) || "د")}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{doc.user?.name}</h3>
                          <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">{doc.specialty?.name}</p>
                        </div>
                      </div>
                      <div className="bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1">
                        {parseFloat(doc.avg_rating || 0).toFixed(1)} ★
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">الأوقات المتاحة</p>
                      <div className="flex flex-wrap gap-2">
                        {doc.slots && doc.slots.length > 0 ? (
                          doc.slots.slice(0, 4).map(slot => (
                            <span key={slot.id} className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium">
                              {new Date(slot.date).toLocaleDateString("ar-EG", {month:'short', day:'numeric'})} • {slot.start_time?.substring(0, 5)}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs italic">اعرض الملف الشخصي لمشاهدة جدول المواعيد.</span>
                        )}
                        {doc.slots && doc.slots.length > 4 && <span className="text-gray-400 text-xs px-1 py-1">+{doc.slots.length - 4} أخرى</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">الرسوم</p>
                      <p className="text-xl font-black text-gray-800">${parseFloat(doc.consultation_fee || 0).toFixed(2)}</p>
                    </div>
                    <button onClick={() => navigate(`/doctor/${doc.id}`)}
                      className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-xl font-bold text-sm transition cursor-pointer">
                      عرض الملف
                    </button>
                  </div>
                </div>
                </ScrollAnimation>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}