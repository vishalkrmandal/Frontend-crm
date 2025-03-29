import React, { useState, useEffect } from 'react';
import CurrencyFlagDropdown from './CurrencyFlagDropdown';

interface ExchangeRateData {
  base: string;
  rates: Record<string, number>;
  date: string;
}

const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>('');

  // Fetch exchange rates whenever currencies change
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!fromCurrency || !toCurrency) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);

        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }

        const data: ExchangeRateData = await response.json();

        if (data.rates && data.rates[toCurrency]) {
          setExchangeRate(data.rates[toCurrency]);
          setDate(data.date);
        } else {
          throw new Error(`Exchange rate not available for ${toCurrency}`);
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch exchange rates. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  // Calculate converted amount when amount or exchange rate changes
  useEffect(() => {
    if (exchangeRate !== null && amount !== '') {
      const numericAmount = parseFloat(amount);
      if (!isNaN(numericAmount)) {
        setConvertedAmount(numericAmount * exchangeRate);
      } else {
        setConvertedAmount(null);
      }
    } else {
      setConvertedAmount(null);
    }
  }, [amount, exchangeRate]);

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  // Handle currency swap
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="currency-converter">
      <h1>Currency Converter</h1>

      <div className="converter-container">
        <div className="amount-input">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount"
            min="0"
            step="0.01"
          />
        </div>

        <div className="currency-selectors">
          <div className="from-currency">
            <label>From</label>
            <CurrencyFlagDropdown
              onSelectCurrency={setFromCurrency}
              selectedCurrency={fromCurrency}
            />
          </div>

          <button className="swap-button" onClick={handleSwapCurrencies}>
            ⇄
          </button>

          <div className="to-currency">
            <label>To</label>
            <CurrencyFlagDropdown
              onSelectCurrency={setToCurrency}
              selectedCurrency={toCurrency}
            />
          </div>
        </div>

        <div className="result-container">
          {loading ? (
            <div className="loading">Loading exchange rates...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : convertedAmount !== null ? (
            <div className="conversion-result">
              <div className="conversion-text">
                <span className="amount">{parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="currency">{fromCurrency}</span>
                <span className="equals"> = </span>
              </div>
              <div className="converted-amount">
                <span className="amount">{convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="currency">{toCurrency}</span>
              </div>
              <div className="exchange-rate">
                <span>1 {fromCurrency} = {exchangeRate?.toFixed(6)} {toCurrency}</span>
                <span className="update-date">Last updated: {date}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <style>{`
        .currency-converter {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 30px;
          color: #333;
        }
        
        .converter-container {
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 24px;
        }
        
        .amount-input {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          font-size: 14px;
          color: #555;
          margin-bottom: 8px;
        }
        
        input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s;
          outline: none;
        }
        
        input:focus {
          border-color: #1a73e8;
        }
        
        .currency-selectors {
          display: flex;
          align-items: center;
          margin-bottom: 24px;
          gap: 15px;
        }
        
        .from-currency,
        .to-currency {
          flex: 1;
        }
        
        .swap-button {
          width: 40px;
          height: 40px;
          background-color: #f5f5f5;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          color: #333;
          transition: background-color 0.3s;
          margin-top: 20px;
        }
        
        .swap-button:hover {
          background-color: #e0e0e0;
        }
        
        .result-container {
          margin-top: 20px;
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .loading,
        .error {
          text-align: center;
          padding: 20px;
        }
        
        .error {
          color: #d32f2f;
        }
        
        .conversion-result {
          width: 100%;
        }
        
        .conversion-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 8px;
        }
        
        .converted-amount {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 12px;
        }
        
        .exchange-rate {
          font-size: 14px;
          color: #777;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .update-date {
          font-size: 12px;
          color: #999;
        }
        
        .amount {
          margin-right: 5px;
        }
        
        .currency {
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default CurrencyConverter;