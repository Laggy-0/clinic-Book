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

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking State
  const [consultType, setConsultType] = useState("clinic");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [reason, setReason] = useState("");
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [docData, revData, slotsData] = await Promise.all([
          getDoctorById(id),
          getDoctorReviews(id).catch(() => []),
          getDoctorSlots(id).catch(() => [])
        ]);
        
        setDoctor(docData.doctor || docData);
        setReviews(revData.reviews || revData || []);
        
        // Filter slots to only show available ones
        const fetchedSlots = slotsData.slots || slotsData || [];
        const availableSlots = fetchedSlots.filter(s => !s.is_booked);
        setSlots(availableSlots);

        // Auto-select the first available date if slots exist
        if (availableSlots.length > 0) {
          setSelectedDate(availableSlots[0].date);
        }
      } catch (error) {
        toast.error("Failed to load doctor profile.");
        navigate("/doctor-search");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [id, navigate]);

  // Group slots by date for easy UI selection
  const slotsByDate = useMemo(() => {
    return slots.reduce((acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    }, {});
  }, [slots]);

  const availableDates = Object.keys(slotsByDate).sort();
  const slotsForSelectedDate = slotsByDate[selectedDate] || [];

  const handleConfirmBooking = async () => {
    if (!selectedSlotId) return toast.error("Please select a specific time slot.");
    
    const toastId = toast.loading("Booking appointment...");
    try {
      await createAppointment({
        doctor_id: parseInt(id, 10),
        slot_id: parseInt(selectedSlotId, 10),
        type: consultType,
        symptoms: reason,
        total_fee: parseFloat(fee)
      });
      toast.success("Appointment booked successfully!", { id: toastId });
      navigate("/my-appointments");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to book appointment.", { id: toastId });
    }
  };

  if (loading || !doctor) return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const fee = parseFloat(doctor.consultation_fee || 0).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <button onClick={() => navigate("/doctor-search")} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-medium transition">
          ← Back to Search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN: Doctor Details & Reviews --- */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Info */}
            <ScrollAnimation variant="fade-up">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition-shadow">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl overflow-hidden border-4 border-blue-50 shrink-0">
                {doctor.user?.profile_picture ? <img src={doctor.user.profile_picture} className="w-full h-full object-cover" alt="avatar" /> : (doctor.user?.name?.charAt(0) || "D")}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dr. {doctor.user?.name}</h1>
                <p className="text-blue-600 font-bold uppercase tracking-wider text-sm mt-1">{doctor.specialty?.name}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-black">
                    {parseFloat(doctor.avg_rating || 0).toFixed(1)} ★
                  </span>
                  <span className="text-gray-500 text-sm font-medium">{doctor.qualifications || "MD Equivalent"}</span>
                </div>
              </div>
            </div>
            </ScrollAnimation>

            {/* Bio & Location */}
            <ScrollAnimation variant="fade-up" delay={100}>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">About Doctor</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {showFullBio ? doctor.bio : doctor.bio?.slice(0, 150) + (doctor.bio?.length > 150 ? "..." : "") || "No biography provided."}
              </p>
              {doctor.bio?.length > 150 && (
                <button onClick={() => setShowFullBio(!showFullBio)} className="text-blue-600 text-sm font-bold mt-2">
                  {showFullBio ? "Read Less" : "Read More"}
                </button>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Clinic Location</h3>
                <p className="text-gray-600 text-sm">{doctor.location || "Online Consultations Only"}</p>
              </div>
            </div>
            </ScrollAnimation>

            {/* Patient Reviews Row by Row */}
            <ScrollAnimation variant="fade-up" delay={200}>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Patient Reviews ({reviews.length})</h2>
              
              {reviews.length === 0 ? (
                <p className="text-gray-500 italic text-sm">No reviews submitted for this doctor yet.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold shrink-0">
                        {review.patient?.name?.charAt(0) || "P"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-800 text-sm">{review.patient?.name || "Anonymous Patient"}</h4>
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

          {/* --- RIGHT COLUMN: Booking Area --- */}
          <div className="lg:col-span-5">
            <ScrollAnimation variant="fade-left" delay={150}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Book Appointment</h2>

              {/* Consultation Type */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Consultation Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setConsultType("clinic")}
                    className={`py-3 rounded-xl font-bold text-sm border-2 transition ${consultType === "clinic" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}
                  >
                    🏥 In-Clinic
                  </button>
                  <button 
                    onClick={() => setConsultType("video")}
                    className={`py-3 rounded-xl font-bold text-sm border-2 transition ${consultType === "video" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-100 text-gray-500 hover:border-gray-200"}`}
                  >
                    📹 Video
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Date</label>
                {availableDates.length === 0 ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                    No availability right now.
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {availableDates.map(dateStr => {
                      const dateObj = new Date(dateStr);
                      return (
                        <button
                          key={dateStr}
                          onClick={() => { setSelectedDate(dateStr); setSelectedSlotId(""); }}
                          className={`min-w-[70px] py-2 px-3 rounded-xl border-2 flex flex-col items-center transition ${selectedDate === dateStr ? "border-blue-600 bg-blue-600 text-white" : "border-gray-100 bg-white text-gray-600 hover:border-blue-200"}`}
                        >
                          <span className="text-[10px] uppercase font-bold mb-1 opacity-80">{dateObj.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                          <span className="text-lg font-black">{dateObj.getDate()}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Time (24H)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {slotsForSelectedDate.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`py-2 rounded-lg font-bold text-sm transition border ${selectedSlotId === slot.id ? "bg-emerald-500 border-emerald-500 text-white" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"}`}
                      >
                        {slot.start_time?.substring(0, 5)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reason Input */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reason for Visit (Optional)</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  rows="3" 
                  placeholder="Describe your symptoms..."
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500 text-sm transition"
                ></textarea>
              </div>

              {/* Checkout Button */}
              <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Fee</p>
                  <p className="text-2xl font-black text-gray-800">${fee}</p>
                </div>
                <button 
                  onClick={handleConfirmBooking}
                  disabled={!selectedSlotId}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition shadow-md ${selectedSlotId ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                >
                  Confirm Booking
                </button>
              </div>

            </div>
            </ScrollAnimation>
          </div>
          
        </div>
      </div>
    </div>
  );
}