import axios from "axios";

const API = "http://localhost:5000/api/courses";

export const getCourses = () => axios.get(API);
export const createCourse = (data) => axios.post(API, data);
export const deleteCourse = (id) => axios.delete(`${API}/${id}`);
