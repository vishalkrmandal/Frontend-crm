// Frontend\src\utils\impersonation.ts

interface UserData {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
}

/**
 * Handles client impersonation by an admin
 * 
 * @param clientToken JWT token for the client
 * @param userData Client user data
 */
export const impersonateClient = (clientToken: string, userData: UserData) => {
    // Store the client token in localStorage with a different key than the admin token
    localStorage.setItem('clientToken', clientToken);
    localStorage.setItem('clientUser', JSON.stringify(userData));

    // Flag to indicate impersonation mode - useful for UI indicators
    localStorage.setItem('isImpersonated', 'true');

    // Add admin reference for returning to admin panel
    const adminToken = localStorage.getItem('token');
    const adminUser = localStorage.getItem('user');

    if (adminToken && adminUser) {
        localStorage.setItem('adminToken', adminToken);
        localStorage.setItem('adminUser', adminUser);
    }

    // Open client dashboard in a new tab
    // Adjust the URL to point to your client dashboard
    const clientUrl = `${window.location.origin}/client`;
    window.open(clientUrl, '_blank');
};

/**
 * Ends client impersonation and returns to admin state
 */
export const endImpersonation = () => {
    // Restore admin token and user
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');

    if (adminToken && adminUser) {
        localStorage.setItem('token', adminToken);
        localStorage.setItem('user', adminUser);
    }

    // Remove client-specific items
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    localStorage.removeItem('isImpersonated');
    // localStorage.removeItem('adminToken');
    // localStorage.removeItem('adminUser');

    // Redirect to admin panel
    window.location.href = `${window.location.origin}/admin`;
};

/**
 * Check if current session is an impersonation
 */
export const isImpersonationActive = (): boolean => {
    return localStorage.getItem('isImpersonated') === 'true';
};

/**
 * Get impersonation info for UI display
 */
export const getImpersonationInfo = () => {
    if (!isImpersonationActive()) {
        return null;
    }

    try {
        const clientUser = JSON.parse(localStorage.getItem('clientUser') || '{}');
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

        return {
            clientName: `${clientUser.firstname} ${clientUser.lastname}`,
            clientEmail: clientUser.email,
            adminName: `${adminUser.firstname} ${adminUser.lastname}`
        };
    } catch (error) {
        console.error('Error parsing impersonation info', error);
        return null;
    }
};