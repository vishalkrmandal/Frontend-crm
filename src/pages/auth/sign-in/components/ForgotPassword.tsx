// Frontend/src/pages/auth/sign-in/components/ForgotPassword.tsx

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Mail, ArrowRight, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ForgotPasswordProps {
    open: boolean;
    handleClose: () => void;
}

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPassword({ open, handleClose }: ForgotPasswordProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [emailSent, setEmailSent] = React.useState(false);

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (data.success) {
                setEmailSent(true);
                toast.success('Password reset email sent! Please check your inbox.');

                setTimeout(() => {
                    handleClose();
                    setEmailSent(false);
                    form.reset();
                }, 3000);
            } else {
                toast.error(data.message || 'Failed to send reset email');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDialogClose = () => {
        handleClose();
        setEmailSent(false);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                    </div>
                    <DialogTitle className="text-2xl font-bold">
                        {emailSent ? 'Check Your Email' : 'Reset Password'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {emailSent
                            ? 'We\'ve sent a password reset link to your email address. Please check your inbox and follow the instructions.'
                            : 'Enter your email address and we\'ll send you a link to reset your password.'
                        }
                    </DialogDescription>
                </DialogHeader>

                {!emailSent ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
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
                                                placeholder="Enter your email address"
                                                type="email"
                                                className="h-12 bg-background/50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleDialogClose}
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Sending...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <ArrowRight className="w-4 h-4" />
                                            Send Reset Link
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                ) : (
                    <div className="mt-6 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            If you don't see the email in your inbox, please check your spam folder.
                        </p>
                        <Button
                            onClick={handleDialogClose}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            Got it, thanks!
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}