import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import axios from 'axios';

interface WalletDetailsFormProps {
    initialData: {
        tetherWalletAddress?: string;
        ethWalletAddress?: string;
        accountNumber?: string;
        trxWalletAddress?: string;
    };
    setProfileData: (data: any) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const WalletDetailsForm: React.FC<WalletDetailsFormProps> = ({ initialData, setProfileData }) => {
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
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error("Please login to update your wallet details");
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/profile/wallet-details`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success("Wallet details updated successfully");

                // Update the global profile data
                setProfileData((prev: { walletDetails?: typeof formData }) => ({
                    ...prev,
                    walletDetails: formData
                }));
            }
        } catch (error) {
            toast.error("Failed to update wallet details");
            console.error("Error updating wallet details:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tether Wallet Address */}
                <div className="space-y-2">
                    <Label htmlFor="tetherWalletAddress">Tether Wallet Address</Label>
                    <Input
                        id="tetherWalletAddress"
                        name="tetherWalletAddress"
                        value={formData.tetherWalletAddress || ''}
                        onChange={handleChange}
                        placeholder="Enter Tether wallet address"
                    />
                </div>

                {/* ETH Wallet Address */}
                <div className="space-y-2">
                    <Label htmlFor="ethWalletAddress">ETH Wallet Address</Label>
                    <Input
                        id="ethWalletAddress"
                        name="ethWalletAddress"
                        value={formData.ethWalletAddress || ''}
                        onChange={handleChange}
                        placeholder="Enter ETH wallet address"
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
                    />
                </div>

                {/* TRX Wallet Address */}
                <div className="space-y-2">
                    <Label htmlFor="trxWalletAddress">TRX Wallet Address</Label>
                    <Input
                        id="trxWalletAddress"
                        name="trxWalletAddress"
                        value={formData.trxWalletAddress || ''}
                        onChange={handleChange}
                        placeholder="Enter TRX wallet address"
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
                ) : 'Update Wallet Details'}
            </Button>
        </form>
    );
};

export default WalletDetailsForm;