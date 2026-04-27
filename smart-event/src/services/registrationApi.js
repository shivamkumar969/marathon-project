import axios from "axios";

const API =
"http://localhost:5000/api/registrations";

export const getMyRegistrations =
(userId) =>
axios.get(`${API}/user/${userId}`);

export const withdrawRegistration = (id) => axios.delete(`${API}/${id}`);

export const registerEvent = (data) => axios.post(API, data);

export const getAllRegistrations = () => axios.get(API);