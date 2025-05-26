// src/api/ibApi.ts

import axios from "axios";

// Define API base URL - should be set in your environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

// Setup axios instance with auth token
const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    };
};

// Group API functions
export const getGroups = async (): Promise<Group[]> => {
    try {
        const response = await axios.get(`${API_URL}/api/groups`, getAuthHeader());
        return response.data.data;
    } catch (error) {
        console.error("Error fetching groups:", error);
        throw error;
    }
};

// IB Configuration API functions
export const getIBConfigurationsByGroup = async (groupId: string): Promise<IBConfiguration[]> => {
    try {
        const response = await axios.get(
            `${API_URL}/api/ib-configurations/group/${groupId}`,
            getAuthHeader()
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching IB configurations:", error);
        throw error;
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
        return response.data.data;
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
        return response.data.data;
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

// // IB Partners API functions (placeholder for future implementation)
// export const getIBPartners = async (): Promise<IBPartner[]> => {
//     // This would be replaced with an actual API call
//     // For now, return sample data
//     return [
//         {
//             id: 1,
//             user: {
//                 name: "John Smith",
//                 email: "john@example.com",
//                 avatar: "/placeholder.svg",
//             },
//             accountNumber: "IB10023",
//             dateCreated: "2025-01-15T14:30:00",
//             kycVerified: true,
//             referralLink: "https://example.com/ref/john-smith",
//             status: "Active",
//         },
//         {
//             id: 2,
//             user: {
//                 name: "Emily Johnson",
//                 email: "emily@example.com",
//                 avatar: "/placeholder.svg",
//             },
//             accountNumber: "IB10024",
//             dateCreated: "2025-02-10T09:15:00",
//             kycVerified: true,
//             referralLink: "https://example.com/ref/emily-johnson",
//             status: "Active",
//         },
//         {
//             id: 3,
//             user: {
//                 name: "Michael Chen",
//                 email: "michael@example.com",
//                 avatar: "/placeholder.svg",
//             },
//             accountNumber: "IB10025",
//             dateCreated: "2025-02-25T16:45:00",
//             kycVerified: false,
//             referralLink: "https://example.com/ref/michael-chen",
//             status: "Pending",
//         },
//         {
//             id: 4,
//             user: {
//                 name: "Sarah Williams",
//                 email: "sarah@example.com",
//                 avatar: "/placeholder.svg",
//             },
//             accountNumber: "IB10026",
//             dateCreated: "2025-01-20T11:20:00",
//             kycVerified: true,
//             referralLink: "https://example.com/ref/sarah-williams",
//             status: "Active",
//         },
//         {
//             id: 5,
//             user: {
//                 name: "David Rodriguez",
//                 email: "david@example.com",
//                 avatar: "/placeholder.svg",
//             },
//             accountNumber: "IB10027",
//             dateCreated: "2025-03-05T08:30:00",
//             kycVerified: false,
//             referralLink: "https://example.com/ref/david-rodriguez",
//             status: "Pending",
//         },
//         {
//             id: 6,
//             user: {
//                 name: "Lisa Kim",
//                 email: "lisa@example.com",
//                 avatar: "/placeholder.svg",
//             },
//             accountNumber: "IB10028",
//             dateCreated: "2025-02-18T13:10:00",
//             kycVerified: true,
//             referralLink: "https://example.com/ref/lisa-kim",
//             status: "Inactive",
//         },
//     ];
// };