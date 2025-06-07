// Frontend\src\services\api\clientService.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const clientService = {

    // Get all clients
    getAllClients: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/clients`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                    'ngrok-skip-browser-warning': 'true'
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
            const response = await axios.get(`${API_BASE_URL}/api/clients/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                    'ngrok-skip-browser-warning': 'true'
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
            const response = await axios.put(`${API_BASE_URL}/api/clients/${id}`, clientData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                    'ngrok-skip-browser-warning': 'true'
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
            const response = await axios.put(`${API_BASE_URL}/api/clients/${id}/update-password`, { password }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                    'ngrok-skip-browser-warning': 'true'
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
            const response = await axios.get(`${API_BASE_URL}/api/clients/${id}/password`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                    'ngrok-skip-browser-warning': 'true'
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
            const response = await axios.put(`${API_BASE_URL}/api/clients/${id}/suspend`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                    'ngrok-skip-browser-warning': 'true'
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
            const response = await axios.put(`${API_BASE_URL}/api/clients/${id}/activate`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get all accounts for a specific user
    getUserAccounts: async (userId: string) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/clients/users/${userId}/accounts`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                    'ngrok-skip-browser-warning': 'true'
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
            const response = await axios.get(`${API_BASE_URL}/api/clients/export/excel`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                    'ngrok-skip-browser-warning': 'true'
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
            const response = await axios.get(`${API_BASE_URL}/api/clients/export/pdf`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                    'ngrok-skip-browser-warning': 'true'
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
    },

    // Impersonate client
    impersonateClient: async (clientId: string) => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/admin/impersonate/${clientId}`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                'ngrok-skip-browser-warning': 'true'
            }
        });
        return response.data;
    }
};

export default clientService;