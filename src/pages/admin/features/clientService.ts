// Frontend\src\services\api\clientService.ts

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const clientService = {
    // Get all clients
    getAllClients: async () => {
        try {
            const response = await axios.get(`${API_URL}/clients`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log("Client data response:", response.data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get client details
    getClientDetails: async (id: string) => {
        try {
            const response = await axios.get(`${API_URL}/clients/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update client
    updateClient: async (id: string, clientData: any) => {
        try {
            const response = await axios.put(`${API_URL}/clients/${id}`, clientData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update client password
    updateClientPassword: async (id: string, password: string) => {
        try {
            const response = await axios.put(`${API_URL}/clients/${id}/update-password`, { password }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get client password
    getClientPassword: async (id: string) => {
        try {
            const response = await axios.get(`${API_URL}/clients/${id}/password`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Suspend client
    suspendClient: async (id: string) => {
        try {
            const response = await axios.put(`${API_URL}/clients/${id}/suspend`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Activate client
    activateClient: async (id: string) => {
        try {
            const response = await axios.put(`${API_URL}/clients/${id}/activate`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Export clients to Excel
    exportToExcel: async () => {
        try {
            const response = await axios.get(`${API_URL}/clients/export/excel`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                responseType: 'blob'
            });

            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'clients.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            throw error;
        }
    },

    // Export clients to PDF
    exportToPdf: async () => {
        try {
            const response = await axios.get(`${API_URL}/clients/export/pdf`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                responseType: 'blob'
            });

            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'clients.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            throw error;
        }
    }
};

export default clientService;