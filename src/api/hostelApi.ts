// Frontend/src/api/hostelApi.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getHostelOccupancy = async () => {
  const response = await axios.get(`${API_URL}/hostel/occupancy`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};