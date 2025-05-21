// Frontend\src\pages\auth\sign-in\SignUp.tsx

import {
    CssBaseline,
    Typography,
    Stack,
    Card as MuiCard,
    useTheme
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { styled } from "@mui/material/styles";
import AppTheme from "@/Material/shared-theme/AppTheme";
import ColorModeSelect from "@/Material/shared-theme/ColorModeSelect";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import LocationSelector from "@/components/ui/location-input";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner"


const SignUpContainer = styled(Stack)(({ theme }) => ({
    minHeight: "100vh",
    width: "100%",
    padding: theme.spacing(2),
    overflowY: "auto",
    [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(4),
    },
}));

const Card = styled(MuiCard)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    width: "100%",
    maxWidth: "600px",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: "auto",
    boxShadow: "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
    // Applying proper color scheme for light/dark mode
    // backgroundColor: theme.palette.background.paper,
    // color: theme.palette.text.primary,
    [theme.breakpoints.up("sm")]: {
        maxWidth: "750px",
    },
}));

// Add this to ensure inputs adapt to theme
const ThemedInput = styled(Input)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    // color: theme.palette.text.primary,
    '&::placeholder': {
        color: theme.palette.text.secondary,
    },
}));

// Similarly for PasswordInput
const ThemedPasswordInput = styled(PasswordInput)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    // color: theme.palette.text.primary,
    '&::placeholder': {
        color: theme.palette.text.secondary,
    },
}));

// Modified PhoneInput component
const ThemedPhoneInput = styled(PhoneInput)(({ theme }) => ({
    '& .PhoneInputCountrySelect': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    '& input': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        color: theme.palette.text.primary,
    },
    '& button': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        color: theme.palette.text.primary,
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
    }
}));

// Create a themed version of your LocationSelector
const ThemedLocationSelector = styled(LocationSelector)(({ theme }) => ({
    '& button': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        color: theme.palette.text.primary,
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
    },
    '& .popover-content': {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
    }
}));

// Constants
const API_BASE_URL = 'http://localhost:5000/api/auth';

export default function SignUp(props: { disableCustomTheme?: boolean }) {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countryName, setCountryName] = useState<string>("");
    const [stateName, setStateName] = useState<string>("");

    // Updated schema with password confirmation
    const formSchema = z.object({
        firstname: z.string().min(1, "First name is required"),
        lastname: z.string().min(1, "Last name is required"),
        country: z.tuple([z.string(), z.string().optional()]),
        phone: z.string().min(13, "Enter a valid phone number"),
        dateofbirth: z.instanceof(Date, { message: "Invalid date" }),
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password")
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    });

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

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true);
            // Show loading toast
            // toast.loading('Submitting registration...');
            console.log(values);
            // In a real app, we'd send this to an API
            fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Clear loading toast
                        toast.dismiss();
                        toast.success("Registration successful! Please check your email to verify your account.", {
                            duration: 5000
                        });

                        form.reset();

                        // Redirect to login page
                        setTimeout(() => {
                            navigate('/');  //LOGIN PAGE
                        }, 2000);

                    } else {
                        toast.error(data.message || "Failed to register. Please try again.");
                    }
                })
                .catch(error => {
                    console.error("Registration error", error);
                    toast.error("Something went wrong. Please try again.");
                });
        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Failed to submit the form. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
            <SignUpContainer direction="column" justifyContent="center">
                <Card variant="outlined">
                    <Typography component="h1" variant="h4">
                        Sign up
                    </Typography>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="firstname"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <ThemedInput placeholder="First Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="lastname"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <ThemedInput placeholder="Last Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Country</FormLabel>
                                        <FormControl>
                                            <ThemedLocationSelector
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

                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone number</FormLabel>
                                                <FormControl>
                                                    <ThemedPhoneInput placeholder="Phone number" {...field} defaultCountry="IN" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="col-span-6">
                                    <FormField
                                        control={form.control}
                                        name="dateofbirth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date of Birth</FormLabel>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker
                                                        value={dayjs(field.value)}
                                                        onChange={(newValue: Dayjs | null) => {
                                                            field.onChange(newValue ? newValue.toDate() : null);
                                                        }}
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                sx: (theme) => ({
                                                                    "& .MuiInputBase-root": {
                                                                        // color: theme.palette.text.primary,
                                                                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                                                    }
                                                                })
                                                            }
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <ThemedInput placeholder="Email" type="email" {...field} />
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
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <ThemedPasswordInput placeholder="Password" {...field} />
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
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <ThemedPasswordInput placeholder="Confirm your password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                            </Button>
                        </form>
                    </Form>
                    <Toaster />
                </Card>
            </SignUpContainer>
        </AppTheme>
    );
}