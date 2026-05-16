import axiosInstance from "./axiosInstance";

export const getPatientAppointments = async () => {
  const response = await axiosInstance.get("/api/appointments");
  return response.data;
};

export const getDoctorAppointments = async () => {
  const response = await axiosInstance.get(`/api/appointments`);
  return response.data;
};

export const updateAppointmentStatus = async (id, status) => {
  const response = await axiosInstance.put(`/api/appointments/${id}/status`, { status });
  return response.data;
};

export const createAppointment = async (appointmentData) => {
  const response = await axiosInstance.post("/api/appointments", appointmentData);
  return response.data;
};

export const submitReview = async (appointmentId, reviewData) => {
  const response = await axiosInstance.post(`/api/appointments/${appointmentId}/reviews`, reviewData);
  return response.data;
};