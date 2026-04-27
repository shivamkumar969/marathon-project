import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

export const getAllUsers = () => {
  return axios.get(API_URL);
};

export const updateUserRole = (id, role) => {
  return axios.put(`${API_URL}/${id}`, { role });
};

export const deleteUser = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

export const createUser = (userData) => {
  return axios.post(API_URL, userData);
};
