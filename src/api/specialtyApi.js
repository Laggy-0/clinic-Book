import axiosInstance from "./axiosInstance";

export const getSpecialties = async () => {
  const response = await axiosInstance.get("/api/specialties");
  return response.data;
};