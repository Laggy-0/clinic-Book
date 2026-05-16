import { useState, useEffect } from "react";
import Navbar from './../../components/navbar/Navbar';
import { getDoctorEarnings } from "../../api/doctorApi";

export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const profile = user?.doctorProfile || {};
  
  const [stats, setStats] = useState({ appointments_count: 0, total_earnings: 0, avg_rating: profile.avg_rating || "0.0" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (profile.id) {
        try {
          const data = await getDoctorEarnings(profile.id);
          setStats((prev) => ({ ...prev, ...data }));
        } catch (error) {
          console.error("Failed to load dashboard stats", error);
        }
      }
      setLoading(false);
    };
    fetchStats();
  }, [profile.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          Welcome, Dr. {user?.name}
        </h1>

        {loading ? (
          <p className="text-gray-500">Loading your performance metrics...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Appointments</h3>
              <p className="text-4xl font-black text-gray-800">{stats.appointments_count}</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Earnings</h3>
              <p className="text-4xl font-black text-green-600">${stats.total_earnings}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Current Rating</h3>
              <div className="flex items-center space-x-2">
                <span className="text-4xl font-black text-gray-800">{parseFloat(stats.avg_rating).toFixed(1)}</span>
                <span className="text-yellow-400 text-2xl">★</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Appointments</h2>
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">Your schedule is currently clear.</p>
          </div>
        </div>
      </div>
    </div>
  );
}