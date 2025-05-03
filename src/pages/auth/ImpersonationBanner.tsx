import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/**
 * A banner to display when admin is impersonating a client
 * Should be placed at the top of client layout when impersonation is active
 */
const ImpersonationBanner: React.FC = () => {
    const { isImpersonated, impersonationInfo, endImpersonation } = useAuth();
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    // Use effect to properly sync the banner visibility with auth state
    useEffect(() => {
        // Only show banner when both flags are true and we have info
        setVisible(isImpersonated && !!impersonationInfo);
    }, [isImpersonated, impersonationInfo]);

    if (!visible) {
        return null;
    }

    return (
        <div className="bg-amber-500 text-white py-2 px-4 flex items-center justify-between">
            <div className="flex items-center">
                <span className="font-medium mr-2">Admin Session:</span>
                <span>
                    You are viewing {impersonationInfo.clientName}'s account ({impersonationInfo.clientEmail}) as administrator {impersonationInfo.adminName}
                </span>
            </div>
            <button
                onClick={() => endImpersonation(navigate)}
                className="bg-white text-amber-500 px-3 py-1 rounded-md hover:bg-amber-50 transition-colors flex items-center"
            >
                <span className="mr-1">Exit Client View</span>
                <X size={16} />
            </button>
        </div>
    );
};

export default ImpersonationBanner;