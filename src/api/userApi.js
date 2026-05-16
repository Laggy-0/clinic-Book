import axiosInstance from "./axiosInstance";

export const getMe = async () => {
  const response = await axiosInstance.get("/api/auth/me");
  return response.data;
};

export const updateUserProfile = async (id, data) => {
  const response = await axiosInstance.put(`/api/users/${id}`, data);
  return response.data;
};

export const uploadAvatar = async (id, formData) => {
  const response = await axiosInstance.post(`/api/users/${id}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const removeAvatar = async (id) => {
  // Uses the DELETE method to remove the avatar resource
  const response = await axiosInstance.delete(`/api/users/${id}/avatar`);
  return response.data;
};