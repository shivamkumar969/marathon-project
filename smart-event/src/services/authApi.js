import axios from "axios";
import config from "../config";

const API = `${config.API_BASE_URL}/api/auth`;

export const registerUser = (data) => axios.post(`${API}/register`, data);

export const loginUser = (data) => axios.post(`${API}/login`, data);

export const getCoordinators = () => axios.get(`${API}/coordinators`);

export const forgotPassword = (data) => axios.post(`${API}/forgot-password`, data);