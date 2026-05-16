import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import ScrollAnimation from "../../components/ScrollAnimation";
import toast from "react-hot-toast";
import { getDoctorById, getDoctorReviews } from "../../api/doctorApi";
import { getDoctorSlots } from "../../api/slotApi";
import { createAppointment } from "../../api/appointmentApi";

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentType, setAppointmentType] = useState("clinic");
  const [booking, setBooking] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [docData, revData, slotsData] = await Promise.all([
          getDoctorById(id), getDoctorReviews(id).catch(() => ({})), getDoctorSlots(id).catch(() => []),
        ]);
        setDoctor(docData.doctor || docData);
        setReviews(revData.reviews || revData || []);
        setSlots(slotsData.slots || slotsData || []);
      } catch { toast.error("فشل تحميل الملف الشخصي"); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const availableDates = useMemo(() => {
    const dateMap = {};
    slots.filter(s => s.is_available).forEach(s => {
      if (!dateMap[s.date]) dateMap[s.date] = [];
      dateMap[s.date].push(s);
    });
    return dateMap;
  }, [slots]);

  const handleBook = async () => {
    if (!selectedSlot) return toast.error("اختر وقتًا أولاً");
    if (!user?.id) return toast.error("يجب تسجيل الدخول للحجز");
    setBooking(true);
    try {
      await createAppointment({ slot_id: selectedSlot.id, type: appointmentType });
      toast.success("تم الحجز بنجاح! 🎉");
      setTimeout(() => navigate("/my-appointments"), 1200);
    } catch (err) { toast.error(err.response?.data?.message || "فشل الحجز"); }
    finally { setBooking(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!doctor) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500 text-lg">لم يتم العثور على الطبيب.</p></div>;

  const fee = parseFloat(doctor.consultation_fee || 0).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 pb-20">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <ScrollAnimation variant="fade-up">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition-shadow">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl overflow-hidden border-4 border-blue-50 shrink-0">
                {doctor.user?.profile_picture ? <img src={doctor.user.profile_picture} className="w-full h-full object-cover" alt="" /> : <img src="/doctor-char.png" className="w-full h-full object-cover" alt="" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{doctor.user?.name}</h1>
                <p className="text-blue-600 text-sm font-bold mt-1">{doctor.specialty?.name}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-black">{parseFloat(doctor.avg_rating || 0).toFixed(1)} ★</span>
                  <span className="text-gray-500 text-sm font-medium">{doctor.qualifications || "طبيب عام"}</span>
                </div>
              </div>
            </div>
            </ScrollAnimation>

            <ScrollAnimation variant="fade-up" delay={100}>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">نبذة عن الطبيب</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {showFullBio ? doctor.bio : doctor.bio?.slice(0, 150) + (doctor.bio?.length > 150 ? "..." : "") || "لم يتم إضافة نبذة."}
              </p>
              {doctor.bio?.length > 150 && (
                <button onClick={() => setShowFullBio(!showFullBio)} className="text-blue-600 text-sm font-bold mt-2 cursor-pointer">{showFullBio ? "عرض أقل" : "المزيد"}</button>
              )}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-2">موقع العيادة</h3>
                <p className="text-gray-600 text-sm">{doctor.location || "استشارات أونلاين فقط"}</p>
              </div>
            </div>
            </ScrollAnimation>

            <ScrollAnimation variant="fade-up" delay={200}>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">مراجعات المرضى ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="text-gray-500 italic text-sm">لا توجد مراجعات بعد.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0"><img src="/patient-char.png" className="w-full h-full object-cover" alt="" /></div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-800 text-sm">{review.patient?.name || "مجهول"}</h4>
                          <span className="text-yellow-400 text-xs">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                        </div>
                        {review.comment && <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg mt-2">{review.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </ScrollAnimation>
          </div>

          <div className="lg:col-span-5">
            <ScrollAnimation variant="fade-left" delay={150}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">حجز موعد</h2>

              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">نوع الزيارة</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{ value: "clinic", label: "عيادة" }, { value: "video", label: "فيديو" }].map(t => (
                    <button key={t.value} type="button" onClick={() => setAppointmentType(t.value)}
                      className={`py-2.5 rounded-xl text-sm font-bold transition cursor-pointer border ${appointmentType === t.value ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">اختر التاريخ</p>
                {Object.keys(availableDates).length === 0 ? (
                  <p className="text-gray-400 text-sm italic">لا توجد أوقات متاحة حالياً.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(availableDates).sort().map(date => (
                      <button key={date} onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer border ${selectedDate === date ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300"}`}>
                        {new Date(date).toLocaleDateString("ar-EG", { weekday: "short", month: "short", day: "numeric" })}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedDate && availableDates[selectedDate] && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">اختر الوقت</p>
                  <div className="grid grid-cols-3 gap-2">
                    {availableDates[selectedDate].map(slot => (
                      <button key={slot.id} onClick={() => setSelectedSlot(slot)}
                        className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer border ${selectedSlot?.id === slot.id ? "bg-emerald-600 text-white border-emerald-600" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400"}`}>
                        {slot.start_time?.substring(0, 5)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm font-medium">رسوم الاستشارة</span>
                  <span className="text-2xl font-black text-gray-800">${fee}</span>
                </div>
              </div>

              <button onClick={handleBook} disabled={booking || !selectedSlot}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:bg-blue-300 cursor-pointer disabled:cursor-not-allowed">
                {booking ? "جاري الحجز..." : "تأكيد الحجز"}
              </button>
            </div>
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </div>
  );
}