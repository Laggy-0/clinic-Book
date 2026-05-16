import { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import ScrollAnimation from "../../components/ScrollAnimation";
import { searchDoctors, getDoctorReviews } from "../../api/doctorApi";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => { (async () => { try { const d = await searchDoctors({}); setDoctors(d.doctors || d || []); } catch {} finally { setLoading(false); } })(); }, []);

  const filtered = searchName ? doctors.filter(d => d.user?.name?.toLowerCase().includes(searchName.toLowerCase())) : doctors;

  const openDetail = async (doc) => {
    setSelectedDoc(doc);
    try { const r = await getDoctorReviews(doc.id); setReviews(r.reviews || r || []); } catch { setReviews([]); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ScrollAnimation variant="fade-up">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">إدارة الأطباء</h1>
          <p className="text-gray-500 mb-8">عرض جميع الأطباء المسجلين، تخصصاتهم، تقييماتهم ومراجعاتهم.</p>
        </ScrollAnimation>

        <div className="mb-8">
          <input type="text" placeholder="ابحث عن طبيب بالاسم…" value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full sm:w-80 bg-white border border-gray-200 px-5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-sm" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300"><p className="text-gray-500 text-lg">لا يوجد أطباء مطابقون.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((doc, i) => (
              <ScrollAnimation key={doc.id} variant="fade-up" delay={i * 60}>
                <div onClick={() => openDetail(doc)}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl overflow-hidden">
                      {doc.user?.profile_picture ? <img src={doc.user.profile_picture} className="w-full h-full object-cover" alt="" /> : <img src="/doctor-char.png" className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{doc.user?.name}</h3>
                      <p className="text-emerald-600 text-xs font-bold">{doc.specialty?.name || "عام"}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-black">{parseFloat(doc.avg_rating || 0).toFixed(1)} ★</span>
                    <span className="text-gray-800 font-bold">${parseFloat(doc.consultation_fee || 0).toFixed(0)}</span>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        )}
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex justify-start" onClick={() => setSelectedDoc(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl p-8 animate-slide-in">
            <button onClick={() => setSelectedDoc(null)} className="absolute top-6 left-6 text-gray-400 hover:text-gray-700 text-2xl cursor-pointer">✕</button>
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl overflow-hidden border-4 border-emerald-50">
                {selectedDoc.user?.profile_picture ? <img src={selectedDoc.user.profile_picture} className="w-full h-full object-cover" alt="" /> : <img src="/doctor-char.png" className="w-full h-full object-cover" alt="" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedDoc.user?.name}</h2>
                <p className="text-emerald-600 font-bold text-sm">{selectedDoc.specialty?.name}</p>
                <p className="text-gray-500 text-sm mt-1">{selectedDoc.qualifications || "—"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-gray-50 p-3 rounded-xl text-center"><p className="text-xs text-gray-400 font-bold">التقييم</p><p className="text-xl font-black text-gray-800">{parseFloat(selectedDoc.avg_rating || 0).toFixed(1)} ★</p></div>
              <div className="bg-gray-50 p-3 rounded-xl text-center"><p className="text-xs text-gray-400 font-bold">الرسوم</p><p className="text-xl font-black text-gray-800">${selectedDoc.consultation_fee}</p></div>
              <div className="bg-gray-50 p-3 rounded-xl text-center"><p className="text-xs text-gray-400 font-bold">الموقع</p><p className="text-sm font-bold text-gray-800 truncate">{selectedDoc.location || "أونلاين"}</p></div>
            </div>

            {selectedDoc.bio && (
              <div className="mb-8"><h3 className="font-bold text-gray-800 mb-2">نبذة عن الطبيب</h3><p className="text-gray-600 text-sm leading-relaxed">{selectedDoc.bio}</p></div>
            )}

            <h3 className="font-bold text-gray-800 mb-4 pt-4 border-t border-gray-100">مراجعات المرضى ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm italic">لا توجد مراجعات بعد.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0"><img src="/patient-char.png" className="w-full h-full object-cover" alt="" /></div>
                    <div>
                      <div className="flex items-center gap-2"><h4 className="font-bold text-gray-800 text-sm">{r.patient?.name || "مجهول"}</h4><span className="text-yellow-400 text-xs">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span></div>
                      {r.comment && <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded-lg mt-1">{r.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
