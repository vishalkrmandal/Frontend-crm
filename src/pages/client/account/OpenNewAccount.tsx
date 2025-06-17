// Frontend\src\pages\client\account\OpenNewAccount.tsx

import { AlertCircle, Check, ChevronLeft, ChevronRight, Loader2, Info, TrendingUp } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    leverage: "",
    accountType: "",
    platform: "MetaTrader 5"
  });

  // Fetch data with better error handling
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [groupsResponse, leveragesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/groups`),
        axios.get(`${API_BASE_URL}/api/leverages`)
      ]);

      if (groupsResponse.data.success) {
        setGroups(groupsResponse.data.data);
      }

      if (leveragesResponse.data.success) {
        setLeverages(leveragesResponse.data.data.filter((item: Leverage) => item.active));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load account options. Please refresh the page to try again.");
      toast.error("Failed to load account options");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev === 0) {
        // For mobile: go to last item, for desktop: go to last set of 3
        return window.innerWidth < 768 ? groups.length - 1 : Math.max(0, groups.length - 3);
      }
      return prev - 1;
    });
  }, [groups.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => {
      // For mobile: cycle through individual items, for desktop: cycle through sets of 3
      if (window.innerWidth < 768) {
        return prev >= groups.length - 1 ? 0 : prev + 1;
      } else {
        return prev >= groups.length - 3 ? 0 : prev + 1;
      }
    });
  }, [groups.length]);

  const handleSelect = useCallback((group: AccountGroup) => {
    setSelectedGroup(group);
    setFormValues(prev => ({
      ...prev,
      accountType: group.value
    }));
    toast.success(`${group.name} account type selected`);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormValues({
      leverage: "",
      accountType: "",
      platform: "MetaTrader 5"
    });
    setSelectedGroup(null);
  }, []);

  const validateForm = () => {
    if (!formValues.accountType) {
      toast.error("Please select an account type");
      return false;
    }
    if (!formValues.leverage) {
      toast.error("Please select leverage");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/api/accounts/create`, {
        ...formValues,
        platform: "MetaTrader 5"
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('clientToken')}`
        }
      });

      toast.success("Account created successfully!");
      resetForm();
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto slideshow with pause on hover
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || groups.length <= 3) return;

    const interval = setInterval(handleNext, 4000);
    return () => clearInterval(interval);
  }, [handleNext, isPaused, groups.length]);

  const parseFeatures = (description?: string) => {
    if (!description) return [];
    return description
      .split(/[\n,]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading account options...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Open New Trading Account</h1>
          <p className="text-muted-foreground">Create a new trading account to diversify your trading strategy.</p>
        </div>
        <div className="rounded-lg border bg-red-50 p-6 text-center dark:bg-red-950/50 dark:border-red-800">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4 dark:text-red-400" />
          <h3 className="text-lg font-medium text-red-800 mb-2 dark:text-red-200">Unable to Load Account Options</h3>
          <p className="text-red-600 mb-4 dark:text-red-300">{error}</p>
          <button
            onClick={fetchData}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const visibleGroups = groups.slice(currentIndex, currentIndex + 3);
  const totalPages = Math.ceil(groups.length / 3);

  return (
    <div className="space-y-2 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center text-primary px-3 py-1 rounded-full text-sm font-medium mb-4 bg-primary/10">
          <TrendingUp className="h-4 w-4" />
          New Account Setup
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Open New Trading Account</h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto">
          Create a new trading account to diversify your trading strategy and explore new opportunities.
        </p>
      </div>

      {/* Account Type Selection */}
      {groups.length > 0 && (
        <div className="space-y-6">
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Mobile Carousel - Single Card */}
            <div className="block md:hidden">
              <div className="relative overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {groups.map((group) => (
                    <div key={group._id} className="w-full flex-shrink-0 px-2">
                      <div
                        className={`rounded-lg border-2 bg-card p-6 shadow-sm transition-all duration-300 cursor-pointer hover:shadow-lg ${selectedGroup?.value === group.value
                          ? "border-primary ring-2 ring-primary/20 shadow-md"
                          : "border-border hover:border-primary/50"
                          }`}
                        onClick={() => handleSelect(group)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">{group.name}</h3>
                          {group.name === "BASIC" && (
                            <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                              Popular
                            </span>
                          )}
                        </div>

                        <div className="space-y-3 min-h-[144px]">
                          {parseFeatures(group.description).length > 0 ? (
                            parseFeatures(group.description).map((feature, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                                <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Info className="h-4 w-4" />
                              <span className="text-sm">No features listed</span>
                            </div>
                          )}
                        </div>

                        <button
                          className={`mt-6 w-full rounded-md py-3 px-4 font-medium transition-all duration-200 ${selectedGroup?.value === group.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "border-2 border-primary text-primary hover:bg-primary/10"
                            }`}
                        >
                          {selectedGroup?.value === group.value ? "✓ Selected" : "Select"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Navigation Buttons */}
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background shadow-lg border border-border hover:bg-accent hover:text-accent-foreground z-10"
                  aria-label="Previous account type"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background shadow-lg border border-border hover:bg-accent hover:text-accent-foreground z-10"
                  aria-label="Next account type"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Desktop Carousel - Three Cards */}
            <div className="hidden md:flex items-center gap-4">
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                disabled={groups.length <= 3}
                className="p-3 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all hover:shadow-md"
                aria-label="Previous account types"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Cards Container */}
              <div className="flex-1 overflow-hidden">
                <div className="grid gap-6 md:grid-cols-3">
                  {visibleGroups.map((group) => (
                    <div
                      key={group._id}
                      className={`rounded-lg border-2 bg-card p-6 shadow-sm transition-all duration-300 cursor-pointer hover:shadow-lg ${selectedGroup?.value === group.value
                        ? "border-primary ring-2 ring-primary/20 shadow-md"
                        : "border-border hover:border-primary/50"
                        }`}
                      onClick={() => handleSelect(group)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{group.name}</h3>
                        {group.name === "BASIC" && (
                          <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                            Popular
                          </span>
                        )}
                      </div>

                      <div className="space-y-3 min-h-[144px]">
                        {parseFeatures(group.description).length > 0 ? (
                          parseFeatures(group.description).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                              <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Info className="h-4 w-4" />
                            <span className="text-sm">No features listed</span>
                          </div>
                        )}
                      </div>

                      <button
                        className={`mt-6 w-full rounded-md py-3 px-4 font-medium transition-all duration-200 ${selectedGroup?.value === group.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border-2 border-primary text-primary hover:bg-primary/10"
                          }`}
                      >
                        {selectedGroup?.value === group.value ? "✓ Selected" : "Select"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={groups.length <= 3}
                className="p-3 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all hover:shadow-md"
                aria-label="Next account types"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Pagination Indicators */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx * 3)}
                    className={`h-2 rounded-full transition-all duration-200 ${Math.floor(currentIndex / 3) === idx
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted hover:bg-muted-foreground/50"
                      }`}
                    aria-label={`Go to page ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Details Form */}
      <div className="rounded-lg border bg-card shadow-sm p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Account Configuration</h2>
          <p className="text-muted-foreground">Configure your account settings and trading parameters</p>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Leverage Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="leverage">
                Leverage Ratio
              </label>
              <select
                id="leverage"
                className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                value={formValues.leverage}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose leverage...</option>
                {leverages.map(leverage => (
                  <option key={leverage._id} value={leverage.value}>
                    {leverage.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Type Selection */}
            <div className="space-y-2">
              <label htmlFor="accountType" className="block text-sm font-medium">
                Account Type
              </label>
              <select
                id="accountType"
                className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                value={formValues.accountType}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose account type...</option>
                {groups.map((group) => (
                  <option key={group._id} value={group.value}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Trading Platform */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" htmlFor="platform">
                Trading Platform
              </label>
              <div className="w-full rounded-md border border-input bg-muted px-4 py-3 text-sm text-muted-foreground">
                MetaTrader 5
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-primary mb-1">Account Creation Process</h4>
                <p className="text-sm text-primary/80">
                  Your new trading account will be created instantly upon submission. You can fund it from your
                  existing accounts or make a new deposit once the account is active.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formValues.accountType || !formValues.leverage}
              className="flex-1 rounded-md bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Trading Account"
              )}
            </button>

            {(formValues.accountType || formValues.leverage) && (
              <button
                onClick={resetForm}
                disabled={isSubmitting}
                className="px-6 py-3 border border-input bg-background text-foreground rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}