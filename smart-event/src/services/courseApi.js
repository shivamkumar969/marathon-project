import axios from "axios";
import config from "../config";

const API = `${config.API_BASE_URL}/api/courses`;

export const getCourses = () => axios.get(API);
export const createCourse = (data) => axios.post(API, data);
export const deleteCourse = (id) => axios.delete(`${API}/${id}`);
