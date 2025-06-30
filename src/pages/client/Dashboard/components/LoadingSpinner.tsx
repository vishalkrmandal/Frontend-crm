// Frontend/src/components/common/LoadingSpinner.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    className = '',
    text
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
    };

    return (
        <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
            <Loader2
                className={`animate-spin text-blue-500 ${sizeClasses[size]}`}
            />
            {text && (
                <p className={`text-muted-foreground ${textSizeClasses[size]}`}>
                    {text}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;