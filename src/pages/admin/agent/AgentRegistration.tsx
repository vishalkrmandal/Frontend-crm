// Frontend\src\pages\agent\AgentRegistration.tsx

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CalendarIcon, Eye, EyeOff, Phone, User, Mail, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import LocationSelector from "@/components/ui/location-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formSchema = z.object({
    firstname: z.string().min(1, "First name is required").max(50, "First name too long"),
    lastname: z.string().min(1, "Last name is required").max(50, "Last name too long"),
    country: z.tuple([z.string(), z.string().optional()]),
    phone: z.string().min(10, "Enter a valid phone number"),
    dateofbirth: z.date({ required_error: "Date of birth is required" }),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    referralCode: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});



export default function AgentRegistration() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [countryName, setCountryName] = useState<string>("");
    const [stateName, setStateName] = useState<string>("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dateofbirth: new Date(),
            firstname: "",
            lastname: "",
            phone: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
    });

    useEffect(() => {
        // Reset country and state names when form resets
        form.reset({
            dateofbirth: new Date(),
            firstname: "",
            lastname: "",
            phone: "",
            email: "",
            password: "",
            confirmPassword: ""
        });
        setCountryName("");
        setStateName("");
    }, [form]);

    const { activeRole } = useAuth();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true);

            // Check if current user has permission
            if (!['admin', 'superadmin'].includes(activeRole || "")) {
                throw new Error('Insufficient permissions to create agents');
            }

            // Get the appropriate token based on active role
            const token = localStorage.getItem(`${activeRole}Token`);

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/api/auth/agent/signup`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    country: [countryName, stateName]
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create agent');
            }

            const data = await response.json();
            // Handle success


            if (data.success) {
                toast.success("Registration successful! Please check your email to verify your account.", {
                    duration: 5000
                });

                form.reset();
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                toast.error(data.message || "Failed to register. Please try again.");
            }
        } catch (error) {
            console.error("Registration error", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-background relative overflow-x-hidden">
            {/* Background decoration - Hidden on mobile to improve performance */}
            {/* <div className="absolute inset-0 overflow-hidden hidden md:block">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-purple-600 dark:opacity-30"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:bg-blue-600 dark:opacity-30"></div>
                <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-600 dark:opacity-30"></div>
            </div> */}

            {/* Main Content Container - Changed to use padding instead of flex centering */}
            <div className="relative z-10 w-full md:py-6 lg:py-0">
                <div className="max-w-5xl mx-auto">
                    <Card className="w-full border-0 bg-card backdrop-blur-sm">
                        <CardHeader className="text-center space-y-4 md:pb-8 lg:pb-2">
                            <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 md:w-8 md:h-8 text-white" />
                            </div>
                            <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Create Your Agent Account
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="px-4 md:px-8 md:pb-8">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                                    {/* Name Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <FormField
                                            control={form.control}
                                            name="firstname"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                                                        <User className="w-4 h-4" />
                                                        First Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter your first name"
                                                            className="h-10 md:h-12 bg-background/50 text-sm md:text-base"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs md:text-sm" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="lastname"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                                                        <User className="w-4 h-4" />
                                                        Last Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter your last name"
                                                            className="h-10 md:h-12 bg-background/50 text-sm md:text-base"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs md:text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Location */}
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                                                    <Globe className="w-4 h-4" />
                                                    Location
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="min-h-[40px] md:min-h-[48px]">
                                                        <LocationSelector
                                                            onCountryChange={(country) => {
                                                                setCountryName(country?.name || "");
                                                                form.setValue(field.name, [country?.name || "", stateName || ""]);
                                                            }}
                                                            onStateChange={(state) => {
                                                                setStateName(state?.name || "");
                                                                form.setValue(field.name, [countryName || "", state?.name || ""]);
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs md:text-sm" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Phone and Date */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                                                        <Phone className="w-4 h-4" />
                                                        Phone Number
                                                    </FormLabel>
                                                    <FormControl>
                                                        <PhoneInput
                                                            placeholder="Enter phone number"
                                                            defaultCountry="IN"
                                                            className="h-10 md:h-12"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs md:text-sm" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="dateofbirth"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                                                        <CalendarIcon className="w-4 h-4" />
                                                        Date of Birth
                                                    </FormLabel>
                                                    <FormControl>
                                                        <DatePicker
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            className="h-10 md:h-12 w-full"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs md:text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Email */}
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                                                    <Mail className="w-4 h-4" />
                                                    Email Address
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter your email address"
                                                        type="email"
                                                        className="h-10 md:h-12 bg-background/50 text-sm md:text-base"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs md:text-sm" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Password Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                                                        <Lock className="w-4 h-4" />
                                                        Password
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="Create a strong password"
                                                                type={showPassword ? "text" : "password"}
                                                                className="h-10 md:h-12 bg-background/50 pr-10 text-sm md:text-base"
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
                                                    <FormMessage className="text-xs md:text-sm" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 text-sm md:text-base">
                                                        <Lock className="w-4 h-4" />
                                                        Confirm Password
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="Confirm your password"
                                                                type={showConfirmPassword ? "text" : "password"}
                                                                className="h-10 md:h-12 bg-background/50 pr-10 text-sm md:text-base"
                                                                {...field}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            >
                                                                {showConfirmPassword ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs md:text-sm" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full h-10 md:h-12 text-base md:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Creating Account...
                                            </div>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </Button>

                                    {/* Sign In Link */}
                                    {/* <div className="text-center pt-4">
                                        <p className="text-muted-foreground text-sm md:text-base">
                                            Already have an account?{" "}
                                            <Button
                                                variant="link"
                                                className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700 text-sm md:text-base"
                                                onClick={() => navigate('/')}
                                            >
                                                Sign in here
                                            </Button>
                                        </p>
                                    </div> */}
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}