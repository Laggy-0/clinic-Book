import axiosInstance from "./axiosInstance";

export const getAdminStats = async () => {
  const response = await axiosInstance.get("/api/admin/stats");
  return response.data;
};

export const getAdminUsers = async ({ role, search, page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams();
  if (role) params.append("role", role);
  if (search) params.append("search", search);
  params.append("page", page);
  params.append("limit", limit);

  const response = await axiosInstance.get(`/api/admin/users?${params.toString()}`);
  return response.data;
};

export const updateAdminUser = async (id, data) => {
  const response = await axiosInstance.put(`/api/admin/users/${id}`, data);
  return response.data;
};
