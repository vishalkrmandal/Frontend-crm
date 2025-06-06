// Frontend/src/pages/auth/sign-in/ReferralRouteHandler.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import SignUp from './SignUp';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ReferralRouteHandler = () => {
    const { referralCode } = useParams();
    const navigate = useNavigate();
    const [validationState, setValidationState] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const [referrerName, setReferrerName] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!referralCode) {
            // This shouldn't happen as the route requires referralCode, but just in case
            navigate('/signup');
            return;
        }

        validateReferralCode();
    }, [referralCode, navigate]);

    const validateReferralCode = async () => {
        try {
            setValidationState('loading');

            const response = await axios.post(
                `${API_BASE_URL}/api/ibclients/ib-configurations/verify-referral`,
                { referralCode }
            );

            if (response.data.success) {
                setValidationState('valid');
                setReferrerName(response.data.referralInfo.referringUserName);
            } else {
                setValidationState('invalid');
                setError(response.data.message || 'Invalid referral code');
            }
        } catch (error: any) {
            console.error('Error validating referral code:', error);
            setValidationState('invalid');
            setError(
                error.response?.data?.message ||
                'Invalid or expired referral code'
            );
        }
    };

    const handleContinueWithNormalSignup = () => {
        // Navigate to normal signup without referral
        navigate('/signup');
    };

    const handleRetry = () => {
        validateReferralCode();
    };

    // Loading state
    if (validationState === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader className="text-center space-y-4 pb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Validating Referral
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-muted-foreground">
                            Please wait while we validate your referral code: <strong>{referralCode}</strong>
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Checking referral code validity...
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Invalid referral code state
    if (validationState === 'invalid') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader className="text-center space-y-4 pb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                            Invalid Referral Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Referral Code Not Found</AlertTitle>
                            <AlertDescription>
                                The referral code <strong>{referralCode}</strong> is invalid, expired, or doesn't exist in our system.
                            </AlertDescription>
                        </Alert>

                        <div className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {error}
                            </p>

                            <div className="space-y-3">
                                <Button
                                    onClick={handleContinueWithNormalSignup}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    Continue to Normal Signup
                                </Button>

                                <Button
                                    onClick={handleRetry}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Loader2 className="w-4 h-4 mr-2" />
                                    Retry Validation
                                </Button>
                            </div>

                            <div className="text-xs text-muted-foreground pt-4 border-t">
                                <p>If you believe this is an error, please contact the person who shared this link with you.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Valid referral code - show signup form with pre-filled referral
    if (validationState === 'valid') {
        return (
            <div className="relative">
                {/* Success notification at the top */}
                {/* <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
                    <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 shadow-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800 dark:text-green-200">
                            Valid Referral Code!
                        </AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-300">
                            You were referred by <strong>{referrerName}</strong>.
                            The referral code has been automatically applied to your registration.
                        </AlertDescription>
                    </Alert>
                </div> */}

                {/* Render the signup form with the validated referral code */}
                <SignUp validReferral={{
                    code: referralCode!,
                    userName: referrerName,
                    preValidated: true
                }} />
            </div>
        );
    }

    return null;
};

export default ReferralRouteHandler;