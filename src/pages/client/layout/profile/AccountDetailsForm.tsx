import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


interface AccountDetailsFormProps {
    initialData: {
        bankName?: string;
        accountHolderName?: string;
        accountNumber?: string;
        ifscSwiftCode?: string;
    };
    setProfileData: React.Dispatch<React.SetStateAction<any>>;
}

const AccountDetailsForm: React.FC<AccountDetailsFormProps> = ({ initialData, setProfileData }) => {
    const [formData, setFormData] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('clientToken');

            if (!token) {
                toast.error("Please login to update your account details");
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/profile/account-details`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success("Account details updated successfully");

                // Update the global profile data
                setProfileData((prev: { bankDetails?: typeof formData }) => ({
                    ...prev,
                    bankDetails: formData
                }));
            }
        } catch (error) {
            toast.error("Failed to update account details");
            console.error("Error updating account details:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bank Name */}
                <div className="space-y-2">
                    <Label htmlFor="bankName">Name of Bank</Label>
                    <Input
                        id="bankName"
                        name="bankName"
                        value={formData.bankName || ''}
                        onChange={handleChange}
                        placeholder="Enter bank name"
                        required
                    />
                </div>

                {/* Account Holder Name */}
                <div className="space-y-2">
                    <Label htmlFor="accountHolderName">Account Holder Name</Label>
                    <Input
                        id="accountHolderName"
                        name="accountHolderName"
                        value={formData.accountHolderName || ''}
                        onChange={handleChange}
                        placeholder="Enter account holder name"
                        required
                    />
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                        id="accountNumber"
                        name="accountNumber"
                        value={formData.accountNumber || ''}
                        onChange={handleChange}
                        placeholder="Enter account number"
                        required
                    />
                </div>

                {/* IFSC/SWIFT Code */}
                <div className="space-y-2">
                    <Label htmlFor="ifscSwiftCode">IFSC/SWIFT Code</Label>
                    <Input
                        id="ifscSwiftCode"
                        name="ifscSwiftCode"
                        value={formData.ifscSwiftCode || ''}
                        onChange={handleChange}
                        placeholder="Enter IFSC or SWIFT code"
                        required
                    />
                </div>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span className="animate-spin mr-2">&#10227;</span>
                        Updating...
                    </>
                ) : 'Update Account Details'}
            </Button>
        </form>
    );
};

export default AccountDetailsForm;