// Frontend/src/pages/auth/sign-in/components/SignInCard.tsx

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Eye, EyeOff, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast, Toaster } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import ForgotPassword from './ForgotPassword';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().default(false)
});

export default function SignInCard() {
    const { login, hasMultipleRoles } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showForgotPassword, setShowForgotPassword] = React.useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false
        }
    });

    // Check if user already has active sessions
    React.useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        const clientToken = localStorage.getItem('clientToken');
        const superadminToken = localStorage.getItem('superadminToken');

        if (adminToken || superadminToken) {
            navigate('/admin');
        } else if (clientToken) {
            navigate('/client');
        }
    }, [navigate]);

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: values.email,
                    password: values.password
                }),
            });

            const data = await response.json();

            if (data.success) {
                const userRole = data.user.role;

                // Store token and user info in localStorage based on role
                localStorage.setItem(`${userRole}Token`, data.token);
                localStorage.setItem(`${userRole}User`, JSON.stringify(data.user));

                if (data.user.isEmailVerified === true) {
                    toast.success('Login successful! Redirecting...', {
                        duration: 2000
                    });

                    setTimeout(() => {
                        if (userRole === 'admin' || userRole === 'superadmin') {
                            window.location.href = '/admin';
                        } else {
                            window.location.href = '/client';
                        }
                    }, 1000);
                } else {
                    toast.error('Please verify your email address first');
                }
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('An error occurred during login');
        } finally {
            setIsSubmitting(false);
        }
    };

    const multipleRoles = hasMultipleRoles();

    return (
        <>
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4 pb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    {multipleRoles && (
                        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                            <AlertDescription className="text-blue-800 dark:text-blue-200">
                                You are already logged in with multiple accounts. You can switch between them in your profile.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Email Address
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your email"
                                                type="email"
                                                className="h-12 bg-background/50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="flex items-center gap-2">
                                                <Lock className="w-4 h-4" />
                                                Password
                                            </FormLabel>
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="p-0 h-auto text-sm font-medium text-blue-600 hover:text-blue-700"
                                                onClick={() => setShowForgotPassword(true)}
                                            >
                                                Forgot password?
                                            </Button>
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    placeholder="Enter your password"
                                                    type={showPassword ? "text" : "password"}
                                                    className="h-12 bg-background/50 pr-10"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="rememberMe"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm font-medium">
                                                Remember me
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Signing in...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <LogIn className="w-4 h-4" />
                                        Sign In
                                    </div>
                                )}
                            </Button>

                            <div className="text-center pt-4">
                                <p className="text-muted-foreground">
                                    Don't have an account?{" "}
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700"
                                        onClick={() => navigate('/signup')}
                                    >
                                        <UserPlus className="w-4 h-4 mr-1" />
                                        Create account
                                    </Button>
                                </p>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <ForgotPassword
                open={showForgotPassword}
                handleClose={() => setShowForgotPassword(false)}
            />
            <Toaster richColors position="top-right" />
        </>
    );
}