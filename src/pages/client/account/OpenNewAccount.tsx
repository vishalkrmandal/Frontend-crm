import { AlertCircle, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner";


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Define the Leverage type
interface Leverage {
  _id: string
  value: string
  name: string
  active: boolean
}

interface AccountGroup {
  _id: string;
  value: string;
  name: string;
  description?: string;
  features?: string[];
}

export default function OpenNewAccount() {
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [leverages, setLeverages] = useState<Leverage[]>([])
  const [selectedGroup, setSelectedGroup] = useState<AccountGroup | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    leverage: "",
    accountType: "",
    platform: "MetaTrader 5"
  })


  useEffect(() => {
    // Fetch groups data
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/groups`)
        if (response.data.success) {
          setGroups(response.data.data)
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast.error("Failed to fetch account types");
      }
    }

    // Fetch leverages data
    const fetchLeverages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/leverages`)
        if (response.data.success) {
          setLeverages(response.data.data.filter((item: Leverage) => item.active))
        }
      } catch (error) {
        console.error("Error fetching leverages:", error)
        toast.error("Failed to fetch leverage options");
      }
    }

    fetchGroups()
    fetchLeverages()
  }, [])

  const handlePrevious = () => {
    setCurrentIndex(prev => {
      if (prev === 0) return Math.max(0, groups.length - 3)
      return prev - 1
    })
  }

  const handleNext = () => {
    setCurrentIndex(prev => {
      if (prev >= groups.length - 3) return 0
      return prev + 1
    })
  }

  const handleSelect = (group: AccountGroup) => {
    setSelectedGroup(group);
    setFormValues({
      ...formValues,
      accountType: group.value
    });
    toast.success(`${group.name} selected`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value
    });
  };

  // Function to reset the form
  const resetForm = () => {
    setFormValues({
      leverage: "",
      accountType: "",
      platform: "MetaTrader 5"
    });
    setSelectedGroup(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true);

    if (!formValues.accountType) {
      toast.error("Please select an account type");
      return;
    }

    if (!formValues.leverage) {
      toast.error("Please select leverage");
      return;
    }

    try {
      // Create new account
      await axios.post(`${API_BASE_URL}/api/accounts/create`, {
        ...formValues,
        platform: "MetaTrader 5"
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('clientToken')}`
        }
      })
      setTimeout(() => {
        toast.success("Account created successfully!");
        setIsSubmitting(false);
      }, 1500);
      resetForm(); // Reset the form after successful submission
    } catch (error) {
      console.error("Error creating account:", error)
      toast.error("Failed to create account. Please try again.");
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  }

  // Auto slideshow effect
  useEffect(() => {
    const interval = setInterval(handleNext, 3000);
    return () => clearInterval(interval);
  }, [currentIndex, groups.length]);

  // Parse description field into separate features
  const parseFeatures = (description?: string) => {
    if (!description) return [];

    // Split by newlines or commas
    return description
      .split(/[\n,]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Open New Trading Account</h1>
        <p className="text-muted-foreground">Create a new trading account to diversify your trading strategy.</p>
      </div>

      {/* Account Type Carousel */}
      <div className="relative">
        {/* Header */}
        {/* <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium P-[20px]">Account Types</h2>
        </div> */}

        <div className="flex justify-between items-center ">
          <div className="p-2 cursor-pointer" onClick={handlePrevious}>
            <ChevronLeft className="h-6 w-6" />
          </div>
          {/* Carousel */}
          <div className="grid gap-6 md:grid-cols-3 flex-grow ">
            {/* Slides */}
            {groups.slice(currentIndex, currentIndex + 3).map((group) => (
              <div
                key={group._id}
                className={`rounded-lg border p-6 shadow-sm ${selectedGroup?.value === group.value
                  ? "ring-2 ring-blue-500"
                  : "hover:border-blue-300"
                  }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">{group.name}</h3>
                  {group.name === "BASIC" && (
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                </div>

                <div className="space-y-2 min-h-36">
                  {parseFeatures(group.description).map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>


                <button
                  onClick={() => handleSelect(group)}
                  className={`mt-4 w-full rounded py-2 px-4 transition-colors ${selectedGroup?.value === group.value
                    ? "bg-blue-600 text-white"
                    : "border border-blue-600 text-blue-600 hover:bg-blue-50"
                    }`}
                >
                  {selectedGroup?.value === group.value ? "Selected" : "Select"}
                </button>
              </div>
            ))}
          </div>

          <div className="p-2 cursor-pointer" onClick={handleNext}>
            <ChevronRight className="h-6 w-6" />
          </div>
        </div>

        {/* Bottom Indicators */}
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(groups.length / 3) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * 3)}
              className={`h-2 rounded-full transition-all ${Math.floor(currentIndex / 3) === idx
                ? "w-6 bg-blue-600"
                : "w-2 bg-gray-300"
                }`}
            />
          ))}
        </div>
      </div>

      {/* Account Details Form */}
      <div className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Account Details</h2>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="leverage">
                Leverage
              </label>
              <select
                id="leverage"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formValues.leverage}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Leverage</option>
                {leverages.map(leverage => (
                  <option key={leverage._id} value={leverage.value}>{leverage.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="accountType" className="block text-sm font-medium mb-1">
                Account Type
              </label>
              <select
                id="accountType"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formValues.accountType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Account Type</option>
                {groups.map((group) => (
                  <option key={group._id} value={group.value}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="platform">
                Trading Platform
              </label>
              <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                MetaTrader 5
              </div>
            </div>
          </div>

          <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="ml-3">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Your new trading account will be created instantly. You can fund it from your existing accounts or
                  make a new deposit.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Processing..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  )
}