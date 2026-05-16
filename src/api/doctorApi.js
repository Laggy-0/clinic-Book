import axiosInstance from "./axiosInstance";

export const getDoctorEarnings = async (doctorId) => {
  const response = await axiosInstance.get(`/api/doctors/${doctorId}/earnings`);
  return response.data;
};

export const updateDoctorProfile = async (doctorId, data) => {
  const response = await axiosInstance.put(`/api/doctors/${doctorId}`, data);
  return response.data;
};

// --- NEW SEARCH & PROFILE FUNCTIONS ---
export const searchDoctors = async (filters) => {
  const params = new URLSearchParams();

  // Passing exact parameters for the backend to handle ranges (e.g., Op.gte)
  if (filters.name) params.append("name", filters.name);
  if (filters.specialty) params.append("specialty", filters.specialty);
  if (filters.date) params.append("date", filters.date);
  if (filters.startTime) params.append("start_time", filters.startTime.substring(0, 5));
  if (filters.minPrice) params.append("min_price", filters.minPrice);
  if (filters.maxPrice) params.append("max_price", filters.maxPrice);
  if (filters.minRating) params.append("min_rating", filters.minRating);

  const response = await axiosInstance.get(`/api/doctors?${params.toString()}`);
  return response.data;
};

export const getDoctorById = async (id) => {
  const response = await axiosInstance.get(`/api/doctors/${id}`);
  return response.data;
};

export const getDoctorReviews = async (id) => {
  const response = await axiosInstance.get(`/api/doctors/${id}/reviews`);
  return response.data;
};