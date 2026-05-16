import axiosInstance from "./axiosInstance";

export const getSpecialties = async () => {
  const response = await axiosInstance.get("/api/specialties");
  return response.data;
};

export const createSpecialty = async ({ name, description }) => {
  const response = await axiosInstance.post("/api/specialties", { name, description });
  return response.data;
};

export const updateSpecialty = async (id, { name, description }) => {
  const response = await axiosInstance.put(`/api/specialties/${id}`, { name, description });
  return response.data;
};

export const deleteSpecialty = async (id) => {
  const response = await axiosInstance.delete(`/api/specialties/${id}`);
  return response.data;
};