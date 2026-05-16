import { useState, useEffect } from "react";
import Navbar from './../../components/navbar/Navbar';
import { getPatientAppointments } from "../../api/appointmentApi";

export default function PatientDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getPatientAppointments();
        // Assuming the API returns an array or an object with an appointments array
        setAppointments(data.appointments || data || []);
      } catch (error) {
        console.error("Failed to load appointments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto p-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              Welcome, {user?.name || "Patient"}
            </h1>
            <p className="text-gray-600">This is your patient dashboard.</p>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg max-w-sm hidden md:block">
            <h3 className="font-bold text-blue-700 text-sm uppercase mb-1">💡 Health Advice of the Day</h3>
            <p className="text-blue-800 text-sm">Drink at least 8 glasses of water today to stay properly hydrated and maintain your energy levels!</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Bookings</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading your schedule...</p>
          ) : appointments.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500">You have no upcoming appointments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appt, index) => (
                <div key={index} className="p-4 border border-gray-100 rounded-lg flex justify-between items-center bg-gray-50">
                  <div>
                    <h4 className="font-bold text-gray-800">Dr. {appt.doctor?.name || "Doctor"}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(appt.date).toLocaleDateString()} at {appt.time}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {appt.status?.toUpperCase() || "PENDING"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}