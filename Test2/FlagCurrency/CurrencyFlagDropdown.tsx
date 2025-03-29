import React, { useState, useEffect, useRef } from 'react';

interface Currency {
    code: string;
    name: string;
    symbol: string;
    flag: string;
    countryName: string;
}

interface CurrencyFlagDropdownProps {
    onSelectCurrency: (currencyCode: string) => void;
    selectedCurrency?: string;
}

const CurrencyFlagDropdown: React.FC<CurrencyFlagDropdownProps> = ({
    onSelectCurrency,
    selectedCurrency = 'USD'
}) => {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [filteredCurrencies, setFilteredCurrencies] = useState<Currency[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch countries data
    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies,flags,cca2');

                if (!response.ok) {
                    throw new Error('Failed to fetch countries data');
                }

                const data = await response.json();
                const currencyList: Currency[] = [];
                const addedCurrencies = new Set<string>();

                // Extract currency information from each country
                data.forEach((country: any) => {
                    if (country.currencies) {
                        Object.keys(country.currencies).forEach(currencyCode => {
                            if (!addedCurrencies.has(currencyCode)) {
                                addedCurrencies.add(currencyCode);
                                currencyList.push({
                                    code: currencyCode,
                                    name: country.currencies[currencyCode].name || currencyCode,
                                    symbol: country.currencies[currencyCode].symbol || '',
                                    flag: country.flags.svg,
                                    countryName: country.name.common
                                });
                            }
                        });
                    }
                });

                // Sort currencies alphabetically by code
                const sortedCurrencies = currencyList.sort((a, b) => a.code.localeCompare(b.code));

                setCurrencies(sortedCurrencies);
                setFilteredCurrencies(sortedCurrencies);
                setLoading(false);
            } catch (err) {
                setError('Failed to load currencies');
                setLoading(false);
            }
        };

        fetchCurrencies();
    }, []);

    // Filter currencies based on search term
    useEffect(() => {
        if (searchTerm) {
            const filtered = currencies.filter(currency =>
                currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                currency.countryName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCurrencies(filtered);
        } else {
            setFilteredCurrencies(currencies);
        }
    }, [searchTerm, currencies]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Get selected currency
    const getSelectedCurrency = () => {
        return currencies.find(currency => currency.code === selectedCurrency);
    };

    // Handle currency selection
    const handleSelectCurrency = (currency: Currency) => {
        onSelectCurrency(currency.code);
        setIsOpen(false);
        setSearchTerm('');
    };

    if (loading) {
        return <div className="currency-loading">Loading currencies...</div>;
    }

    if (error) {
        return <div className="currency-error">{error}</div>;
    }

    return (
        <div className="currency-flag-dropdown" ref={dropdownRef}>
            <div
                className="selected-currency"
                onClick={() => setIsOpen(!isOpen)}
            >
                {getSelectedCurrency() ? (
                    <>
                        <img
                            src={getSelectedCurrency()?.flag}
                            alt={getSelectedCurrency()?.countryName}
                            className="currency-flag"
                        />
                        <span className="currency-code">{getSelectedCurrency()?.code}</span>
                        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
                    </>
                ) : (
                    <span>Select Currency</span>
                )}
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="currency-list">
                        {filteredCurrencies.map(currency => (
                            <div
                                key={currency.code}
                                className={`currency-item ${currency.code === selectedCurrency ? 'selected' : ''}`}
                                onClick={() => handleSelectCurrency(currency)}
                            >
                                <img src={currency.flag} alt={currency.countryName} className="currency-flag" />
                                <span className="currency-code">{currency.code}</span>
                                {currency.code === selectedCurrency && (
                                    <span className="check-mark">✓</span>
                                )}
                            </div>
                        ))}

                        {filteredCurrencies.length === 0 && (
                            <div className="no-results">No currencies found</div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
        .currency-flag-dropdown {
          position: relative;
          width: 100%;
          max-width: 560px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .selected-currency {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border: 2px solid #1d4720;
          border-radius: 28px;
          background-color: #ffffff;
          cursor: pointer;
          user-select: none;
          font-size: 16px;
        }
        
        .currency-flag {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 10px;
        }
        
        .currency-code {
          font-weight: 500;
        }
        
        .dropdown-arrow {
          margin-left: auto;
          font-size: 12px;
          color: #666;
        }
        
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 5px);
          left: 0;
          width: 100%;
          max-height: 350px;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 10;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .search-container {
          padding: 10px;
          border-bottom: 1px solid #ddd;
          position: sticky;
          top: 0;
          background-color: #fff;
          z-index: 1;
        }
        
        .search-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 14px;
          outline: none;
        }
        
        .currency-list {
          overflow-y: auto;
          max-height: 290px;
        }
        
        .currency-item {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .currency-item:hover {
          background-color: #f5f5f5;
        }
        
        .currency-item.selected {
          background-color: #f0f9ff;
        }
        
        .check-mark {
          margin-left: auto;
          color: #1a73e8;
          font-weight: bold;
        }
        
        .no-results {
          padding: 16px;
          text-align: center;
          color: #666;
        }
        
        .currency-loading,
        .currency-error {
          padding: 16px;
          text-align: center;
        }
        
        .currency-error {
          color: #d32f2f;
        }
      `}</style>
        </div>
    );
};

export default CurrencyFlagDropdown;