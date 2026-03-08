import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CurrencyRate {
  currency_code: string;
  currency_name: string;
  symbol: string;
  rate: number;
}

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  rates: CurrencyRate[];
  formatPrice: (usdAmount: number) => string;
  convertPrice: (usdAmount: number) => number;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  rates: [],
  formatPrice: (amount) => `$${amount.toFixed(2)}`,
  convertPrice: (amount) => amount,
  symbol: '$',
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState<CurrencyRate[]>([]);

  useEffect(() => {
    const fetchRates = async () => {
      const { data } = await supabase
        .from('currency_rates')
        .select('*')
        .order('currency_code');
      if (data) setRates(data as CurrencyRate[]);
    };
    fetchRates();
  }, []);

  const currentRate = rates.find(r => r.currency_code === currency);
  const symbol = currentRate?.symbol || '$';
  const rate = currentRate?.rate || 1;

  const convertPrice = (usdAmount: number) => {
    return Math.round(usdAmount * rate * 100) / 100;
  };

  const formatPrice = (usdAmount: number) => {
    const converted = convertPrice(usdAmount);
    return `${symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, formatPrice, convertPrice, symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};
