import axios from "axios";
import config from "../config";

const API = `${config.API_BASE_URL}/api/winners`;

export const markWinner = (data) =>
axios.post(API, data);

export const getWinners = () =>
axios.get(API);