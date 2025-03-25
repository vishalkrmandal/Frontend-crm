// Frontend\src\pages\auth\StudentRegistation.tsx
"use client"
import { toast, Toaster } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { PasswordInput } from "@/components/ui/password-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

// Constants
const API_BASE_URL = 'http://localhost:5000/api/newuser';

// Types
interface AvailableRoom {
  roomNumber: string;
  block: string;
  capacity: number;
  occupiedCount: number;
  available: boolean;
}

interface RoomResponse {
  availableRooms: AvailableRoom[];
  blocksForGender: string[];
}

export default function StudentRegistration() {
  const [roomError, setRoomError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const navigate = useNavigate();

  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    dateOfBirth: z.coerce.date().refine(
      (date) => {
        const age = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        return age >= 1 && age <= 100;
      },
      { message: "Age must be between 1 and 100 years" }
    ),
    dateOfAdmission: z.coerce.date().refine(
      (date) => {
        const age = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        return age <= 16;
      },
      { message: "Admission date not before 2009." }
    ),
    phoneNumber: z.string().min(13, "Phone number is required"),
    gender: z.string().min(1, "Gender is required"),
    school: z.string().min(1, "School is required"),
    programme: z.string().min(1, "Programme is required"),
    block: z.string().min(1, "Block is required"),
    roomNo: z.string().min(1, "Room number is required"),
    state: z.string().min(1, "State is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      dateOfBirth: new Date(),
      phoneNumber: "",
      dateOfAdmission: new Date(),
      gender: "",
      school: "",
      programme: "",
      block: "",
      roomNo: "",
      state: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const schoolOptions = [
    { value: "sissp", label: "School of Internal Security and SMART Policing (SISSP)" },
    { value: "sitaics", label: "School of IT, Artificial Intelligence and Cyber Security (SITAICS)" },
    { value: "sicmss", label: "School of Integrated Coastal and Maritime Security Studies (SICMSS)" },
    { value: "sisdss", label: "School of Internal Security, Defence and Strategic Studies (SISDSS)" },
    { value: "sicssl", label: "School of International Cooperation, Security and Strategic Languages (SICSSL)" },
    { value: "sbsfi", label: "School of Behavioural Sciences and Forensic Investigations (SBSFI)" },
    { value: "sclml", label: "School of Criminal Law and Military Law (SCLML)" },
    { value: "spicsm", label: "School of Private, Industrial and Corporate Security Management (SPICSM)" },
    { value: "spes", label: "School of Physical Education and Sports (SPES)" },
    { value: "bcore", label: "Bharat Centre of Olympic Research And Education (BCORE)" },
    { value: "sastra", label: "Security And Scientific Technical Research Association(SASTRA)" },
    { value: "saset", label: "School of Applied Sciences, Engineering and Technology (SASET)" }
  ];

  const programmeOptions = [
    { value: "btech", label: "B.Tech" },
    { value: "mtech", label: "M.Tech" },
    { value: "msc", label: "M.Sc" },
    { value: "phd", label: "Ph.D" },
    { value: "mba", label: "MBA" },
    { value: "ma", label: "MA" },
    { value: "diploma", label: "Diploma" }
  ];

  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttarakhand", "Uttar Pradesh", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Lakshadweep", "Puducherry"
  ];

  // Fetch available rooms when gender is selected
  const fetchAvailableRooms = async (gender: string) => {
    try {
      setRoomError("");
      const response = await axios.get<RoomResponse>(
        `${API_BASE_URL}/available-rooms`,
        { params: { gender } }
      );
      setAvailableRooms(response.data.availableRooms);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch available rooms'
        toast.error(errorMessage)
      } else {
        toast.error('An unexpected error occurred while fetching rooms')
      }
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
  
      // Validate email domain before submission
      if (!values.email.endsWith('@rru.ac.in') && !values.email.endsWith('@student.rru.ac.in')) {
        toast.error('Email must be from @rru.ac.in or @student.rru.ac.in domain');
        return;
      }
  
      // Password strength validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(values.password)) {
        toast.error('Password must contain at least 8 characters, including uppercase, lowercase, number & special character');
        return;
      }
  
      // Phone number validation
      if (!values.phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
        toast.error('Please enter a valid phone number');
        return;
      }
  
      // Age validation
      const age = Math.floor((Date.now() - values.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      if (age < 1 || age > 100) {
        toast.error('Age must be between 1 and 100 years');
        return;
      }
  
      // Admission date validation
      const admissionYears = Math.floor((Date.now() - values.dateOfAdmission.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      if (admissionYears > 16) {
        toast.error('Admission date cannot be before 2009');
        return;
      }
  
      const submissionData = {
        ...values,
        role: 'student'
      };
  
      // Show loading toast
      toast.loading('Submitting registration...');
  
      const response = await axios.post(`${API_BASE_URL}/submit`, submissionData);
  
      if (response.data) {
        // Clear loading toast
        toast.dismiss();
        
        // Show success toast
        toast.success('Registration submitted successfully! Please wait for approval.', {
          duration: 5000
        });
  
        form.reset();
  
        // Redirect to login page
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.dismiss(); // Clear loading toast
  
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
  
        // Handle specific field validation errors
        if (errorData?.error) {
          const errorMessage = errorData.error;
          
          // Show specific field error toasts
          if (errorMessage.includes('Name')) {
            toast.error('Please enter a valid name');
          }
          if (errorMessage.includes('Email')) {
            toast.error('Please enter a valid institutional email address');
          }
          if (errorMessage.includes('Password')) {
            toast.error('Password does not meet security requirements');
          }
          if (errorMessage.includes('Phone')) {
            toast.error('Please enter a valid phone number');
          }
          if (errorMessage.includes('School')) {
            toast.error('Please select your school');
          }
          if (errorMessage.includes('Programme')) {
            toast.error('Please select your programme');
          }
          if (errorMessage.includes('Block')) {
            toast.error('Please select a valid hostel block');
          }
          if (errorMessage.includes('Room')) {
            toast.error('Please select a valid room number');
          }
          if (errorMessage.includes('State')) {
            toast.error('Please select your state');
          }
          if (errorMessage.includes('Gender')) {
            toast.error('Please select your gender');
          }
          if (errorMessage.includes('Date of Birth')) {
            toast.error('Please enter a valid date of birth');
          }
          if (errorMessage.includes('Date of Admission')) {
            toast.error('Please enter a valid admission date');
          }
        } else {
          toast.error(errorData?.message || 'Failed to submit registration');
        }
  
        // Set form errors
        if (errorData?.errors) {
          Object.entries(errorData.errors).forEach(([field, message]) => {
            form.setError(field as any, {
              type: 'server',
              message: message as string,
            });
          });
        }
      } else {
        toast.error('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <section className="flex justify-center items-center">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-xl">Student Registration</CardTitle>
            <CardDescription>Enter your information to register for hostel accommodation</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">
                {/* Personal Information */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of birth*</FormLabel>
                        <FormControl>
                          <DatePicker
                            startYear={1950}
                            endYear={new Date().getFullYear()}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone number*</FormLabel>
                        <FormControl>
                          <PhoneInput
                            placeholder="Enter your phone number"
                            {...field}
                            defaultCountry="IN"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfAdmission"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Admission*</FormLabel>
                        <FormControl>
                          <DatePicker
                            startYear={2009}
                            endYear={new Date().getFullYear()}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender*</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedGender(value);
                            if (value === 'male' || value === 'female') {
                              fetchAvailableRooms(value);
                            }
                            form.setValue('block', '');
                            form.setValue('roomNo', '');
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Academic Information */}
                <FormField
                  control={form.control}
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School*</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select School" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {schoolOptions.map((school) => (
                            <SelectItem key={school.value} value={school.value}>
                              {school.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Add Programme Field */}
                <FormField
                  control={form.control}
                  name="programme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Programme*</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Programme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {programmeOptions.map((programme) => (
                            <SelectItem key={programme.value} value={programme.value}>
                              {programme.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Accommodation Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="block"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Block*</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('roomNo', '');
                          }}
                          disabled={!selectedGender || selectedGender === 'others'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Block" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableRooms
                              .map(room => room.block)
                              .filter((block, index, self) => self.indexOf(block) === index)
                              .map(block => (
                                <SelectItem key={block} value={block}>
                                  Block {block}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {!selectedGender && "Please select gender first"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="roomNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Number*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          disabled={!form.watch('block')}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Room" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableRooms
                              .filter(room => room.block === form.watch('block'))
                              .map((room) => (
                                <SelectItem
                                  key={room.roomNumber}
                                  value={room.roomNumber}
                                >
                                  Room {room.roomNumber} ({room.occupiedCount}/{room.capacity})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {!form.watch('block') && "Please select block first"}
                        </FormDescription>
                        <FormMessage />
                        {roomError && (
                          <span className="text-red-500 text-sm mt-1">{roomError}</span>
                        )}
                      </FormItem>
                    )}
                  />
                </div>


                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State*</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {states.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Account Information */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          type="email"
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
                      <FormLabel>Password*</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Create a password"
                          {...field}
                        />
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
                      <FormLabel>Confirm Password*</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Confirm your password"
                          {...field}
                        />
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
          </CardContent>
        </Card>
      </section>
      <Toaster />
    </div>
  );
}