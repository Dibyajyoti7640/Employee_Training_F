import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5007/api', // Change this to your backend URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config;
})

export default api;
