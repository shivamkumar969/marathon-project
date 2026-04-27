import axios from "axios";

const API =
"http://localhost:5000/api/winners";

export const markWinner = (data) =>
axios.post(API, data);

export const getWinners = () =>
axios.get(API);