import { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import ScrollAnimation from "../../components/ScrollAnimation";
import { searchDoctors, getDoctorReviews } from "../../api/doctorApi";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [selected, setSelected] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const data = await searchDoctors({ name: searchName });
        setDoctors(data.doctors || data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchDoctors();
  }, [searchName]);

  const openDetail = async (doc) => {
    setSelected(doc);
    setReviewLoading(true);
    try {
      const data = await getDoctorReviews(doc.id);
      setReviews(data.reviews || []);
    } catch { setReviews([]); }
    finally { setReviewLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ScrollAnimation variant="fade-up">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Doctor Management</h1>
          <p className="text-gray-500 mb-8">View all registered doctors, specialties, ratings and reviews.</p>
        </ScrollAnimation>

        <div className="mb-8">
          <input type="text" placeholder="Search doctors by name…" value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full max-w-md border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-56 rounded-2xl bg-gray-200 animate-pulse" />)}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><p className="text-gray-400 text-lg">No doctors found.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div key={doc.id} onClick={() => openDetail(doc)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-xl font-bold">
                      {doc.user?.name?.charAt(0).toUpperCase() || "D"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{doc.user?.name || "Unknown"}</h3>
                      <p className="text-sm text-emerald-600 font-medium">{doc.specialty?.name || "General"}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between"><span>Fee</span><span className="font-semibold text-gray-800">${parseFloat(doc.consultation_fee || 0).toFixed(0)}</span></div>
                    <div className="flex justify-between"><span>Rating</span><span className="font-semibold text-gray-800">{parseFloat(doc.avg_rating || 0).toFixed(1)} <span className="text-yellow-400">★</span></span></div>
                    {doc.location && <div className="flex justify-between"><span>Location</span><span className="font-semibold text-gray-800">{doc.location}</span></div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-2xl font-bold">
                {selected.user?.name?.charAt(0).toUpperCase() || "D"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.user?.name}</h2>
                <p className="text-emerald-600 font-medium">{selected.specialty?.name || "General"}</p>
              </div>
            </div>
            <div className="space-y-3 mb-6 text-sm">
              {[
                ["Email", selected.user?.email],
                ["Location", selected.location || "—"],
                ["Fee", "$" + parseFloat(selected.consultation_fee || 0).toFixed(0)],
                ["Rating", parseFloat(selected.avg_rating || 0).toFixed(1) + " ★"],
                ["Bio", selected.bio || "—"],
                ["Qualifications", selected.qualifications || "—"],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800 text-right max-w-[60%]">{val}</span>
                </div>
              ))}
            </div>
            <h3 className="font-bold text-gray-900 mb-3">Reviews</h3>
            {reviewLoading ? <p className="text-gray-400 text-sm">Loading…</p>
              : reviews.length === 0 ? <p className="text-gray-400 text-sm">No reviews yet.</p>
              : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-800 text-sm">{r.patient?.name || "Patient"}</span>
                        <span className="text-yellow-500 text-sm font-bold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      </div>
                      {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            <button onClick={() => setSelected(null)} className="mt-6 w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 cursor-pointer text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
