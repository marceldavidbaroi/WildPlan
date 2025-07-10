// boot/ai.js
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const apiAI = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

apiAI.interceptors.request.use(async (config) => {
  const token = await getAuth().currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiAI;
