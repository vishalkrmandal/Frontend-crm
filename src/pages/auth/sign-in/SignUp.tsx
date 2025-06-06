// Frontend/src/pages/auth/sign-in/SignUp.tsx - Updated without manual referral code input

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CalendarIcon, Eye, EyeOff, Phone, User, Mail, Lock, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { toast, Toaster } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import LocationSelector from "@/components/ui/location-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API_BASE_URL = 'http://localhost:5000';

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

interface SignUpProps {
    validReferral?: {
        code: string;
        userName: string;
        preValidated: boolean;
    };
}

export default function SignUp({ validReferral }: SignUpProps) {
    const navigate = useNavigate();
    // const location = useLocation();
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
            confirmPassword: "",
            referralCode: validReferral?.code || ""
        },
    });

    // Handle pre-validated referral from ReferralRouteHandler
    useEffect(() => {
        if (validReferral?.preValidated) {
            form.setValue("referralCode", validReferral.code);
        }
    }, [validReferral, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true);

            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    country: [countryName, stateName]
                }),
            });

            const data = await response.json();

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 flex items-center justify-center">
            <ThemeToggle />

            <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4 pb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Create Your Account
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        {validReferral?.preValidated && validReferral.userName ?
                            `Join us today! You were referred by ${validReferral.userName}` :
                            "Join us today and start your journey"
                        }
                    </CardDescription>
                </CardHeader>

                {/* Valid Referral Alert */}
                {validReferral?.preValidated && (
                    <div className="px-8 mb-4">
                        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                            <Check className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800 dark:text-green-200">
                                Valid Referral Code!
                            </AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-300">
                                You were referred by <strong>{validReferral.userName}</strong>.
                                The referral bonus will be applied to your account.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <CardContent className="px-8 pb-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="firstname"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                First Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your first name"
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
                                    name="lastname"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                Last Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your last name"
                                                    className="h-12 bg-background/50"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
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
                                        <FormLabel className="flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            Location
                                        </FormLabel>
                                        <FormControl>
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
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Phone and Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                Phone Number
                                            </FormLabel>
                                            <FormControl>
                                                <PhoneInput
                                                    placeholder="Enter phone number"
                                                    defaultCountry="IN"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dateofbirth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4" />
                                                Date of Birth
                                            </FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    className="h-12 w-full"
                                                />
                                            </FormControl>
                                            <FormMessage />
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

                            {/* Hidden referral code field for pre-validated referrals */}
                            {validReferral?.preValidated && (
                                <input type="hidden" {...form.register("referralCode")} />
                            )}

                            {/* Password Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Lock className="w-4 h-4" />
                                                Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Create a strong password"
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
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Lock className="w-4 h-4" />
                                                Confirm Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Confirm your password"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        className="h-12 bg-background/50 pr-10"
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
                            <div className="text-center pt-4">
                                <p className="text-muted-foreground">
                                    Already have an account?{" "}
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700"
                                        onClick={() => navigate('/')}
                                    >
                                        Sign in here
                                    </Button>
                                </p>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <Toaster richColors position="top-right" />
        </div>
    );
}