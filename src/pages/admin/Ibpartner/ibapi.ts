// src/api/ibApi.ts

import axios from "axios";

// Define API base URL - should be set in your environment
const API_URL = import.meta.env.VITE_API_URL

// Types
export interface Group {
    _id: string;
    name: string;
    value: string;
    description: string;
}

export interface IBConfiguration {
    _id: string;
    groupId: string | Group;
    level: number;
    bonusPerLot: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface IBPartner {
    id: number;
    user: {
        name: string;
        email: string;
        avatar: string;
    };
    accountNumber: string;
    dateCreated: string;
    kycVerified: boolean;
    referralLink: string;
    status: string;
}

// Setup axios instance with auth token and ngrok bypass
const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'ngrok-skip-browser-warning': 'true'
        }
    };
};

// Group API functions
export const getGroups = async (): Promise<Group[]> => {
    try {
        const response = await axios.get(`${API_URL}/api/groups`, getAuthHeader());
        console.log("Groups API response:", response.data);

        // Handle different response structures
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
            return response.data;
        } else {
            console.warn("Unexpected groups response structure:", response.data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching groups:", error);
        // Return empty array instead of throwing
        return [];
    }
};

// IB Configuration API functions
export const getIBConfigurationsByGroup = async (groupId: string): Promise<IBConfiguration[]> => {
    try {
        const response = await axios.get(
            `${API_URL}/api/ib-configurations/group/${groupId}`,
            getAuthHeader()
        );
        console.log("IB Configurations API response:", response.data);

        // Handle different response structures
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
            return response.data;
        } else {
            console.warn("Unexpected IB configurations response structure:", response.data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching IB configurations:", error);
        // Return empty array instead of throwing
        return [];
    }
};

export const createIBConfiguration = async (
    groupId: string,
    level: number,
    bonusPerLot: number
): Promise<IBConfiguration> => {
    try {
        const response = await axios.post(
            `${API_URL}/api/ib-configurations`,
            { groupId, level, bonusPerLot },
            getAuthHeader()
        );

        // Handle different response structures
        if (response.data && response.data.data) {
            return response.data.data;
        } else if (response.data) {
            return response.data;
        } else {
            throw new Error("Invalid response structure");
        }
    } catch (error) {
        console.error("Error creating IB configuration:", error);
        throw error;
    }
};

export const updateIBConfiguration = async (
    id: string,
    bonusPerLot: number
): Promise<IBConfiguration> => {
    try {
        const response = await axios.put(
            `${API_URL}/api/ib-configurations/${id}`,
            { bonusPerLot },
            getAuthHeader()
        );

        // Handle different response structures
        if (response.data && response.data.data) {
            return response.data.data;
        } else if (response.data) {
            return response.data;
        } else {
            throw new Error("Invalid response structure");
        }
    } catch (error) {
        console.error("Error updating IB configuration:", error);
        throw error;
    }
};

export const deleteIBConfiguration = async (id: string): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/api/ib-configurations/${id}`, getAuthHeader());
    } catch (error) {
        console.error("Error deleting IB configuration:", error);
        throw error;
    }
};