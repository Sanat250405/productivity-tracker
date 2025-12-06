// client/src/api.js
import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  // Ensure this points to your backend URL (ending in /api if that's how you set .env)
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Helper: Wait for Firebase to verify if a user is logged in or not
const waitForAuth = () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe(); // Unsubscribe immediately after getting the status
      resolve(user);
    });
  });
};

api.interceptors.request.use(
  async (config) => {
    try {
      // 1. Check if user is already loaded in memory
      let user = auth.currentUser;

      // 2. If not loaded yet, wait for Firebase initialization
      if (!user) {
         user = await waitForAuth();
      }

      // 3. If we have a valid user, get the token and attach it
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error attaching token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;