// Frontend\src\hooks\useAuth.tsx
import { useState, useEffect, createContext, useContext } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { isImpersonationActive, getImpersonationInfo, endImpersonation as endImpersonationUtil } from '@/utils/impersonation';
import axios from 'axios';

// Replace process.env with import.meta.env for Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface User {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    adminUser: User | null;
    clientUser: User | null;
    superadminUser: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isImpersonated: boolean;
    activeRole: string | null; // 'client', 'admin', or 'superadmin'
    impersonationInfo: any;
    login: (email: string, password: string, navigate: NavigateFunction) => Promise<void>;
    logout: (role?: string, navigate?: NavigateFunction) => void;
    switchRole: (role: string, navigate?: NavigateFunction) => void;
    endImpersonation: (navigate?: NavigateFunction) => void;
    hasMultipleRoles: () => boolean;
    getToken: (userType: 'client' | 'admin') => string | null; // ADD THIS LINE
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a named function component instead of an anonymous arrow function
function AuthProviderComponent({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [clientUser, setClientUser] = useState<User | null>(null);
    const [superadminUser, setSuperadminUser] = useState<User | null>(null);
    const [activeRole, setActiveRole] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isImpersonated, setIsImpersonated] = useState(false);
    const [impersonationInfo, setImpersonationInfo] = useState<{ clientName: string; clientEmail: any; adminName: string } | null>(null);

    // Get token based on user type for notifications
    const getToken = (userType: 'client' | 'admin'): string | null => {
        if (userType === 'admin') {
            // For admin, check both admin and superadmin tokens
            return localStorage.getItem('adminToken') || localStorage.getItem('superadminToken');
        } else {
            // For client, get client token
            return localStorage.getItem('clientToken');
        }
    };


    // Check if the user is authenticated on initial load
    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);

            try {
                // Load all possible user roles from localStorage
                const adminToken = localStorage.getItem('adminToken');
                const clientToken = localStorage.getItem('clientToken');
                const superadminToken = localStorage.getItem('superadminToken');
                const adminUserStr = localStorage.getItem('adminUser');
                const clientUserStr = localStorage.getItem('clientUser');
                const superadminUserStr = localStorage.getItem('superadminUser');

                // Set all available user objects
                if (adminUserStr) setAdminUser(JSON.parse(adminUserStr));
                if (clientUserStr) setClientUser(JSON.parse(clientUserStr));
                if (superadminUserStr) setSuperadminUser(JSON.parse(superadminUserStr));

                // Check if impersonation is active
                if (isImpersonationActive() && clientToken && clientUserStr) {
                    const clientUser = JSON.parse(clientUserStr);
                    setUser(clientUser);
                    setActiveRole('client');
                    setIsAuthenticated(true);
                    setIsImpersonated(true);
                    setImpersonationInfo(getImpersonationInfo());
                    setIsLoading(false);
                    return;
                }

                // Determine which role to activate first (priority order)
                if (superadminToken && superadminUserStr) {
                    const userData = JSON.parse(superadminUserStr);
                    setUser(userData);
                    setActiveRole('superadmin');
                    setIsAuthenticated(true);
                } else if (adminToken && adminUserStr) {
                    const userData = JSON.parse(adminUserStr);
                    setUser(userData);
                    setActiveRole('admin');
                    setIsAuthenticated(true);
                } else if (clientToken && clientUserStr) {
                    const userData = JSON.parse(clientUserStr);
                    setUser(userData);
                    setActiveRole('client');
                    setIsAuthenticated(true);
                } else {
                    // No valid tokens found
                    setUser(null);
                    setActiveRole(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Authentication error:', error);
                setUser(null);
                setActiveRole(null);
                setIsAuthenticated(false);
            }

            setIsLoading(false);
        };

        checkAuth();
    }, []);

    // Function to check if user is logged in with multiple roles
    const hasMultipleRoles = () => {
        let roleCount = 0;
        if (localStorage.getItem('adminToken')) roleCount++;
        if (localStorage.getItem('clientToken')) roleCount++;
        if (localStorage.getItem('superadminToken')) roleCount++;
        return roleCount > 1;
    };

    // Function to switch between roles if multiple logins exist
    const switchRole = (role: string, navigate?: NavigateFunction) => {
        if (!['admin', 'client', 'superadmin'].includes(role)) {
            console.error('Invalid role specified');
            return;
        }

        const token = localStorage.getItem(`${role}Token`);
        const userStr = localStorage.getItem(`${role}User`);

        if (!token || !userStr) {
            console.error(`No ${role} credentials found`);
            return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);
        setActiveRole(role);
        setIsAuthenticated(true);

        // Update axios default headers
        const api = axios.create({
            baseURL: API_URL,
        });
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Redirect to appropriate route if navigate function is provided
        if (navigate) {
            if (role === 'client') {
                navigate('/client');
            } else {
                navigate('/admin');
            }
        }
    };

    const login = async (email: string, password: string, navigate: NavigateFunction) => {
        try {
            const api = axios.create({
                baseURL: API_URL,
            });
            const response = await api.post('/api/auth/login', { email, password });

            if (response.data.success) {
                const { token, user } = response.data;
                const role = user.role;

                // Store auth data based on role
                localStorage.setItem(`${role}Token`, token);
                localStorage.setItem(`${role}User`, JSON.stringify(user));

                // Update role-specific user state
                if (role === 'admin') {
                    setAdminUser(user);
                } else if (role === 'superadmin') {
                    setSuperadminUser(user);
                } else if (role === 'client') {
                    setClientUser(user);
                }

                // Update active user state
                setUser(user);
                setActiveRole(role);
                setIsAuthenticated(true);

                // Set authorization header for future requests
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Redirect based on role
                if (role === 'admin' || role === 'superadmin') {
                    navigate('/admin');
                } else {
                    navigate('/client');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = (role?: string, navigate?: NavigateFunction) => {
        if (role) {
            // Log out from specific role only
            localStorage.removeItem(`${role}Token`);
            localStorage.removeItem(`${role}User`);

            // Update state for that role
            if (role === 'admin') {
                setAdminUser(null);
            } else if (role === 'superadmin') {
                setSuperadminUser(null);
            } else if (role === 'client') {
                setClientUser(null);
            }

            // If current active role is being logged out, switch to another available role
            if (activeRole === role) {
                // Find another role to switch to
                if (role !== 'superadmin' && localStorage.getItem('superadminToken')) {
                    switchRole('superadmin', navigate);
                    return;
                } else if (role !== 'admin' && localStorage.getItem('adminToken')) {
                    switchRole('admin', navigate);
                    return;
                } else if (role !== 'client' && localStorage.getItem('clientToken')) {
                    switchRole('client', navigate);
                    return;
                } else {
                    // No other roles available, log out completely
                    logoutAll(navigate);
                }
            }
        } else {
            // Full logout from all roles
            logoutAll(navigate);
        }
    };

    // Helper function to log out from all roles
    const logoutAll = (navigate?: NavigateFunction) => {
        // Clear all auth-related data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientUser');
        localStorage.removeItem('superadminToken');
        localStorage.removeItem('superadminUser');
        localStorage.removeItem('isImpersonated');

        // Reset all auth state
        setUser(null);
        setAdminUser(null);
        setClientUser(null);
        setSuperadminUser(null);
        setActiveRole(null);
        setIsAuthenticated(false);
        setIsImpersonated(false);
        setImpersonationInfo(null);

        // Clear API header
        const api = axios.create({
            baseURL: API_URL,
        });
        delete api.defaults.headers.common['Authorization'];

        // Redirect to login if navigate function is provided
        if (navigate) {
            navigate('/');
        }
    };

    const handleEndImpersonation = (navigate?: NavigateFunction) => {
        // Call utility function to end impersonation
        endImpersonationUtil();

        // Update state
        setIsImpersonated(false);
        setImpersonationInfo(null);

        // If admin was previously logged in, switch back to admin role
        if (localStorage.getItem('adminToken')) {
            switchRole('admin', navigate);
        } else if (localStorage.getItem('superadminToken')) {
            switchRole('superadmin', navigate);
        } else if (navigate) {
            // No admin role available, go to login
            navigate('/');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                adminUser,
                clientUser,
                superadminUser,
                isAuthenticated,
                isLoading,
                isImpersonated,
                activeRole,
                impersonationInfo,
                login,
                logout,
                switchRole,
                hasMultipleRoles,
                endImpersonation: handleEndImpersonation,
                getToken
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Named function for the custom hook
function useAuthHook() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Export the named components using default exports pattern
export const AuthProvider = AuthProviderComponent;
export const useAuth = useAuthHook;

// Alternative solution:
// Export default the hook and keep the provider as a named export
// export { AuthProviderComponent as AuthProvider };
// export default useAuthHook;