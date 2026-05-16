import { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import toast from "react-hot-toast";
import { 
  getPatientAppointments, 
  getDoctorAppointments, 
  updateAppointmentStatus, 
  submitReview 
} from "../../api/appointmentApi";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    "in-progress": "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const currentStyle = styles[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${currentStyle}`}>
      {status || "Unknown"}
    </span>
  );
};

const PatientView = ({ appointments, refreshData }) => {
  const [reviewingId, setReviewingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewedAppts, setReviewedAppts] = useState(new Set());

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    const toastId = toast.loading("Canceling appointment...");
    try {
      await updateAppointmentStatus(id, "cancelled");
      toast.success("Appointment canceled successfully.", { id: toastId });
      refreshData();
    } catch (error) {
      toast.error("Failed to cancel appointment.", { id: toastId });
    }
  };

  const handleReviewSubmit = async (appointmentId) => {
    const toastId = toast.loading("Submitting review...");
    try {
      await submitReview(appointmentId, { rating, comment });
      toast.success("Review submitted!", { id: toastId });
      
      setReviewedAppts(new Set([...reviewedAppts, appointmentId]));
      setReviewingId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review", { id: toastId });
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">You have no booking history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appt) => (
        <div key={appt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 transition hover:shadow-md">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden border border-blue-100 shrink-0">
                {appt.doctor?.user?.profile_picture ? (
                  <img src={appt.doctor.user.profile_picture} alt="Doctor" className="w-full h-full object-cover" />
                ) : (
                  appt.doctor?.user?.name?.charAt(0).toUpperCase() || "D"
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Dr. {appt.doctor?.user?.name || "Doctor"}</h3>
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold">{new Date(appt.slot?.date).toLocaleDateString()}</span> at {appt.slot?.start_time?.substring(0, 5)}
                </p>
                <p className="text-blue-600 font-medium text-sm mt-1 uppercase tracking-wider text-[11px]">{appt.type === 'video' ? '📹 Video Consult' : '🏥 Clinic Visit'} • ${parseFloat(appt.total_fee || 0).toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
              <StatusBadge status={appt.status} />
              
              <div className="flex gap-2">
                {["pending", "confirmed"].includes(appt.status?.toLowerCase()) && (
                  <button onClick={() => handleCancel(appt.id)} className="text-red-500 text-sm font-bold hover:text-red-700 transition px-2">
                    Cancel Booking
                  </button>
                )}

                {appt.status?.toLowerCase() === "completed" && !reviewedAppts.has(appt.id) && reviewingId !== appt.id && (
                  <button 
                    onClick={() => { setReviewingId(appt.id); setRating(5); setComment(""); }} 
                    className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-100 transition"
                  >
                    Leave a Review
                  </button>
                )}
                
                {reviewedAppts.has(appt.id) && (
                  <span className="text-emerald-500 text-xs font-black uppercase tracking-wider flex items-center gap-1 mt-2">
                    ✓ Reviewed
                  </span>
                )}
              </div>
            </div>
          </div>

          {reviewingId === appt.id && (
            <div className="pt-4 mt-2 border-t border-gray-100 animate-fadeIn">
              <h4 className="text-sm font-bold text-gray-800 mb-2">Rate your experience with Dr. {appt.doctor?.user?.name}</h4>
              
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-colors ${rating >= star ? "text-yellow-400" : "text-gray-200 hover:text-yellow-200"}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave an optional comment about your visit..."
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500 text-sm transition mb-3"
                rows="2"
              ></textarea>

              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setReviewingId(null)} 
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleReviewSubmit(appt.id)} 
                  className="px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-100"
                >
                  Submit Review
                </button>
              </div>
            </div>
          )}

        </div>
      ))}
    </div>
  );
};

const DoctorView = ({ appointments, refreshData }) => {
  const handleUpdateStatus = async (id, newStatus) => {
    const toastId = toast.loading("Updating status...");
    try {
      await updateAppointmentStatus(id, newStatus);
      toast.success(`Appointment marked as ${newStatus}.`, { id: toastId });
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.", { id: toastId });
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">Your schedule is completely clear.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appt) => (
        <div key={appt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-xl overflow-hidden border border-emerald-100 shrink-0">
              {appt.patient?.profile_picture ? (
                <img src={appt.patient.profile_picture} alt="Patient" className="w-full h-full object-cover" />
              ) : (
                appt.patient?.name?.charAt(0).toUpperCase() || "P"
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{appt.patient?.name || "Patient"}</h3>
              <p className="text-gray-500 text-sm">
                <span className="font-semibold">{new Date(appt.slot?.date).toLocaleDateString()}</span> at {appt.slot?.start_time?.substring(0, 5)}
              </p>
              {appt.symptoms && (
                <p className="text-gray-600 text-sm mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-700">Notes:</span> {appt.symptoms}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <StatusBadge status={appt.status} />
            
            <div className="flex gap-2 mt-2">
              {appt.status?.toLowerCase() === "pending" && (
                <>
                  <button onClick={() => handleUpdateStatus(appt.id, "confirmed")} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition">
                    Accept
                  </button>
                  <button onClick={() => handleUpdateStatus(appt.id, "cancelled")} className="px-4 py-1.5 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition">
                    Decline
                  </button>
                </>
              )}
              
              {appt.status?.toLowerCase() === "confirmed" && (
                <>
                  <button onClick={() => handleUpdateStatus(appt.id, "in-progress")} className="px-4 py-1.5 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600 transition">
                    Start Session
                  </button>
                  <button onClick={() => handleUpdateStatus(appt.id, "cancelled")} className="px-4 py-1.5 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition">
                    Cancel
                  </button>
                </>
              )}

              {appt.status?.toLowerCase() === "in-progress" && (
                <button onClick={() => handleUpdateStatus(appt.id, "completed")} className="px-4 py-1.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition">
                  Mark Completed
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function MyAppointments() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); 

  const role = user?.role || "patient";

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let data;
      if (role === "doctor" && user.doctorProfile?.id) {
        data = await getDoctorAppointments(); 
      } else {
        data = await getPatientAppointments();
      }
      
      const apptsArray = data.appointments || data || [];
      setAppointments(apptsArray);
    } catch (error) {
      console.error("Failed to load appointments", error);
      toast.error("Could not load your appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [role]);

  const upcomingStatuses = ["pending", "confirmed", "in-progress"];
  const pastStatuses = ["completed", "cancelled"];

  const filteredAppointments = appointments.filter((appt) => {
    const status = appt.status?.toLowerCase();
    if (activeTab === "upcoming") return upcomingStatuses.includes(status);
    if (activeTab === "past") return pastStatuses.includes(status);
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">My Appointments</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your clinic and video consultations.</p>
          </div>
          
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
            <button 
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition ${activeTab === "upcoming" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setActiveTab("past")}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition ${activeTab === "past" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
            >
              Past History
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {role === "doctor" ? (
              <DoctorView appointments={filteredAppointments} refreshData={fetchAppointments} />
            ) : (
              <PatientView appointments={filteredAppointments} refreshData={fetchAppointments} />
            )}
          </>
        )}
      </div>
    </div>
  );
}