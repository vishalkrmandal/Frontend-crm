// Frontend/src/api/studentApi.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FilterParams {
  gender?: string;
  school?: string;
  programme?: string;
  block?: string;
  state?: string;
  year?: string;
  search?: string;
}

interface UpdateStudentData {
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  gender: string;
  block: string;
  roomNo: string;
  state: string;
}

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export const getStudents = async (filters?: FilterParams) => {
  try {
    const response = await axios.get(
      `${API_URL}/students${filters ? '/filter' : ''}`,
      {
        ...getAuthHeaders(),
        params: filters
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStudent = async (id: string, data: UpdateStudentData) => {
  try {
    const response = await axios.put(
      `${API_URL}/students/${id}`, 
      data,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteStudent = async (id: string, reason: string) => {
  try {
    const response = await axios.delete(
      `${API_URL}/students/${id}`,
      {
        ...getAuthHeaders(),
        data: { reason }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/students/dashboard/stats`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};