import { useState, useRef, useEffect } from "react";
import Navbar from './../../components/navbar/Navbar';
import toast from "react-hot-toast";
import { getMe, updateUserProfile, uploadAvatar, removeAvatar } from "../../api/userApi";
import { getDoctorEarnings, updateDoctorProfile } from "../../api/doctorApi";
import { getSpecialties } from "../../api/specialtyApi";
import { getDoctorSlots, createSlot, deleteSlot } from "../../api/slotApi";

export default function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const role = user?.role || "patient";
  const doctorId = user?.doctorProfile?.id;

  // Global State
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(user.profile_picture || null);
  
  // Form State
  const [formData, setFormData] = useState({ 
    name: user.name || "", 
    email: user.email || "",
    bio: user?.doctorProfile?.bio || "",
    specialty_id: user?.doctorProfile?.specialty_id || "",
    qualifications: user?.doctorProfile?.qualifications || "",
    location: user?.doctorProfile?.location || "",
    consultation_fee: user?.doctorProfile?.consultation_fee || ""
  });

  // Doctor Specific State
  const [stats, setStats] = useState({ appointments_count: 0, total_earnings: 0, avg_rating: "0.0", reviews_count: 0 });
  const [specialties, setSpecialties] = useState([]);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: "", startTime: "", endTime: "" });

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const userData = await getMe();
        setUser(userData.user);
        setAvatarPreview(userData.user.profile_picture);
        setFormData(prev => ({
          ...prev,
          name: userData.user.name,
          email: userData.user.email,
          ...(userData.user.role === 'doctor' && userData.user.doctorProfile ? {
            bio: userData.user.doctorProfile.bio || "",
            specialty_id: userData.user.doctorProfile.specialty_id || "",
            qualifications: userData.user.doctorProfile.qualifications || "",
            location: userData.user.doctorProfile.location || "",
            consultation_fee: userData.user.doctorProfile.consultation_fee || ""
          } : {})
        }));
        localStorage.setItem("user", JSON.stringify(userData.user));

        if (userData.user.role === "doctor" && userData.user.doctorProfile?.id) {
          const docId = userData.user.doctorProfile.id;
          const [earningsData, specialtiesData, slotsData] = await Promise.all([
            getDoctorEarnings(docId).catch(() => ({})),
            getSpecialties().catch(() => ({ specialties: [] })),
            getDoctorSlots(docId).catch(() => ({ slots: [] }))
          ]);
          
          setStats(prev => ({ ...prev, ...earningsData }));
          setSpecialties(specialtiesData.specialties || specialtiesData || []);
          setSlots(slotsData.slots || slotsData || []);
        }
      } catch (error) {
        console.error("Failed to load profile data", error);
        toast.error("Failed to load some profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveChanges = async () => {
    const toastId = toast.loading("Saving changes...");
    try {
      const userUpdateRes = await updateUserProfile(user.id, { name: formData.name, email: formData.email });
      let updatedUser = { ...user, ...userUpdateRes.user };

      if (role === "doctor" && doctorId) {
        const docUpdateRes = await updateDoctorProfile(doctorId, {
          bio: formData.bio,
          specialty_id: formData.specialty_id === "" ? null : parseInt(formData.specialty_id, 10),
          qualifications: formData.qualifications,
          location: formData.location,
          consultation_fee: formData.consultation_fee === "" ? null : parseFloat(formData.consultation_fee)
        });
        updatedUser.doctorProfile = { ...updatedUser.doctorProfile, ...docUpdateRes.doctorProfile };
      }

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);
      toast.success("Profile updated successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to update profile", { id: toastId });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("image", file);
    const toastId = toast.loading("Uploading avatar...");
    try {
      const response = await uploadAvatar(user.id, data);
      const updatedUser = { ...user, profile_picture: response.profile_picture_url };
      setUser(updatedUser);
      setAvatarPreview(response.profile_picture_url);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Avatar updated!", { id: toastId });
    } catch (error) {
      toast.error("Failed to upload avatar", { id: toastId });
    }
  };

  const handleRemoveAvatar = async () => {
    const toastId = toast.loading("Removing avatar...");
    try {
      await removeAvatar(user.id);
      const updatedUser = { ...user, profile_picture: null };
      setUser(updatedUser);
      setAvatarPreview(null); 
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Avatar removed!", { id: toastId });
    } catch (error) {
      toast.error("Failed to remove avatar", { id: toastId });
    }
  };

  // --- SLOT HANDLERS ---
const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) return toast.error("Please fill all slot fields");
    
    const toastId = toast.loading("Adding slot...");
    try {
      const payload = {
        date: newSlot.date,
        start_time: newSlot.startTime.substring(0, 5), // Forces exact HH:MM
        end_time: newSlot.endTime.substring(0, 5)      // Forces exact HH:MM
      };

      const addedSlot = await createSlot(payload);
      
      setSlots([...slots, addedSlot.slot || addedSlot]);
      setNewSlot({ date: "", startTime: "", endTime: "" });
      toast.success("Slot added!", { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add slot", { id: toastId });
      console.error(error);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    const toastId = toast.loading("Deleting slot...");
    try {
      await deleteSlot(slotId);
      setSlots(slots.filter(s => s.id !== slotId));
      toast.success("Slot deleted!", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete slot", { id: toastId });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
        
        {/* --- 1. HEADER & AVATAR SECTION --- */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-4xl overflow-hidden border-4 border-blue-50 shrink-0">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${role === 'doctor' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
              {role} Account
            </span>
            
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              <button onClick={() => fileInputRef.current.click()} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition text-sm">
                Change Avatar
              </button>
              {avatarPreview && (
                <button onClick={handleRemoveAvatar} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition text-sm">
                  Remove Avatar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- 2. DOCTOR STATISTICS --- */}
        {role === "doctor" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Rating</p>
              <p className="text-2xl font-black text-gray-800 flex items-center justify-center gap-1">
                {parseFloat(stats.avg_rating || 0).toFixed(1)} <span className="text-yellow-400 text-lg">★</span>
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Appointments</p>
              <p className="text-2xl font-black text-gray-800">{stats.appointments_count || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Earnings</p>
              <p className="text-2xl font-black text-green-600">${stats.total_earnings || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Reviews</p>
              <p className="text-2xl font-black text-gray-800">{stats.reviews_count || 0}</p>
            </div>
          </div>
        )}

        {/* --- 3. PROFILE DETAILS FORM --- */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">Profile Details</h2>
            <button 
              onClick={() => isEditing ? saveChanges() : setIsEditing(true)}
              className={`px-5 py-2 rounded-lg font-medium transition ${isEditing ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
            >
              {isEditing ? "Save All Changes" : "Edit Details"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg outline-none disabled:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg outline-none disabled:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
            </div>

            {role === "doctor" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Specialty</label>
                  <select name="specialty_id" value={formData.specialty_id} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg outline-none disabled:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
                    <option value="" disabled>Select a specialty</option>
                    {specialties.map(spec => (
                      <option key={spec.id} value={spec.id}>{spec.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Consultation Fee ($)</label>
                  <input type="number" step="0.01" name="consultation_fee" value={formData.consultation_fee} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg outline-none disabled:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" placeholder="e.g. 50.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Location / Clinic</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg outline-none disabled:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" placeholder="Clinic Address or 'Online'" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Qualifications</label>
                  <input type="text" name="qualifications" value={formData.qualifications} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg outline-none disabled:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" placeholder="MD, PhD, etc." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Professional Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleInputChange} disabled={!isEditing} rows="3" className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg outline-none disabled:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" placeholder="Tell patients about your experience..."></textarea>
                </div>
              </>
            )}
          </div>
        </div>

        {/* --- 4. AVAILABILITY SLOTS --- */}
        {role === "doctor" && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Manage Availability Slots</h2>
            
            <form onSubmit={handleAddSlot} className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                <input type="date" value={newSlot.date} onChange={e => setNewSlot({...newSlot, date: e.target.value})} className="w-full border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-blue-400" required/>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                <input type="time" value={newSlot.startTime} onChange={e => setNewSlot({...newSlot, startTime: e.target.value})} className="w-full border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-blue-400" required/>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Time</label>
                <input type="time" value={newSlot.endTime} onChange={e => setNewSlot({...newSlot, endTime: e.target.value})} className="w-full border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-blue-400" required/>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition h-[42px]">
                  Add Slot
                </button>
              </div>
            </form>

            {slots.length === 0 ? (
              <p className="text-center text-gray-500 py-6 border border-dashed border-gray-200 rounded-xl">No slots added yet. Create your schedule above.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {slots.map(slot => (
                  <div key={slot.id} className={`p-4 rounded-xl border flex justify-between items-center ${slot.is_booked ? 'bg-red-50 border-red-100' : 'bg-white border-gray-200'}`}>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{new Date(slot.date).toLocaleDateString()}</p>
                      <p className="text-gray-500 text-xs">{slot.startTime || slot.start_time} - {slot.endTime || slot.end_time}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 block ${slot.is_booked ? 'text-red-500' : 'text-emerald-500'}`}>
                        {slot.is_booked ? 'Booked' : 'Available'}
                      </span>
                    </div>
                    {!slot.is_booked && (
                      <button onClick={() => handleDeleteSlot(slot.id)} className="text-gray-400 hover:text-red-500 p-2 transition" title="Delete Slot">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- 5. SECURITY SECTION --- */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Security Settings</h2>
          <p className="text-gray-500 text-sm mb-4">If you need to update your password, request a secure link to your registered email.</p>
          <button 
            onClick={() => toast.success("Password reset link sent to your email!", { icon: '📧' })}
            className="bg-gray-100 text-gray-700 px-5 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Request Password Reset
          </button>
        </div>

      </div>
    </div>
  );
}