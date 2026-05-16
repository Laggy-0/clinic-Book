import axiosInstance from "./axiosInstance";

export const getDoctorSlots = async (doctorId) => {

  const response = await axiosInstance.get(`/api/slots?doctor_id=${doctorId}`);
  return response.data;
};

export const createSlot = async (slotData) => {

  const response = await axiosInstance.post("/api/slots", slotData);
  return response.data;
};

export const deleteSlot = async (id) => {
  const response = await axiosInstance.delete(`/api/slots/${id}`);
  return response.data;
};