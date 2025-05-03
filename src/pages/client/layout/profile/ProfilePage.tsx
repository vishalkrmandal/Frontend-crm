import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalInfoForm from './PersonalInfoForm';
import AccountDetailsForm from './AccountDetailsForm';
import WalletDetailsForm from './WalletDetailsForm';
import axios from 'axios';
import { toast } from 'sonner';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProfilePage = () => {
    const [profileData, setProfileData] = useState({
        personalInfo: {
            firstname: '',
            lastname: '',
            dateofbirth: '',
            phone: '',
            email: '',
            educationLevel: '',
            otherEducation: '',
            isEmployed: '',
            idDocument: undefined,
            address1Document: undefined,
            address2Document: undefined
        },
        bankDetails: {
            bankName: '',
            accountHolderName: '',
            accountNumber: '',
            ifscSwiftCode: ''
        },
        walletDetails: {
            tetherWalletAddress: '',
            ethWalletAddress: '',
            accountNumber: '',
            trxWalletAddress: ''
        }
    });
    const [loading, setLoading] = useState(true);

    // Fetch profile data when component mounts
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('clientToken');

                if (!token) {
                    toast.error("Authentication Error: Please login to view your profile");
                    return;
                }

                const response = await axios.get(`${API_URL}/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log("Profile data response:", response.data);

                if (response.data.success) {
                    const data = response.data.data;

                    // Merge the fetched data with our state structure
                    setProfileData({
                        personalInfo: {
                            ...data.personalInfo,
                            educationLevel: data.educationLevel || '',
                            otherEducation: data.otherEducation || '',
                            isEmployed: data.isEmployed ? 'yes' : 'no',
                            idDocument: data.idDocument || undefined,
                            address1Document: data.address1Document || undefined,
                            address2Document: data.address2Document || undefined
                        },
                        bankDetails: data.bankDetails || {
                            bankName: '',
                            accountHolderName: '',
                            accountNumber: '',
                            ifscSwiftCode: ''
                        },
                        walletDetails: data.walletDetails || {
                            tetherWalletAddress: '',
                            ethWalletAddress: '',
                            accountNumber: '',
                            trxWalletAddress: ''
                        }
                    });
                }
            } catch (error) {
                toast.error("Failed to fetch profile data");
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [toast]);

    return (
        <div className="container mx-auto px-2 py-2">
            <h1 className="text-2xl font-bold mb-6">My Profile</h1>

            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <Tabs defaultValue="personal">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="personal">Personal Info</TabsTrigger>
                        <TabsTrigger value="account">Account Details</TabsTrigger>
                        <TabsTrigger value="wallet">Wallet Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal">
                        <PersonalInfoForm
                            initialData={profileData.personalInfo}
                            setProfileData={setProfileData}
                        />
                    </TabsContent>

                    <TabsContent value="account">
                        <AccountDetailsForm
                            initialData={profileData.bankDetails}
                            setProfileData={setProfileData}
                        />
                    </TabsContent>

                    <TabsContent value="wallet">
                        <WalletDetailsForm
                            initialData={profileData.walletDetails}
                            setProfileData={setProfileData}
                        />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
};

export default ProfilePage;