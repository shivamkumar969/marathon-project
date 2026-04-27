import axios from "axios";
import config from "../config";

const API = `${config.API_BASE_URL}/api/registrations`;

export const getMyRegistrations =
(userId) =>
axios.get(`${API}/user/${userId}`);

export const withdrawRegistration = (id) => axios.delete(`${API}/${id}`);

export const registerEvent = (data) => axios.post(API, data);

export const getAllRegistrations = () => axios.get(API);