import axiosInstance from "./axiosInstance";

export const registerApi = async ({ name, email, password, role }) => {
  const response = await axiosInstance.post("/api/auth/register", {
    name,
    email,
    password,
    role,
  });

  return response.data;
};

export const loginApi = async ({ email, password }) => {
  const response = await axiosInstance.post("/api/auth/login", {
    email,
    password,
  });

  return response.data;
};